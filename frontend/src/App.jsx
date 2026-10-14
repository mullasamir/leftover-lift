import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="discover" element={<Discover />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="rescues" element={<RequireRole role="CONSUMER"><MyRescues /></RequireRole>} />
        <Route path="vendor" element={<RequireRole role="VENDOR"><VendorDashboard /></RequireRole>} />
        <Route path="vendor/new" element={<RequireRole role="VENDOR"><ListingForm /></RequireRole>} />
        <Route path="vendor/:id/edit" element={<RequireRole role="VENDOR"><ListingForm /></RequireRole>} />
        <Route path="admin" element={<RequireRole role="ADMIN"><AdminDashboard /></RequireRole>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
