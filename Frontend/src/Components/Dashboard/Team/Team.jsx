import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, Trash2, Plus, X, Search } from 'lucide-react';
import axiosInstance from "../../../Constants/Axiosintance"

const Team = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', role: '', password: '' });
  
  const currentUserRole = localStorage.getItem('role');
  const isAccountManager = currentUserRole === 'Account Manager';

  // Fetch team members
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/accounts/team/');
      setTeamData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  // Add new member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/accounts/team/create/', formData);
      await fetchTeamMembers();
      setShowAddModal(false);
      setFormData({ email: '', name: '', role: '', password: '' });
    } catch (err) {
      alert('Error adding member: ' + (err.response?.data?.detail || err.response?.data?.email?.[0] || err.message));
    }
  };

  // Delete member (Account Manager only)
  const handleDeleteMember = async (memberId, memberName) => {
    if (!confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) return;

    try {
      const response = await axiosInstance.delete(`/accounts/team/delete/${memberId}/`);
      alert(response.data.message || 'Member deleted successfully');
      await fetchTeamMembers();
    } catch (err) {
      alert('Error deleting member: ' + (err.response?.data?.error || err.message));
    }
  };

  // Filter members based on search
  const teamMembers = teamData?.members || [];
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

  const getAuthProviderIcon = (provider) => {
    return provider === 'google' ? '🔗' : '📧';
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
        {isAccountManager && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {teamData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-600">Total Members</p>
            </div>
            <p className="text-2xl font-bold text-[#1f2f4c]">{teamData.summary.total_members}</p>
          </div>
          
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#3e7ed2] to-[#529adf] shadow-sm p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5" />
              <p className="text-sm opacity-90">Account Managers</p>
            </div>
            <p className="text-2xl font-bold">{teamData.summary.account_managers}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#73b5e7] to-[#9fc9ed] shadow-sm p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <p className="text-sm opacity-90">Team Leads</p>
            </div>
            <p className="text-2xl font-bold">{teamData.summary.team_leads}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#c7e2f6] to-[#dfeefa] shadow-sm p-4 text-[#30589d]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <p className="text-sm">Team Members</p>
            </div>
            <p className="text-2xl font-bold">{teamData.summary.team_members}</p>
          </div>
        </div>
      )}

      {/* Search */}
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
          <span className="text-sm font-medium text-[#1f2f4c]">{filteredMembers.length} Found</span>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3e7ed2] to-[#529adf] flex items-center justify-center text-white font-bold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-gray-500" title={member.auth_provider === 'google' ? 'Google Account' : 'Email Account'}>
                    {getAuthProviderIcon(member.auth_provider)} {member.auth_provider}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold !text-[#1f2f4c] mb-1">{member.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{member.email}</span>
              </div>

              {member.date_joined && (
                <div className="text-xs text-gray-500 mb-4">
                  Joined: {new Date(member.date_joined).toLocaleDateString()}
                </div>
              )}

              {isAccountManager && member.role !== 'Account Manager' && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}

              {!isAccountManager && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">Team member view only</p>
                </div>
              )}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  <option value="Team Lead">Team Lead</option>
                  <option value="Team Member">Team Member</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Only Team Lead and Team Member roles can be created</p>
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
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ email: '', name: '', role: '', password: '' });
                  }}
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