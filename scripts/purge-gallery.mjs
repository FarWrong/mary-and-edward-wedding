// Purge ALL gallery uploads (photos, videos, and the leaderboard, which is
// derived from upload paths) from the Vercel Blob store.
//
// Usage:
//   node scripts/purge-gallery.mjs           # dry run: lists what would be deleted
//   node scripts/purge-gallery.mjs --yes     # actually deletes everything
//
// Requires BLOB_READ_WRITE_TOKEN, either in the environment or in .env.local:
//   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
import { list, del } from '@vercel/blob'
import { readFileSync } from 'node:fs'

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^\s*BLOB_READ_WRITE_TOKEN\s*=\s*"?([^"\s]+)"?\s*$/)
      if (m) process.env.BLOB_READ_WRITE_TOKEN = m[1]
    }
  } catch {
    // no .env.local; fall through to the check below
  }
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    'Missing BLOB_READ_WRITE_TOKEN. Put it in .env.local or the environment.'
  )
  process.exit(1)
}

const confirm = process.argv.includes('--yes')

const blobs = []
let cursor
do {
  const page = await list({ prefix: 'filming/', cursor, limit: 1000 })
  blobs.push(...page.blobs)
  cursor = page.cursor
} while (cursor)

if (blobs.length === 0) {
  console.log('Gallery is already empty. Nothing to delete.')
  process.exit(0)
}

const bytes = blobs.reduce((sum, b) => sum + b.size, 0)
console.log(`Found ${blobs.length} uploads (${(bytes / 1e6).toFixed(1)} MB):`)
for (const b of blobs) console.log(`  ${b.pathname}`)

if (!confirm) {
  console.log('\nDry run only. Re-run with --yes to delete everything above.')
  process.exit(0)
}

// del() accepts batches of URLs
const BATCH = 100
for (let i = 0; i < blobs.length; i += BATCH) {
  await del(blobs.slice(i, i + BATCH).map((b) => b.url))
  console.log(`Deleted ${Math.min(i + BATCH, blobs.length)}/${blobs.length}`)
}
console.log('Done. Gallery and leaderboard are now empty.')
