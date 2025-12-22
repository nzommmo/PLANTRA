// ========================
// Event Component
// ========================
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, DollarSign, Plus, X, Search, Filter, TrendingUp, Clock, Edit2, Trash2, MoreVertical } from 'lucide-react';
import axiosInstance from '../../../Constants/Axiosintance';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    event_date: '',
    expected_budget: '',
    expected_attendance: '',
    expected_revenue: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/events/');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/events/create/', formData);
      await fetchEvents();
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        event_date: '',
        expected_budget: '',
        expected_attendance: '',
        expected_revenue: '',
        status: 'Pending'
      });
    } catch (err) {
      alert('Error creating event: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      location: event.location,
      event_date: event.event_date,
      expected_budget: event.expected_budget,
      expected_attendance: event.expected_attendance,
      expected_revenue: event.expected_revenue,
      status: event.status
    });
    setShowEditModal(true);
    setShowDropdown(null);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/events/${selectedEvent.id}/update/`, formData);
      await fetchEvents();
      setShowEditModal(false);
      setSelectedEvent(null);
      setFormData({
        name: '',
        description: '',
        location: '',
        event_date: '',
        expected_budget: '',
        expected_attendance: '',
        expected_revenue: '',
        status: 'Pending'
      });
    } catch (err) {
      alert('Error updating event: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (event) => {
    if (!confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) return;

    try {
      await axiosInstance.delete(`/events/${event.id}/delete/`);
      await fetchEvents();
      setShowDropdown(null);
    } catch (err) {
      alert('Error deleting event: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBudgetStatus = (event) => {
    const budget = event.expected_budget || 0;
    const expenses = event.total_expenses || 0;
    
    if (budget === 0) return { color: 'text-gray-600', label: 'No Budget', icon: '' };
    
    const utilizationPercent = (expenses / budget) * 100;
    
    if (utilizationPercent >= 100) {
      return { color: 'text-red-600', label: 'Over Budget', icon: '⚠️' };
    } else if (utilizationPercent >= 90) {
      return { color: 'text-orange-600', label: 'Critical', icon: '⚠️' };
    } else if (utilizationPercent >= 75) {
      return { color: 'text-yellow-600', label: 'Warning', icon: '⚡' };
    } else {
      return { color: 'text-green-600', label: 'Healthy', icon: '✓' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Events</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e7ed2] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading events...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Events</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm p-8">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchEvents}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Events</h2>
          <p className="text-gray-600 mt-1">Manage and track all your event projects</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search events by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f1f7fd] rounded-lg">
          <Calendar className="h-4 w-4 text-[#3e7ed2]" />
          <span className="text-sm font-medium !text-[#1f2f4c]">{filteredEvents.length} Events</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-semibold text-lg !text-[#1f2f4c] mb-1 truncate">{event.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(showDropdown === index ? null : index);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-700" />
                    </button>
                    {showDropdown === index && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
                        <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <button
                            onClick={() => handleEdit(event)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#f1f7fd] rounded-t-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4 pb-4 border-b border-gray-200">
                <Clock className="h-3.5 w-3.5 text-[#3e7ed2]" />
                <span className="font-medium">{formatDate(event.event_date)}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-3.5 w-3.5" />
                    <span>Expected Attendance</span>
                  </div>
                  <span className="font-semibold text-[#1f2f4c]">{event.expected_attendance}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Approved Budget</span>
                  </div>
                  <span className="font-semibold text-[#1f2f4c]">{formatCurrency(event.expected_budget)}</span>
                </div>

                {event.total_expenses !== undefined && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>Budget Status</span>
                    </div>
                    <span className={`font-semibold flex items-center gap-1 ${getBudgetStatus(event).color}`}>
                      <span>{getBudgetStatus(event).icon}</span>
                      {getBudgetStatus(event).label}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Expected Revenue</span>
                  </div>
                  <span className="font-semibold text-green-600">{formatCurrency(event.expected_revenue)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 text-sm font-medium text-[#3e7ed2] bg-[#f1f7fd] rounded-lg hover:bg-[#dfeefa] transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold !text-[#1f2f4c] mb-2">No events found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first event'}
            </p>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold !text-[#1f2f4c]">Create New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved Budget (KES) *</label>
                  <input
                    type="number"
                    value={formData.expected_budget}
                    onChange={(e) => setFormData({ ...formData, expected_budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                    min="0"
                    placeholder="Total approved budget"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendance *</label>
                  <input
                    type="number"
                    value={formData.expected_attendance}
                    onChange={(e) => setFormData({ ...formData, expected_attendance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Revenue (KES) *</label>
                  <input
                    type="number"
                    value={formData.expected_revenue}
                    onChange={(e) => setFormData({ ...formData, expected_revenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d]"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-[#1f2f4c]">Edit Event</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved Budget (KES) *</label>
                  <input
                    type="number"
                    value={formData.expected_budget}
                    onChange={(e) => setFormData({ ...formData, expected_budget: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                    min="0"
                    placeholder="Total approved budget"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendance *</label>
                  <input
                    type="number"
                    value={formData.expected_attendance}
                    onChange={(e) => setFormData({ ...formData, expected_attendance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Revenue (KES) *</label>
                  <input
                    type="number"
                    value={formData.expected_revenue}
                    onChange={(e) => setFormData({ ...formData, expected_revenue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;