import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import GuestOnly from './components/GuestOnly.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireRole from './components/RequireRole.jsx'
import Landing from './pages/Landing.jsx'
import Discover from './pages/Discover.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'
import VendorDashboard from './pages/VendorDashboard.jsx'
import ListingForm from './pages/ListingForm.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import MyRescues from './pages/MyRescues.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import ForBusinesses from './pages/ForBusinesses.jsx'
import FaqPage from './pages/FaqPage.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="discover" element={<Discover />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="for-businesses" element={<ForBusinesses />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="rescues" element={<RequireRole role="CONSUMER"><MyRescues /></RequireRole>} />
        <Route path="vendor" element={<RequireRole role="VENDOR"><VendorDashboard /></RequireRole>} />
        <Route path="vendor/new" element={<RequireRole role="VENDOR"><ListingForm /></RequireRole>} />
        <Route path="vendor/:id/edit" element={<RequireRole role="VENDOR"><ListingForm /></RequireRole>} />
        <Route path="admin" element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
