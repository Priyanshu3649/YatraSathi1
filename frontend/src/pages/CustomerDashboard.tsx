import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import CityDropdown from '../components/CityDropdown'
import { sortedCities } from '../data/cities'

type Ticket = {
  id: number
  origin: string
  destination: string
  travelDate: string
  status: string
  assignedPnr?: string
  paymentAmount?: number
  approvedTicketCount?: number
}

type Payment = {
  id: number
  amount: number
  status: string
  mode: string
  reference?: string
  createdAt: string
}

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [form, setForm] = useState({ origin: '', destination: '', travelDate: '', travelClass: 'SLEEPER', berthPreference: 'NONE', specialRequirements: '' })
  const [paymentForm, setPaymentForm] = useState({ amount: '', mode: 'UPI', reference: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')
    
    if (!token) {
      window.location.href = '/login'
      return
    }
    
    if (userRole !== 'CUSTOMER') {
      alert('Access denied. Customer access only.')
      window.location.href = '/login'
      return
    }
    
    load()
  }, [])

  async function load() {
    try {
      const [ticketsRes, paymentsRes] = await Promise.all([
        api.get('/tickets/my'),
        api.get('/payments/my')
      ])
      setTickets(ticketsRes.data)
      setPayments(paymentsRes.data)
    } catch (error: any) {
      console.error('Error loading data:', error)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (!form.origin || !form.destination || !form.travelDate) {
      alert('Please fill in all required fields (Origin, Destination, Travel Date)')
      return
    }
    
    // Check if travel date is in the past
    const selectedDate = new Date(form.travelDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      alert('Travel date cannot be in the past. Please select a future date.')
      return
    }
    
    try {
      console.log('Submitting ticket request:', form)
      await api.post('/tickets', form)
      setForm({ origin: '', destination: '', travelDate: '', travelClass: 'SLEEPER', berthPreference: 'NONE', specialRequirements: '' })
      await load()
      alert('Ticket request submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting ticket request:', error)
      alert('Error submitting ticket request: ' + (error.response?.data?.message || error.message))
    }
  }

  // Helper function to get city name from code
  function getCityName(cityCode: string): string {
    const city = sortedCities.find(c => c.code === cityCode)
    return city ? city.name : cityCode
  }

  async function makePayment(ticketId: number) {
    if (!paymentForm.mode) {
      alert('Please select payment mode')
      return
    }
    
    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket || !ticket.paymentAmount) {
      alert('Payment amount not set for this ticket')
      return
    }
    
    await api.post(`/payments/ticket/${ticketId}/make-payment`, {
      amount: ticket.paymentAmount,
      mode: paymentForm.mode,
      reference: paymentForm.reference
    })
    setPaymentForm({ amount: '', mode: 'UPI', reference: '' })
    await load()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
        <p className="text-gray-600">Manage your ticket requests and payments</p>
      </div>

      {/* Create Ticket Request */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Ticket Request</h2>
        </div>
        
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <CityDropdown
              value={form.origin}
              onChange={(cityCode) => setForm({ ...form, origin: cityCode })}
              placeholder="Select origin city"
              label="Origin City"
            />
          </div>
          
          <div>
            <CityDropdown
              value={form.destination}
              onChange={(cityCode) => setForm({ ...form, destination: cityCode })}
              placeholder="Select destination city"
              label="Destination City"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" 
              type="date" 
              value={form.travelDate} 
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm({ ...form, travelDate: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Class</label>
            <select 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              value={form.travelClass}
              onChange={e => setForm({ ...form, travelClass: e.target.value })}
            >
              <option value="SLEEPER">Sleeper</option>
              <option value="THREE_A">3A</option>
              <option value="TWO_A">2A</option>
              <option value="ONE_A">1A</option>
              <option value="CHAIR_CAR">Chair Car</option>
              <option value="SECOND_SITTING">Second Sitting</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
            <textarea 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" 
              placeholder="Any special requirements or preferences" 
              rows={3}
              value={form.specialRequirements} 
              onChange={e => setForm({ ...form, specialRequirements: e.target.value })} 
            />
          </div>
          
          <div className="md:col-span-2">
            <button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105" 
              type="submit"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Ticket Request
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">My Ticket Requests</h2>
        </div>
        
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first ticket request above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(t => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        t.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'TICKET_CREATED' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.assignedPnr || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.paymentAmount ? `₹${t.paymentAmount}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {t.status === 'TICKET_CREATED' && t.paymentAmount && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                            <span className="font-medium">Amount to pay: ₹{t.paymentAmount}</span>
                          </div>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentForm.mode}
                            onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                          >
                            <option value="UPI">UPI</option>
                            <option value="CASH">Cash</option>
                            <option value="CHEQUE">Cheque</option>
                            <option value="NET_BANKING">Net Banking</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Reference (optional)" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={paymentForm.reference}
                            onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                          />
                          <button 
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition duration-200"
                            onClick={() => makePayment(t.id)}
                          >
                            💳 Pay ₹{t.paymentAmount}
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

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">My Payments</h2>
        </div>
        
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Payments will appear here after you make them</p>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-semibold text-gray-900">₹{p.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">{p.mode.replace('_', ' ')}</span>
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


