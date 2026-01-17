import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, X, Edit2, Trash2, MoreVertical, AlertCircle, Calendar, CreditCard, FileText } from 'lucide-react';
import axiosInstance from '../../../Constants/Axiosintance';

const Expenses = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [budgetItems, setBudgetItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  
  // Form data
  const [expenseFormData, setExpenseFormData] = useState({
    name: '',
    amount: '',
    description: '',
    budget_item: '',
    payment_method: 'cash',
    receipt_number: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails();
      fetchBudgetItems();
      fetchExpenses();
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

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get(`/events/${selectedEvent}/expenses/`);
      setExpenses(response.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...expenseFormData,
        budget_item: expenseFormData.budget_item || null
      };
      await axiosInstance.post(`/events/${selectedEvent}/expenses/create/`, submitData);
      await fetchExpenses();
      await fetchBudgetItems();
      await fetchEventDetails();
      setShowExpenseModal(false);
      setExpenseFormData({ 
        name: '', 
        amount: '', 
        description: '', 
        budget_item: '',
        payment_method: 'cash',
        receipt_number: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      const errorMsg = err.response?.data?.amount?.[0] || err.response?.data?.detail || err.message;
      alert('Error creating expense: ' + errorMsg);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...expenseFormData,
        budget_item: expenseFormData.budget_item || null
      };
      await axiosInstance.put(`/events/expenses/${editingExpense.id}/update/`, submitData);
      await fetchExpenses();
      await fetchBudgetItems();
      await fetchEventDetails();
      setShowExpenseModal(false);
      setEditingExpense(null);
      setExpenseFormData({ 
        name: '', 
        amount: '', 
        description: '', 
        budget_item: '',
        payment_method: 'cash',
        receipt_number: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      const errorMsg = err.response?.data?.amount?.[0] || err.response?.data?.detail || err.message;
      alert('Error updating expense: ' + errorMsg);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axiosInstance.delete(`/events/expenses/${id}/delete/`);
      await fetchExpenses();
      await fetchBudgetItems();
      await fetchEventDetails();
      setShowDropdown(null);
    } catch (err) {
      alert('Error deleting expense: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseFormData({
      name: expense.name,
      amount: expense.amount,
      description: expense.description || '',
      budget_item: expense.budget_item || '',
      payment_method: expense.payment_method || 'cash',
      receipt_number: expense.receipt_number || '',
      date: expense.date || new Date().toISOString().split('T')[0]
    });
    setShowExpenseModal(true);
    setShowDropdown(null);
  };

  // Extract values with proper fallbacks
  const totalExpenses = eventDetails?.budget?.total_expenses || 0;
  const approvedBudget = eventDetails?.budget?.approved_budget || 0;
  const remaining = eventDetails?.budget?.remaining || approvedBudget;
  const utilizationPercent = eventDetails?.budget?.utilization_percent || 0;

  // Debug log to see what we're getting
  useEffect(() => {
    if (eventDetails) {
      console.log('Expenses - Event Details:', eventDetails);
      console.log('Expenses - Budget Data:', eventDetails?.budget);
    }
  }, [eventDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      'cash': 'Cash',
      'card': 'Card',
      'bank_transfer': 'Bank Transfer',
      'check': 'Check',
      'mobile_money': 'Mobile Money'
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight text-[#1f2f4c]">Expenses</h2>
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
        <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Expenses</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold !text-[#1f2f4c] mb-2">No Events Found</h3>
            <p className="text-gray-600">Create an event first to track expenses.</p>
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
          <h2 className="text-3xl font-bold tracking-tight !text-[#1f2f4c]">Expenses</h2>
          <p className="text-gray-600 mt-1">Track all actual event expenses</p>
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Budget Remaining</span>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remaining)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {remaining >= 0 ? 'Still available' : 'Over budget'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Budget Usage</span>
            <DollarSign className="h-5 w-5 text-[#3e7ed2]" />
          </div>
          <p className="text-2xl font-bold text-[#1f2f4c]">{utilizationPercent.toFixed(1)}%</p>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  utilizationPercent >= 100 ? 'bg-red-600' : 
                  utilizationPercent >= 90 ? 'bg-orange-500' : 
                  'bg-[#3e7ed2]'
                }`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="space-y-4">
        <div className="flex lg:flex-row flex-col justify-between lg:items-center items-start gap-2">
          <h3 className="text-lg font-semibold !text-[#1f2f4c]">Expense Records ({expenses.length})</h3>
          <button
            onClick={() => {
              setEditingExpense(null);
              setExpenseFormData({ 
                name: '', 
                amount: '', 
                description: '', 
                budget_item: '',
                payment_method: 'cash',
                receipt_number: '',
                date: new Date().toISOString().split('T')[0]
              });
              setShowExpenseModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Record Expense
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense, index) => {
                  const budgetItem = budgetItems.find(item => item.id === expense.budget_item);
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(expense.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#1f2f4c]">{expense.name}</div>
                        {expense.description && (
                          <div className="text-xs text-gray-500 mt-1">{expense.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {budgetItem ? (
                          <div>
                            <div className="font-medium">{budgetItem.name}</div>
                            <div className="text-xs text-gray-500">{budgetItem.category}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Miscellaneous</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                          {getPaymentMethodLabel(expense.payment_method)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {expense.receipt_number ? (
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            {expense.receipt_number}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600 whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setShowDropdown(showDropdown === `expense-${index}` ? null : `expense-${index}`)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-600" />
                          </button>
                          {showDropdown === `expense-${index}` && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)} />
                              <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#f1f7fd]"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {expenses.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold !text-[#1f2f4c] mb-2">No Expenses</h3>
            <p className="text-gray-600">Start recording expenses for this event.</p>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold !text-[#1f2f4c]">
                {editingExpense ? 'Edit Expense' : 'Record Expense'}
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name *</label>
                <input
                  type="text"
                  value={expenseFormData.name}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                  placeholder="e.g., Catering deposit payment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Item <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <select
                  value={expenseFormData.budget_item}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, budget_item: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                >
                  <option value="">Miscellaneous (No budget item)</option>
                  {budgetItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.category} - {item.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Link this expense to a budget item or leave as miscellaneous</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={expenseFormData.payment_method}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Number <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={expenseFormData.receipt_number}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, receipt_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  placeholder="e.g., RCP-2024-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3e7ed2]"
                  placeholder="Additional notes about this expense"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3e7ed2] text-white rounded-lg hover:bg-[#30589d]"
                >
                  {editingExpense ? 'Update' : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;