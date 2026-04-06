import { motion } from 'framer-motion'
import { EASE } from '../config'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

function SectionHeader({ label, title, subtitle }) {
  return (
    <motion.div
      className="section-header"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
    >
      <motion.span
        className="section-label"
        variants={{
          hidden: { opacity: 0, x: -20 },
          visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
        }}
      >
        {label}
      </motion.span>

      <motion.h2
        className="section-title"
        variants={{
          hidden: { clipPath: 'inset(0 100% 0 0)' },
          visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.9, ease: EASE } },
        }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="ornament"
        variants={{
          hidden: { opacity: 0, scaleX: 0 },
          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.6, ease: EASE } },
        }}
      >
        <span className="ornament-line ornament-line-left" />
        <span className="ornament-symbol">&#x2726;</span>
        <span className="ornament-line ornament-line-right" />
      </motion.div>

      {subtitle && (
        <motion.p
          className="section-subtitle"
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}

export default SectionHeader
