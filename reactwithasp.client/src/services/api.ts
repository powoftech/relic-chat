import axios, { HttpStatusCode } from 'axios'
import Cookies from 'js-cookie'

// Use memory storage for access token
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'https://localhost:8001'}/api`,
  withCredentials: true,
})

// Add a request interceptor to include the access token in the headers
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

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
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'https://localhost:8001'}/api/auth/refresh`,
          {
            refreshToken: Cookies.get('refresh_token'),
          },
        )
        const { accessToken: newAccessToken, refreshToken } = response.data

        // Update access token in memory
        setAccessToken(newAccessToken)

        Cookies.set('refresh_token', refreshToken, {
          expires: 7, // 7 days
          secure: true,
          sameSite: 'Strict',
        })

        // Process all the requests that were waiting for the token refresh
        processQueue(null)
        isRefreshing = false

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false

        // Clear tokens on refresh failure
        setAccessToken(null)
        Cookies.remove('refresh_token')

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
