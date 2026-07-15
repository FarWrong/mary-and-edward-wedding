import { Fragment } from 'react'

const PAGES = [
  { href: '/schedule', label: 'Schedule' },
  { href: '/seating', label: 'Seating' },
  { href: '/filming', label: 'Photos' },
  { href: '/quiz', label: 'Quiz' },
]

// Quiet cross-links between the four guest pages: the current page is
// marked, the other three are one tap away.
function GuestPagesNav({ current }) {
  return (
    <nav className="guest-nav" aria-label="Wedding pages">
      {PAGES.map((page, i) => (
        <Fragment key={page.href}>
          {i > 0 && (
            <span className="guest-nav-dot" aria-hidden="true">
              &middot;
            </span>
          )}
          {page.href === current ? (
            <span className="guest-nav-link current" aria-current="page">
              {page.label}
            </span>
          ) : (
            <a className="guest-nav-link" href={page.href}>
              {page.label}
            </a>
          )}
        </Fragment>
      ))}
    </nav>
  )
}

export default GuestPagesNav
