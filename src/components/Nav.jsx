import { useState } from 'react'
import { CONFIG } from '../config'

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Schedule', href: '/schedule' },
    { label: 'Seating', href: '/seating' },
    { label: 'Share Photos', href: '/filming' },
    { label: 'Quiz', href: '/quiz' },
    { label: 'Details', id: 'details' },
    { label: 'Venue', id: 'venue' },
    { label: 'Travel', id: 'travel' },
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
      <nav className="nav scrolled">
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
            <li key={link.id || link.href}>
              {link.href ? (
                <a href={link.href}>{link.label}</a>
              ) : (
                <a onClick={() => scrollTo(link.id)}>{link.label}</a>
              )}
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
