import { motion } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import SectionHeader from './SectionHeader'

function Registry() {
  return (
    <section className="section registry" id="registry">
      <div className="container">
        <SectionHeader
          label="Gifts"
          title="Registry"
          subtitle="The only thing we really need is you there. For those who would like to give a gift, we are registered below."
        />

        <motion.div
          style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.a
            href={CONFIG.registry[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="registry-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            View Registry <span aria-hidden="true">&rarr;</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default Registry
