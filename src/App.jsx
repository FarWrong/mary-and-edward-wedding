import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import Nav from './components/Nav'
import Hero from './components/Hero'
import BigDay from './components/BigDay'
import Details from './components/Details'
import Venue from './components/Venue'
import Gallery from './components/Gallery'
import Travel from './components/Travel'
import Footer from './components/Footer'
import BirdCanvas from './components/BirdCanvas'

function App() {
  const [loading, setLoading] = useState(true)
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800)
    return () => clearTimeout(timer)
  }, [])

  const handleLoadingExit = () => {
    setTimeout(() => setHeroReady(true), 100)
  }

  return (
    <>
      <AnimatePresence onExitComplete={handleLoadingExit}>
        {loading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <BirdCanvas />

      <div style={{ visibility: loading ? 'hidden' : 'visible' }}>
        <Nav />
        <Hero isReady={heroReady} />
        <main>
          <BigDay />
          <Details />
          <Venue />
          <Gallery />
          <Travel />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
