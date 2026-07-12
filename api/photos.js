import { list, del } from '@vercel/blob'

const VIDEO_EXTS = new Set([
  'mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv', '3gp', 'mpg', 'mpeg', 'wmv',
])

// Blob pathnames look like: filming/{gallery}/{deviceId}/{nameB64|anon}/{file}-{randomSuffix}.{ext}
function parseBlob(blob) {
  const parts = blob.pathname.split('/')
  if (parts.length !== 5 || parts[0] !== 'filming') return null
  const [, gallery, device, nameB64, file] = parts

  let name = ''
  if (nameB64 !== 'anon') {
    try {
      name = Buffer.from(nameB64, 'base64url').toString('utf8')
    } catch {
      name = ''
    }
  }

  const ext = (file.includes('.') ? file.split('.').pop() : '').toLowerCase()
  // Strip the random suffix Vercel appends before the extension for display
  const filename = file.replace(/-[A-Za-z0-9]{16,}(\.[A-Za-z0-9]+)$/, '$1')

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl || `${blob.url}?download=1`,
    pathname: blob.pathname,
    size: blob.size,
    uploadedAt: blob.uploadedAt,
    gallery,
    device,
    name,
    filename,
    kind: VIDEO_EXTS.has(ext) ? 'video' : 'image',
  }
}

async function listGallery(gallery) {
  const blobs = []
  let cursor
  do {
    const page = await list({ prefix: `filming/${gallery}/`, cursor, limit: 1000 })
    blobs.push(...page.blobs)
    cursor = page.cursor
  } while (cursor && blobs.length < 10000)
  return blobs
    .map(parseBlob)
    .filter(Boolean)
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
}

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'storage_not_configured' })
  }

  try {
    if (req.method === 'GET') {
      const gallery = req.query.gallery === 'couple' ? 'couple' : 'everyone'
      let items = await listGallery(gallery)

      if (gallery === 'couple') {
        const secret = process.env.FILMING_COUPLE_CODE
        const isCouple = Boolean(secret) && req.query.code === secret
        if (!isCouple) {
          // Guests only ever see their own private gifts to the couple
          const device = typeof req.query.device === 'string' ? req.query.device : ''
          items = device ? items.filter((i) => i.device === device) : []
        }
        return res.status(200).json({ items, isCouple })
      }

      return res.status(200).json({ items, isCouple: false })
    }

    if (req.method === 'DELETE') {
      const { url, device } = req.body || {}
      if (typeof url !== 'string' || typeof device !== 'string' || !device) {
        return res.status(400).json({ error: 'Missing url or device' })
      }
      let pathname
      try {
        pathname = decodeURIComponent(new URL(url).pathname.slice(1))
      } catch {
        return res.status(400).json({ error: 'Invalid url' })
      }
      const parts = pathname.split('/')
      // Only the device that uploaded a file may remove it
      if (parts[0] !== 'filming' || parts[2] !== device) {
        return res.status(403).json({ error: 'Not your upload' })
      }
      await del(url)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
