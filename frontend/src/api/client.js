const BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'
const ACCESS_KEY = 'leftoverlift.token'
const REFRESH_KEY = 'leftoverlift.refresh'

// Note: localStorage keeps this simple, but a script injected into the page could read it.
// Before production, move both tokens into httpOnly, SameSite cookies.
export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: ({ accessToken, refreshToken }) => {
    localStorage.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'Something went wrong. Please try again.')
    this.status = status
    this.code = body?.code ?? 'UNKNOWN'
    this.fieldErrors = body?.fieldErrors ?? {}
  }
}

async function rawRequest(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStore.getAccess()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE}${path}`, { method, headers, signal, body: body !== undefined ? JSON.stringify(body) : undefined })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new ApiError(0, { code: 'NETWORK', message: "We can't reach the server. Check your connection and try again." })
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data
}

// Several requests can hit an expired access token at once; they all share one refresh.
let refreshing = null
function refreshSession() {
  if (!refreshing) {
    refreshing = rawRequest('/auth/refresh', { method: 'POST', body: { refreshToken: tokenStore.getRefresh() }, auth: false })
      .then((auth) => {
        tokenStore.set(auth)
        return auth
      })
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

async function request(path, options = {}) {
  try {
    return await rawRequest(path, options)
  } catch (err) {
    const canRefresh = err instanceof ApiError && err.status === 401 && options.auth !== false && tokenStore.getRefresh()
    if (!canRefresh) throw err
    try {
      await refreshSession()
    } catch {
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:expired'))
      throw err
    }
    return rawRequest(path, options)
  }
}

function qs(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => {
    const refreshToken = tokenStore.getRefresh()
    return refreshToken ? request('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }).catch(() => {}) : Promise.resolve()
  },
  me: () => request('/auth/me'),

  listings: {
    search: (params, signal) => request(`/listings${qs(params)}`, { signal }),
    get: (id) => request(`/listings/${id}`),
  },

  vendor: {
    list: () => request('/vendor/listings?size=50'),
    get: (id) => request(`/vendor/listings/${id}`),
    create: (body) => request('/vendor/listings', { method: 'POST', body }),
    update: (id, body) => request(`/vendor/listings/${id}`, { method: 'PUT', body }),
    cancel: (id) => request(`/vendor/listings/${id}/cancel`, { method: 'POST' }),
  },

  admin: {
    stats: () => request('/admin/stats'),
    users: (params) => request(`/admin/users${qs(params)}`),
    setEnabled: (id, enabled) => request(`/admin/users/${id}/enabled`, { method: 'PATCH', body: { enabled } }),
  },
}
