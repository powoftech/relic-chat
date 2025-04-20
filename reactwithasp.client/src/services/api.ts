import axios, { HttpStatusCode } from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://localhost:8001'}/api`,
  withCredentials: true,
})

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false
// Store pending requests to retry after token refresh
let failedQueue: {
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}[] = []

const processQueue = (error: unknown, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If it's not an unauthorized error, reject immediately
    if (error.response?.status !== HttpStatusCode.Unauthorized) {
      return Promise.reject(error)
    }

    // If we're not already refreshing the token
    if (!isRefreshing) {
      isRefreshing = true

      try {
        await api.post('/auth/refresh')

        // Process all the requests that were waiting for the token refresh
        processQueue(null)
        isRefreshing = false

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    // If we're already refreshing, add this request to the queue
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve: () => resolve(api(originalRequest)), reject })
    })
  },
)

export default api
