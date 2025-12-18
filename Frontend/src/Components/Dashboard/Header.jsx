import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

const Header = () => {
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
          
          <div className="flex items-center gap-3 pl-3 border-l border-gray-300">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none text-gray-900">Event Organizer</p>
              <p className="text-xs text-gray-600 mt-0.5">organizer@plantra.com</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-semibold text-sm">
              EO
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;