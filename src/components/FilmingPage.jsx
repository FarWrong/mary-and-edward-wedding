import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { upload } from '@vercel/blob/client'
import { CONFIG, EASE } from '../config'

/* ---------- identity (no sign-in: a quiet per-device id) ---------- */

function getDeviceId() {
  let id = localStorage.getItem('filming.device')
  if (!id) {
    id = (
      crypto.randomUUID?.() ||
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    )
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 24)
    localStorage.setItem('filming.device', id)
  }
  return id
}

const DEVICE_ID = getDeviceId()

/* ---------- helpers ---------- */

function encodeName(name) {
  const trimmed = name.trim().slice(0, 60)
  if (!trimmed) return 'anon'
  const bytes = new TextEncoder().encode(trimmed)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function sanitizeFilename(name) {
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 ? name.slice(dot + 1).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) : ''
  let base = (dot > 0 ? name.slice(0, dot) : name)
    .replace(/[^a-zA-Z0-9 _.-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
  if (!base) base = 'memory'
  return ext ? `${base}.${ext.toLowerCase()}` : base
}

function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function searchText(item) {
  return normalize(`${item.name} ${item.filename} ${item.kind} ${formatDate(item.uploadedAt)}`)
}

let uidCounter = 0
const uid = () => `u${Date.now().toString(36)}-${uidCounter++}`

const MAX_PARALLEL = 3
const MULTIPART_THRESHOLD = 8 * 1024 * 1024

/* ---------- icons ---------- */

const HeartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.7-9.6-9.2C.9 8 2.7 4.6 6 4.6c2.2 0 3.6 1.2 6 3.8 2.4-2.6 3.8-3.8 6-3.8 3.3 0 5.1 3.4 3.6 6.7-2.1 4.5-9.6 9.2-9.6 9.2z" strokeLinejoin="round" />
  </svg>
)

const CameraIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M4 8h2.6l1.5-2.4A1.2 1.2 0 0 1 9.1 5h5.8a1.2 1.2 0 0 1 1 .6L17.4 8H20a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19H4a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 4 8z" strokeLinejoin="round" />
    <circle cx="12" cy="13" r="3.4" />
  </svg>
)

const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" strokeLinecap="round" />
  </svg>
)

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
)

const LockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <rect x="5" y="10.5" width="14" height="9" rx="1.5" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
)

/* ---------- component ---------- */

const GALLERIES = {
  everyone: {
    label: "Everyone's Album",
    tagline: 'Shared with all our guests — fill it with the day as you saw it.',
  },
  couple: {
    label: 'Just for Mary & Edward',
    tagline: 'A private gift. Only the two of us will ever see what you leave here.',
  },
}

function FilmingPage() {
  const [tab, setTab] = useState('everyone')
  const [albums, setAlbums] = useState({ everyone: null, couple: null })
  const [status, setStatus] = useState('loading') // loading | ready | error | unconfigured
  const [uploads, setUploads] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [toast, setToast] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploaderName, setUploaderName] = useState(
    () => localStorage.getItem('filming.name') || ''
  )
  const [coupleKey, setCoupleKey] = useState(
    () => localStorage.getItem('filming.coupleKey') || ''
  )
  const [keyInput, setKeyInput] = useState('')
  const [keyPromptOpen, setKeyPromptOpen] = useState(false)
  const [keyError, setKeyError] = useState(false)

  const fileInputRef = useRef(null)
  const nameRef = useRef(uploaderName)
  const queueRef = useRef([])
  const activeRef = useRef(0)
  const toastTimer = useRef(null)

  useEffect(() => {
    document.title = `Share Your Photos — ${CONFIG.partner2} & ${CONFIG.partner1}`
  }, [])

  useEffect(() => {
    nameRef.current = uploaderName
    localStorage.setItem('filming.name', uploaderName)
  }, [uploaderName])

  /* ---------- fetching ---------- */

  const fetchAlbum = useCallback(
    async (gallery, { code } = {}) => {
      setStatus('loading')
      try {
        const params = new URLSearchParams({ gallery, device: DEVICE_ID })
        const secret = code !== undefined ? code : localStorage.getItem('filming.coupleKey') || ''
        if (gallery === 'couple' && secret) params.set('code', secret)
        const res = await fetch(`/api/photos?${params}`)
        if (res.status === 503) {
          setStatus('unconfigured')
          return null
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setAlbums((prev) => ({ ...prev, [gallery]: data }))
        setStatus('ready')
        return data
      } catch {
        setStatus('error')
        return null
      }
    },
    []
  )

  useEffect(() => {
    if (!albums[tab]) fetchAlbum(tab)
    else setStatus('ready')
    setFilter('all')
    setQuery('')
    setLightbox(null)
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- uploading ---------- */

  const showToast = (message) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  const patchUpload = (id, patch) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }

  const removeUpload = (id) => {
    setUploads((prev) => {
      const entry = prev.find((u) => u.id === id)
      if (entry?.preview) URL.revokeObjectURL(entry.preview)
      return prev.filter((u) => u.id !== id)
    })
  }

  const runUpload = async (entry) => {
    patchUpload(entry.id, { status: 'uploading' })
    try {
      const nameB64 = encodeName(nameRef.current)
      const safe = sanitizeFilename(entry.file.name)
      const pathname = `filming/${entry.gallery}/${DEVICE_ID}/${nameB64}/${safe}`
      const result = await upload(pathname, entry.file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
        multipart: entry.file.size > MULTIPART_THRESHOLD,
        onUploadProgress: ({ percentage }) => {
          patchUpload(entry.id, { progress: percentage })
        },
      })
      patchUpload(entry.id, { status: 'done', progress: 100 })
      setTimeout(() => removeUpload(entry.id), 2600)

      const item = {
        url: result.url,
        downloadUrl: `${result.url}?download=1`,
        pathname: result.pathname,
        size: entry.file.size,
        uploadedAt: new Date().toISOString(),
        gallery: entry.gallery,
        device: DEVICE_ID,
        name: nameRef.current.trim(),
        filename: safe,
        kind: entry.kind,
      }
      setAlbums((prev) => {
        const album = prev[entry.gallery]
        if (!album) return prev
        return {
          ...prev,
          [entry.gallery]: { ...album, items: [item, ...album.items] },
        }
      })
      showToast(
        entry.gallery === 'couple'
          ? 'Tucked away for Mary & Edward 🤍'
          : 'Added to the album — thank you 🤍'
      )
    } catch (err) {
      patchUpload(entry.id, { status: 'error', error: err?.message || 'Upload failed' })
    }
  }

  const pump = () => {
    while (activeRef.current < MAX_PARALLEL && queueRef.current.length) {
      const entry = queueRef.current.shift()
      activeRef.current++
      runUpload(entry).finally(() => {
        activeRef.current--
        pump()
      })
    }
  }

  const handleFiles = (fileList) => {
    const files = [...fileList].filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (!files.length) return
    const entries = files.map((file) => ({
      id: uid(),
      file,
      gallery: tab,
      kind: file.type.startsWith('video/') ? 'video' : 'image',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      progress: 0,
      status: 'queued',
    }))
    setUploads((prev) => [...prev, ...entries])
    queueRef.current.push(...entries)
    pump()
  }

  const retryUpload = (entry) => {
    patchUpload(entry.id, { status: 'queued', progress: 0, error: null })
    queueRef.current.push(entry)
    pump()
  }

  /* ---------- couple key ---------- */

  const submitCoupleKey = async (e) => {
    e.preventDefault()
    const code = keyInput.trim()
    if (!code) return
    setKeyError(false)
    const data = await fetchAlbum('couple', { code })
    if (data?.isCouple) {
      localStorage.setItem('filming.coupleKey', code)
      setCoupleKey(code)
      setKeyPromptOpen(false)
      setKeyInput('')
      showToast('Welcome back, you two 🤍')
    } else if (data) {
      setKeyError(true)
    }
  }

  /* ---------- deletion ---------- */

  const deleteItem = async (item) => {
    if (!window.confirm('Remove this from the album?')) return
    try {
      const res = await fetch('/api/photos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url, device: DEVICE_ID }),
      })
      if (!res.ok) throw new Error()
      setAlbums((prev) => {
        const album = prev[item.gallery || tab]
        if (!album) return prev
        return {
          ...prev,
          [item.gallery || tab]: {
            ...album,
            items: album.items.filter((i) => i.url !== item.url),
          },
        }
      })
      setLightbox(null)
      showToast('Removed')
    } catch {
      showToast("Couldn't remove that — try again")
    }
  }

  /* ---------- derived ---------- */

  const album = albums[tab]
  const items = album?.items || []
  const isCouple = Boolean(album?.isCouple)

  const visible = useMemo(() => {
    let arr = items
    if (filter === 'image' || filter === 'video') arr = arr.filter((i) => i.kind === filter)
    if (filter === 'mine') arr = arr.filter((i) => i.device === DEVICE_ID)
    const q = normalize(query.trim())
    if (q) arr = arr.filter((i) => searchText(i).includes(q))
    return arr
  }, [items, filter, query])

  /* ---------- lightbox ---------- */

  const openLightbox = (index) => {
    setLightbox(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    document.body.style.overflow = ''
  }, [])

  const navigate = useCallback(
    (dir) => {
      setLightbox((prev) =>
        prev === null ? prev : (prev + dir + visible.length) % visible.length
      )
    },
    [visible.length]
  )

  useEffect(() => {
    const handler = (e) => {
      if (lightbox === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, closeLightbox, navigate])

  useEffect(() => () => { document.body.style.overflow = '' }, [])

  const current = lightbox !== null ? visible[lightbox] : null

  const activeUploads = uploads.filter((u) => u.status !== 'done')
  const doneUploads = uploads.filter((u) => u.status === 'done')

  /* ---------- render ---------- */

  return (
    <div className="filming-page">
      {/* header */}
      <header className="filming-header">
        <a href="/" className="filming-back">
          ← Back to Home
        </a>
        <motion.div
          className="filming-header-content"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.span
            className="filming-monogram"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            {CONFIG.monogram}
          </motion.span>
          <motion.h1
            className="filming-title"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            Through Your Lens
          </motion.h1>
          <motion.p
            className="filming-intro"
            variants={{
              hidden: { opacity: 0, y: 16 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
            }}
          >
            Every photograph remembers the day a little differently.
            Leave us yours.
          </motion.p>
        </motion.div>
      </header>

      {/* album tabs */}
      <div className="filming-tabs" role="tablist">
        {Object.entries(GALLERIES).map(([key, g]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`filming-tab${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {key === 'couple' && <LockIcon className="filming-tab-lock" />}
            {g.label}
            {tab === key && (
              <motion.span
                className="filming-tab-underline"
                layoutId="filming-tab-underline"
                transition={{ duration: 0.4, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tab}
          className="filming-tagline"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {GALLERIES[tab].tagline}
        </motion.p>
      </AnimatePresence>

      <main className="filming-main">
        {/* upload card */}
        <motion.section
          className="filming-upload-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        >
          <div className="filming-name-row">
            <label htmlFor="filming-name">Sharing as</label>
            <input
              id="filming-name"
              type="text"
              value={uploaderName}
              maxLength={60}
              placeholder="your name (optional)"
              onChange={(e) => setUploaderName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div
            className={`filming-dropzone${dragOver ? ' drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
            }}
          >
            <motion.div
              className="filming-dropzone-icon"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CameraIcon />
            </motion.div>
            <p className="filming-dropzone-title">
              {dragOver ? 'Let them go 🤍' : 'Drop your memories here'}
            </p>
            <p className="filming-dropzone-sub">
              or tap to open your camera roll · photos & videos
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {/* upload progress */}
          <AnimatePresence>
            {(activeUploads.length > 0 || doneUploads.length > 0) && (
              <motion.ul
                className="filming-upload-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <AnimatePresence>
                  {uploads.map((u) => (
                    <motion.li
                      key={u.id}
                      className={`filming-upload-row ${u.status}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      layout
                    >
                      <div className="filming-upload-thumb">
                        {u.preview ? (
                          <img src={u.preview} alt="" />
                        ) : (
                          <span className="filming-upload-thumb-video">
                            <PlayIcon />
                          </span>
                        )}
                      </div>
                      <div className="filming-upload-info">
                        <span className="filming-upload-name">{u.file.name}</span>
                        {u.status === 'error' ? (
                          <span className="filming-upload-error">
                            Upload failed ·{' '}
                            <button onClick={() => retryUpload(u)}>retry</button>
                            {' · '}
                            <button onClick={() => removeUpload(u.id)}>dismiss</button>
                          </span>
                        ) : (
                          <span className="filming-upload-bar">
                            <motion.span
                              className="filming-upload-bar-fill"
                              animate={{ width: `${u.progress}%` }}
                              transition={{ duration: 0.25 }}
                            />
                          </span>
                        )}
                      </div>
                      <span className="filming-upload-status">
                        {u.status === 'done'
                          ? '✓'
                          : u.status === 'error'
                            ? '!'
                            : `${Math.round(u.progress)}%`}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.section>

        {/* couple unlock */}
        {tab === 'couple' && !isCouple && status === 'ready' && (
          <div className="filming-couple-note">
            <p>
              Everything uploaded here goes straight to Mary&nbsp;&&nbsp;Edward.
              Below are the memories <em>you've</em> left for them.
            </p>
            {!keyPromptOpen ? (
              <button
                className="filming-unlock-link"
                onClick={() => setKeyPromptOpen(true)}
              >
                <LockIcon className="filming-tab-lock" /> Mary or Edward? Unlock your album
              </button>
            ) : (
              <form className="filming-unlock-form" onSubmit={submitCoupleKey}>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value)
                    setKeyError(false)
                  }}
                  placeholder="your secret key"
                  autoFocus
                />
                <button type="submit">Unlock</button>
                {keyError && (
                  <span className="filming-unlock-error">
                    That's not it — try again
                  </span>
                )}
              </form>
            )}
          </div>
        )}
        {tab === 'couple' && isCouple && (
          <p className="filming-couple-badge">
            <HeartIcon className="filming-badge-heart" /> Viewing as Mary & Edward —
            every private upload is here.
          </p>
        )}

        {/* toolbar */}
        {status === 'ready' && items.length > 0 && (
          <div className="filming-toolbar">
            <div className="filming-search">
              <SearchIcon className="filming-search-icon" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, file, or date…"
                aria-label="Search photos"
              />
              {query && (
                <button
                  className="filming-search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <div className="filming-chips">
              {[
                ['all', 'All'],
                ['image', 'Photos'],
                ['video', 'Videos'],
                ['mine', 'My Uploads'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  className={`filming-chip${filter === key ? ' active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* gallery states */}
        {status === 'loading' && (
          <div className="filming-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="filming-skeleton"
                style={{ aspectRatio: [4 / 5, 1, 3 / 4, 4 / 3][i % 4] }}
              />
            ))}
          </div>
        )}

        {status === 'unconfigured' && (
          <div className="filming-empty">
            <HeartIcon className="filming-empty-heart" />
            <p>The album is almost ready — photo storage isn't connected yet.</p>
            <p className="filming-empty-sub">
              (Connect a Vercel Blob store to this project and it will come alive.)
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="filming-empty">
            <p>We couldn't load the album just now.</p>
            <button className="filming-retry" onClick={() => fetchAlbum(tab)}>
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && items.length === 0 && (
          <div className="filming-empty">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <HeartIcon className="filming-empty-heart" />
            </motion.div>
            <p>
              {tab === 'couple'
                ? "You haven't left anything for the couple yet — be their favorite surprise."
                : 'No memories here yet — be the first to fill the album.'}
            </p>
          </div>
        )}

        {status === 'ready' && items.length > 0 && visible.length === 0 && (
          <div className="filming-empty">
            <p>Nothing matches that — try a different search.</p>
          </div>
        )}

        {status === 'ready' && visible.length > 0 && (
          <div className="filming-grid">
            {visible.map((item, i) => (
              <motion.figure
                key={item.pathname}
                className="filming-item"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: Math.min(i * 0.04, 0.5), ease: EASE }}
                onClick={() => openLightbox(i)}
              >
                {item.kind === 'video' ? (
                  <div className="filming-item-video">
                    <video
                      src={`${item.url}#t=0.1`}
                      preload="metadata"
                      muted
                      playsInline
                    />
                    <span className="filming-item-play">
                      <PlayIcon />
                    </span>
                  </div>
                ) : (
                  <img src={item.url} alt={item.name ? `Shared by ${item.name}` : 'Guest photo'} loading="lazy" />
                )}
                <figcaption className="filming-item-meta">
                  <span className="filming-item-name">
                    {item.device === DEVICE_ID ? 'You' : item.name || 'A guest'}
                  </span>
                  <span className="filming-item-date">
                    {formatDate(item.uploadedAt)}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </main>

      {/* lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="lightbox filming-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox()
            }}
          >
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              &times;
            </button>
            {visible.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={() => navigate(-1)}
                  aria-label="Previous"
                >
                  &#8249;
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={() => navigate(1)}
                  aria-label="Next"
                >
                  &#8250;
                </button>
              </>
            )}
            {current.kind === 'video' ? (
              <motion.video
                key={current.pathname}
                className="lightbox-img"
                src={current.url}
                controls
                autoPlay
                playsInline
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            ) : (
              <motion.img
                key={current.pathname}
                className="lightbox-img"
                src={current.url}
                alt={current.name ? `Shared by ${current.name}` : 'Guest photo'}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            )}
            <div className="filming-lightbox-caption">
              <span>
                {current.device === DEVICE_ID
                  ? 'Shared by you'
                  : current.name
                    ? `Shared by ${current.name}`
                    : 'Shared by a guest'}
                {' · '}
                {formatDate(current.uploadedAt)}
              </span>
              <span className="filming-lightbox-actions">
                <a href={current.downloadUrl} download>
                  Download
                </a>
                {current.device === DEVICE_ID && (
                  <button onClick={() => deleteItem(current)}>Remove</button>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="filming-toast"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="filming-footer">
        <span className="filming-footer-hashtag">{CONFIG.hashtag}</span>
      </footer>
    </div>
  )
}

export default FilmingPage
