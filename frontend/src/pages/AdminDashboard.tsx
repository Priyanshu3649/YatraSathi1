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

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>({})
  const [payments, setPayments] = useState<Payment[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])

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
      const [summaryRes, paymentsRes, ticketsRes] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/payments/all'),
        api.get('/tickets/confirmed')
      ])
      setSummary(summaryRes.data)
      setPayments(paymentsRes.data)
      setTickets(ticketsRes.data)
    } catch (error: any) {
      console.error('Error loading data:', error)
    }
  }

  async function updatePaymentStatus(paymentId: number, status: string) {
    await api.post(`/payments/${paymentId}/update-status?status=${status}`)
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
    <div className="grid gap-6">
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


