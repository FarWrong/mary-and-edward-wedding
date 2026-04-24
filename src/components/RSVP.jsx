import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EASE } from '../config'
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
    hasInvitePlusOne: '', plusOne: '', plusOneName: '', plusOneEmail: '',
    hotelBlock: '', needTransport: '',
    dietary: '', song: '', message: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const declined = formData.attending === 'no'

  const next = () => {
    if (step === 0) {
      const newErrors = {}
      if (!formData.name.trim()) newErrors.name = true
      if (!formData.email.trim()) newErrors.email = true
      if (!formData.attending) newErrors.attending = true
      if (Object.keys(newErrors).length) { setErrors(newErrors); return }
      if (declined) { handleSubmit(); return }
    }
    setStep((s) => Math.min(s + 1, 2))
  }

  const back = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit = async () => {
    try {
      await fetch('https://formsubmit.co/ajax/morewrong32@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Wedding RSVP: ${formData.name} - ${formData.attending === 'yes' ? 'Attending' : 'Declined'}`,
          Name: formData.name,
          Email: formData.email,
          Attending: formData.attending === 'yes' ? 'Joyfully Accepts' : 'Regretfully Declines',
          'Plus One Invited': formData.hasInvitePlusOne || 'N/A',
          'Bringing Plus One': formData.plusOne || 'N/A',
          'Plus One Name': formData.plusOneName || 'N/A',
          'Plus One Email': formData.plusOneEmail || 'N/A',
          'Hotel Block': formData.hotelBlock || 'N/A',
          'Needs Transportation': formData.needTransport || 'N/A',
          'Dietary Requirements': formData.dietary || 'None',
          'Song Request': formData.song || 'None',
          Message: formData.message || 'None',
        }),
      })
    } catch (err) {
      console.error('RSVP submit error:', err)
    }
    setSubmitted(true)
  }

  return (
    <section className="section rsvp" id="rsvp">
      <div className="rsvp-bg">
        <img src="https://img.snappr.com/vmc-3u9-wo4ksyunDoee6MfLIbU=/fit-in/2048x0/42edbb9f-7656-4911-b7ec-27c06ece3f6f" alt="" aria-hidden="true" loading="lazy" />
      </div>

      <div className="container-narrow" style={{ position: 'relative', zIndex: 1 }}>
        <SectionHeader
          label="Respond"
          title="Kindly Respond"
          subtitle={<>We would love to have you there. Please respond by <strong>June 14, 2026</strong>.</>}
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
                              onClick={() => setFormData((prev) => ({ ...prev, hasInvitePlusOne: 'no', plusOne: '', plusOneName: '', plusOneEmail: '' }))}
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
                                    onClick={() => setFormData((prev) => ({ ...prev, plusOne: 'no', plusOneName: '', plusOneEmail: '' }))}
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
                                    <div className="form-group">
                                      <label htmlFor="plusOneName">Guest's Full Name</label>
                                      <input
                                        type="text"
                                        id="plusOneName"
                                        name="plusOneName"
                                        value={formData.plusOneName}
                                        onChange={handleChange}
                                        placeholder="As it appears on your invitation"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label htmlFor="plusOneEmail">Guest's Email Address</label>
                                      <input
                                        type="email"
                                        id="plusOneEmail"
                                        name="plusOneEmail"
                                        value={formData.plusOneEmail}
                                        onChange={handleChange}
                                        placeholder="their@email.com"
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
                          <label>Do you plan on staying in our hotel block?</label>
                          <div className="plusone-toggle">
                            <motion.button
                              type="button"
                              className={`plusone-btn${formData.hotelBlock === 'yes' ? ' active' : ''}`}
                              onClick={() => setFormData((prev) => ({ ...prev, hotelBlock: 'yes' }))}
                              whileTap={{ scale: 0.97 }}
                            >
                              Yes
                            </motion.button>
                            <motion.button
                              type="button"
                              className={`plusone-btn${formData.hotelBlock === 'no' ? ' active' : ''}`}
                              onClick={() => setFormData((prev) => ({ ...prev, hotelBlock: 'no', needTransport: '' }))}
                              whileTap={{ scale: 0.97 }}
                            >
                              No
                            </motion.button>
                          </div>
                        </div>
                        <AnimatePresence>
                          {formData.hotelBlock === 'yes' && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: EASE }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="form-group">
                                <label>Will you need transportation from the assigned hotel to the venue the day of?</label>
                                <div className="plusone-toggle">
                                  <motion.button
                                    type="button"
                                    className={`plusone-btn${formData.needTransport === 'yes' ? ' active' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, needTransport: 'yes' }))}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    Yes
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    className={`plusone-btn${formData.needTransport === 'no' ? ' active' : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, needTransport: 'no' }))}
                                    whileTap={{ scale: 0.97 }}
                                  >
                                    No
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="form-group">
                          <label htmlFor="message">Do you have any dietary restrictions or anything else we should know?</label>
                          <textarea id="message" name="message"
                            value={formData.message} onChange={handleChange}
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
                  onClick={(step < 2 && !declined) ? next : (step === 0 && declined) ? next : handleSubmit}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {(step === 0 && declined) ? 'Send Response' : step < 2 ? 'Continue' : 'Send Response'}
                </motion.button>
              </div>

              <p className="rsvp-deadline">
                Kindly respond by the fourteenth of June, two thousand twenty-six.
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
                {declined
                  ? 'We\'ll miss you! Thank you for letting us know.'
                  : 'We\'re looking forward to celebrating with you.'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default RSVP
