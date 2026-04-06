import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import SectionHeader from './SectionHeader'

const photos = CONFIG.photos.gallery

function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const openLightbox = (index) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }, [])

  const navigate = useCallback(
    (dir) => {
      setLightboxIndex((prev) => (prev + dir + photos.length) % photos.length)
    },
    []
  )

  useEffect(() => {
    const handler = (e) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, closeLightbox, navigate])

  return (
    <>
      <section className="section gallery" id="gallery">
        <div className="container">
          <SectionHeader
            label="Moments"
            title="Captured Moments"
            subtitle="A glimpse into our journey together."
          />

          <motion.div
            className="gallery-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
            }}
          >
            {photos.map((src, i) => (
              <motion.div
                key={i}
                className="gallery-item"
                onClick={() => openLightbox(i)}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.7, ease: EASE },
                  },
                }}
              >
                <img
                  src={src}
                  alt={`Engagement photo ${i + 1}`}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox()
            }}
          >
            <button className="lightbox-close" onClick={closeLightbox}>
              &times;
            </button>
            <button
              className="lightbox-nav lightbox-prev"
              onClick={() => navigate(-1)}
            >
              &#8249;
            </button>
            <button
              className="lightbox-nav lightbox-next"
              onClick={() => navigate(1)}
            >
              &#8250;
            </button>
            <motion.img
              key={lightboxIndex}
              className="lightbox-img"
              src={photos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Gallery
