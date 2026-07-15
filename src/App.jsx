import BigDay from './components/BigDay'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Details from './components/Details'
import Venue from './components/Venue'
import Gallery from './components/Gallery'
import Travel from './components/Travel'
import Footer from './components/Footer'
import BirdCanvas from './components/BirdCanvas'

function App() {
  return (
    <>
      <BirdCanvas />

      <div>
        <Nav />
        <Hero isReady />
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
