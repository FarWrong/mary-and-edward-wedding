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
          subtitle="Your presence means the world to us. For those who would like to give a gift, we are registered at the following."
        />

        <motion.div
          className="registry-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {CONFIG.registry.map((item, i) => (
            <motion.a
              key={i}
              className="registry-card"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: EASE },
                },
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.3 },
              }}
            >
              <div className="registry-card-inner-border" />
              {item.image && (
                <div className="registry-image">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
              )}
              <div className="registry-body">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.price && <span className="registry-price">{item.price}</span>}
                <span className="registry-link">
                  View Registry <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Registry
