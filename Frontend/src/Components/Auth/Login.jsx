import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../Constants/Axiosintance"
import Authimage from "../../assets/images/Auth.png"
import { useGoogleLogin } from '@react-oauth/google'

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
      localStorage.setItem("name", response.data.name)
      localStorage.setItem("role", response.data.role)
      localStorage.setItem("organization", response.data.organization_name)

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

  const handleCustomGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true)
        setErrors({})

        // Get user info from Google using the access token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google')
        }

        const userInfo = await userInfoResponse.json()

        // Now get a proper ID token by exchanging the access token
        // OR send the user info directly to your backend
        const response = await axiosInstance.post("accounts/login/google/", {
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.sub,
          // If this is a new user, you might need organization_name
          // organization_name: "Your Organization"
        })

        // Save tokens if login is successful
        localStorage.setItem("access_token", response.data.access)
        localStorage.setItem("refresh_token", response.data.refresh)
        localStorage.setItem("name", response.data.user.name)
        localStorage.setItem("role", response.data.user.role)
        localStorage.setItem("organization", response.data.user.organization_name)

        navigate("/dashboard")
      } catch (err) {
        console.error('Google login error:', err)
        if (err.response && err.response.data) {
          if (err.response.data.error && err.response.data.error.includes('organization_name')) {
            setErrors({
              general: "Please complete your registration by providing your organization name"
            })
          } else {
            setErrors({
              general: err.response.data.error || err.response.data.detail || "Google login failed"
            })
          }
        } else {
          setErrors({ general: "Google login failed. Please try again." })
        }
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setErrors({ general: "Google login failed. Please try again." })
    }
  })

  return (
    <div className="min-h-screen flex   items-center justify-center bg-gray-50">
      <div className="min-h-screen flex lg:flex-row flex-col items-center justify-center bg-gray-50">
        <div className="text-center mb-4">
          <div className="flex  items-center justify-center pt-8">
            <img src={Authimage} className="lg:w-1/3 w-2/8 lg:pt-0 lg:pt-32 mx-5" alt="" />
          </div>
          <h3 className="!text-custom9 text-2xl font-semibold">Welcome back</h3>
          <p className="text-sm text-gray-500">Sign in to continue</p>
          <div>
            <p className="mt-4 text-center text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/registration/')}
                className="text-custom7 hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
        
        
        <form onSubmit={handleSignin} className="space-y-2">
          {/* Google Login Button - Place it at the top of the form */}
          {errors.general && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {errors.general}
          </div>
        )}
          <button
            onClick={handleCustomGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-md py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
            </div>
          </div>

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
            <button type="button" className="text-custom7 hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-custom7 text-white rounded-md py-2 font-medium hover:bg-custom8 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login