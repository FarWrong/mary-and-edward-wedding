import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import { SCHEDULE } from '../scheduleData'
import GuestPagesNav from './GuestPagesNav'

function SchedulePage() {
  useEffect(() => {
    document.title = `Schedule · ${CONFIG.partner2} & ${CONFIG.partner1}`
  }, [])

  return (
    <div className="schedule-page">
      <header className="seating-header">
        <a href="/" className="seating-back">
          &larr; Back to the Wedding
        </a>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="seating-header-content"
        >
          <span className="seating-monogram">{CONFIG.monogram}</span>
          <span className="section-label">Sunday, July 19, 2026</span>
          <h1 className="section-title">The Big Day</h1>
          <div className="ornament">
            <span className="ornament-line ornament-line-left" />
            <span className="ornament-symbol">&#10047;</span>
            <span className="ornament-line ornament-line-right" />
          </div>
          <GuestPagesNav current="/schedule" />
        </motion.div>
      </header>

      <main className="schedule-wrapper">
        {SCHEDULE.map((group, groupIndex) => (
          <motion.section
            key={group.section}
            className="schedule-group"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.35,
              ease: EASE,
              delay: Math.min(groupIndex * 0.03, 0.1),
            }}
          >
            <h2 className="schedule-section-title">{group.section}</h2>
            <ol className="schedule-events">
              {group.events.map((event) => (
                <li key={`${event.time}-${event.title}`} className="schedule-event">
                  <span className="schedule-time">{event.time}</span>
                  <span className="schedule-marker" aria-hidden="true" />
                  <div className="schedule-body">
                    <h3 className="schedule-title">{event.title}</h3>
                    {event.location && (
                      <p className="schedule-location">{event.location}</p>
                    )}
                    {event.note && <p className="schedule-note">{event.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>
        ))}

        <p className="schedule-closing">
          We can&rsquo;t wait to celebrate with you!
        </p>
        <div className="schedule-links">
          <a href="/seating" className="schedule-link-btn">
            Find Your Seat
          </a>
        </div>
      </main>

      <footer className="seating-footer">
        <span className="seating-footer-monogram">{CONFIG.monogram}</span>
        <p>July 19, 2026 &bull; {CONFIG.venue.name}</p>
      </footer>
    </div>
  )
}

export default SchedulePage
