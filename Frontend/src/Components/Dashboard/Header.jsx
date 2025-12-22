import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, LogOut, User, X, Calendar, DollarSign, Receipt, CheckSquare, Users, LayoutDashboard, Settings } from 'lucide-react';

const Header = ({ activeView, setActiveView }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    organization: ''
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Fetch user data from localStorage
    const userName = localStorage.getItem('name') || 'User';
    const userRole = localStorage.getItem('role') || 'Member';
    const organizationName = localStorage.getItem('organization') || 'Organization';
    const userEmail = localStorage.getItem('user_email') || 'user@plantra.com';

    setUser({
      name: userName,
      email: userEmail,
      role: userRole,
      organization: organizationName
    });
  }, []);

  // Close mobile menu when view changes
  useEffect(() => {
    setShowMobileMenu(false);
  }, [activeView]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };
    
    if (showMobileMenu) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Menu items matching your sidebar
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { name: 'Events', icon: Calendar, view: 'events' },
    { name: 'Team', icon: Users, view: 'team' },
    { name: 'Checklist', icon: CheckSquare, view: 'checklist' },
    { name: 'Budget', icon: DollarSign, view: 'budget' },
    { name: 'Expenses', icon: Receipt, view: 'expenses' },
    { name: 'Settings', icon: Settings, view: 'settings' },
  ];

  const handleMenuItemClick = (view) => {
    console.log('Menu clicked:', view); // Debug log
    if (setActiveView) {
      setActiveView(view);
    }
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-14 items-center gap-4 px-6">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 hover:bg-[#f1f7fd] rounded-md transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-sm hidden sm:block">
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
                          setActiveView('settings');
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

      {/* Mobile Drawer */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 lg:hidden transition-opacity"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-[60] lg:hidden flex flex-col">
            {/* Drawer Header */}
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-6 flex-shrink-0">
              <div className="flex items-center gap-2 font-semibold">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-lg text-[#1f2f4c]">Plantra</span>
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 bg-[#f1f7fd] border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-semibold">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  <p className="text-xs text-[#3e7ed2] font-medium mt-0.5">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation - Matching Sidebar Style */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;
                
                return (
                  <button
                    key={item.view}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleMenuItemClick(item.view);
                    }}
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#3e7ed2] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-[#f1f7fd] hover:text-[#30589d]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="border-t border-gray-200 p-4 flex-shrink-0">
              <button
                onClick={handleLogout}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#f1f7fd] hover:text-[#30589d] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;