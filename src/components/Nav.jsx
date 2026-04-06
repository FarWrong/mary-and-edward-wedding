import { useState, useEffect } from 'react'
import { CONFIG } from '../config'

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Details', id: 'details' },
    { label: 'Venue', id: 'venue' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Travel', id: 'travel' },
    { label: 'Registry', id: 'registry' },
    { label: 'RSVP', id: 'rsvp' },
  ]

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.body.style.overflow = ''
    const el = document.getElementById(id)
    if (el) {
      const offset = 80
      const top = el.getBoundingClientRect().top + window.pageYOffset - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const toggleMenu = () => {
    setMenuOpen((prev) => {
      document.body.style.overflow = !prev ? 'hidden' : ''
      return !prev
    })
  }

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <a
          href="#home"
          className="nav-monogram"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          {CONFIG.monogram}
        </a>
        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {links.map((link) => (
            <li key={link.id}>
              <a onClick={() => scrollTo(link.id)}>{link.label}</a>
            </li>
          ))}
        </ul>
        <button
          className={`nav-toggle${menuOpen ? ' active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div
        className={`nav-overlay${menuOpen ? ' active' : ''}`}
        onClick={toggleMenu}
      />
    </>
  )
}

export default Nav
