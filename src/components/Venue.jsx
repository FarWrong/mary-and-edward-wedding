import { motion } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import SectionHeader from './SectionHeader'

function Venue() {
  return (
    <section className="section venue" id="venue">
      <div className="container-narrow">
        <SectionHeader label="The Setting" title="The Venue" />

        <div style={{ overflow: 'hidden' }}>
          <motion.h3
            className="venue-name"
            initial={{ y: '100%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {CONFIG.venue.name}
          </motion.h3>
        </div>

        <motion.p
          className="venue-description"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          Nestled along the shores of the Great South Bay, The Mansion at West
          Sayville is a breathtaking waterfront estate steeped in Long Island
          history. Its timeless elegance, manicured gardens, and sweeping views
          of the bay provide the perfect backdrop for an unforgettable
          celebration of love.
        </motion.p>

        <motion.div
          className="venue-info"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <address className="venue-address">{CONFIG.venue.address}</address>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <motion.a
            href={CONFIG.venue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="venue-map-link"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            View on Map &rarr;
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default Venue
