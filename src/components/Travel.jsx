import { motion } from 'framer-motion'
import { EASE } from '../config'
import SectionHeader from './SectionHeader'

const cards = [
  {
    title: 'Where to Stay',
    content: (
      <>
        <p>
          We have arranged a room block at the{' '}
          <strong>Hilton Garden Inn Islip/MacArthur Airport</strong>{' '}
          for our guests&apos; convenience. Details and booking
          information can be found on your invitation.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          3485 Veterans Memorial Hwy
          <br />
          Ronkonkoma, NY 11779
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
          Parkway. Parking is available at the venue.
        </p>
      </>
    ),
  },
  {
    title: 'Things to Enjoy',
    content: (
      <>
        <p>
          For those traveling from further afield, New York City is just an
          hour west of the venue. Take in the skyline, stroll through
          Central Park, or explore world-class dining and Broadway. Closer to
          the venue, Long Island offers beautiful beaches, vineyards, and
          charming villages. Fire Island is a short ferry ride from Sayville.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          We recommend arriving a day or two early to settle in and enjoy
          everything the area has to offer.
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
