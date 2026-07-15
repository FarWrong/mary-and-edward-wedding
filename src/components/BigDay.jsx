import { motion } from 'framer-motion'
import { EASE } from '../config'
import SectionHeader from './SectionHeader'

const LINKS = [
  {
    href: '/schedule',
    icon: '✦',
    title: 'Schedule',
    text: 'See how the day unfolds, from the ceremony to the last dance.',
    cta: 'View the Schedule',
  },
  {
    href: '/seating',
    icon: '✧',
    title: 'Seating Chart',
    text: 'Find your table and see who you’ll be celebrating beside.',
    cta: 'Find Your Seat',
  },
  {
    href: '/filming',
    icon: '✥',
    title: 'Share Photos',
    text: 'Add your photos and videos to our shared wedding album.',
    cta: 'Open the Album',
  },
  {
    href: '/quiz',
    icon: '❉',
    title: 'The Quiz',
    text: 'How well do you know the bride and groom? Play for bragging rights.',
    cta: 'Test Yourself',
  },
]

function BigDay() {
  return (
    <section className="section bigday" id="bigday">
      <div className="container">
        <SectionHeader
          label="Sunday, July 19, 2026"
          title="The Big Day"
          subtitle="Everything you need for the celebration, all in one place."
        />
        <div className="bigday-grid">
          {LINKS.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="bigday-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
            >
              <span className="bigday-card-inner-border" aria-hidden="true" />
              <span className="detail-icon">{link.icon}</span>
              <h3>{link.title}</h3>
              <p>{link.text}</p>
              <span className="bigday-cta">{link.cta}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BigDay
