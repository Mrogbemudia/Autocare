/**
 * The ONLY place the frontend talks to the backend.
 * Every endpoint is listed in the `api` object at the bottom, so when the
 * Part 2 API contract is final you edit this file and nothing else.
 * See API_ASSUMPTIONS.md for the response shapes assumed here.
 */
const BASE = '/api'
const REQUEST_TIMEOUT_MS = 60_000 // free-tier backends can take ~1 minute to wake

// A 401 on these must not trigger a silent refresh.
const NO_REFRESH = new Set([
  '/auth/login',
  '/auth/register/owner',
  '/auth/register/shop',
  '/auth/refresh',
  '/auth/logout',
])

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', fields = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

function buildUrl(path, params) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') qs.set(key, String(value))
  }
  const query = qs.toString()
  return `${BASE}${path}${query ? `?${query}` : ''}`
}

async function send(path, { method = 'GET', body, params } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(buildUrl(path, params), {
      method,
      credentials: 'same-origin', // cookies are first-party through the Vercel rewrite (D-23)
      signal: controller.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) {
      throw new ApiError(json?.error?.message ?? 'Something went wrong. Please try again.', {
        status: res.status,
        code: json?.error?.code,
        fields: json?.error?.fields,
      })
    }
    return json
  } catch (err) {
    if (err instanceof ApiError) throw err
    throw new ApiError(
      'Cannot reach Kaza right now. Check your connection and try again. The server may still be waking up.',
      { status: 0, code: 'NETWORK' },
    )
  } finally {
    clearTimeout(timer)
  }
}

// One refresh at a time, even if several requests get a 401 together.
let refreshing = null
function refreshSession() {
  refreshing ??= send('/auth/refresh', { method: 'POST' })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

async function request(path, options) {
  try {
    return await send(path, options)
  } catch (err) {
    if (err.status === 401 && !NO_REFRESH.has(path) && (await refreshSession())) {
      return send(path, options)
    }
    throw err
  }
}

const data = (promise) => promise.then((json) => json?.data ?? null)
const post = (path, body) => data(request(path, { method: 'POST', body }))
const patch = (path, body) => data(request(path, { method: 'PATCH', body }))
const id = encodeURIComponent

export const api = {
  auth: {
    me: () => data(request('/auth/me')),
    login: (body) => post('/auth/login', body),
    registerOwner: (body) => post('/auth/register/owner', body),
    registerShop: (body) => post('/auth/register/shop', body),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  shops: {
    list: (params) => request('/shops', { params }), // returns { data, meta }
    get: (shopId) => data(request(`/shops/${id(shopId)}`)),
  },
  vehicles: {
    list: () => data(request('/vehicles')),
    create: (body) => post('/vehicles', body),
    update: (vehicleId, body) => patch(`/vehicles/${id(vehicleId)}`, body),
    remove: (vehicleId) => request(`/vehicles/${id(vehicleId)}`, { method: 'DELETE' }),
  },
  requests: {
    list: () => data(request('/requests')),
    create: (body) => post('/requests', body),
  },
  admin: {
    shops: (params) => request('/admin/shops', { params }), // returns { data, meta }
    reviewShop: (shopId, body) => patch(`/admin/shops/${id(shopId)}/verification`, body),
  },
}
