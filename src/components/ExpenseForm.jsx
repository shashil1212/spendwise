// src/components/ExpenseForm.jsx
// CS304.3 Advanced Database Management System — Group AJ
//
// ✅ FIXED: Now loads users, categories, payment methods LIVE from Oracle
// Oracle calls: GET /api/users, /api/categories, /api/paymethods
// On submit: POST /api/expenses → sp_AddExpense stored procedure
// Trigger trg_CheckBudgetLimit fires automatically and blocks if over budget

import React, { useState, useEffect } from 'react'
import { addExpense, getCategories, getPayMethods, getUsers } from '../api/dataService'

export default function ExpenseForm({ onExpenseAdded }) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    user_id: '', category_id: '', pay_method_id: '',
    amount: '', expense_date: today, description: '',
  })

  // ✅ These are now loaded from Oracle — not hardcoded
  const [users,      setUsers]      = useState([])
  const [categories, setCategories] = useState([])
  const [payMethods, setPayMethods] = useState([])
  const [dropLoading, setDropLoading] = useState(true)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  // ✅ Load dropdown data from Oracle when form first appears
  useEffect(() => {
    async function loadDropdowns() {
      try {
        // Fetch all 3 dropdowns at the same time (faster)
        const [u, c, p] = await Promise.all([
          getUsers(),
          getCategories(),
          getPayMethods(),
        ])
        setUsers(u)
        setCategories(c)
        setPayMethods(p)
      } catch (err) {
        console.error('Failed to load dropdown data:', err)
        setMessage({ type: 'error', text: 'Could not load form data. Is the backend running?' })
      } finally {
        setDropLoading(false)
      }
    }
    loadDropdowns()
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.user_id || !form.category_id || !form.pay_method_id || !form.amount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      await addExpense(form)
      setMessage({ type: 'success', text: '✅ Expense recorded successfully in Oracle!' })
      
      setForm({
        user_id: '', category_id: '', pay_method_id: '',
        amount: '', expense_date: today, description: '',
      })
      
      if (onExpenseAdded) onExpenseAdded()
      setTimeout(() => setMessage(null), 4000)
    } catch (err) {
      const text = err?.response?.data?.message || err.message || 'Something went wrong.'
      setMessage({ type: 'error', text })
    } finally {
      setLoading(false)
    }
  }

  if (dropLoading) {
    return (
      <div className="card fade-up">
        <div className="section-title">Add New Expense</div>
        <div className="spinner-wrap">
          <div className="spinner" /> Loading form data from Oracle...
        </div>
      </div>
    )
  }

  return (
    <div className="card fade-up">
      <div className="section-title">Add New Expense</div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* User dropdown — from Oracle User_Table */}
          <div className="form-group">
            <label>User *</label>
            <select name="user_id" value={form.user_id} onChange={handleChange} required>
              <option value="">Select user</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Category dropdown — from Oracle Category_Table */}
          <div className="form-group">
            <label>Category *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Payment method dropdown — from Oracle Pay_Method_Table */}
          <div className="form-group">
            <label>Payment Method *</label>
            <select name="pay_method_id" value={form.pay_method_id} onChange={handleChange} required>
              <option value="">Select method</option>
              {payMethods.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount (Rs) *</label>
            <input
              type="number" name="amount" value={form.amount}
              onChange={handleChange} placeholder="0.00"
              min="1" step="0.01" required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date" name="expense_date"
              value={form.expense_date} onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label>Description <span style={{ fontWeight: 400, color: '#8a8f9d' }}>(optional)</span></label>
            <input
              type="text" name="description" value={form.description}
              onChange={handleChange} placeholder="e.g. Lunch at restaurant"
            />
          </div>
        </div>

        {message && (
          <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
            {message.text}
          </div>
        )}

        <button type="submit" className="btn-primary btn-primary-full" disabled={loading}>
          {loading
            ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Adding…</>
            : 'Add Expense'}
        </button>
      </form>
    </div>
  )
}
