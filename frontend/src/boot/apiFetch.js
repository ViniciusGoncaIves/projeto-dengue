class HttpClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  buildUrl(endpoint, params = {}) {
    const baseUrl = this.baseUrl.replace(/\/$/, '')
    let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

    if (baseUrl.endsWith('/api') && path.startsWith('/api/')) {
      path = path.replace(/^\/api/, '')
    }

    const url = new URL(`${baseUrl}${path}`)

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    return url.toString()
  }

  async apiFetch(endpoint, options = {}) {
    const { method = 'GET', body, headers = {}, params, skipAuth, ...rest } = options

    const isFormData =
      body && typeof FormData !== 'undefined' && (body instanceof FormData || rest.isFormData)

    const mergedHeaders = {
      ...headers,
    }

    if (!isFormData) {
      mergedHeaders['Content-Type'] = mergedHeaders['Content-Type'] || 'application/json'
    }

    const token = getAuthToken()
    if (
      !skipAuth &&
      !('Authorization' in mergedHeaders) &&
      !('authorization' in mergedHeaders) &&
      token
    ) {
      mergedHeaders.Authorization = `Bearer ${token}`
    }

    const response = await fetch(this.buildUrl(endpoint, params), {
      method,
      headers: mergedHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      ...rest,
    })

    const contentType = response.headers.get('content-type')

    let data = null

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      const message = data?.message || data?.error || 'Erro na requisicao'
      const error = new Error(message)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  get(endpoint, options = {}) {
    return this.apiFetch(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  post(endpoint, body, options = {}) {
    return this.apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body,
    })
  }

  put(endpoint, body, options = {}) {
    return this.apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body,
    })
  }

  patch(endpoint, body, options = {}) {
    return this.apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    })
  }

  delete(endpoint, options = {}) {
    return this.apiFetch(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

/**
 * URL centralizada del backend
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const AUTH_TOKEN_KEY = 'auth_dengue_token'

export function setAuthToken(token) {
  if (typeof localStorage === 'undefined') return
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthToken() {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthToken() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * Instancia global
 */
export const http = new HttpClient(BACKEND_URL)

/**
 * Helper directo
 */
export const apiFetch = http.apiFetch.bind(http)
