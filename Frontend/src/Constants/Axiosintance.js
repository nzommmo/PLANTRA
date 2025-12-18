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

export default axiosInstance
