

import axios from 'axios'


const API = axios.create({ baseURL: '/api' })

const USE_MOCK = false


export async function getExpenses() {
  if (USE_MOCK) {
    await delay()
    return [..._mockExpenses].sort((a, b) => b.expense_date.localeCompare(a.expense_date))
  }
  const res = await API.get('/expenses')
  
  return res.data.data.map(r => ({
    id:            r.EXPENSE_ID,
    user_id:       r.USER_ID,
    user_name:     r.USER_NAME,
    category_id:   r.CATEGORY_ID,
    category_name: r.CATEGORY_NAME,
    method_name:   r.METHOD_NAME,
    amount:        Number(r.AMOUNT),
    expense_date:  r.EXPENSE_DATE
      ? (typeof r.EXPENSE_DATE === 'string'
          ? r.EXPENSE_DATE.slice(0, 10)
          : new Date(r.EXPENSE_DATE).toISOString().slice(0, 10))
      : '',
    description:   r.DESCRIPTION || '',
  }))
}

export async function addExpense(payload) {
  if (USE_MOCK) {
    await delay(500)
    const cat  = CATEGORIES.find(c => c.id === Number(payload.category_id))
    const user = USERS.find(u => u.id === Number(payload.user_id))
    const meth = PAY_METHODS.find(m => m.id === Number(payload.pay_method_id))
    _mockExpenses.push({
      id:            _nextId++,
      user_id:       Number(payload.user_id),
      user_name:     user?.name || 'Unknown',
      category_id:   Number(payload.category_id),
      category_name: cat?.name  || 'Other',
      method_name:   meth?.name || 'Cash',
      amount:        Number(payload.amount),
      expense_date:  payload.expense_date,
      description:   payload.description || '',
    })
    return { success: true }
  }
  const res = await API.post('/expenses', payload)
  return res.data
}

export async function deleteExpense(id) {
  if (USE_MOCK) {
    await delay(300)
    _mockExpenses = _mockExpenses.filter(e => e.id !== id)
    return { success: true }
  }
  const res = await API.delete(`/expenses/${id}`)
  return res.data
}

export async function getBudgets() {
  if (USE_MOCK) {
    await delay()
    const spentMap = {}
    _mockExpenses.forEach(e => {
      spentMap[e.category_name] = (spentMap[e.category_name] || 0) + e.amount
    })
    return _mockBudgets.map(b => ({
      ...b,
      spent:     spentMap[b.category_name] || 0,
      remaining: b.monthly_limit - (spentMap[b.category_name] || 0),
    }))
  }
  const res = await API.get('/budgets')
  return res.data.data.map(r => ({
    budget_id:     r.BUDGET_ID,
    user_id:       r.USER_ID,
    category_name: r.CATEGORY_NAME,
    monthly_limit: Number(r.MONTHLY_LIMIT),
    spent:         Number(r.MONTHLY_LIMIT) - Number(r.REMAINING_BUDGET),
    remaining:     Number(r.REMAINING_BUDGET),
  }))
}

export async function getCategories() {
  if (USE_MOCK) return CATEGORIES
  const res = await API.get('/categories')
  return res.data.data.map(r => ({ id: r.CATEGORY_ID, name: r.NAME }))
}

export async function getPayMethods() {
  if (USE_MOCK) return PAY_METHODS
  const res = await API.get('/paymethods')
  return res.data.data.map(r => ({ id: r.PAY_METHOD_ID, name: r.METHOD_NAME }))
}

export async function getUsers() {
  if (USE_MOCK) return USERS
  const res = await API.get('/users')
  return res.data.data.map(r => ({ id: r.USER_ID, name: r.NAME }))
}


export const CATEGORIES = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Education' },
  { id: 4, name: 'Health' },
  { id: 5, name: 'Entertainment' },
  { id: 6, name: 'Shopping' },
  { id: 7, name: 'Bills' },
  { id: 8, name: 'Travel' },
]

export const PAY_METHODS = [
  { id: 1, name: 'Cash' },
  { id: 2, name: 'Credit Card' },
  { id: 3, name: 'Debit Card' },
  { id: 4, name: 'Mobile Banking' },
  { id: 5, name: 'Bank Transfer' },
]

export const USERS = [
  { id: 1, name: 'Kamal Perera' },
  { id: 2, name: 'Nimal Silva' },
  { id: 3, name: 'Saman Jayasuriya' },
  { id: 4, name: 'Dilani Fernando' },
  { id: 5, name: 'Kasuni Peris' },
  { id: 6, name: 'Ruwan Dias' },
  { id: 7, name: 'Tharushi Senanayake' },
  { id: 8, name: 'Ashan Wickramasinghe' },
]


let _mockExpenses = [
  { id:1, user_id:1, user_name:'Kamal Perera',        category_id:1, category_name:'Food',          method_name:'Credit Card',    amount:2500,  expense_date:'2026-05-01', description:'Lunch and dinner' },
  { id:2, user_id:2, user_name:'Nimal Silva',          category_id:2, category_name:'Transport',     method_name:'Cash',           amount:1200,  expense_date:'2026-05-02', description:'Bus fare' },
  { id:3, user_id:3, user_name:'Saman Jayasuriya',     category_id:3, category_name:'Education',     method_name:'Debit Card',     amount:5000,  expense_date:'2026-05-03', description:'Course fee' },
  { id:4, user_id:4, user_name:'Dilani Fernando',      category_id:4, category_name:'Health',        method_name:'Credit Card',    amount:3500,  expense_date:'2026-05-04', description:'Medical checkup' },
  { id:5, user_id:5, user_name:'Kasuni Peris',         category_id:5, category_name:'Entertainment', method_name:'Mobile Banking', amount:2800,  expense_date:'2026-05-05', description:'Movie tickets' },
  { id:6, user_id:6, user_name:'Ruwan Dias',           category_id:6, category_name:'Shopping',      method_name:'Debit Card',     amount:7600,  expense_date:'2026-05-06', description:'Clothes shopping' },
  { id:7, user_id:7, user_name:'Tharushi Senanayake',  category_id:7, category_name:'Bills',         method_name:'Mobile Banking', amount:4500,  expense_date:'2026-05-07', description:'Electricity bill' },
  { id:8, user_id:8, user_name:'Ashan Wickramasinghe', category_id:8, category_name:'Travel',        method_name:'Credit Card',    amount:15000, expense_date:'2026-05-08', description:'Trip expenses' },
]
let _nextId = 9
const _mockBudgets = [
  { budget_id:1, category_name:'Food',          monthly_limit:20000 },
  { budget_id:2, category_name:'Transport',     monthly_limit:10000 },
  { budget_id:3, category_name:'Education',     monthly_limit:30000 },
  { budget_id:4, category_name:'Health',        monthly_limit:15000 },
  { budget_id:5, category_name:'Entertainment', monthly_limit:12000 },
  { budget_id:6, category_name:'Shopping',      monthly_limit:25000 },
  { budget_id:7, category_name:'Bills',         monthly_limit:18000 },
  { budget_id:8, category_name:'Travel',        monthly_limit:40000 },
]
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))