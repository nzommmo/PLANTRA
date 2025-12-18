import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../Constants/Axiosintance"
import Authimage from "../../assets/images/Auth.png"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const clearForm = () => {
    setEmail("")
    setPassword("")
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignin = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      const response = await axiosInstance.post("accounts/login/", { email, password })

      // Save tokens if login is successful
      localStorage.setItem("access_token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)

      clearForm()
      navigate("/dashboard")
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors({ general: err.response.data.detail || "Invalid email or password" })
      } else {
        setErrors({ general: "Login failed. Please try again." })
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center pt-8">
            <img src={Authimage} className="lg:w-1/3 w-2/8 lg:pt-0 pt-32 mx-5" alt="" />
          </div>
          <h3 className="!text-custom9 text-2xl font-semibold">Welcome back</h3>
          <p className="text-sm text-gray-500">Sign in to continue</p>
          <div>
            <p className="mt-4 text-center text-sm">
              Don’t have an account?{' '}
              <button
                onClick={() => navigate('/registration/')}
                className="text-blue-600 hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>

        {errors.general && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSignin} className="space-y-2">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`mt-1 w-full rounded-md border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-md border px-3 py-1.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <button type="button" className="text-blue-600 hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
