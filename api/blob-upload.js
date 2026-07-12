import { handleUpload } from '@vercel/blob/client'

// Uploads land at: filming/{gallery}/{deviceId}/{nameBase64url|anon}/{filename}
// gallery: 'everyone' (shared album) or 'couple' (private, for Mary & Edward)
const PATH_RE =
  /^filming\/(everyone|couple)\/[a-zA-Z0-9]{8,64}\/(anon|[A-Za-z0-9_-]{1,120})\/[^/]{1,200}$/

const MAX_SIZE = 2 * 1024 * 1024 * 1024 // 2GB — plenty for phone video

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!PATH_RE.test(pathname)) {
          throw new Error('Invalid upload path')
        }
        return {
          allowedContentTypes: ['image/*', 'video/*'],
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: true,
        }
      },
      // Fires via webhook after the browser finishes uploading (not on localhost).
      // We list blobs directly, so nothing to record here.
      onUploadCompleted: async () => {},
    })
    return res.status(200).json(jsonResponse)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
