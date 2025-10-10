import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { sortedCities } from '../data/cities'

type Payment = {
  id: number
  amount: number
  status: string
  mode: string
  reference?: string
  createdAt: string
}

type Ticket = {
  id: number
  origin: string
  destination: string
  travelDate: string
  status: string
  assignedPnr?: string
  paymentAmount?: number
}

type Employee = {
  id: number
  name: string
  email: string
  phone: string
  role: string
  active: boolean
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>({})
  const [payments, setPayments] = useState<Payment[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'EMPLOYEE'
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token) {
      window.location.href = '/login'
      return
    }
    
    if (userRole !== 'ADMIN') {
      alert('Access denied. Admin access only.')
      window.location.href = '/login'
      return
    }
    
    load()
  }, [])

  async function load() {
    try {
      const [summaryRes, paymentsRes, ticketsRes, employeesRes] = await Promise.all([
        api.get('/api/dashboard/admin'),
        api.get('/api/payments/all'),
        api.get('/api/tickets/confirmed'),
        api.get('/api/admin/employees')
      ])
      setSummary(summaryRes.data)
      setPayments(paymentsRes.data)
      setTickets(ticketsRes.data)
      setEmployees(employeesRes.data || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
    }
  }
  
  async function createEmployee() {
    try {
      await api.post('/api/admin/employees', newEmployee)
      alert('Employee created successfully')
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'EMPLOYEE'
      })
      load() // Reload the employee list
    } catch (error: any) {
      console.error('Error creating employee:', error)
      alert('Failed to create employee: ' + (error.response?.data?.message || error.message))
    }
  }
  
  async function updateEmployeeStatus(id: number, active: boolean) {
    try {
      await api.put(`/api/admin/employees/${id}/status`, { active })
      alert(`Employee ${active ? 'activated' : 'deactivated'} successfully`)
      load() // Reload the employee list
    } catch (error: any) {
      console.error('Error updating employee status:', error)
      alert('Failed to update employee status: ' + (error.response?.data?.message || error.message))
    }
  }
  
  async function resetPassword(id: number) {
    try {
      const password = prompt('Enter new password:')
      if (!password) return
      
      await api.put(`/api/admin/employees/${id}/reset-password`, { password })
      alert('Password reset successfully')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password: ' + (error.response?.data?.message || error.message))
    }
  }

  async function updatePaymentStatus(paymentId: number, status: string) {
    await api.post(`/api/payments/${paymentId}/update-status?status=${status}`)
    await load()
  }

  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = payments.filter(p => p.status === 'PENDING')

  // Helper function to get city name from code
  function getCityName(cityCode: string): string {
    const city = sortedCities.find(c => c.code === cityCode)
    return city ? city.name : cityCode
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'employees' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee Management
        </button>
      </div>
      
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Pending Tickets" value={summary.pendingTickets} />
            <Stat label="Approved Tickets" value={summary.approvedTickets} />
            <Stat label="Confirmed Tickets" value={summary.confirmedTickets} />
            <Stat label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Payment Management</h2>
            <table className="w-full text-left">
              <thead>
                <tr><th>Amount</th><th>Mode</th><th>Status</th><th>Reference</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-t">
                    <td>₹{p.amount}</td>
                    <td>{p.mode}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.reference || '-'}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      {p.status === 'PENDING' && (
                        <div className="space-x-2">
                          <button className="px-2 py-1 bg-green-600 text-white rounded text-sm" onClick={() => updatePaymentStatus(p.id, 'COMPLETED')}>Complete</button>
                          <button className="px-2 py-1 bg-red-600 text-white rounded text-sm" onClick={() => updatePaymentStatus(p.id, 'FAILED')}>Failed</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Confirmed Tickets</h2>
            <table className="w-full text-left">
              <thead>
                <tr><th>Origin</th><th>Destination</th><th>Date</th><th>PNR</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} className="border-t">
                    <td>{getCityName(t.origin)}</td>
                    <td>{getCityName(t.destination)}</td>
                    <td>{t.travelDate}</td>
                    <td>{t.assignedPnr}</td>
                    <td>{t.paymentAmount ? `₹${t.paymentAmount}` : '-'}</td>
                    <td>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Exports</h2>
            <div className="space-x-3">
              <a className="px-3 py-2 bg-gray-800 text-white rounded" href="/api/admin/export/tickets.csv">Download Tickets CSV</a>
              <a className="px-3 py-2 bg-gray-800 text-white rounded" href="/api/admin/export/payments.csv">Download Payments CSV</a>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'employees' && (
        <>
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Create New Employee</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded" 
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-gray-300 rounded" 
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded" 
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-gray-300 rounded" 
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded" 
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={createEmployee}
            >
              Create Employee
            </button>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Manage Employees</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-t">
                    <td className="p-3">{emp.id}</td>
                    <td className="p-3">{emp.name}</td>
                    <td className="p-3">{emp.email}</td>
                    <td className="p-3">{emp.phone}</td>
                    <td className="p-3">{emp.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${emp.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {emp.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button 
                          className={`px-2 py-1 rounded text-xs text-white ${emp.active ? 'bg-red-600' : 'bg-green-600'}`}
                          onClick={() => updateEmployeeStatus(emp.id, !emp.active)}
                        >
                          {emp.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                          onClick={() => resetPassword(emp.id)}
                        >
                          Reset Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-gray-500">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-semibold">{value ?? '-'}</div>
    </div>
  )
}


