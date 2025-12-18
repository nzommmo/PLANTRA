// components/dashboard/DashboardHome.jsx
import React from 'react';
import { Calendar, Users, CheckSquare, DollarSign, Clock, AlertCircle, Plus } from 'lucide-react';

const DashboardHome = () => {
  const stats = [
    { label: 'Active Events', value: '12', change: '+3 this month', trend: 'up', icon: Calendar },
    { label: 'Team Members', value: '24', change: '+4 this week', trend: 'up', icon: Users },
    { label: 'Pending Tasks', value: '47', change: '18 overdue', trend: 'down', icon: CheckSquare },
    { label: 'Total Budget', value: '$125,430', change: '68% spent', trend: 'neutral', icon: DollarSign },
  ];

  const upcomingEvents = [
    { name: 'Annual Tech Conference', date: 'Dec 25, 2025', status: 'In Progress', progress: 75 },
    { name: 'Product Launch Party', date: 'Jan 15, 2026', status: 'Planning', progress: 45 },
    { name: 'Team Building Retreat', date: 'Feb 10, 2026', status: 'Early Stage', progress: 20 },
  ];

  const recentActivity = [
    { action: 'Budget item added', detail: 'Venue rental - $5,000', time: '2 hours ago', icon: DollarSign },
    { action: 'Task completed', detail: 'Finalize catering menu', time: '4 hours ago', icon: CheckSquare },
    { action: 'Team member added', detail: 'Sarah Johnson joined as coordinator', time: '1 day ago', icon: Users },
    { action: 'Event created', detail: 'Summer Gala 2026', time: '2 days ago', icon: Calendar },
  ];

  const urgentTasks = [
    { task: 'Confirm vendor contracts', event: 'Tech Conference', deadline: 'Today' },
    { task: 'Send invitations', event: 'Product Launch', deadline: 'Tomorrow' },
    { task: 'Book venue', event: 'Team Retreat', deadline: 'In 3 days' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex lg:flex-row flex-col lg:items-center items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Event Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Manage your events, teams, and budgets all in one place
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-[#dfeefa] flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#3e7ed2]" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-[#1f2f4c]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold leading-none tracking-tight !text-[#1f2f4c]">Upcoming Events</h3>
                <p className="text-sm text-gray-600 mt-1.5">
                  Your active and upcoming event projects
                </p>
              </div>
              <button className="text-sm text-[#3e7ed2] hover:text-[#30589d] font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-[#f1f7fd] transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-bold shrink-0">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-[#1f2f4c] truncate">{event.name}</p>
                      <span className="text-xs text-gray-600 ml-2">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#3e7ed2] h-2 rounded-full transition-all"
                          style={{ width: `${event.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{event.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold leading-none tracking-tight !text-[#1f2f4c]">Urgent Tasks</h3>
            </div>
            <div className="space-y-3">
              {urgentTasks.map((item, index) => (
                <div key={index} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <p className="text-sm font-medium text-[#1f2f4c] mb-1">{item.task}</p>
                  <p className="text-xs text-gray-600 mb-2">{item.event}</p>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium">{item.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <h3 className="font-semibold leading-none tracking-tight !text-[#1f2f4c] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#dfeefa] flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-[#3e7ed2]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1f2f4c]">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
