import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG, EASE } from '../config'

/* ---------- identity: same quiet per-device id as the photo album ---------- */

function getDeviceId() {
  let id = localStorage.getItem('filming.device')
  if (!id) {
    id = (
      crypto.randomUUID?.() ||
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    )
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 24)
    localStorage.setItem('filming.device', id)
  }
  return id
}

const DEVICE_ID = getDeviceId()

/* ---------- questions ---------- */

const QUESTIONS = [
  {
    q: 'Where did Mary and Edward meet?',
    options: ['In the Library', 'College student center', 'At Work'],
    answer: 1,
  },
  {
    q: 'Who said "I love you" first?',
    options: ['Mary', 'Edward'],
    answer: 0,
    duo: true,
  },
  {
    q: 'Who is more likely to be late?',
    options: ['Mary', 'Edward'],
    answer: 1,
    duo: true,
  },
  {
    q: 'Who is the better cook?',
    options: ['Mary', 'Edward'],
    answer: 1,
    duo: true,
  },
  {
    q: 'Who does the planning?',
    options: ['Mary', 'Edward'],
    answer: 0,
    duo: true,
  },
  {
    q: 'Noodles or rice: who is team noodles?',
    options: ['Mary', 'Edward'],
    answer: 0,
    duo: true,
    note: 'Mary is team noodles, Edward is team rice.',
  },
  {
    q: 'Who would win a badminton match?',
    options: ['Mary', 'Edward'],
    answer: 0,
    duo: true,
  },
  {
    q: 'Who is the lightweight of the couple?',
    options: ['Mary', 'Edward'],
    answer: 1,
    duo: true,
  },
  {
    q: 'How long has the couple been together? (counting today)',
    options: [
      '3 years + 5 months',
      '3 years + 6 months',
      '4 years',
      '4 years + 5 months',
    ],
    answer: 3,
  },
  {
    q: "What's Edward's most played League of Legends champion?",
    options: ['Ivern', 'Irelia', 'Vayne'],
    answer: 1,
  },
  {
    q: "Who is Edward's favorite musical artist?",
    options: ['Yorushika', 'Taylor Swift', 'TYOSIN'],
    answer: 0,
  },
  {
    q: "What is Mary's nickname?",
    options: ['Mare Bear', 'Mary Machine', 'Mary Poppins'],
    answer: 1,
  },
]

const LETTERS = ['A', 'B', 'C', 'D']
const CORRECT_LINES = ['Nailed it!', 'Correct!', 'Right you are!', 'You two must be close!']
const WRONG_LINES = ['So close!', 'Not quite!', 'Alas!']
const CONFETTI_COLORS = ['#E5C1CA', '#C5A572', '#B8B3CC', '#B0BDA3', '#D4BC94', '#D5D1E3']

function resultTitle(score) {
  if (score === QUESTIONS.length) return 'Perfect score! Officially family.'
  if (score >= 8) return 'Impressive. You clearly know us well!'
  if (score >= 5) return 'Not bad! We should hang out more, though.'
  return 'Plenty to catch up on at the reception!'
}

function QuizPage() {
  const [name, setName] = useState(
    () => localStorage.getItem('filming.name') || ''
  )
  const [step, setStep] = useState(-1) // -1 intro, 0..n-1 questions, n results
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [shownScore, setShownScore] = useState(0)
  const [board, setBoard] = useState([])
  const [boardState, setBoardState] = useState('idle') // idle|loading|ready|unavailable
  const [recorded, setRecorded] = useState(null)

  const question = step >= 0 && step < QUESTIONS.length ? QUESTIONS[step] : null
  const finished = step === QUESTIONS.length

  useEffect(() => {
    document.title = `The Quiz · ${CONFIG.partner2} & ${CONFIG.partner1}`
  }, [])

  /* ---------- confetti ---------- */

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(0)
  const reducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    size()
    window.addEventListener('resize', size)
    return () => {
      window.removeEventListener('resize', size)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const alive = []
    for (const p of particlesRef.current) {
      p.vy += 0.16
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      if (p.y < canvas.height + 24) alive.push(p)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.globalAlpha = 0.9
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62)
      }
      ctx.restore()
    }
    particlesRef.current = alive
    if (alive.length > 0) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const burst = useCallback(
    (count = 70, origin = { x: 0.5, y: 0.35 }) => {
      if (reducedMotion) return
      const canvas = canvasRef.current
      if (!canvas) return
      const wasEmpty = particlesRef.current.length === 0
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 7
        particlesRef.current.push({
          x: origin.x * canvas.width + (Math.random() - 0.5) * 40,
          y: origin.y * canvas.height + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5,
          size: 5 + Math.random() * 6,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          round: Math.random() < 0.25,
        })
      }
      if (wasEmpty) rafRef.current = requestAnimationFrame(tick)
    },
    [reducedMotion, tick]
  )

  /* ---------- quiz flow ---------- */

  const start = () => {
    // Same optional-name rules as the photo album: remembered per device
    localStorage.setItem('filming.name', name.trim())
    setStep(0)
  }

  const pick = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === question.answer) {
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      burst(60, { x: 0.5, y: 0.4 })
    } else {
      setStreak(0)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  const next = () => {
    setPicked(null)
    setStep((s) => s + 1)
  }

  const restart = () => {
    setPicked(null)
    setScore(0)
    setStreak(0)
    setShownScore(0)
    setRecorded(null)
    setStep(0)
  }

  /* ---------- results: count-up, celebration, leaderboard ---------- */

  useEffect(() => {
    if (!finished) return
    setShownScore(0)
    const counter = setInterval(() => {
      setShownScore((s) => {
        if (s >= score) {
          clearInterval(counter)
          return s
        }
        return s + 1
      })
    }, 110)

    const celebrations = []
    if (score >= 8) {
      celebrations.push(setTimeout(() => burst(120, { x: 0.3, y: 0.3 }), 300))
      celebrations.push(setTimeout(() => burst(120, { x: 0.7, y: 0.3 }), 700))
    }
    if (score === QUESTIONS.length) {
      celebrations.push(setTimeout(() => burst(200, { x: 0.5, y: 0.2 }), 1200))
    }

    let cancelled = false
    ;(async () => {
      setBoardState('loading')
      try {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device: DEVICE_ID, name: name.trim(), score }),
        })
        if (!res.ok) throw new Error()
        const submitted = await res.json()
        const lb = await fetch('/api/quiz')
        if (!lb.ok) throw new Error()
        const data = await lb.json()
        if (!cancelled) {
          setRecorded(submitted.recorded)
          setBoard(Array.isArray(data.entries) ? data.entries : [])
          setBoardState('ready')
        }
      } catch {
        if (!cancelled) setBoardState('unavailable')
      }
    })()

    return () => {
      cancelled = true
      clearInterval(counter)
      celebrations.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const myRank = board.findIndex((e) => e.device === DEVICE_ID)

  return (
    <div className="quiz-page">
      <canvas ref={canvasRef} className="quiz-confetti" aria-hidden="true" />

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
          <span className="section-label">A Little Fun</span>
          <h1 className="section-title">How Well Do You Know the Bride &amp; Groom?</h1>
          <div className="ornament">
            <span className="ornament-line ornament-line-left" />
            <span className="ornament-symbol">&#10047;</span>
            <span className="ornament-line ornament-line-right" />
          </div>
        </motion.div>
      </header>

      <main className="quiz-wrapper">
        <div className={`quiz-card${shaking ? ' shake' : ''}`}>
          <span className="quiz-card-inner-border" aria-hidden="true" />
          <AnimatePresence mode="wait">
            {step === -1 && (
              <motion.div
                key="intro"
                className="quiz-step"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <input
                  type="text"
                  className="quiz-name-input"
                  placeholder="Your name (optional)"
                  maxLength={40}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button className="quiz-btn" onClick={start}>
                  Start the Quiz
                </button>
              </motion.div>
            )}

            {question && (
              <motion.div
                key={`q${step}`}
                className="quiz-step"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="quiz-progress-row">
                  <p className="quiz-progress">
                    Question {step + 1} of {QUESTIONS.length}
                  </p>
                  {streak >= 3 && (
                    <motion.span
                      className="quiz-streak"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {streak} in a row!
                    </motion.span>
                  )}
                </div>
                <div className="quiz-progress-bar" aria-hidden="true">
                  <span
                    style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
                <h2 className="quiz-question">{question.q}</h2>
                <div
                  className={`quiz-options${question.duo ? ' quiz-options-duo' : ''}`}
                >
                  {question.options.map((option, i) => {
                    let cls = 'quiz-option'
                    if (picked !== null) {
                      if (i === question.answer) cls += ' correct'
                      else if (i === picked) cls += ' wrong'
                      else cls += ' faded'
                    }
                    return (
                      <button
                        key={option}
                        className={cls}
                        onClick={() => pick(i)}
                        disabled={picked !== null}
                      >
                        {!question.duo && (
                          <span className="quiz-option-letter">{LETTERS[i]}.</span>
                        )}
                        {option}
                      </button>
                    )
                  })}
                </div>
                <AnimatePresence>
                  {picked !== null && (
                    <motion.div
                      className="quiz-feedback"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="quiz-verdict">
                        {picked === question.answer
                          ? CORRECT_LINES[step % CORRECT_LINES.length]
                          : `${WRONG_LINES[step % WRONG_LINES.length]} It's ${question.options[question.answer]}.`}
                      </p>
                      {question.note && (
                        <p className="quiz-note">{question.note}</p>
                      )}
                      <button className="quiz-btn" onClick={next}>
                        {step + 1 === QUESTIONS.length
                          ? 'See My Score'
                          : 'Next Question'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {finished && (
              <motion.div
                key="results"
                className="quiz-step quiz-results"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className="quiz-results-flourish">&#10047;</span>
                <h2 className="quiz-results-title">
                  {name.trim() ? `${name.trim()}, you scored` : 'You scored'}
                </h2>
                <p className="quiz-score">
                  {shownScore}
                  <span> of {QUESTIONS.length}</span>
                </p>
                <p className="quiz-results-message">{resultTitle(score)}</p>
                {recorded !== null && recorded < score && (
                  <p className="quiz-best-note">
                    Your first score of {recorded} is the one on the
                    leaderboard. No do-overs!
                  </p>
                )}

                <div className="quiz-board">
                  <h3 className="quiz-board-title">Leaderboard</h3>
                  {boardState === 'loading' && (
                    <p className="quiz-board-status">Tallying the scores&hellip;</p>
                  )}
                  {boardState === 'unavailable' && (
                    <p className="quiz-board-status">
                      The leaderboard is napping. Your score will count once
                      it wakes up.
                    </p>
                  )}
                  {boardState === 'ready' && (
                    <ol className="quiz-board-list">
                      {board.slice(0, 10).map((entry, i) => (
                        <li
                          key={entry.device}
                          className={entry.device === DEVICE_ID ? 'me' : ''}
                        >
                          <span className="quiz-board-rank">{i + 1}</span>
                          <span className="quiz-board-name">
                            {entry.name || 'Anonymous Guest'}
                            {entry.device === DEVICE_ID && ' (you)'}
                          </span>
                          <span className="quiz-board-score">
                            {entry.score}/{entry.total}
                          </span>
                        </li>
                      ))}
                      {myRank >= 10 && (
                        <li className="me">
                          <span className="quiz-board-rank">{myRank + 1}</span>
                          <span className="quiz-board-name">
                            {board[myRank].name || 'Anonymous Guest'} (you)
                          </span>
                          <span className="quiz-board-score">
                            {board[myRank].score}/{board[myRank].total}
                          </span>
                        </li>
                      )}
                    </ol>
                  )}
                </div>

                <button className="quiz-btn" onClick={restart}>
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="seating-footer">
        <span className="seating-footer-monogram">{CONFIG.monogram}</span>
        <p>July 19, 2026 &bull; {CONFIG.venue.name}</p>
      </footer>
    </div>
  )
}

export default QuizPage
