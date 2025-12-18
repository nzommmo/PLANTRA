import React, { useState } from 'react'
import Authimage from "../../assets/images/Auth.png"
import { useNavigate } from 'react-router-dom'
import axiosInstance from "../../Constants/Axiosintance"

const SignUp = () => {
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const clearForm = () => {
    setFullName('')
    setOrganizationName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}
    if (!fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!organizationName.trim()) newErrors.organizationName = 'Organization name is required'
    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      const payload = {
        name: fullName,
        organization_name: organizationName,
        email,
        password
      }
      await axiosInstance.post('/accounts/register/', payload)
      clearForm()
      navigate('/login') // go to login page after successful signup
    } catch (err) {
      if (err.response && err.response.data) {
        setErrors({ general: err.response.data.detail || 'Signup failed. Please try again.' })
      } else {
        setErrors({ general: 'Signup failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="min-h-screen flex lg:flex-row flex-col items-center justify-center bg-gray-50">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center pt-8">
            <img src={Authimage} className="lg:w-1/3 w-2/8 lg:pt-0 lg:pt-32 mx-5" alt="" />
          </div>
          <h3 className="!text-custom9 text-2xl font-semibold">Create account</h3>
          <p className="text-sm text-gray-500">Enter your details to get started</p>
          <div>
            <p className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login/')}
                className="text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {errors.general && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-2">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-1.5 ${
                errors.fullName ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium">Organization Name</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-1.5 ${
                errors.organizationName ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.organizationName && (
              <p className="text-xs text-red-500 mt-1">{errors.organizationName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-1.5 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-md border px-3 py-1.5 pr-10 ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-md border px-3 py-1.5 pr-10 ${
                  errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-custom7 text-white rounded-md py-2 font-medium hover:bg-custom8 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignUp
