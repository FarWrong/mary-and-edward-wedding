import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import { GUESTS } from '../seatingData'
import PetalCanvas from './PetalCanvas'

function lastName(name) {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1]
}

function tableLabel(table) {
  return typeof table === 'number' ? `Table ${table}` : table
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const SORTED_GUESTS = [...GUESTS].sort(
  (a, b) =>
    lastName(a.name).localeCompare(lastName(b.name)) ||
    a.name.localeCompare(b.name)
)

function guestKey(guest) {
  return `${guest.name}-${guest.table}`
}

function SeatingPage() {
  const [query, setQuery] = useState('')
  const [openKey, setOpenKey] = useState(null)

  useEffect(() => {
    document.title = `Seating Chart — ${CONFIG.partner2} & ${CONFIG.partner1}`
  }, [])

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return SORTED_GUESTS
    return SORTED_GUESTS.filter((g) => normalize(g.name).includes(q))
  }, [query])

  const groups = useMemo(() => {
    const map = new Map()
    for (const guest of filtered) {
      const letter = lastName(guest.name)[0].toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter).push(guest)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div className="seating-page">
      <PetalCanvas />

      <header className="seating-header">
        <a href="/" className="seating-back">
          &larr; Back to the Wedding
        </a>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="seating-header-content"
        >
          <span className="seating-monogram">{CONFIG.monogram}</span>
          <span className="section-label">Find Your Seat</span>
          <h1 className="section-title">Seating Chart</h1>
          <div className="ornament">
            <span className="ornament-line ornament-line-left" />
            <span className="ornament-symbol">&#10047;</span>
            <span className="ornament-line ornament-line-right" />
          </div>
          <p className="seating-intro">
            Welcome! Search for your name below to find your table.
          </p>
        </motion.div>
      </header>

      <div className="seating-search-bar">
        <div className="seating-search-inner">
          <svg
            className="seating-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            type="search"
            className="seating-search-input"
            placeholder="Search your name&hellip;"
            aria-label="Search for your name"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="seating-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <main className="seating-list-wrapper">
        <p className="seating-count" role="status">
          {filtered.length === SORTED_GUESTS.length
            ? `${SORTED_GUESTS.length} guests, listed alphabetically`
            : `${filtered.length} ${filtered.length === 1 ? 'guest' : 'guests'} found`}
        </p>
        {groups.length > 0 && (
          <p className="seating-hint">
            Tap any name to see who you&rsquo;re seated with
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {groups.length === 0 ? (
            <motion.p
              key="empty"
              className="seating-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No guests found by that name &mdash; try just a first or last
              name, or find us at the reception and we&rsquo;ll point you to
              your seat!
            </motion.p>
          ) : (
            groups.map(([letter, guests], groupIndex) => (
              <motion.section
                key={letter}
                className="seating-group"
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: EASE,
                    delay: Math.min(groupIndex * 0.05, 0.4),
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <h2 className="seating-letter">{letter}</h2>
                <ul className="seating-rows">
                  {guests.map((guest) => {
                    const key = guestKey(guest)
                    const isOpen = openKey === key
                    const mates = isOpen
                      ? SORTED_GUESTS.filter(
                          (g) => g.table === guest.table && g.name !== guest.name
                        )
                      : []
                    return (
                      <li key={key} className="seating-row-item">
                        <button
                          type="button"
                          className={`seating-row${isOpen ? ' open' : ''}`}
                          aria-expanded={isOpen}
                          onClick={() => setOpenKey(isOpen ? null : key)}
                        >
                          <span className="seating-name">{guest.name}</span>
                          <span className="seating-leader" aria-hidden="true" />
                          <span className="seating-table">
                            {tableLabel(guest.table)}
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              className="seating-mates"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: EASE }}
                            >
                              <p>
                                {mates.length > 0 ? (
                                  <>
                                    <span className="seating-mates-label">
                                      Seated with
                                    </span>{' '}
                                    {mates.map((m) => m.name).join(' · ')}
                                  </>
                                ) : (
                                  <span className="seating-mates-label">
                                    Seated at {tableLabel(guest.table)}
                                  </span>
                                )}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    )
                  })}
                </ul>
              </motion.section>
            ))
          )}
        </AnimatePresence>
      </main>

      <footer className="seating-footer">
        <span className="seating-footer-monogram">{CONFIG.monogram}</span>
        <p>July 19, 2026 &bull; {CONFIG.venue.name}</p>
      </footer>
    </div>
  )
}

export default SeatingPage
