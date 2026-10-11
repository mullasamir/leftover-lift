import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'checking' while we verify a saved token on first load, so pages don't flash the signed-out state.
  const [status, setStatus] = useState(tokenStore.get() ? 'checking' : 'ready')

  useEffect(() => {
    if (!tokenStore.get()) return
    let cancelled = false
    api
      .me()
      .then((u) => !cancelled && setUser(u))
      .catch((err) => {
        // An expired or invalid token is cleared; a network blip keeps it so a refresh can recover.
        if (err.status === 401) tokenStore.clear()
      })
      .finally(() => !cancelled && setStatus('ready'))
    return () => {
      cancelled = true
    }
  }, [])

  const accept = useCallback((auth) => {
    tokenStore.set(auth.accessToken)
    setUser(auth.user)
    return auth.user
  }, [])

  const login = useCallback(async (credentials) => accept(await api.login(credentials)), [accept])
  const register = useCallback(async (payload) => accept(await api.register(payload)), [accept])
  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, status, login, register, logout }), [user, status, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
