import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckSquare, DollarSign, Clock, AlertCircle, Plus } from 'lucide-react';
import axiosInstance from '../../Constants/Axiosintance';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/accounts/dashboard/stats/');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Calendar,
      Users,
      CheckSquare,
      DollarSign,
      Clock,
      AlertCircle
    };
    return icons[iconName] || Calendar;
  };

  const stats = dashboardData ? [
    { 
      label: 'Active Events', 
      value: dashboardData.stats.active_events.value.toString(), 
      change: dashboardData.stats.active_events.change, 
      trend: dashboardData.stats.active_events.trend, 
      icon: Calendar 
    },
    { 
      label: 'Team Members', 
      value: dashboardData.stats.team_members.value.toString(), 
      change: dashboardData.stats.team_members.change, 
      trend: dashboardData.stats.team_members.trend, 
      icon: Users 
    },
    { 
      label: 'Pending Tasks', 
      value: dashboardData.stats.pending_tasks.value.toString(), 
      change: dashboardData.stats.pending_tasks.change, 
      trend: dashboardData.stats.pending_tasks.trend, 
      icon: CheckSquare 
    },
    { 
      label: 'Total Budget', 
      value: dashboardData.stats.total_budget.value, 
      change: dashboardData.stats.total_budget.change, 
      trend: dashboardData.stats.total_budget.trend, 
      icon: DollarSign 
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e7ed2] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm p-8">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        <button 
          onClick={() => navigate('/dashboard/events/create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors shadow-sm mt-4 lg:mt-0"
        >
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
          <div className="p-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold leading-none tracking-tight !text-[#1f2f4c]">Upcoming Events</h3>
                <p className="text-sm text-gray-600 mt-1.5">
                  Your active and upcoming event projects
                </p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/events')}
                className="text-sm text-[#3e7ed2] hover:text-[#30589d] font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData?.upcoming_events && dashboardData.upcoming_events.length > 0 ? (
                dashboardData.upcoming_events.map((event) => (
                  <div 
                    key={event.id} 
                    onClick={() => navigate(`/dashboard/events/${event.id}`)}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-[#f1f7fd] transition-colors cursor-pointer"
                  >
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-bold shrink-0">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-[#1f2f4c] truncate">{event.name}</p>
                        <span className="text-xs text-gray-600 ml-2">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
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
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No upcoming events</p>
                  <button 
                    onClick={() => navigate('/dashboard/events/create')}
                    className="mt-3 text-sm text-[#3e7ed2] hover:text-[#30589d] font-medium"
                  >
                    Create your first event
                  </button>
                </div>
              )}
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
              {dashboardData?.urgent_tasks && dashboardData.urgent_tasks.length > 0 ? (
                dashboardData.urgent_tasks.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/dashboard/events/${item.event_id}`)}
                    className="p-3 rounded-lg bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                  >
                    <p className="text-sm font-medium text-[#1f2f4c] mb-1">{item.task}</p>
                    <p className="text-xs text-gray-600 mb-2">{item.event}</p>
                    <div className="flex items-center gap-1 text-orange-600">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs font-medium">{item.deadline}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CheckSquare className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No urgent tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <h3 className="font-semibold leading-none tracking-tight !text-[#1f2f4c] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
              dashboardData.recent_activity.map((activity, index) => {
                const Icon = getIconComponent(activity.icon);
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
              })
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;