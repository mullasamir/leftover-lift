const BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'
const TOKEN_KEY = 'leftoverlift.token'

// Note: localStorage keeps this simple, but a script injected into the page could read it.
// Before production, move the token into an httpOnly, SameSite cookie.
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? 'Something went wrong. Please try again.')
    this.status = status
    this.code = body?.code ?? 'UNKNOWN'
    this.fieldErrors = body?.fieldErrors ?? {}
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, { code: 'NETWORK', message: "We can't reach the server. Check your connection and try again." })
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, data)
  return data
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
}
