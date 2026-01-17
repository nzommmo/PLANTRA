import axios from "axios"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

/**
 * Request Interceptor
 * Automatically attaches JWT access token if available
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = localStorage.getItem("refresh_token")

    if (!refreshToken) {
      // No refresh token, redirect to login
      localStorage.clear()
      window.location.href = "/login"
      return Promise.reject(error)
    }

    try {
      // Attempt to refresh the token
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}accounts/token/refresh/`,
        { refresh: refreshToken }
      )

      const { access, refresh, name, role, organization_name } = response.data

      // Store new tokens and user data
      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("name", name)
      localStorage.setItem("role", role)
      localStorage.setItem("organization_name", organization_name)

      // Update authorization header
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${access}`
      originalRequest.headers.Authorization = `Bearer ${access}`

      // Process queued requests
      processQueue(null, access)

      isRefreshing = false

      // Retry original request
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      // Refresh failed, clear storage and redirect to login
      processQueue(refreshError, null)
      isRefreshing = false

      localStorage.clear()
      window.location.href = "/login"

      return Promise.reject(refreshError)
    }
  }
)

export default axiosInstance