import { apiClient } from '../../../services/apiClient'

export async function loginRequest(email: string, password: string) {
  const res = await apiClient.post('/auth/login', { email, password })
  return res.data
}

export async function meRequest() {
  const res = await apiClient.get('/auth/me')
  return res.data
}

export async function logoutRequest() {
  const res = await apiClient.post('/auth/logout')
  return res.data
}
