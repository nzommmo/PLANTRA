import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, Edit2, UserX, Plus, X, Search } from 'lucide-react';
import axiosInstance from "../../../Constants/Axiosintance"

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ email: '', name: '', role: '', password: '' });

  // Fetch team members
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/accounts/team/');
      setTeamMembers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  // Edit member
  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({ email: member.email, name: member.name, role: member.role, password: '' });
    setShowEditModal(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    try {
      // Only send fields that should be updated (exclude password if empty)
      const updateData = {
        email: formData.email,
        name: formData.name,
        role: formData.role
      };
      
      await axiosInstance.put(`/accounts/team/${selectedMember.email}/`, updateData);
      await fetchTeamMembers();
      setShowEditModal(false);
      setSelectedMember(null);
      setFormData({ email: '', name: '', role: '', password: '' });
    } catch (err) {
      alert('Error updating member: ' + (err.response?.data?.message || err.message));
    }
  };

  // Deactivate member
  const handleDeactivate = async (member) => {
    if (!confirm(`Are you sure you want to deactivate ${member.name}?`)) return;

    try {
      await axiosInstance.post(`/accounts/team/${member.email}/deactivate/`);
      await fetchTeamMembers();
    } catch (err) {
      alert('Error deactivating member: ' + (err.response?.data?.message || err.message));
    }
  };

  // Add new member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/accounts/team/create/', formData);
      await fetchTeamMembers();
      setShowAddModal(false);
      setFormData({ email: '', name: '', role: '' });
    } catch (err) {
      alert('Error adding member: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter members based on search
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    const roleColors = {
      'Account Manager': 'bg-[#3e7ed2] text-white',
      'Team Lead': 'bg-[#73b5e7] text-white',
      'Team Member': 'bg-[#c7e2f6] text-[#30589d]',
    };
    return roleColors[role] || 'bg-gray-200 text-gray-700';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Team</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e7ed2] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading team members...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Team</h2>
        <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm p-8">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchTeamMembers}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Team</h2>
          <p className="text-gray-600 mt-1">Manage your event planning team members</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f1f7fd] rounded-lg">
          <Users className="h-4 w-4 text-[#3e7ed2]" />
          <span className="text-sm font-medium text-[#1f2f4c]">{filteredMembers.length} Members</span>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-bold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </span>
              </div>

              <h3 className="font-semibold !text-[#1f2f4c] mb-1">{member.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{member.email}</span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#3e7ed2] bg-[#f1f7fd] rounded-lg hover:bg-[#dfeefa] transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeactivate(member)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <UserX className="h-3.5 w-3.5" />
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1f2f4c] mb-2">No team members found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first team member'}
            </p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-[#1f2f4c]">Edit Team Member</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Account Manager">Account Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Team Member">Team Member</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters recommended</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold !text-[#1f2f4c]">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Account Manager">Account Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Team Member">Team Member</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters required</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;