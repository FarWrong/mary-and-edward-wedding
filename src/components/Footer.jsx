import { motion } from 'framer-motion'
import { CONFIG, EASE } from '../config'

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

function Footer() {
  return (
    <footer className="footer">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="footer-monogram"
          variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.8, ease: EASE },
            },
          }}
        >
          {CONFIG.monogram}
        </motion.div>

        <motion.p className="footer-message" variants={fadeUp}>
          With love and gratitude
        </motion.p>

        <motion.p className="footer-hashtag" variants={fadeUp}>
          {CONFIG.hashtag}
        </motion.p>
      </motion.div>

      <div className="footer-bottom">
        July 19, 2026 &bull; West Sayville, Long Island
      </div>
    </footer>
  )
}

export default Footer
