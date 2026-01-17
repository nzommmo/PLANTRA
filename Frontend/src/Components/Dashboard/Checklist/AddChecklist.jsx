import React, { useState } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../../Constants/Axiosintance';

const AddChecklist = ({ isOpen, onClose, onChecklistCreated, selectedEvent, teamMembers }) => {
  const [checklistFormData, setChecklistFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    status: 'pending'
  });

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      // Convert assigned_to to number before sending
      const submitData = {
        ...checklistFormData,
        assigned_to: Number(checklistFormData.assigned_to)
      };
      
      await axiosInstance.post(`/events/${selectedEvent}/checklist/create/`, submitData);
      
      // Reset form
      setChecklistFormData({
        title: '',
        description: '',
        assigned_to: '',
        due_date: '',
        status: 'pending'
      });
      
      onChecklistCreated(); // Trigger refresh in parent component
      onClose(); // Close the modal
    } catch (err) {
      alert('Error creating checklist item: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold !text-[#1f2f4c]">Add Task</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateItem} className="p-6 space-y-4 h-screen">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={checklistFormData.title}
              onChange={(e) => setChecklistFormData({ ...checklistFormData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={checklistFormData.description}
              onChange={(e) => setChecklistFormData({ ...checklistFormData, description: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
            <select
              value={checklistFormData.assigned_to}
              onChange={(e) => setChecklistFormData({ ...checklistFormData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
              required
            >
              <option value="">Select team member</option>
              {teamMembers && teamMembers.length > 0 ? (
                teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))
              ) : (
                <option value="" disabled>No team members available</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input
              type="date"
              value={checklistFormData.due_date}
              onChange={(e) => setChecklistFormData({ ...checklistFormData, due_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              value={checklistFormData.status}
              onChange={(e) => setChecklistFormData({ ...checklistFormData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
              required
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d]"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChecklist;