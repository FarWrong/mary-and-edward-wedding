import { motion } from 'framer-motion'
import { EASE } from '../config'
import SectionHeader from './SectionHeader'

const cards = [
  {
    title: 'Where to Stay',
    content: (
      <>
        <p>
          We have arranged room blocks at select nearby hotels for our
          guests&apos; convenience. Please mention our wedding when booking for
          the group rate.
        </p>
        <p style={{ marginTop: '1rem' }}>
          <strong>Sayville Inn</strong>
          <br />
          Walking distance from the venue
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>Holiday Inn Express Ronkonkoma</strong>
          <br />
          Approximately 15 minutes from the venue
        </p>
      </>
    ),
  },
  {
    title: 'Getting There',
    content: (
      <>
        <p>
          <strong>From New York City:</strong>
          <br />
          Take the Long Island Rail Road (LIRR) from Penn Station to the
          Sayville station (approximately 1 hour 15 minutes). The venue is a
          short ride from the station.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>By Car:</strong>
          <br />
          Approximately 60 miles east of Manhattan via the Southern State
          Parkway. Complimentary valet parking is available at the venue.
        </p>
      </>
    ),
  },
  {
    title: 'Things to Enjoy',
    content: (
      <>
        <p>
          If you are extending your visit, Long Island offers beautiful beaches,
          vineyards, and charming villages to explore. The nearby Fire Island is
          a short ferry ride from Sayville.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          We recommend arriving the day before to settle in and enjoy the area
          at your leisure.
        </p>
      </>
    ),
  },
]

function Travel() {
  return (
    <section className="section travel" id="travel">
      <div className="container">
        <SectionHeader
          label="Getting There"
          title="Travel & Accommodations"
          subtitle="We want to make your visit as seamless as possible."
        />

        <motion.div
          className="travel-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="travel-card"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: EASE },
                },
              }}
              whileHover={{
                borderColor: 'rgba(197, 165, 114, 0.4)',
                transition: { duration: 0.3 },
              }}
            >
              <h3>{card.title}</h3>
              {card.content}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Travel
