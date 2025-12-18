import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './DashboardHome';

// Placeholder components for other views
const EventsView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Events</h2>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
      <p className="text-gray-600">Events management content will go here...</p>
    </div>
  </div>
);

const TeamView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Team</h2>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
      <p className="text-gray-600">Team management content will go here...</p>
    </div>
  </div>
);

const ChecklistView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Checklist</h2>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
      <p className="text-gray-600">Checklist content will go here...</p>
    </div>
  </div>
);

const BudgetView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Budget & Expenses</h2>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
      <p className="text-gray-600">Budget and expenses content will go here...</p>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Settings</h2>
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
      <p className="text-gray-600">Settings content will go here...</p>
    </div>
  </div>
);

const MainDash = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'events':
        return <EventsView />;
      case 'team':
        return <TeamView />;
      case 'checklist':
        return <ChecklistView />;
      case 'budget':
        return <BudgetView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f7fd]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainDash;