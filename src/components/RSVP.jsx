import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG, EASE } from '../config'
import SectionHeader from './SectionHeader'

const STEPS = [
  { title: 'Will you join us?' },
  { title: 'Plus One' },
  { title: 'A few more details' },
]

function AttendanceCard({ value, selected, onChange, icon, label, sublabel }) {
  return (
    <motion.button
      type="button"
      className={`attendance-card${selected ? ' selected' : ''}`}
      onClick={() => onChange(value)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="attendance-icon">{icon}</span>
      <span className="attendance-label">{label}</span>
      <span className="attendance-sublabel">{sublabel}</span>
      <motion.div
        className="attendance-check"
        initial={false}
        animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        &#x2726;
      </motion.div>
    </motion.button>
  )
}

function RSVP() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', attending: '',
    hasInvitePlusOne: '', plusOne: '', plusOneName: '',
    dietary: '', song: '', message: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const next = () => {
    if (step === 0) {
      const newErrors = {}
      if (!formData.name.trim()) newErrors.name = true
      if (!formData.email.trim()) newErrors.email = true
      if (!formData.attending) newErrors.attending = true
      if (Object.keys(newErrors).length) { setErrors(newErrors); return }
    }
    setStep((s) => Math.min(s + 1, 2))
  }

  const back = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = () => {
    console.log('RSVP Submission:', formData)
    setSubmitted(true)
  }

  return (
    <section className="section rsvp" id="rsvp">
      <div className="rsvp-bg">
        <img src={CONFIG.photos.gallery[4]} alt="" aria-hidden="true" loading="lazy" />
      </div>

      <div className="container-narrow" style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeader
          label="Respond"
          title="Kindly Respond"
          subtitle="The honor of your presence is requested. Please respond by June 1, 2026."
        />

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="card"
              className="rsvp-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <div className="rsvp-card-inner-border" />

              {/* Step dots */}
              <div className="step-dots">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`step-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
                  />
                ))}
              </div>

              {/* Step content */}
              <div className="rsvp-step-container">
                {/* All steps always rendered; tallest sets container height */}
                {STEPS.map((s, i) => (
                  <motion.div
                    key={i}
                    className="rsvp-step"
                    initial={false}
                    animate={{
                      opacity: i === step ? 1 : 0,
                      x: i === step ? 0 : i < step ? -40 : 40,
                    }}
                    transition={{ duration: 0.35, ease: EASE }}
                    style={{ pointerEvents: i === step ? 'auto' : 'none' }}
                  >
                    <h3 className="rsvp-step-title">{s.title}</h3>

                    {i === 0 && (
                      <>
                        <div className="form-group">
                          <label htmlFor="guestName">Full Name</label>
                          <input
                            type="text" id="guestName" name="name"
                            value={formData.name} onChange={handleChange}
                            placeholder="As it appears on your invitation"
                            className={errors.name ? 'error' : ''}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="guestEmail">Email Address</label>
                          <input
                            type="email" id="guestEmail" name="email"
                            value={formData.email} onChange={handleChange}
                            placeholder="your@email.com"
                            className={errors.email ? 'error' : ''}
                          />
                        </div>
                        <div className="form-group">
                          <label>Will You Be Attending?</label>
                          <div className={`attendance-cards${errors.attending ? ' error' : ''}`}>
                            <AttendanceCard
                              value="yes"
                              selected={formData.attending === 'yes'}
                              onChange={(v) => {
                                setFormData((prev) => ({ ...prev, attending: v }))
                                if (errors.attending) setErrors((prev) => ({ ...prev, attending: false }))
                              }}
                              icon="&#x2726;"
                              label="Joyfully Accepts"
                              sublabel="We&rsquo;ll be there"
                            />
                            <AttendanceCard
                              value="no"
                              selected={formData.attending === 'no'}
                              onChange={(v) => {
                                setFormData((prev) => ({ ...prev, attending: v }))
                                if (errors.attending) setErrors((prev) => ({ ...prev, attending: false }))
                              }}
                              icon="&#x2767;"
                              label="Regretfully Declines"
                              sublabel="With you in spirit"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {i === 1 && (
                      <>
                        <div className="form-group">
                          <label>Does your invitation include a plus one?</label>
                          <div className="plusone-toggle">
                            <motion.button
                              type="button"
                              className={`plusone-btn${formData.hasInvitePlusOne === 'yes' ? ' active' : ''}`}
                              onClick={() => setFormData((prev) => ({ ...prev, hasInvitePlusOne: 'yes' }))}
                              whileTap={{ scale: 0.97 }}
                            >
                              Yes
                            </motion.button>
                            <motion.button
                              type="button"
                              className={`plusone-btn${formData.hasInvitePlusOne === 'no' ? ' active' : ''}`}
                              onClick={() => setFormData((prev) => ({ ...prev, hasInvitePlusOne: 'no', plusOne: '', plusOneName: '' }))}
                              whileTap={{ scale: 0.97 }}
                            >
                              No
                            </motion.button>
                          </div>
                        </div>
                        <AnimatePresence>
                          {formData.hasInvitePlusOne === 'yes' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: EASE }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="form-group">
                                <label>Will you be bringing your plus one?</label>
                                <div className="plusone-toggle">
                                  <motion.button
                                    type="button"
                                    className={`plusone-btn${formData.plusOne === 'yes' ? ' active' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, plusOne: 'yes' }))}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    Yes
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    className={`plusone-btn${formData.plusOne === 'no' ? ' active' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, plusOne: 'no', plusOneName: '' }))}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    No
                                  </motion.button>
                                </div>
                              </div>
                              <AnimatePresence>
                                {formData.plusOne === 'yes' && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.35, ease: EASE }}
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div className="plusone-name-field">
                                      <input
                                        type="text"
                                        name="plusOneName"
                                        value={formData.plusOneName}
                                        onChange={handleChange}
                                        placeholder="Guest's full name"
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    {i === 2 && (
                      <>
                        <div className="form-group">
                          <label htmlFor="dietary">Dietary Requirements</label>
                          <input type="text" id="dietary" name="dietary"
                            value={formData.dietary} onChange={handleChange}
                            placeholder="Any allergies or dietary needs" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="songRequest">Song Request</label>
                          <input type="text" id="songRequest" name="song"
                            value={formData.song} onChange={handleChange}
                            placeholder="Help us build our playlist" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="message">A Note for the Couple</label>
                          <textarea id="message" name="message"
                            value={formData.message} onChange={handleChange}
                            placeholder="Your warm wishes..."
                            rows={4} />
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Navigation */}
              <div className="rsvp-nav">
                {step > 0 ? (
                  <motion.button
                    className="rsvp-btn rsvp-btn-back"
                    onClick={back}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                ) : (
                  <div />
                )}
                <motion.button
                  className="rsvp-btn rsvp-btn-next"
                  onClick={step < 2 ? next : handleSubmit}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {step < 2 ? 'Continue' : 'Send Response'}
                </motion.button>
              </div>

              <p className="rsvp-deadline">
                Kindly respond by the first of June, two thousand twenty-six.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className="rsvp-success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                className="rsvp-success-icon"
              >
                &#x2726;
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
              >
                Thank You
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Your response has been received with gratitude.
                <br />
                We cannot wait to celebrate with you.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default RSVP
