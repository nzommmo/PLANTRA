import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../../Constants/Axiosintance'

const AccountSettings = () => {
  const navigate = useNavigate()
  
  // User data from localStorage
  const [userData, setUserData] = useState({
    name: localStorage.getItem('name') || '',
    email: '',
    role: localStorage.getItem('role') || '',
    organization: localStorage.getItem('organization') || '',
  })

  // Profile settings state
  const [profileData, setProfileData] = useState({
    name: userData.name,
    phone: '',
    timezone: 'UTC',
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    marketingEmails: false,
  })

  // UI state
  const [activeTab, setActiveTab] = useState('profile')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        // This is a dummy fetch - replace with your actual endpoint
        // const response = await axiosInstance.get('accounts/profile/')
        // setUserData(response.data)
      } catch (err) {
        console.error('Failed to fetch user data')
      }
    }
    fetchUserData()
  }, [])

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Dummy update - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      localStorage.setItem('name', profileData.name)
      setSuccess('Profile updated successfully!')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordErrors({})
    setError('')
    setSuccess('')

    // Validation
    const errors = {}
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setLoading(true)
    try {
      // Dummy password change - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  // Handle notification settings update
  const handleNotificationUpdate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Dummy update - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Notification settings updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update notification settings')
    } finally {
      setLoading(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await axiosInstance.delete('accounts/account/delete/')

      // Clear local storage
      localStorage.clear()

      // Show success message
      alert(response.data.message)

      // Redirect to login
      navigate('/login')
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || 'Failed to delete account')
      } else {
        setError('Failed to delete account. Please try again.')
      }
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h3 className="font-bold !text-custom9">Account Settings</h3>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-custom7 text-custom7'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h4 className="text-xl font-semibold mb-6 !text-custom9">Profile Information</h4>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom7 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userData.email || 'user@example.com'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom7 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom7 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={userData.role}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={userData.organization}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-custom7 text-white rounded-lg hover:bg-custom8 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h4 className="text-xl font-semibold mb-6 !text-custom9">Security Settings</h4>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-custom7 focus:border-transparent ${
                          passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-custom7 focus:border-transparent ${
                          passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-custom7 focus:border-transparent ${
                          passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-custom7 text-white rounded-lg hover:bg-custom8 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                {/* Two-Factor Authentication (Dummy) */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                      Enable
                    </button>
                  </div>
                </div>

                {/* Active Sessions (Dummy) */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">💻</span>
                        </div>
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-600">Chrome on Windows • Nairobi, Kenya</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active Now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h4 className="text-xl font-semibold mb-6 !text-custom9">Notification Preferences</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive email updates about your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom7/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom7"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receive push notifications on your devices</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom7/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom7"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-gray-600">Get a weekly summary of your activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.weeklyReport}
                        onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom7/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom7"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive news and promotional content</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.marketingEmails}
                        onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom7/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-custom7"></div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleNotificationUpdate}
                      disabled={loading}
                      className="px-6 py-2 bg-custom7 text-white rounded-lg hover:bg-custom8 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div>
                <h4 className="text-xl font-semibold mb-6 text-red-600 !text-custom9">Danger Zone</h4>
                
                <div className="border border-red-300 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2 !text-custom10">Delete Account</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back. Please be certain. 
                        All your data will be permanently removed from our servers.
                      </p>
                      <ul className="text-sm text-red-700 mb-4 list-disc list-inside space-y-1">
                        <li>All your personal data will be deleted</li>
                        <li>You will lose access to all features</li>
                        <li>This action cannot be undone</li>
                        {userData.role === 'Account Manager' && (
                          <li className="font-semibold">As an Account Manager, ensure all team members are managed before deletion</li>
                        )}
                      </ul>
                      
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Export Data (Dummy) */}
                <div className="mt-6 border border-gray-300 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 !text-custom10">Export Your Data</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Download a copy of your data before deleting your account
                      </p>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Export Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Account Deletion</h3>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> You will immediately lose access to:
                </p>
                <ul className="text-sm text-yellow-800 mt-2 list-disc list-inside space-y-1">
                  <li>All your account data</li>
                  <li>Organization access</li>
                  <li>All saved information</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setError('')
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountSettings