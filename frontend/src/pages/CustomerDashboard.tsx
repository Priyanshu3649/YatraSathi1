import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import CityDropdown from '../components/CityDropdown'

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
  // Active tab state
  const [activeTab, setActiveTab] = useState('bookings')
  
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  
  // Set tomorrow's date as default travel date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Get today's date for booking date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Train booking form
  const [form, setForm] = useState({ 
    origin: '', 
    destination: '', 
    travelDate: tomorrowStr, 
    bookingDate: todayStr,
    travelClass: 'SLEEPER', 
    specialRequirements: ''
  })
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({ amount: '', mode: 'UPI', reference: '' })
  
  // Passenger details
  const [showPassengerForm, setShowPassengerForm] = useState(false)
  const [passengerForms, setPassengerForms] = useState<Array<{name: string, age: string, gender: string, idProofType: string, idProofNumber: string, seatPreference?: string}>>([{
    name: '',
    age: '',
    gender: 'Male',
    idProofType: 'Aadhar',
    idProofNumber: '',
    seatPreference: ''
  }])
  
  // Master passenger list
  const [masterPassengerList, setMasterPassengerList] = useState<Array<{id: string, name: string, age: string, gender: string, idProofType: string, idProofNumber: string}>>([])  
  const [showMasterList, setShowMasterList] = useState(false)
  
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
    specialRequirements: ''
  })
  
  // Hotel booking form
  const [hotelForm, setHotelForm] = useState({
    city: '',
    checkInDate: '',
    checkOutDate: '',
    roomCount: 1,
    roomType: 'STANDARD',
    specialRequirements: ''
  })
  
  // Always show passenger form
  useEffect(() => {
    // Initialize with one empty passenger form if none exists
    if (passengerForms.length === 0) {
      setPassengerForms([{
        name: '',
        age: '',
        gender: 'Male',
        idProofType: 'Aadhar',
        idProofNumber: '',
        seatPreference: ''
      }])
    }
    
    // Always show passenger form
    setShowPassengerForm(true)
  }, [])

  // Authentication check
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

  // Load tickets and payments
  async function load() {
    try {
      const [ticketsRes, paymentsRes] = await Promise.all([
        api.get('/api/tickets/my'),
        api.get('/api/payments/my')
      ])
      
      // Ensure tickets is always an array
      const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
      setTickets(ticketsData)
      setPayments(paymentsRes.data)
      
      // Load master passenger list from localStorage
      const savedList = localStorage.getItem('masterPassengerList')
      if (savedList) {
        setMasterPassengerList(JSON.parse(savedList))
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
    }
  }
  
  // Save master passenger list
  function saveMasterPassengerList(list: Array<{id: string, name: string, age: string, gender: string, idProofType: string, idProofNumber: string}>) {
    setMasterPassengerList(list)
    localStorage.setItem('masterPassengerList', JSON.stringify(list))
  }
  
  // Add passenger to master list
  function addToMasterList(passenger: {name: string, age: string, gender: string, idProofType: string, idProofNumber: string}) {
    const newList = [...masterPassengerList, {
      ...passenger,
      id: Date.now().toString() // Generate a unique ID
    }]
    saveMasterPassengerList(newList)
    alert('Passenger added to master list')
  }
  
  // Remove passenger from master list
  function removeFromMasterList(id: string) {
    const newList = masterPassengerList.filter(p => p.id !== id)
    saveMasterPassengerList(newList)
  }

  // Submit booking form
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    
    // Handle different booking types
    if (bookingType === 'train') {
      // Train ticket validation
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
      
      // First, ensure passenger form is visible
      if (!showPassengerForm) {
        setShowPassengerForm(true)
        alert('Please add at least one passenger to continue')
        return
      }
      
      // Validate that there's at least one valid passenger in the grid view
      const validPassengers = passengerForms.filter(p => p.name && p.age && p.gender)
      
      if (validPassengers.length === 0) {
        alert('At least 1 passenger with complete details is required. Please add passenger details.')
        return
      }
      
      try {
        const response = await api.post('/api/tickets', {
          ...form,
          passengerCount: validPassengers.length,
          bookingDate: todayStr, // Ensure booking date is set to today
          bookingTime: new Date().toTimeString().split(' ')[0], // Add booking time
          bookingType: 'TRAIN'
        })
        const ticketId = response.data.id
        
        // Submit only valid passenger details
        const passengers = validPassengers.map(form => ({
          name: form.name,
          age: parseInt(form.age),
          gender: form.gender,
          idProofType: form.idProofType,
          idProofNumber: form.idProofNumber,
          seatPreference: form.seatPreference || ''
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
    } else if (bookingType === 'flight') {
      // Flight booking validation
      if (!flightForm.origin || !flightForm.destination || !flightForm.departureDate || !flightForm.travelClass) {
        alert('Please fill in all required fields for flight booking')
        return
      }
      
      // Validate that at least one passenger is added
      const validPassengers = passengerForms.filter(p => p.name && p.age && p.gender).length
      if (validPassengers < 1) {
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
        const response = await api.post('/api/tickets', {
          origin: flightForm.origin,
          destination: flightForm.destination,
          travelDate: flightForm.departureDate,
          returnDate: flightForm.returnDate,
          travelClass: flightForm.travelClass,
          passengerCount: passengerForms.filter(p => p.name && p.age && p.gender).length,
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
      
      if (hotelForm.roomCount < 1) {
        alert('At least 1 room is required')
        return
      }
      
      // Validate that at least one passenger is added
      const validGuests = passengerForms.filter(p => p.name && p.age && p.gender).length
      if (validGuests < 1) {
        alert('At least 1 guest is required')
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
        const response = await api.post('/api/tickets', {
          // Map hotel booking fields to ticket request fields
          origin: hotelForm.city,  // Use city as both origin and destination
          destination: hotelForm.city,
          travelDate: hotelForm.checkInDate,
          returnDate: hotelForm.checkOutDate,
          travelClass: hotelForm.roomType,  // Map room type to travel class
          passengerCount: passengerForms.filter(p => p.name && p.age && p.gender).length,  // Count valid passengers
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
  
  // Submit passenger details
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
  
  // Make payment
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
      alert('Payment successful!')
    } catch (error: any) {
      console.error('Error making payment:', error)
      alert('Error making payment: ' + (error.response?.data?.message || error.message))
    }
  }
  
  // Reset forms
  function resetForms() {
    // Reset train ticket form
    setForm({ 
      origin: '', 
      destination: '', 
      travelDate: tomorrowStr, 
      bookingDate: todayStr,
      travelClass: 'SLEEPER', 
      specialRequirements: ''
    })
    
    // Reset flight booking form
    setFlightForm({
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      travelClass: 'ECONOMY',
      specialRequirements: ''
    })
    
    // Reset hotel booking form
    setHotelForm({
      city: '',
      checkInDate: '',
      checkOutDate: '',
      roomCount: 1,
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
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen p-4 md:p-6">
      {/* Header with Welcome Message */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {userName}!</h1>
            <p className="text-sm text-gray-500">Manage your travel bookings and payments</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="hidden md:flex space-x-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Tickets</div>
            <div className="text-xl font-bold text-blue-600">{tickets.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Payments</div>
            <div className="text-xl font-bold text-green-600">{payments.length}</div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              New Booking
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('payments')}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My Payments
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'tickets' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('tickets')}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Tickets
            </div>
          </button>
          <button 
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'masterList' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('masterList')}
          >
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Master List
            </div>
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="space-y-6">
        {/* Master List Tab */}
        {activeTab === 'masterList' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Master Passenger List</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Manage your saved passengers for quick booking. These passengers will be available for selection in all your future bookings.</p>
              
              {/* Add New Passenger Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-3">Add New Passenger</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="w-full md:w-1/3">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      id="masterPassengerName"
                    />
                  </div>
                  <div className="w-full md:w-1/6">
                    <input 
                      type="number" 
                      placeholder="Age" 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="120"
                      id="masterPassengerAge"
                    />
                  </div>
                  <div className="w-full md:w-1/6">
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      id="masterPassengerGender"
                      onClick={(e) => {
                        const select = e.target as HTMLSelectElement;
                        if (select.options.length > 0) {
                          select.size = 4;
                        }
                      }}
                      onBlur={(e) => {
                        const select = e.target as HTMLSelectElement;
                        select.size = 1;
                      }}
                      onChange={(e) => {
                        const select = e.target as HTMLSelectElement;
                        select.size = 1;
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="w-full md:w-1/6">
                    <button 
                      type="button" 
                      className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={() => {
                        const nameInput = document.getElementById('masterPassengerName') as HTMLInputElement;
                        const ageInput = document.getElementById('masterPassengerAge') as HTMLInputElement;
                        const genderInput = document.getElementById('masterPassengerGender') as HTMLSelectElement;
                        
                        if (nameInput.value && ageInput.value && genderInput.value) {
                          const newPassenger = {
                            name: nameInput.value,
                            age: ageInput.value,
                            gender: genderInput.value,
                            idProofType: 'Aadhar',
                            idProofNumber: '',
                            seatPreference: ''
                          };
                          
                          addToMasterList(newPassenger);
                          
                          // Reset form
                          nameInput.value = '';
                          ageInput.value = '';
                          genderInput.value = '';
                        } else {
                          alert('Please fill in all required fields');
                        }
                      }}
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Master Passenger List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {masterPassengerList.length > 0 ? (
                      masterPassengerList.map((passenger, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{passenger.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{passenger.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{passenger.gender}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => {
                                // Add passenger to current booking
                                setPassengerForms([...passengerForms, passenger]);
                                alert(`${passenger.name} added to current booking`);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Use
                            </button>
                            <button 
                              onClick={() => removeFromMasterList(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                          No passengers in master list. Add passengers to save them for future bookings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* New Booking Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-md p-6">
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
            
            {/* Booking Type Selector */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-4 py-2 rounded-lg ${bookingType === 'train' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setBookingType('train')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Train
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg ${bookingType === 'flight' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setBookingType('flight')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Flight
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg ${bookingType === 'hotel' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => setBookingType('hotel')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Hotel
                </button>
              </div>
            </div>
            
            <form onSubmit={submit} className="space-y-6">
              {/* Train Booking Form */}
              {bookingType === 'train' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Origin*</label>
                      <CityDropdown 
                        value={form.origin} 
                        onChange={(value) => setForm({...form, origin: value})}
                        placeholder="Select origin station"
                        label=""
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destination*</label>
                      <CityDropdown 
                        value={form.destination} 
                        onChange={(value) => setForm({...form, destination: value})}
                        placeholder="Select destination station"
                        label=""
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date*</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={form.travelDate}
                        onChange={(e) => setForm({...form, travelDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travel Class</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Any special requirements or preferences?"
                      rows={1}
                      value={form.specialRequirements}
                      onChange={(e) => setForm({...form, specialRequirements: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab' && !e.shiftKey) {
                          e.preventDefault();
                          document.getElementById('newPassengerName')?.focus();
                        }
                      }}
                    />
                  </div>
                  

                </div>
              )}
              
              {/* Flight Booking Form */}
              {bookingType === 'flight' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Origin Airport*</label>
                      <CityDropdown 
                        value={flightForm.origin} 
                        onChange={(value) => setFlightForm({...flightForm, origin: value})}
                        placeholder="Select origin airport"
                        label=""
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destination Airport*</label>
                      <CityDropdown 
                        value={flightForm.destination} 
                        onChange={(value) => setFlightForm({...flightForm, destination: value})}
                        placeholder="Select destination airport"
                        label=""
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date*</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={flightForm.departureDate}
                        onChange={(e) => setFlightForm({...flightForm, departureDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Date (Optional)</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={flightForm.returnDate}
                        onChange={(e) => setFlightForm({...flightForm, returnDate: e.target.value})}
                        min={flightForm.departureDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travel Class</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                        value={flightForm.travelClass}
                        onChange={(e) => setFlightForm({...flightForm, travelClass: e.target.value})}
                      >
                        <option value="ECONOMY">Economy</option>
                        <option value="PREMIUM_ECONOMY">Premium Economy</option>
                        <option value="BUSINESS">Business</option>
                        <option value="FIRST">First Class</option>
                      </select>
                    </div>
                    

                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Any special requirements or preferences?"
                      rows={1}
                      value={flightForm.specialRequirements}
                      onChange={(e) => setFlightForm({...flightForm, specialRequirements: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab' && !e.shiftKey) {
                          e.preventDefault();
                          document.getElementById('newPassengerName')?.focus();
                        }
                      }}
                    />
                  </div>
                  

                </div>
              )}
              
              {/* Hotel Booking Form */}
              {bookingType === 'hotel' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                      <CityDropdown 
                        value={hotelForm.city} 
                        onChange={(value) => setHotelForm({...hotelForm, city: value})}
                        placeholder="Select city"
                        label=""
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date*</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={hotelForm.checkInDate}
                        onChange={(e) => setHotelForm({...hotelForm, checkInDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date*</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={hotelForm.checkOutDate}
                        onChange={(e) => setHotelForm({...hotelForm, checkOutDate: e.target.value})}
                        min={hotelForm.checkInDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Count</label>
                      <input 
                        type="number" 
                        min="1"
                        max="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                        value={hotelForm.roomCount}
                        onChange={(e) => setHotelForm({...hotelForm, roomCount: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                      placeholder="Any special requirements or preferences?"
                      rows={2}
                      value={hotelForm.specialRequirements}
                      onChange={(e) => setHotelForm({...hotelForm, specialRequirements: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab' && !e.shiftKey) {
                          e.preventDefault();
                          document.getElementById('newPassengerName')?.focus();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Passenger Details Form - Expandable/Collapsible */}
              <div className="mt-6">
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
                    {/* Master Passenger List */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-md font-medium text-gray-700">Master Passenger List</h4>
                        <button 
                          type="button"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => setShowMasterList(!showMasterList)}
                        >
                          {showMasterList ? 'Hide List' : 'Show List'}
                        </button>
                      </div>
                      
                      {showMasterList && (
                        <div className="mb-4">
                          {masterPassengerList.length === 0 ? (
                            <p className="text-gray-500 text-sm">No passengers in master list. Add passengers to create your list.</p>
                          ) : (
                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {masterPassengerList.map((passenger) => (
                                    <tr key={passenger.id}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{passenger.name}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{passenger.age}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{passenger.gender}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                          type="button"
                                          className="text-blue-600 hover:text-blue-900 mr-3"
                                          onClick={() => {
                                            // Add to current passenger forms
                                            setPassengerForms([...passengerForms, {
                                              name: passenger.name,
                                              age: passenger.age,
                                              gender: passenger.gender,
                                              idProofType: passenger.idProofType,
                                              idProofNumber: passenger.idProofNumber,
                                              seatPreference: ''
                                            }]);
                                          }}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                        </button>
                                        <button 
                                          type="button"
                                          className="text-red-600 hover:text-red-900"
                                          onClick={() => removeFromMasterList(passenger.id)}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Passenger Input Form */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                      <div className="flex items-center mb-3">
                        <h4 className="text-md font-medium text-gray-700">Add New Passenger</h4>
                      </div>
                      
                      <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                        <div className="w-full md:w-[30%]">
                          <input 
                            type="text" 
                            id="newPassengerName"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                            placeholder="Full Name*"
                            pattern="[A-Za-z ]+"
                            title="Only alphabets and spaces allowed"
                            required
                            tabIndex={1}
                            onInput={(e) => {
                              const input = e.target as HTMLInputElement;
                              input.value = input.value.replace(/[^A-Za-z ]/g, '');
                            }}
                          />
                        </div>
                        
                        <div className="w-full md:w-[15%]">
                          <input 
                            type="number" 
                            id="newPassengerAge"
                            min="1"
                            max="120"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm"
                            placeholder="Age*"
                            required
                            tabIndex={2}
                            onInput={(e) => {
                              const input = e.target as HTMLInputElement;
                              input.value = input.value.replace(/[^0-9]/g, '');
                            }}
                          />
                        </div>
                        
                        <div className="w-full md:w-[15%]">
                          <select 
                            id="newPassengerGender"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                            required
                            tabIndex={3}
                            onClick={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.focus();
                              select.size = 4; // Show 4 options at once
                            }}
                            onFocus={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.size = 4; // Show 4 options at once
                            }}
                            onBlur={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.size = 1; // Reset to default
                            }}
                            onChange={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.size = 1; // Reset to default after selection
                            }}
                          >
                            <option value="">Sex*</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div className="w-full md:w-[30%]">
                          <select 
                            id="newPassengerSeatPreference"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 shadow-sm bg-white"
                            tabIndex={4}
                            onClick={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.focus();
                              select.size = 4; // Show 4 options at once
                            }}
                            onFocus={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.size = 4; // Show 4 options at once
                            }}
                            onBlur={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.size = 1; // Reset to default
                            }}
                            onChange={(e) => {
                              const select = e.target as HTMLSelectElement;
                              select.size = 1; // Reset to default after selection
                            }}
                          >
                            <option value="">Seat Preference</option>
                            <option value="LOWER">Lower</option>
                            <option value="MIDDLE">Middle</option>
                            <option value="UPPER">Upper</option>
                            <option value="SIDE_LOWER">Side Lower</option>
                            <option value="SIDE_UPPER">Side Upper</option>
                          </select>
                        </div>
                        
                        <div className="w-full md:w-[10%]">
                          <button 
                            type="button"
                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                            tabIndex={5}
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
                                        className="text-green-600 hover:text-green-900 mr-3"
                                        onClick={() => {
                                           // Add to master list
                                           const masterPassenger = {
                                             id: Date.now().toString(),
                                             name: passenger.name,
                                             age: passenger.age,
                                             gender: passenger.gender,
                                             idProofType: passenger.idProofType || '',
                                             idProofNumber: passenger.idProofNumber || ''
                                           };
                                           addToMasterList(masterPassenger);
                                         }}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                      </button>
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
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button 
                  className="w-full md:w-auto md:min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 transform hover:scale-105 shadow-md flex items-center justify-center space-x-2" 
                  type="submit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {bookingType === "train" && 'Submit'}
                    {bookingType === "flight" && 'Submit Flight Booking Request'}
                    {bookingType === "hotel" && 'Submit Hotel Booking Request'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* My Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-md p-6">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
                <p className="mt-1 text-sm text-gray-500">Your payment history will appear here once you make payments for your bookings.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
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
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{payment.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{payment.mode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{payment.reference || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">My Ticket Requests</h2>
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tickets.length}</span>
            </div>
            
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No ticket requests yet</h3>
                <p className="mt-1 text-sm text-gray-500">Your ticket requests will appear here once you submit a booking.</p>
              </div>
            ) : (
              <div>
                {/* Filter Controls */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                      onChange={(e) => {
                        // Filter tickets by status
                        // This would be implemented with state variables in a real app
                      }}
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                    <select 
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                      onChange={(e) => {
                        // Filter tickets by time period
                        // This would be implemented with state variables in a real app
                      }}
                    >
                      <option value="">All Time</option>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last 30 Days</option>
                      <option value="90">Last 3 Months</option>
                      <option value="365">Last Year</option>
                    </select>
                  </div>
                  
                  <div className="ml-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input 
                      type="text" 
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search tickets..."
                      onChange={(e) => {
                        // Search tickets
                        // This would be implemented with state variables in a real app
                      }}
                    />
                  </div>
                </div>
                
                {/* Tickets Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
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
                        <tr key={ticket.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ticket.type || 'TRAIN'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ticket.origin}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ticket.destination}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{new Date(ticket.travelDate).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ticket.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ticket.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{ticket.assignedPnr || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {ticket.status === 'APPROVED' && !ticket.paymentAmount && (
                              <button 
                                type="button" 
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md"
                                onClick={() => {
                                  // Show payment form for this ticket
                                  const paymentAmount = ticket.approvedTicketCount ? (ticket.approvedTicketCount * 500).toString() : '500';
                                  setPaymentForm({ ...paymentForm, amount: paymentAmount });
                                  
                                  // Open payment modal or form
                                  // This would typically be implemented with a modal component
                                  const paymentModal = document.getElementById(`payment-modal-${ticket.id}`);
                                  if (paymentModal) {
                                    paymentModal.classList.remove('hidden');
                                  }
                                }}
                              >
                                Make Payment
                              </button>
                            )}
                            
                            {/* Payment Modal/Form */}
                            <div id={`payment-modal-${ticket.id}`} className="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                  <h3 className="text-lg font-medium text-gray-900 mb-4">Make Payment</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                      <input 
                                        type="number" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                                        required
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                      <select 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        value={paymentForm.mode}
                                        onChange={(e) => setPaymentForm({...paymentForm, mode: e.target.value})}
                                        required
                                      >
                                        <option value="UPI">UPI</option>
                                        <option value="CREDIT_CARD">Credit Card</option>
                                        <option value="DEBIT_CARD">Debit Card</option>
                                        <option value="NET_BANKING">Net Banking</option>
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                                      <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={paymentForm.reference}
                                        onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                                        placeholder="Transaction ID or Reference"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end space-x-3 mt-6">
                                    <button 
                                      type="button" 
                                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                      onClick={() => {
                                        // Close payment modal
                                        const paymentModal = document.getElementById(`payment-modal-${ticket.id}`);
                                        if (paymentModal) {
                                          paymentModal.classList.add('hidden');
                                        }
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="button" 
                                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      onClick={() => makePayment(ticket.id)}
                                    >
                                      Pay Now
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}