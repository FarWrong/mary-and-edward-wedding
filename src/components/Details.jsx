import { motion } from 'framer-motion'
import { EASE } from '../config'
import SectionHeader from './SectionHeader'

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay: i * 0.2 },
  }),
}

const borderVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.2 + 0.3 },
  }),
}

function Details() {
  return (
    <section className="section details" id="details">
      <div className="container">
        <SectionHeader
          label="The Celebration"
          title="Wedding Details"
          subtitle="Everything you need to know about the day."
        />

        <motion.p
          className="details-note"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
        >
          This will be an adults-only celebration. Thank you for understanding.
        </motion.p>

        <div className="details-grid">
          <motion.div
            className="detail-card"
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <motion.div
              className="detail-card-inner-border"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={borderVariants}
            />
            <span className="detail-icon">&#x2727;</span>
            <h3>Ceremony</h3>
            <span className="detail-time">Begins Promptly at Two in the Afternoon</span>
            <p>
              St. Lawrence the Martyr Roman Catholic Church
              <br />
              27 Handsome Ave
              <br />
              Sayville, NY 11782
            </p>
            <p className="detail-note">Please arrive a little early</p>
            <span className="detail-dress">Formal Dress</span>
          </motion.div>

          <motion.div
            className="detail-card"
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <motion.div
              className="detail-card-inner-border"
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={borderVariants}
            />
            <span className="detail-icon">&#x2725;</span>
            <h3>Reception</h3>
            <span className="detail-time">
              Four in the Afternoon, Following the Ceremony
            </span>
            <p>
              The Mansion at West Sayville
              <br />
              200 Main St
              <br />
              West Sayville, NY 11796
            </p>
            <span className="detail-dress">Dinner &amp; Dancing</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Details
