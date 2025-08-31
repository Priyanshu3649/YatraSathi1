import axios from 'axios'

// Remove the '/api' prefix since the Vite proxy already handles this
const baseURL = ''

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Token is invalid or expired - just log it
      console.log('Authentication error: 403 Forbidden')
    }
    return Promise.reject(error)
  }
)



