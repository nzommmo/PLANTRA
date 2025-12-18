
// components/dashboard/Header.jsx
import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    organization: ''
  });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Fetch user data from localStorage
    const userName = localStorage.getItem('name') || 'User';
    const userRole = localStorage.getItem('role') || 'Member';
    const organizationName = localStorage.getItem('organization') || 'Organization';
    // Email is typically stored in localStorage during login, or you can decode from JWT
    const userEmail = localStorage.getItem('user_email') || 'user@plantra.com';

    setUser({
      name: userName,
      email: userEmail,
      role: userRole,
      organization: organizationName
    });
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.clear();
    // Redirect to login
    navigate('/login');
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-14 items-center gap-4 px-6">
        <button className="lg:hidden">
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="search"
              placeholder="Search events, tasks, team..."
              className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3e7ed2]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-md p-2 hover:bg-[#f1f7fd]">
            <Bell className="h-5 w-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#3e7ed2] text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="relative flex items-center gap-3 pl-3 border-l border-gray-300">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{user.role}</p>
            </div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-semibold text-sm hover:shadow-md transition-shadow"
            >
              {getInitials(user.name)}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.organization}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // Navigate to profile or settings
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#f1f7fd] rounded-md transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
