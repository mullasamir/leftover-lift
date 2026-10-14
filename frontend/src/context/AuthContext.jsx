import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, tokenStore } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // 'checking' while we verify a saved session on first load, so pages don't flash the signed-out state.
  const [status, setStatus] = useState(tokenStore.getAccess() ? 'checking' : 'ready')

  useEffect(() => {
    if (!tokenStore.getAccess()) return undefined
    let cancelled = false
    api
      .me()
      .then((u) => !cancelled && setUser(u))
      .catch(() => {
        // The client already tried a refresh. If we are still here the session is gone, unless it was only a network blip.
        if (!tokenStore.getAccess()) setUser(null)
      })
      .finally(() => !cancelled && setStatus('ready'))
    return () => {
      cancelled = true
    }
  }, [])

  // The API client fires this when a refresh fails (expired, revoked, or the account was disabled).
  useEffect(() => {
    const onExpired = () => setUser(null)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const accept = useCallback((auth) => {
    tokenStore.set(auth)
    setUser(auth.user)
    return auth.user
  }, [])

  const login = useCallback(async (credentials) => accept(await api.login(credentials)), [accept])
  const register = useCallback(async (payload) => accept(await api.register(payload)), [accept])
  const logout = useCallback(async () => {
    await api.logout() // revokes the refresh token on the server; failures are ignored
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

/** Where each kind of account should land after signing in or registering. */
export function homeFor(user) {
  if (user?.role === 'VENDOR') return '/vendor'
  if (user?.role === 'ADMIN') return '/admin'
  return '/discover'
}
