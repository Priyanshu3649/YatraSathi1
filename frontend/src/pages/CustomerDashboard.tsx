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
  type?: 'train' | 'flight' | 'hotel'
}

type Payment = {
  id: number
  amount: number
  status: string
  mode: string
  reference?: string
  createdAt: string
}

interface CustomerDashboardProps {
  bookingType?: 'train' | 'flight' | 'hotel';
}

export default function CustomerDashboard({ bookingType: propBookingType }: CustomerDashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  
  // Set tomorrow's date as default travel date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Get today's date for booking date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const [form, setForm] = useState({ 
    origin: '', 
    destination: '', 
    travelDate: tomorrowStr, 
    bookingDate: todayStr,
    travelClass: 'SLEEPER', 
    specialRequirements: '', 
    passengerCount: 1 
  })
  
  const [paymentForm, setPaymentForm] = useState({ amount: '', mode: 'UPI', reference: '' })
  const [showPassengerForm, setShowPassengerForm] = useState(false)
  const [passengerForms, setPassengerForms] = useState<Array<{name: string, age: string, gender: string, idProofType: string, idProofNumber: string, seatPreference?: string}>>([])
  
  // Get booking type from props or URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const bookingTypeParam = urlParams.get('type') as 'train' | 'flight' | 'hotel' || 'train';
  const [bookingType, setBookingType] = useState<'train' | 'flight' | 'hotel'>(propBookingType || bookingTypeParam || 'train')
  
  // Update bookingType when prop changes
  useEffect(() => {
    if (propBookingType) {
      setBookingType(propBookingType);
    }
  }, [propBookingType])
  
  // Flight booking form
  const [flightForm, setFlightForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    travelClass: 'ECONOMY',
    passengerCount: 1,
    specialRequirements: ''
  })
  
  // Hotel booking form
  const [hotelForm, setHotelForm] = useState({
    city: '',
    checkInDate: '',
    checkOutDate: '',
    roomCount: 1,
    guestCount: 1,
    roomType: 'STANDARD',
    specialRequirements: ''
  })
  
  // Update passenger forms when passenger count changes
  useEffect(() => {
    // Adjust passenger forms array to match passenger count
    const newPassengerForms = [...passengerForms]
    while (newPassengerForms.length < form.passengerCount) {
      newPassengerForms.push({
        name: '',
        age: '',
        gender: 'Male',
        idProofType: 'Aadhar',
        idProofNumber: ''
      })
    }
    setPassengerForms(newPassengerForms.slice(0, form.passengerCount))
    
    // Show passenger form if passenger count > 0
    setShowPassengerForm(form.passengerCount > 0)
  }, [form.passengerCount])

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
        api.get('/api/tickets/my'),
        api.get('/api/payments/my')
      ])
      console.log('Tickets response:', ticketsRes.data)
      console.log('Tickets type:', typeof ticketsRes.data)
      console.log('Is array?', Array.isArray(ticketsRes.data))
      
      // Ensure tickets is always an array
      const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
      setTickets(ticketsData)
      setPayments(paymentsRes.data)
    } catch (error: any) {
      console.error('Error loading data:', error)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    
    // Handle different booking types
    if (bookingType === 'train') {
      // Train ticket validation
      if (!form.origin || !form.destination || !form.travelDate) {
        alert('Please fill in all required fields (Origin, Destination, Travel Date)')
        return
      }
      
      if (form.passengerCount < 1) {
        alert('At least 1 passenger is required')
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
      
      // If passenger form is already showing, validate and submit passenger details directly
      if (showPassengerForm) {
        const invalidForms = passengerForms.some(form => !form.name || !form.age || !form.gender)
        if (invalidForms) {
          alert('Please fill in all required passenger details (name, age, gender)')
          return
        }
        
        try {
          console.log('Submitting train ticket request with passenger details:', form)
          const response = await api.post('/api/tickets', {
            ...form,
            bookingType: 'TRAIN'
          })
          const ticketId = response.data.id
          
          // Submit passenger details
          const passengers = passengerForms.map(form => ({
            name: form.name,
            age: parseInt(form.age),
            gender: form.gender,
            idProofType: form.idProofType,
            idProofNumber: form.idProofNumber
          }))
          
          await api.post(`/api/passengers/ticket/${ticketId}/batch`, passengers)
          
          resetForms()
          await load()
          alert('Train ticket request and passenger details submitted successfully!')
        } catch (error: any) {
          console.error('Error submitting train ticket request with passenger details:', error)
          alert('Error submitting request: ' + (error.response?.data?.message || error.message))
        }
        return
      }
      
      // If passenger form is not showing yet, just submit the ticket request
      try {
        console.log('Submitting train ticket request:', form)
        const response = await api.post('/api/tickets', {
          ...form,
          bookingType: 'TRAIN'
        })
        const ticketId = response.data.id
        
        resetForms()
        await load()
        alert('Train ticket request submitted successfully!')
      } catch (error: any) {
        console.error('Error submitting train ticket request:', error)
        alert('Error submitting ticket request: ' + (error.response?.data?.message || error.message))
      }
    } else if (bookingType === 'flight') {
      // Flight booking validation
      if (!flightForm.origin || !flightForm.destination || !flightForm.departureDate || !flightForm.travelClass) {
        alert('Please fill in all required fields for flight booking')
        return
      }
      
      if (flightForm.passengerCount < 1) {
        alert('At least 1 passenger is required')
        return
      }
      
      // Check if departure date is in the past
      const departureDate = new Date(flightForm.departureDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (departureDate < today) {
        alert('Departure date cannot be in the past. Please select a future date.')
        return
      }
      
      // If return date is provided, validate it's after departure date
      if (flightForm.returnDate) {
        const returnDate = new Date(flightForm.returnDate)
        if (returnDate < departureDate) {
          alert('Return date must be after departure date')
          return
        }
      }
      
      try {
        console.log('Submitting flight booking request:', flightForm)
        const response = await api.post('/api/tickets', {
          origin: flightForm.origin,
          destination: flightForm.destination,
          travelDate: flightForm.departureDate,
          returnDate: flightForm.returnDate,
          travelClass: flightForm.travelClass,
          passengerCount: flightForm.passengerCount,
          specialRequirements: flightForm.specialRequirements,
          bookingType: 'FLIGHT'
        })
        const ticketId = response.data.id
        
        resetForms()
        await load()
        alert('Flight booking request submitted successfully!')
      } catch (error: any) {
        console.error('Error submitting flight booking request:', error)
        alert('Error submitting request: ' + (error.response?.data?.message || error.message))
      }
    } else if (bookingType === 'hotel') {
      // Hotel booking validation
      if (!hotelForm.city || !hotelForm.checkInDate || !hotelForm.checkOutDate || !hotelForm.roomType) {
        alert('Please fill in all required fields for hotel booking')
        return
      }
      
      if (hotelForm.roomCount < 1 || hotelForm.guestCount < 1) {
        alert('At least 1 room and 1 guest is required')
        return
      }
      
      // Check if check-in date is in the past
      const checkInDate = new Date(hotelForm.checkInDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (checkInDate < today) {
        alert('Check-in date cannot be in the past. Please select a future date.')
        return
      }
      
      // Validate check-out date is after check-in date
      const checkOutDate = new Date(hotelForm.checkOutDate)
      if (checkOutDate <= checkInDate) {
        alert('Check-out date must be after check-in date')
        return
      }
      
      try {
        console.log('Submitting hotel booking request:', hotelForm)
        const response = await api.post('/api/tickets', {
          // Map hotel booking fields to ticket request fields
          origin: hotelForm.city,  // Use city as both origin and destination
          destination: hotelForm.city,
          travelDate: hotelForm.checkInDate,
          returnDate: hotelForm.checkOutDate,
          travelClass: hotelForm.roomType,  // Map room type to travel class
          passengerCount: hotelForm.guestCount,  // Map guest count to passenger count
          specialRequirements: `${hotelForm.roomCount} room(s), ${hotelForm.specialRequirements}`,
          bookingType: 'HOTEL'
        })
        const ticketId = response.data.id
        
        resetForms()
        await load()
        alert('Hotel booking request submitted successfully!')
      } catch (error: any) {
        console.error('Error submitting hotel booking request:', error)
        alert('Error submitting request: ' + (error.response?.data?.message || error.message))
      }
    }
  }
  
  async function submitPassengerDetails() {
    const invalidForms = passengerForms.some(form => !form.name || !form.age || !form.gender)
    if (invalidForms) {
      alert('Please fill in all required passenger details (name, age, gender)')
      return
    }
    
    try {
      // Get the latest created ticket
      const latestTicket = tickets.reduce((latest, ticket) => {
        if (!latest) return ticket
        return new Date(ticket.travelDate) > new Date(latest.travelDate) ? ticket : latest
      }, null as Ticket | null)
      
      if (!latestTicket) {
        alert('No ticket found to attach passenger details to')
        return
      }
      
      // Submit passenger details
      const passengers = passengerForms.map(form => ({
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        idProofType: form.idProofType,
        idProofNumber: form.idProofNumber,
        seatPreference: form.seatPreference || ''
      }))
      
      await api.post(`/api/passengers/ticket/${latestTicket.id}/batch`, passengers)
      
      resetForms()
      await load()
      alert('Passenger details submitted successfully!')
    } catch (error: any) {
      console.error('Error submitting passenger details:', error)
      alert('Error submitting passenger details: ' + (error.response?.data?.message || error.message))
    }
  }
  
  async function makePayment(ticketId: number) {
    if (!paymentForm.mode) {
      alert('Please select a payment mode')
      return
    }
    
    if (!paymentForm.amount) {
      alert('Please enter payment amount')
      return
    }
    
    try {
      await api.post(`/api/payments/ticket/${ticketId}/make-payment`, {
        amount: parseFloat(paymentForm.amount),
        mode: paymentForm.mode,
        reference: paymentForm.reference
      })
      
      setPaymentForm({ amount: '', mode: 'UPI', reference: '' })
      await load()
    } catch (error: any) {
      console.error('Error making payment:', error)
      alert('Error making payment: ' + (error.response?.data?.message || error.message))
    }
  }
  
  function resetForms() {
    // Reset train ticket form
    setForm({ 
      origin: '', 
      destination: '', 
      travelDate: tomorrowStr, 
      bookingDate: todayStr,
      travelClass: 'SLEEPER', 
      specialRequirements: '', 
      passengerCount: 1 
    })
    
    // Reset flight booking form
    setFlightForm({
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      travelClass: 'ECONOMY',
      passengerCount: 1,
      specialRequirements: ''
    })
    
    // Reset hotel booking form
    setHotelForm({
      city: '',
      checkInDate: '',
      checkOutDate: '',
      roomCount: 1,
      guestCount: 1,
      roomType: 'STANDARD',
      specialRequirements: ''
    })
    
    // Reset passenger forms
    setShowPassengerForm(false)
    setPassengerForms([{
      name: '',
      age: '',
      gender: 'Male',
      idProofType: 'Aadhar',
      idProofNumber: '',
      seatPreference: ''
    }])
    
    // Reset booking type to train (default)
    setBookingType('train')
  }

  // Get user name from localStorage
  const userName = localStorage.getItem('userName') || 'User';

  return (
    <>
      <div className="space-y-8 bg-gradient-to-b from-blue-50 to-white min-h-screen p-6">
        {/* Welcome Message */}
        <div className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Welcome, {userName}!
        </div>

        {/* Create Booking Request */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {bookingType === 'train' && 'Train Ticket Request'}
              {bookingType === 'flight' && 'Flight Booking Request'}
              {bookingType === 'hotel' && 'Hotel Booking Request'}
            </h2>
          </div>
          
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Train Booking Form */}
            {bookingType === 'train' && (
              <>
                <div className="space-y-6">
                  {/* All fields inline and responsive */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Booking Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-gray-100"
                        value={form.bookingDate}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Travel Date*
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={form.travelDate}
                        onChange={(e) => setForm({...form, travelDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      {/* Origin label is now handled by CityDropdown component */}
                      <CityDropdown 
                        value={form.origin} 
                        onChange={(value) => setForm({...form, origin: value})}
                        placeholder="Select origin station"
                        label="Origin*"
                      />
                    </div>
                    
                    <div>
                      {/* Destination label is now handled by CityDropdown component */}
                      <CityDropdown 
                        value={form.destination} 
                        onChange={(value) => setForm({...form, destination: value})}
                        placeholder="Select destination station"
                        label="Destination*"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Travel Class
                      </label>
                      <select 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                        value={form.travelClass}
                        onChange={(e) => setForm({...form, travelClass: e.target.value})}
                      >
                        <option value="SLEEPER">Sleeper</option>
                        <option value="AC_3_TIER">AC 3 Tier</option>
                        <option value="AC_2_TIER">AC 2 Tier</option>
                        <option value="AC_1_TIER">AC 1 Tier</option>
                        <option value="SECOND_SITTING">Second Sitting</option>
                        <option value="CHAIR_CAR">Chair Car</option>
                      </select>
                    </div>
                  </div>
              </div>
              </>
            )}
            
            {/* Flight Booking Form */}
            {bookingType === 'flight' && (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Origin Airport*
                    </label>
                    <CityDropdown 
                      value={flightForm.origin} 
                      onChange={(value) => setFlightForm({...flightForm, origin: value})}
                      placeholder="Select origin airport"
                      label="Origin Airport"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Destination Airport*
                    </label>
                    <CityDropdown 
                      value={flightForm.destination} 
                      onChange={(value) => setFlightForm({...flightForm, destination: value})}
                      placeholder="Select destination airport"
                      label="Destination Airport"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Departure Date*
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={flightForm.departureDate}
                      onChange={(e) => setFlightForm({...flightForm, departureDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Return Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={flightForm.returnDate}
                      onChange={(e) => setFlightForm({...flightForm, returnDate: e.target.value})}
                      min={flightForm.departureDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Travel Class
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                      value={flightForm.travelClass}
                      onChange={(e) => setFlightForm({...flightForm, travelClass: e.target.value})}
                    >
                      <option value="ECONOMY">Economy</option>
                      <option value="PREMIUM_ECONOMY">Premium Economy</option>
                      <option value="BUSINESS">Business</option>
                      <option value="FIRST">First Class</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Passenger Count
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="9"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={flightForm.passengerCount}
                      onChange={(e) => setFlightForm({...flightForm, passengerCount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Hotel Booking Form */}
            {bookingType === 'hotel' && (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      City*
                    </label>
                    <CityDropdown 
                      value={hotelForm.city} 
                      onChange={(value) => setHotelForm({...hotelForm, city: value})}
                      placeholder="Select city"
                      label="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Check-in Date*
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={hotelForm.checkInDate}
                      onChange={(e) => setHotelForm({...hotelForm, checkInDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Check-out Date*
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={hotelForm.checkOutDate}
                      onChange={(e) => setHotelForm({...hotelForm, checkOutDate: e.target.value})}
                      min={hotelForm.checkInDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Room Type
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                      value={hotelForm.roomType}
                      onChange={(e) => setHotelForm({...hotelForm, roomType: e.target.value})}
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="DELUXE">Deluxe</option>
                      <option value="SUITE">Suite</option>
                      <option value="EXECUTIVE">Executive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Room Count
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={hotelForm.roomCount}
                      onChange={(e) => setHotelForm({...hotelForm, roomCount: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Guest Count
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      value={hotelForm.guestCount}
                      onChange={(e) => setHotelForm({...hotelForm, guestCount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Special Requirements for train booking - explicitly on its own line */}
            {bookingType === 'train' && (
              <div className="mt-6 md:col-span-5">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Special Requirements
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Any special requirements or preferences?"
                      rows={3}
                      value={form.specialRequirements}
                      onChange={(e) => setForm({...form, specialRequirements: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {bookingType !== 'train' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Special Requirements
                </label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                  placeholder="Any special requirements or preferences?"
                  rows={3}
                  value={
                    bookingType === 'flight' ? flightForm.specialRequirements : hotelForm.specialRequirements
                  }
                  onChange={(e) => {
                    if (bookingType === 'flight') {
                      setFlightForm({...flightForm, specialRequirements: e.target.value})
                    } else {
                      setHotelForm({...hotelForm, specialRequirements: e.target.value})
                    }
                  }}
                />
              </div>
            )}
            
            {/* Passenger Details Form - Expandable/Collapsible */}
            <div className="md:col-span-2">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer mb-2" 
                onClick={() => setShowPassengerForm(!showPassengerForm)}
              >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Passenger Details
                </h3>
                <div className="flex items-center">
                  <span className="text-sm text-blue-600 mr-2">{showPassengerForm ? 'Hide Details' : 'Show Details'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-blue-500 transform transition-transform duration-200 ${showPassengerForm ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {showPassengerForm && (
                <div className="space-y-6 p-4 border border-gray-200 rounded-lg">
                  {/* Passenger Input Form */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                    <div className="flex items-center mb-3">
                      <h4 className="text-md font-medium text-gray-700">Add New Passenger</h4>
                    </div>
                    
                    <div className="flex flex-wrap items-center space-x-4">
                      <div className="flex-1 min-w-[200px]">
                        <input 
                          type="text" 
                          id="newPassengerName"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Full Name*"
                          pattern="[A-Za-z ]+"
                          title="Only alphabets and spaces allowed"
                          required
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^A-Za-z ]/g, '');
                          }}
                        />
                      </div>
                      
                      <div className="w-20">
                        <input 
                          type="number" 
                          id="newPassengerAge"
                          min="1"
                          max="120"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                          placeholder="Age*"
                          required
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            input.value = input.value.replace(/[^0-9]/g, '');
                          }}
                        />
                      </div>
                      
                      <div className="w-32">
                        <select 
                          id="newPassengerGender"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                          required
                        >
                          <option value="">Sex*</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <div className="w-32">
                        <select 
                          id="newPassengerSeatPreference"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                        >
                          <option value="">Seat Preference</option>
                          <option value="LOWER">Lower</option>
                          <option value="MIDDLE">Middle</option>
                          <option value="UPPER">Upper</option>
                          <option value="SIDE_LOWER">Side Lower</option>
                          <option value="SIDE_UPPER">Side Upper</option>
                        </select>
                      </div>
                      
                      <div>
                        <button 
                          type="button"
                          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                          onClick={() => {
                            const nameInput = document.getElementById('newPassengerName') as HTMLInputElement;
                            const ageInput = document.getElementById('newPassengerAge') as HTMLInputElement;
                            const genderInput = document.getElementById('newPassengerGender') as HTMLSelectElement;
                            const seatInput = document.getElementById('newPassengerSeatPreference') as HTMLSelectElement;
                            
                            if (nameInput.value && ageInput.value && genderInput.value) {
                              // Add new passenger to the list
                              setPassengerForms([...passengerForms, {
                                name: nameInput.value,
                                age: ageInput.value,
                                gender: genderInput.value,
                                idProofType: 'Aadhar',
                                idProofNumber: '',
                                seatPreference: seatInput.value || '',
                              }]);
                              
                              // Reset form fields
                              nameInput.value = '';
                              ageInput.value = '';
                              genderInput.value = '';
                              seatInput.value = '';
                            } else {
                              alert('Please fill in all required fields (Name, Age, Sex)');
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passenger grid view with modify and delete icons */}
                  {passengerForms.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Added Passengers:</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat Preference</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {passengerForms.map((passenger, index) => (
                              passenger.name && (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{passenger.name}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{passenger.age}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{passenger.gender}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{passenger.seatPreference || '-'}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                      type="button"
                                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                                      onClick={() => {
                                        // Set form values for editing
                                        const nameInput = document.getElementById('newPassengerName') as HTMLInputElement;
                                        const ageInput = document.getElementById('newPassengerAge') as HTMLInputElement;
                                        const genderInput = document.getElementById('newPassengerGender') as HTMLSelectElement;
                                        const seatInput = document.getElementById('newPassengerSeatPreference') as HTMLSelectElement;
                                        
                                        nameInput.value = passenger.name;
                                        ageInput.value = passenger.age;
                                        genderInput.value = passenger.gender;
                                        seatInput.value = passenger.seatPreference || '';
                                        
                                        // Remove this passenger
                                        const newForms = [...passengerForms];
                                        newForms.splice(index, 1);
                                        setPassengerForms(newForms);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button 
                                      type="button"
                                      className="text-red-600 hover:text-red-900"
                                      onClick={() => {
                                        const newForms = [...passengerForms];
                                        newForms.splice(index, 1);
                                        setPassengerForms(newForms);
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {/* Passenger details are automatically saved when added */}
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2" 
                type="submit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  {bookingType === "train" && 'Submit Train Ticket Request'}
                  {bookingType === "flight" && 'Submit Flight Booking Request'}
                  {bookingType === "hotel" && 'Submit Hotel Booking Request'}
                </span>
              </button>
            </div>
          </form>
        </div>
        
        {/* Old Passenger Details Form - Removed as it's integrated into the main form */}
        {false && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Passenger Details</h2>
            
            {passengerForms.map((passenger, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Passenger {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter full name"
                      value={passenger.name}
                      onChange={(e) => {
                        const newForms = [...passengerForms]
                        newForms[index].name = e.target.value
                        setPassengerForms(newForms)
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age*</label>
                    <input 
                      type="number" 
                      min="1"
                      max="120"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter age"
                      value={passenger.age}
                      onChange={(e) => {
                        const newForms = [...passengerForms]
                        newForms[index].age = e.target.value
                        setPassengerForms(newForms)
                      }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender*</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                      value={passenger.gender}
                      onChange={(e) => {
                        const newForms = [...passengerForms]
                        newForms[index].gender = e.target.value
                        setPassengerForms(newForms)
                      }}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                      value={passenger.idProofType}
                      onChange={(e) => {
                        const newForms = [...passengerForms]
                        newForms[index].idProofType = e.target.value
                        setPassengerForms(newForms)
                      }}
                    >
                      <option value="Aadhar">Aadhar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport</option>
                      <option value="DrivingLicense">Driving License</option>
                      <option value="VoterID">Voter ID</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Number</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter ID proof number"
                      value={passenger.idProofNumber}
                      onChange={(e) => {
                        const newForms = [...passengerForms]
                        newForms[index].idProofNumber = e.target.value
                        setPassengerForms(newForms)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div>
              <button 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                onClick={submitPassengerDetails}
              >
                Submit Passenger Details
              </button>
            </div>
          </div>
        )}
        
        {/* My Payments section remains in the same position */}
        
        {/* My Payments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">My Payments</h2>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{payments.length}</span>
          </div>
          
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
              <p className="mt-1 text-sm text-gray-500">No payment records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.mode}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.reference || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* My Ticket Requests - Moved to the end with search/filtering */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">My Ticket Requests</h2>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tickets.length}</span>
            </div>
            
            {/* Search and Filter */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search tickets..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                onChange={(e) => {
                  // Implement search functionality here
                  // This would filter the tickets based on search term
                  // For now, this is just a placeholder
                }}
              />
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                onChange={(e) => {
                  // Implement filter functionality here
                  // This would filter tickets based on status
                  // For now, this is just a placeholder
                }}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Period:</label>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  onChange={(e) => {
                    // Implement time period filter functionality here
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>
          </div>
          
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new ticket request.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Travel Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PNR</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.origin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.destination}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(ticket.travelDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.assignedPnr || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {ticket.status === 'APPROVED' && !ticket.paymentAmount && (
                          <div className="flex space-x-2">
                            <input 
                              type="number" 
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="Amount"
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                            />
                            <select 
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white"
                              value={paymentForm.mode}
                              onChange={(e) => setPaymentForm({...paymentForm, mode: e.target.value})}
                            >
                              <option value="UPI">UPI</option>
                              <option value="CREDIT_CARD">Credit Card</option>
                              <option value="DEBIT_CARD">Debit Card</option>
                              <option value="NET_BANKING">Net Banking</option>
                            </select>
                            <input 
                              type="text" 
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="Reference"
                              value={paymentForm.reference}
                              onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                            />
                            <button 
                              onClick={() => makePayment(ticket.id)}
                              className="px-2 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Pay
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
      </div>
    </>
  )
}