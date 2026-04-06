import { motion } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import SectionHeader from './SectionHeader'

function ImageReveal({ src, alt, fromRight = false }) {
  return (
    <div className="story-image-wrapper">
      <motion.div
        className="story-image-frame"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
      <motion.div
        style={{ overflow: 'hidden' }}
        initial={{ clipPath: fromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <motion.img
          className="story-image"
          src={src}
          alt={alt}
          loading="lazy"
          initial={{ scale: 1.25 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: EASE }}
        />
      </motion.div>
    </div>
  )
}

function Story() {
  return (
    <section className="section story" id="story">
      <div className="container">
        <SectionHeader
          label="Our Journey"
          title="Our Story"
          subtitle="Every love story is beautiful, but ours is our favorite."
        />

        <div className="story-row story-content">
          <motion.div
            className="story-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <p>
              From the very first moment, there was something undeniable between
              us — a quiet understanding, a warmth that needed no words. What
              began as a chance encounter blossomed into the most extraordinary
              love story we could have ever imagined.
            </p>
            <p>
              Through every season of life, we&apos;ve grown together — sharing
              laughter over candlelit dinners, finding adventure in the simplest
              of moments, and building a love rooted in unwavering friendship,
              deep respect, and joy.
            </p>
          </motion.div>
          <ImageReveal src={CONFIG.photos.story1} alt="Engagement photo" />
        </div>

      </div>
    </section>
  )
}

export default Story
