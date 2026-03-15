import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true })

api.interceptors.request.use((config) => {
  const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}')
  const token = stored?.state?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
}

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  updateManual: (data) => api.post('/profile/manual', data),
  uploadResume: (formData) => api.post('/profile/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (data) => api.put('/profile', data),
}

// Analysis
export const analysisAPI = {
  generate: (data) => api.post('/analysis/generate', data),
  getLatest: () => api.get('/analysis/latest'),
}

// Roadmap
export const roadmapAPI = {
  generate: (duration) => api.post('/roadmap/generate', { duration }),
  getActive: (duration) => api.get('/roadmap/active', { params: duration ? { duration } : {} }),
  getAll: () => api.get('/roadmap/all'),
  updateProgress: (id, data) => api.put(`/roadmap/${id}/progress`, data),
}

// Jobs
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
}

// Mentors
export const mentorsAPI = {
  getAll: (params) => api.get('/mentors', { params }),
  getById: (id) => api.get(`/mentors/${id}`),
  book: (id, data) => api.post(`/mentors/${id}/book`, data),
  getMyBookings: () => api.get('/mentors/me/bookings'),
}

// Community
export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (data) => api.post('/community/posts', data),
  likePost: (id) => api.post(`/community/posts/${id}/like`),
  addComment: (id, content) => api.post(`/community/posts/${id}/comment`, { content }),
  getLeaderboard: () => api.get('/community/leaderboard'),
}

// Chat
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', { message }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
}

// Payment
export const paymentAPI = {
  createOrder: (bookingId) => api.post('/payment/create-order', { bookingId }),
  verify: (data) => api.post('/payment/verify', data),
}

export default api
