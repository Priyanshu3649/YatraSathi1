import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import CityDropdown from '../components/CityDropdown'
import { sortedCities } from '../data/cities'

type Passenger = {
  id: number,
  name: string,
  age: number,
  gender: string,
  idProofType?: string,
  idProofNumber?: string
}

type Ticket = { 
  id: number, 
  origin: string, 
  destination: string, 
  travelDate: string, 
  status: string,
  assignedPnr?: string,
  paymentAmount?: number,
  approvedTicketCount?: number,
  passengerCount?: number
}

type Payment = {
  id: number,
  amount: number,
  status: string,
  mode: string,
  reference?: string,
  createdAt: string
}

export default function EmployeeDashboard() {
  const [pending, setPending] = useState<Ticket[]>([])
  const [approved, setApproved] = useState<Ticket[]>([])
  const [ticketCreated, setTicketCreated] = useState<Ticket[]>([])
  const [confirmed, setConfirmed] = useState<Ticket[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [pnrInput, setPnrInput] = useState('')
  const [paymentAmountInput, setPaymentAmountInput] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null)
  const [passengers, setPassengers] = useState<Passenger[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token) {
      window.location.href = '/login'
      return
    }
    
    if (userRole !== 'EMPLOYEE' && userRole !== 'ADMIN') {
      alert('Access denied. Employee access only.')
      window.location.href = '/login'
      return
    }
    
    load()
  }, [])

  async function load() {
    try {
      const [pendingRes, approvedRes, ticketCreatedRes, confirmedRes, paymentsRes] = await Promise.all([
        api.get('/api/tickets/pending'),
        api.get('/api/tickets/approved'),
        api.get('/api/tickets/ticket-created'),
        api.get('/api/tickets/confirmed'),
        api.get('/api/payments/all')
      ])
      setPending(pendingRes.data)
      setApproved(approvedRes.data)
      setTicketCreated(ticketCreatedRes.data)
      setConfirmed(confirmedRes.data)
      setPayments(paymentsRes.data)
      
      // Reset selected ticket when reloading data
      setSelectedTicket(null)
      setPassengers([])
    } catch (error: any) {
      console.error('Error loading data:', error)
    }
  }
  
  async function loadPassengers(ticketId: number) {
    try {
      const response = await api.get(`/api/passengers/ticket/${ticketId}`)
      // No change needed as this endpoint doesn't have an '/api/' prefix to remove
      setPassengers(response.data)
      setSelectedTicket(ticketId)
    } catch (error: any) {
      console.error('Error loading passenger details:', error)
      alert('Failed to load passenger details')
    }
  }

  async function approve(id: number) {
    await api.post(`/api/tickets/${id}/approve?count=2`)
    await load()
  }

  async function createTicket(id: number) {
    if (!pnrInput.trim()) {
      alert('Please enter PNR number')
      return
    }
    if (!paymentAmountInput.trim() || isNaN(Number(paymentAmountInput))) {
      alert('Please enter a valid payment amount')
      return
    }
    await api.post(`/api/tickets/${id}/create-ticket?pnr=${pnrInput}&paymentAmount=${paymentAmountInput}`)
    setPnrInput('')
    setPaymentAmountInput('')
    await load()
  }

  async function confirm(id: number) {
    await api.post(`/api/tickets/${id}/confirm`)
    await load()
  }

  async function updatePaymentStatus(paymentId: number, status: string) {
    await api.post(`/api/payments/${paymentId}/update-status?status=${status}`)
    await load()
  }

  // Helper function to get city name from code
  function getCityName(cityCode: string): string {
    const city = sortedCities.find(c => c.code === cityCode)
    return city ? city.name : cityCode
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Dashboard</h1>
        <p className="text-gray-600">Manage ticket requests and create tickets for customers</p>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
        </div>
        
        {pending.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-500">All ticket requests have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
          {pending.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getCityName(t.origin)}</div>
                        <div className="text-sm text-gray-500">→ {getCityName(t.destination)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.travelDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition duration-200 underline"
                        onClick={() => loadPassengers(t.id)}
                      >
                        View {t.passengerCount || 1} passenger{(t.passengerCount || 1) > 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 font-medium"
                        onClick={() => approve(t.id)}
                      >
                        ✓ Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved Requests */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Approved Requests (Create Ticket)</h2>
        </div>
        
        {approved.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No approved requests</h3>
            <p className="mt-1 text-sm text-gray-500">Approve some requests to create tickets</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approved.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getCityName(t.origin)}</div>
                        <div className="text-sm text-gray-500">→ {getCityName(t.destination)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.travelDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition duration-200 underline"
                        onClick={() => loadPassengers(t.id)}
                      >
                        View {t.passengerCount || 1} passenger{(t.passengerCount || 1) > 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="text" 
                        placeholder="Enter PNR" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        value={pnrInput}
                        onChange={(e) => setPnrInput(e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number" 
                        placeholder="₹ Amount" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        value={paymentAmountInput}
                        onChange={(e) => setPaymentAmountInput(e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition duration-200 font-medium"
                        onClick={() => createTicket(t.id)}
                      >
                        🎫 Create Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Created */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tickets Created (Awaiting Payment)</h2>
        </div>
        
        {ticketCreated.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets created yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create tickets from approved requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ticketCreated.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getCityName(t.origin)}</div>
                        <div className="text-sm text-gray-500">→ {getCityName(t.destination)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.travelDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition duration-200 underline"
                        onClick={() => loadPassengers(t.id)}
                      >
                        View {t.passengerCount || 1} passenger{(t.passengerCount || 1) > 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {t.assignedPnr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-green-600">₹{t.paymentAmount || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 font-medium"
                        onClick={() => confirm(t.id)}
                      >
                        ✅ Confirm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmed Tickets */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Confirmed Tickets</h2>
        </div>
        
        {confirmed.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No confirmed tickets</h3>
            <p className="mt-1 text-sm text-gray-500">Confirm tickets after payment completion</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {confirmed.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{getCityName(t.origin)}</div>
                        <div className="text-sm text-gray-500">→ {getCityName(t.destination)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.travelDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button 
                        className="text-blue-600 hover:text-blue-800 transition duration-200 underline"
                        onClick={() => loadPassengers(t.id)}
                      >
                        View {t.passengerCount || 1} passenger{(t.passengerCount || 1) > 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {t.assignedPnr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Management */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
        </div>
        
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Payments will appear here after customers make them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">₹{p.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{p.mode.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {p.status === 'PENDING' && (
                        <div className="space-x-2">
                          <button 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition duration-200"
                            onClick={() => updatePaymentStatus(p.id, 'COMPLETED')}
                          >
                            ✓ Complete
                          </button>
                          <button 
                            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-red-700 hover:to-pink-700 transition duration-200"
                            onClick={() => updatePaymentStatus(p.id, 'FAILED')}
                          >
                            ✗ Failed
                          </button>
                        </div>
                      )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
        )}
      </div>
      
      {/* Passenger Details Modal */}
      {selectedTicket !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Passenger Details</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 transition duration-200"
                onClick={() => setSelectedTicket(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {passengers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No passenger details found</h3>
                <p className="mt-1 text-sm text-gray-500">The customer has not provided passenger details yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={passenger.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Passenger {index + 1}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="text-base font-medium">{passenger.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Age</p>
                        <p className="text-base font-medium">{passenger.age}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-base font-medium">{passenger.gender}</p>
                      </div>
                      
                      {passenger.idProofType && (
                        <div>
                          <p className="text-sm text-gray-500">ID Proof</p>
                          <p className="text-base font-medium">{passenger.idProofType}: {passenger.idProofNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


