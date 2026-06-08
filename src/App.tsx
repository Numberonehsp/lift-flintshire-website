import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import Home from './pages/Home'
import About from './pages/About'
import ProgrammesEvents from './pages/ProgrammesEvents'
import ImpactDashboard from './pages/ImpactDashboard'
import Contact from './pages/Contact'
import RegisterCouchTo5k from './pages/RegisterCouchTo5k'
import RegisterWomensRunClub from './pages/RegisterWomensRunClub'
import RegisterGirlsGymSession from './pages/RegisterGirlsGymSession'
import Questionnaire from './pages/Questionnaire'
import Privacy from './pages/Privacy'
import Safeguarding from './pages/Safeguarding'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programmes-events" element={<ProgrammesEvents />} />
          <Route path="/impact" element={<ImpactDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register/couch-to-5k" element={<RegisterCouchTo5k />} />
          <Route path="/register/womens-run-club" element={<RegisterWomensRunClub />} />
          <Route path="/register/girls-gym-session" element={<RegisterGirlsGymSession />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/safeguarding" element={<Safeguarding />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
