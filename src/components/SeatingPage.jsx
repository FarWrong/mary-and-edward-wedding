import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import { GUESTS } from '../seatingData'
import GuestPagesNav from './GuestPagesNav'

const NAME_SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv'])

function lastName(name) {
  const parts = name.trim().split(/\s+/)
  let i = parts.length - 1
  while (i > 0 && NAME_SUFFIXES.has(parts[i].toLowerCase())) i--
  return parts[i]
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

// Stable per-guest ids let duplicate names (e.g. two guests with the
// same first and last name at one table) behave independently.
const SORTED_GUESTS = [...GUESTS]
  .sort(
    (a, b) =>
      lastName(a.name).localeCompare(lastName(b.name)) ||
      a.name.localeCompare(b.name)
  )
  .map((guest, id) => ({ ...guest, id }))

const ALL_LETTERS = [
  ...new Set(SORTED_GUESTS.map((g) => lastName(g.name)[0].toUpperCase())),
].sort()

function SeatingPage() {
  const [query, setQuery] = useState('')
  const [openKey, setOpenKey] = useState(null)
  const barRef = useRef(null)

  useEffect(() => {
    document.title = `Seating Chart · ${CONFIG.partner2} & ${CONFIG.partner1}`
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

  const presentLetters = useMemo(
    () => new Set(groups.map(([letter]) => letter)),
    [groups]
  )

  const jumpToLetter = (letter) => {
    const el = document.getElementById(`seating-group-${letter}`)
    if (!el) return
    const barHeight = barRef.current ? barRef.current.offsetHeight : 0
    const top =
      el.getBoundingClientRect().top + window.pageYOffset - barHeight - 8
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <div className="seating-page">
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
          <GuestPagesNav current="/seating" />
        </motion.div>
      </header>

      <div className="seating-search-bar" ref={barRef}>
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
        <nav className="seating-letter-nav" aria-label="Jump to a letter">
          {ALL_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              className="seating-letter-btn"
              disabled={!presentLetters.has(letter)}
              onClick={() => jumpToLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </nav>
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
              No guests found by that name. Try just a first or last name,
              or find us at the reception and we&rsquo;ll point you to your
              seat!
            </motion.p>
          ) : (
            groups.map(([letter, guests], groupIndex) => (
              <motion.section
                key={letter}
                id={`seating-group-${letter}`}
                className="seating-group"
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.3,
                    ease: EASE,
                    delay: Math.min(groupIndex * 0.02, 0.1),
                  },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <h2 className="seating-letter">{letter}</h2>
                <ul className="seating-rows">
                  {guests.map((guest) => {
                    const isOpen = openKey === guest.id
                    const mates = isOpen
                      ? SORTED_GUESTS.filter(
                          (g) => g.table === guest.table && g.id !== guest.id
                        )
                      : []
                    return (
                      <li key={guest.id} className="seating-row-item">
                        <button
                          type="button"
                          className={`seating-row${isOpen ? ' open' : ''}`}
                          aria-expanded={isOpen}
                          onClick={() => setOpenKey(isOpen ? null : guest.id)}
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
                              transition={{ duration: 0.28, ease: EASE }}
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
