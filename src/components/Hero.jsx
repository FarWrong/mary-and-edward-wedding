import { Fragment, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import { useCountdown } from '../hooks/useCountdown'

const countdownUnits = ['Days', 'Hours', 'Minutes', 'Seconds']

/* Character-by-character cascade reveal */
function SplitText({ text, delay = 0, isReady, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '120%', rotate: 8 }}
            animate={isReady ? { y: '0%', rotate: 0 } : {}}
            transition={{
              duration: 0.65,
              ease: EASE,
              delay: delay + i * 0.045,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function Hero({ isReady }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -60])

  const countdown = useCountdown(CONFIG.weddingDate)
  const values = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]

  const d = 0.2

  return (
    <header className="hero" id="home" ref={ref}>
      <motion.div className="hero-bg" style={{ y: bgY }}>
        <motion.img
          src={CONFIG.photos.hero}
          alt="Engagement photo"
          initial={{ scale: 1.15 }}
          animate={isReady ? { scale: 1 } : {}}
          transition={{ duration: 12, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </motion.div>
      <div className="hero-overlay" />

      <motion.div className="hero-content" style={{ opacity: contentOpacity, y: contentY }}>
        {/* Invitation - clip-path wipe */}
        <motion.p
          className="hero-invitation"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={isReady ? { clipPath: 'inset(0 0% 0 0)' } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: d }}
        >
          Together with their families
        </motion.p>

        {/* Names - character cascade */}
        <h1 className="hero-names">
          <SplitText
            text={CONFIG.partner1}
            delay={d + 0.4}
            isReady={isReady}
          />
          <motion.span
            className="hero-ampersand"
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={isReady ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: d + 0.75 }}
          >
            &amp;
          </motion.span>
          <SplitText
            text={CONFIG.partner2}
            delay={d + 0.9}
            isReady={isReady}
          />
        </h1>

        {/* Gold line draws from center */}
        <motion.div className="hero-details">
          <motion.div
            className="hero-line"
            initial={{ scaleX: 0 }}
            animate={isReady ? { scaleX: 1 } : {}}
            transition={{ duration: 0.7, ease: EASE, delay: d + 1.4 }}
          />

          {/* Date - clip-path reveal */}
          <motion.div
            className="hero-date-block"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={isReady ? { clipPath: 'inset(0 0% 0 0)' } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: d + 1.6 }}
          >
            <span className="hero-date-highlight">July Nineteenth</span>
            <span className="hero-date-year">Two Thousand Twenty-Six</span>
          </motion.div>

          <motion.p
            className="hero-venue"
            initial={{ opacity: 0, y: 10 }}
            animate={isReady ? { opacity: 0.75, y: 0 } : {}}
            transition={{ duration: 0.6, delay: d + 1.9 }}
          >
            The Mansion at West Sayville &bull; Long Island, New York
          </motion.p>
        </motion.div>

        {/* Countdown - staggered number reveal */}
        <motion.div
          className="countdown-wrapper"
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: d + 2.1 }}
        >
          <div className="countdown">
            {countdownUnits.map((label, i) => (
              <Fragment key={label}>
                {i > 0 && <span className="countdown-separator">&middot;</span>}
                <motion.div
                  className="countdown-unit"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isReady ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, ease: EASE, delay: d + 2.2 + i * 0.1 }}
                >
                  <span className="countdown-number">
                    {label === 'Days'
                      ? values[i]
                      : String(values[i]).padStart(2, '0')}
                  </span>
                  <span className="countdown-label">{label}</span>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={isReady ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: d + 2.8 }}
      >
        <span>Scroll</span>
        <div className="scroll-arrow" />
      </motion.div>
    </header>
  )
}

export default Hero
