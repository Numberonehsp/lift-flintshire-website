import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import Home from './pages/Home'
import About from './pages/About'
import RunClub from './pages/RunClub'
import WeightliftingClub from './pages/WeightliftingClub'
import Wellbeing from './pages/Wellbeing'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import EventEntry from './pages/EventEntry'
import EntryConfirmed from './pages/EntryConfirmed'
import ImpactDashboard from './pages/ImpactDashboard'
import Contact from './pages/Contact'
import RegisterCouchTo5k from './pages/RegisterCouchTo5k'
import RegisterWomensRunClub from './pages/RegisterWomensRunClub'
import EnquireYouthStrengthConditioning from './pages/EnquireYouthStrengthConditioning'
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
      <a href="#main" className="skip-link font-body">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="pt-20 focus:outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/run-club" element={<RunClub />} />
          <Route path="/weightlifting-club" element={<WeightliftingClub />} />
          <Route path="/wellbeing" element={<Wellbeing />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/entry-confirmed" element={<EntryConfirmed />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/enter" element={<EventEntry />} />
          <Route path="/impact" element={<ImpactDashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register/couch-to-5k" element={<RegisterCouchTo5k />} />
          <Route path="/register/womens-run-club" element={<RegisterWomensRunClub />} />
          <Route path="/register/girls-gym-session" element={<Navigate to="/contact?subject=school-team" replace />} />
          <Route path="/enquire/youth-weightlifting" element={<EnquireYouthStrengthConditioning />} />
          <Route path="/enquire/youth-strength-conditioning" element={<Navigate to="/enquire/youth-weightlifting" replace />} />
          <Route path="/register/youth-strength-conditioning" element={<Navigate to="/enquire/youth-weightlifting" replace />} />
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
