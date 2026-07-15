import { list, put, del } from '@vercel/blob'

const TOTAL = 11

// Score blobs: quiz/{deviceId}/{nameB64|anon}/{score}of{total}.json
// Everything the leaderboard needs lives in the pathname, so a single
// list() call is enough (same trick as the filming leaderboard).
function parseEntry(blob) {
  const parts = blob.pathname.split('/')
  if (parts.length !== 4 || parts[0] !== 'quiz') return null
  const [, device, nameB64, file] = parts
  const m = file.match(/^(\d{1,2})of(\d{1,2})/)
  if (!m) return null

  let name = ''
  if (nameB64 !== 'anon') {
    try {
      name = Buffer.from(nameB64, 'base64url').toString('utf8')
    } catch {
      name = ''
    }
  }
  return {
    device,
    name,
    score: Number(m[1]),
    total: Number(m[2]),
    at: blob.uploadedAt,
    url: blob.url,
    pathname: blob.pathname,
  }
}

async function listScoreBlobs() {
  const blobs = []
  let cursor
  do {
    const page = await list({ prefix: 'quiz/', cursor, limit: 1000 })
    blobs.push(...page.blobs)
    cursor = page.cursor
  } while (cursor)
  return blobs
}

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'storage_not_configured' })
  }

  try {
    if (req.method === 'GET') {
      const entries = new Map()
      for (const blob of await listScoreBlobs()) {
        const entry = parseEntry(blob)
        if (!entry) continue
        const prev = entries.get(entry.device)
        if (
          !prev ||
          entry.score > prev.score ||
          (entry.score === prev.score && entry.at > prev.at)
        ) {
          entries.set(entry.device, entry)
        }
      }
      const board = [...entries.values()]
        .sort((a, b) => b.score - a.score || new Date(a.at) - new Date(b.at))
        .map(({ device, name, score, total, at }) => ({ device, name, score, total, at }))
      return res.status(200).json({ entries: board, total: TOTAL })
    }

    if (req.method === 'POST') {
      const { device, name, score } = req.body || {}
      if (typeof device !== 'string' || !/^[a-zA-Z0-9]{8,64}$/.test(device)) {
        return res.status(400).json({ error: 'Invalid device' })
      }
      if (!Number.isInteger(score) || score < 0 || score > TOTAL) {
        return res.status(400).json({ error: 'Invalid score' })
      }
      const trimmed = typeof name === 'string' ? name.trim().slice(0, 60) : ''
      const nameB64 = trimmed
        ? Buffer.from(trimmed, 'utf8').toString('base64url')
        : 'anon'

      // One entry per device: keep the best score, adopt the latest name.
      const existing = (await listScoreBlobs()).filter(
        (b) => b.pathname.split('/')[1] === device
      )
      let best = score
      for (const blob of existing) {
        const entry = parseEntry(blob)
        if (entry && entry.score > best) best = entry.score
      }
      if (existing.length) {
        await del(existing.map((b) => b.url))
      }
      await put(
        `quiz/${device}/${nameB64}/${best}of${TOTAL}.json`,
        JSON.stringify({ device, name: trimmed, score: best, total: TOTAL }),
        {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'application/json',
        }
      )
      return res.status(200).json({ ok: true, best, improved: score >= best })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
