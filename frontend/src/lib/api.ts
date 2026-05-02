/**
 * Centralized API client with JWT injection and auto-refresh.
 */
import axios, { AxiosInstance, AxiosError } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Inject access token on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = Cookies.get('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refresh,
          })
          Cookies.set('access_token', data.access_token, { expires: 1 })
          Cookies.set('refresh_token', data.refresh_token, { expires: 30 })
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { full_name?: string; target_role?: string; target_industry?: string }) =>
    api.patch('/users/me', data),
}

// ─── Resumes ─────────────────────────────────────────────────────────────────
export const resumesApi = {
  list: () => api.get('/resumes/'),
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/resumes/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  analyze: (resumeId: string) => api.post(`/resumes/${resumeId}/analyze`),
  rewrite: (resumeId: string, target_role: string, target_industry: string) =>
    api.post(`/resumes/${resumeId}/rewrite`, { resume_id: resumeId, target_role, target_industry }),
  getAnalyses: (resumeId: string) => api.get(`/resumes/${resumeId}/analyses`),
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsApi = {
  match: (data: { resume_id: string; job_title: string; company_name?: string; job_description: string }) =>
    api.post('/jobs/match', data),
  history: () => api.get('/jobs/history'),
  getDetail: (id: string) => api.get(`/jobs/${id}`),
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
export const portfolioApi = {
  review: (data: { github_url?: string; project_description?: string }) =>
    api.post('/portfolio/review', data),
  history: () => api.get('/portfolio/history'),
}

// ─── Interview ────────────────────────────────────────────────────────────────
export const interviewApi = {
  generate: (resume_id: string) => api.post('/interview/generate', { resume_id }),
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (message: string, session_id?: string) =>
    api.post('/chat/message', { message, session_id }),
  getSessions: () => api.get('/chat/sessions'),
  getSession: (id: string) => api.get(`/chat/sessions/${id}`),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}