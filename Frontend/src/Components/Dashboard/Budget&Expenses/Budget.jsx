import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, X, Edit2, Trash2, MoreVertical, TrendingUp, TrendingDown, AlertCircle, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../../Constants/Axiosintance';

const Budget = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  
  // Form data
  const [budgetFormData, setBudgetFormData] = useState({
    category: 'General',
    name: '',
    description: '',
    estimated_cost: '',
    status: 'not_paid'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails();
      fetchBudgetItems();
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

  const fetchEventDetails = async () => {
    try {
      const response = await axiosInstance.get(`/events/${selectedEvent}/summary/`);
      setEventDetails(response.data);
    } catch (err) {
      console.error('Error fetching event details:', err);
    }
  };

  const fetchBudgetItems = async () => {
    try {
      const response = await axiosInstance.get(`/events/${selectedEvent}/budget-items/`);
      setBudgetItems(response.data);
    } catch (err) {
      console.error('Error fetching budget items:', err);
    }
  };

  const handleCreateBudgetItem = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/events/${selectedEvent}/budget-items/create/`, budgetFormData);
      await fetchBudgetItems();
      await fetchEventDetails();
      setShowBudgetModal(false);
      setBudgetFormData({ category: 'General', name: '', description: '', estimated_cost: '', status: 'not_paid' });
    } catch (err) {
      const errorMsg = err.response?.data?.estimated_cost?.[0] || err.response?.data?.detail || err.message;
      alert('Error creating budget item: ' + errorMsg);
    }
  };

  const handleUpdateBudgetItem = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/events/budget-items/${editingBudgetItem.id}/update/`, budgetFormData);
      await fetchBudgetItems();
      await fetchEventDetails();
      setShowBudgetModal(false);
      setEditingBudgetItem(null);
      setBudgetFormData({ category: 'General', name: '', description: '', estimated_cost: '', status: 'not_paid' });
    } catch (err) {
      const errorMsg = err.response?.data?.estimated_cost?.[0] || err.response?.data?.detail || err.message;
      alert('Error updating budget item: ' + errorMsg);
    }
  };

  const handleDeleteBudgetItem = async (id) => {
    if (!confirm('Are you sure you want to delete this budget item?')) return;
    try {
      await axiosInstance.delete(`/events/budget-items/${id}/delete/`);
      await fetchBudgetItems();
      await fetchEventDetails();
      setShowDropdown(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert('Error deleting budget item: ' + errorMsg);
    }
  };

  const handleEditBudgetItem = (item) => {
    setEditingBudgetItem(item);
    setBudgetFormData({
      category: item.category || 'General',
      name: item.name,
      description: item.description || '',
      estimated_cost: item.estimated_cost,
      status: item.status
    });
    setShowBudgetModal(true);
    setShowDropdown(null);
  };

  // Extract values with proper fallbacks
  const approvedBudget = eventDetails?.budget?.approved_budget || 0;
  const totalAllocated = eventDetails?.budget?.total_allocated || 0;
  const totalExpenses = eventDetails?.budget?.total_expenses || 0;
  const remaining = eventDetails?.budget?.remaining || approvedBudget;
  const utilizationPercent = eventDetails?.budget?.utilization_percent || 0;
  const budgetStatus = eventDetails?.budget?.status || 'healthy';

  // Debug log to see what we're getting
  useEffect(() => {
    if (eventDetails) {
      console.log('Event Details:', eventDetails);
      console.log('Budget Data:', eventDetails?.budget);
    }
  }, [eventDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'not_paid': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'deposit_paid': 'bg-blue-100 text-blue-800 border-blue-200',
      'paid': 'bg-green-100 text-green-800 border-green-200',
    };
    const labels = {
      'not_paid': 'Not Paid',
      'deposit_paid': 'Deposit Paid',
      'paid': 'Paid',
    };
    return { class: badges[status] || badges.not_paid, label: labels[status] || 'Not Paid' };
  };

  const getBudgetStatusColor = (status) => {
    const colors = {
      'healthy': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'critical': 'bg-orange-100 text-orange-800 border-orange-200',
      'over_budget': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.healthy;
  };

  const categories = [
    'General',
    'Venue',
    'Catering',
    'Entertainment',
    'Marketing',
    'Decorations',
    'Equipment',
    'Staff',
    'Transportation',
    'Miscellaneous'
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Budget Planning</h2>
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
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Budget Planning</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold !text-[#1f2f4c] mb-2">No Events Found</h3>
            <p className="text-gray-600">Create an event first to manage its budget.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Budget Planning</h2>
          <p className="text-gray-600 mt-1">Plan and track event budget allocations</p>
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

      {/* Budget Status Alert */}
      {budgetStatus !== 'healthy' && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${getBudgetStatusColor(budgetStatus)}`}>
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">
              {budgetStatus === 'over_budget' && 'Budget Exceeded!'}
              {budgetStatus === 'critical' && 'Critical: Near Budget Limit'}
              {budgetStatus === 'warning' && 'Warning: High Budget Usage'}
            </h4>
            <p className="text-sm mt-1">
              {budgetStatus === 'over_budget' && `You have exceeded your budget by ${formatCurrency(Math.abs(remaining))}`}
              {budgetStatus === 'critical' && `You have used ${utilizationPercent.toFixed(1)}% of your approved budget`}
              {budgetStatus === 'warning' && `You have used ${utilizationPercent.toFixed(1)}% of your approved budget`}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Approved Budget</span>
            <DollarSign className="h-5 w-5 text-[#3e7ed2]" />
          </div>
          <p className="text-2xl font-bold text-[#1f2f4c]">{formatCurrency(approvedBudget)}</p>
          <p className="text-xs text-gray-500 mt-1">Total approved amount</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Budget Allocated</span>
            <TrendingDown className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAllocated)}</p>
          <p className="text-xs text-gray-500 mt-1">{budgetItems.length} budget items</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Actual Expenses</span>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">{utilizationPercent.toFixed(1)}% of budget</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Remaining</span>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {remaining >= 0 ? 'Available' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Budget Progress Bar */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#1f2f4c]">Budget Utilization</span>
          <span className={`text-sm font-semibold px-2 py-1 rounded border ${getBudgetStatusColor(budgetStatus)}`}>
            {utilizationPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              utilizationPercent >= 100 ? 'bg-red-600' : 
              utilizationPercent >= 90 ? 'bg-orange-500' : 
              utilizationPercent >= 75 ? 'bg-yellow-500' : 
              'bg-[#3e7ed2]'
            }`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>Healthy (&lt;75%)</span>
          <span>Warning (75-90%)</span>
          <span>Critical (&gt;90%)</span>
        </div>
      </div>

      {/* Budget Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold !text-[#1f2f4c]">Budget Items ({budgetItems.length})</h3>
          <button
            onClick={() => {
              setEditingBudgetItem(null);
              setBudgetFormData({ category: 'General', name: '', description: '', estimated_cost: '', status: 'not_paid' });
              setShowBudgetModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Budget Item
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetItems.map((item, index) => {
            const statusBadge = getStatusBadge(item.status);
            const itemExpenses = item.total_expenses || 0;
            const itemVariance = parseFloat(item.estimated_cost) - itemExpenses;
            const itemUtilization = item.estimated_cost > 0 ? (itemExpenses / item.estimated_cost) * 100 : 0;
            
            return (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {item.category || 'General'}
                      </span>
                    </div>
                    <h3 className="font-semibold !text-[#1f2f4c] mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                    )}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(showDropdown === `budget-${index}` ? null : `budget-${index}`)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                    {showDropdown === `budget-${index}` && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
                        <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                          <button
                            onClick={() => handleEditBudgetItem(item)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#f1f7fd]"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBudgetItem(item.id)}
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
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated</span>
                    <span className="font-semibold text-[#1f2f4c]">{formatCurrency(item.estimated_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actual Expenses</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(itemExpenses)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Variance</span>
                      <span className={`font-semibold ${itemVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {itemVariance >= 0 ? '+' : ''}{formatCurrency(itemVariance)}
                      </span>
                    </div>
                    {itemUtilization > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              itemUtilization >= 100 ? 'bg-red-600' : 
                              itemUtilization >= 90 ? 'bg-orange-500' : 
                              'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(itemUtilization, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{itemUtilization.toFixed(0)}% utilized</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {budgetItems.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold !text-[#1f2f4c] mb-2">No Budget Items</h3>
            <p className="text-gray-600">Start by adding budget items for this event.</p>
          </div>
        )}
      </div>

      {/* Budget Item Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold !text-[#1f2f4c]">
                {editingBudgetItem ? 'Edit Budget Item' : 'Add Budget Item'}
              </h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editingBudgetItem ? handleUpdateBudgetItem : handleCreateBudgetItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={budgetFormData.category}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={budgetFormData.name}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                  placeholder="e.g., Wedding Venue Rental"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={budgetFormData.description}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  placeholder="Additional details about this budget item"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetFormData.estimated_cost}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, estimated_cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status *</label>
                <select
                  value={budgetFormData.status}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                >
                  <option value="not_paid">Not Paid</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d]"
                >
                  {editingBudgetItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;