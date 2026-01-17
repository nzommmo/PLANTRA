import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, X, Edit2, Trash2, MoreVertical, AlertCircle, Clock, User } from 'lucide-react';
import axiosInstance from "../../../Constants/Axiosintance"
import AddChecklist from './AddChecklist';
import EditChecklist from './EditChecklist';

const Checklist = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Modals
  const [editingItem, setEditingItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  
  
  useEffect(() => {
    fetchEvents();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchChecklistItems();
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('/events/');
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEvent(response.data[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setLoading(false);
    }
  };

const fetchTeamMembers = async () => {
  try {
    const response = await axiosInstance.get('/accounts/team/');
    // Extract the members array from the response
    setTeamMembers(response.data.members || []);
    console.log('Team members:', response.data.members); // Debug: Check the structure
  } catch (err) {
    console.error('Error fetching team members:', err);
    setTeamMembers([]); // Set empty array on error
  }
};
  const fetchChecklistItems = async () => {
    try {
      const response = await axiosInstance.get(`/events/${selectedEvent}/checklist/`);
      setChecklistItems(response.data);
    } catch (err) {
      console.error('Error fetching checklist items:', err);
    }
  };



  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;
    try {
      await axiosInstance.delete(`/events/checklist/${id}/delete/`);
      await fetchChecklistItems();
      setShowDropdown(null);
    } catch (err) {
      alert('Error deleting checklist item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
    setShowDropdown(null);
  };


  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await axiosInstance.put(`/events/checklist/${item.id}/update/`, {
        ...item,
        status: newStatus
      });
      await fetchChecklistItems();
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter items by status
  const filteredItems = checklistItems.filter(item => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Calculate stats
  const totalItems = checklistItems.length;
  const completedItems = checklistItems.filter(item => item.status === 'completed').length;
  const pendingItems = checklistItems.filter(item => item.status === 'pending').length;
  const inProgressItems = checklistItems.filter(item => item.status === 'in_progress').length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' },
      'in_progress': { class: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Progress' },
      'completed': { class: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Checklist</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e7ed2]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Checklist</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold !text-[#1f2f4c] mb-2">No Events Found</h3>
            <p className="text-gray-600">Create an event first to manage its checklist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex lg:flex-row flex-col lg:items-center items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Checklist</h2>
          <p className="text-gray-600 mt-1">Track tasks and deliverables for your events</p>
        </div>
        <select
          value={selectedEvent || ''}
          onChange={(e) => setSelectedEvent(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
        >
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Tasks</span>
            <CheckSquare className="h-5 w-5 text-[#3e7ed2]" />
          </div>
          <p className="text-2xl font-bold text-[#1f2f4c]">{totalItems}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Completed</span>
            <CheckSquare className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{completedItems}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">In Progress</span>
            <CheckSquare className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{inProgressItems}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Pending</span>
            <CheckSquare className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingItems}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#1f2f4c]">Overall Progress</span>
          <span className="text-sm text-gray-600">{completionPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex lg:flex-row flex-col lg:items-center items-start gap-2 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit ${
              statusFilter === 'all'
                ? 'bg-[#3e7ed2] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-[#3e7ed2] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'in_progress'
                ? 'bg-[#3e7ed2] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'completed'
                ? 'bg-[#3e7ed2] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
        </div>

              <button
      onClick={() => setShowAddModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors"
    >
      <Plus className="h-4 w-4" />
      Add Task
    </button>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => {
          const statusBadge = getStatusBadge(item.status);
          const assignedMember = teamMembers.find(m => m.id === item.assigned_to);
          const overdue = isOverdue(item.due_date, item.status);

          return (
            <div
              key={item.id}
              className={`rounded-xl border bg-white shadow-sm p-4 hover:shadow-md transition-shadow ${
                overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleStatus(item)}
                  className="mt-1 flex-shrink-0"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.status === 'completed'
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 hover:border-[#3e7ed2]'
                    }`}
                  >
                    {item.status === 'completed' && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h4
                        className={`font-semibold !text-[#1f2f4c] mb-1 ${
                          item.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                        {showDropdown === index && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
                            <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#f1f7fd]"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {assignedMember && (
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{assignedMember.name}</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDate(item.due_date)}</span>
                      {overdue && <span className="text-xs">(Overdue)</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1f2f4c] mb-2">No Tasks Found</h3>
          <p className="text-gray-600">
            {statusFilter !== 'all'
              ? `No ${statusFilter.replace('_', ' ')} tasks found.`
              : 'Start by adding tasks to your checklist.'}
          </p>
        </div>
      )}

{/* Add Checklist Modal */}
<AddChecklist 
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  onChecklistCreated={fetchChecklistItems}
  selectedEvent={selectedEvent}
  teamMembers={teamMembers}
/>

{/* Edit Checklist Modal */}
<EditChecklist 
  isOpen={showEditModal}
  onClose={() => {
    setShowEditModal(false);
    setEditingItem(null);
  }}
  onChecklistUpdated={fetchChecklistItems}
  checklistItem={editingItem}
  teamMembers={teamMembers}
/>
    </div>
  );
};

export default Checklist;