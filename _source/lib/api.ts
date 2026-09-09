import type { IdentityId, Profile } from './data'

interface ApiUser extends Profile {
  id: number
  identityId: IdentityId
}

interface AuthResponse {
  token: string
  user: ApiUser
}

const TOKEN_KEY = 'quote-assistant-token'

function token() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(TOKEN_KEY) || ''
}

async function request<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)
  headers.set('content-type', 'application/json')
  const currentToken = token()
  if (currentToken) headers.set('authorization', `Bearer ${currentToken}`)

  const response = await fetch(path, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || '服务器暂时不可用')
  return payload as T
}

export async function registerUser(input: {
  identityId: IdentityId
  name: string
  phone: string
  address: string
  password: string
}) {
  const result = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  window.localStorage.setItem(TOKEN_KEY, result.token)
  return result.user
}

export async function getCurrentUser() {
  if (!token()) return null
  try {
    const result = await request<{ user: ApiUser }>('/api/me')
    return result.user
  } catch {
    window.localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

export async function updateCurrentUser(input: {
  identityId: IdentityId
  profile: Profile
}) {
  const result = await request<{ user: ApiUser }>('/api/me', {
    method: 'PUT',
    body: JSON.stringify({ identityId: input.identityId, ...input.profile }),
  })
  return result.user
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY)
}
