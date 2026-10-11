import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Landing from './pages/Landing.jsx'
import Discover from './pages/Discover.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Account from './pages/Account.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="discover" element={<Discover />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
