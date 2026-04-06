import { motion } from 'framer-motion'
import { CONFIG, EASE, EASE_OUT } from '../config'

const letterVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: (i) => ({
    y: '0%',
    opacity: 1,
    transition: { duration: 0.6, ease: EASE, delay: 0.3 + i * 0.04 },
  }),
}

function AnimatedLetters({ text, offset = 0 }) {
  return (
    <span aria-label={text} style={{ display: 'inline-block' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
        >
          <motion.span
            style={{ display: 'inline-block' }}
            variants={letterVariants}
            custom={offset + i}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function LoadingScreen() {
  const name1Len = CONFIG.partner1.length

  return (
    <motion.div
      className="loading-screen"
      exit={{ y: '-100vh' }}
      transition={{ duration: 0.9, ease: EASE_OUT }}
    >
      <motion.div
        className="loading-content"
        initial="hidden"
        animate="visible"
      >
        <h1 className="loading-names">
          <AnimatedLetters text={CONFIG.partner1} offset={0} />
          <motion.span
            className="loading-ampersand"
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 + name1Len * 0.04 + 0.1 }}
          >
            &amp;
          </motion.span>
          <AnimatedLetters text={CONFIG.partner2} offset={name1Len + 3} />
        </h1>

        <motion.div
          className="loading-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
        />

        <motion.p
          className="loading-date"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.7, ease: EASE, delay: 1.6 }}
        >
          July Nineteenth, Two Thousand Twenty-Six
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default LoadingScreen
