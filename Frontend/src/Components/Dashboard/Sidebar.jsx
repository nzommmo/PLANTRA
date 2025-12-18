// components/dashboard/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, Calendar, Users, CheckSquare, DollarSign, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { name: 'Events', icon: Calendar, view: 'events' },
    { name: 'Team', icon: Users, view: 'team' },
    { name: 'Checklist', icon: CheckSquare, view: 'checklist' },
    { name: 'Budget & Expenses', icon: DollarSign, view: 'budget' },
    { name: 'Settings', icon: Settings, view: 'settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center border-b border-gray-200 px-6">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-lg text-[#1f2f4c]">Plantra</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
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

      <div className="border-t border-gray-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#f1f7fd] hover:text-[#30589d] transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
