export interface City {
  code: string;
  name: string;
  state: string;
}

export const cities: City[] = [
  // Major Metro Cities
  { code: "NDLS", name: "New Delhi", state: "Delhi" },
  { code: "BCT", name: "Mumbai Central", state: "Maharashtra" },
  { code: "CSTM", name: "Mumbai CST", state: "Maharashtra" },
  { code: "HWH", name: "Howrah Junction", state: "West Bengal" },
  { code: "SDAH", name: "Sealdah", state: "West Bengal" },
  { code: "MAS", name: "Chennai Central", state: "Tamil Nadu" },
  { code: "SBC", name: "Bangalore City", state: "Karnataka" },
  { code: "HYB", name: "Hyderabad Deccan", state: "Telangana" },
  { code: "ADI", name: "Ahmedabad Junction", state: "Gujarat" },
  { code: "PNBE", name: "Patna Junction", state: "Bihar" },
  
  // North India
  { code: "LKO", name: "Lucknow Junction", state: "Uttar Pradesh" },
  { code: "VNS", name: "Varanasi Junction", state: "Uttar Pradesh" },
  { code: "KANP", name: "Kanpur Central", state: "Uttar Pradesh" },
  { code: "ALD", name: "Allahabad Junction", state: "Uttar Pradesh" },
  { code: "JHS", name: "Jhansi Junction", state: "Uttar Pradesh" },
  { code: "GWL", name: "Gwalior Junction", state: "Madhya Pradesh" },
  { code: "BPL", name: "Bhopal Junction", state: "Madhya Pradesh" },
  { code: "JBP", name: "Jabalpur Junction", state: "Madhya Pradesh" },
  { code: "INDB", name: "Indore Junction", state: "Madhya Pradesh" },
  { code: "UJN", name: "Ujjain Junction", state: "Madhya Pradesh" },
  
  // South India
  { code: "TVC", name: "Thiruvananthapuram Central", state: "Kerala" },
  { code: "ERS", name: "Ernakulam Junction", state: "Kerala" },
  { code: "CLT", name: "Kozhikode", state: "Kerala" },
  { code: "TCR", name: "Thrissur", state: "Kerala" },
  { code: "PAL", name: "Palakkad Junction", state: "Kerala" },
  { code: "CBE", name: "Coimbatore Junction", state: "Tamil Nadu" },
  { code: "MDU", name: "Madurai Junction", state: "Tamil Nadu" },
  { code: "TPJ", name: "Tiruchirappalli", state: "Tamil Nadu" },
  { code: "SA", name: "Salem Junction", state: "Tamil Nadu" },
  { code: "VLR", name: "Villupuram Junction", state: "Tamil Nadu" },
  
  // East India
  { code: "RNC", name: "Ranchi Junction", state: "Jharkhand" },
  { code: "JSR", name: "Jamshedpur", state: "Jharkhand" },
  { code: "DHN", name: "Dhanbad Junction", state: "Jharkhand" },
  { code: "BGP", name: "Bhagalpur", state: "Bihar" },
  { code: "MKA", name: "Mokama Junction", state: "Bihar" },
  { code: "GAYA", name: "Gaya Junction", state: "Bihar" },
  { code: "ASN", name: "Asansol Junction", state: "West Bengal" },
  { code: "BWN", name: "Barddhaman Junction", state: "West Bengal" },
  { code: "KGP", name: "Kharagpur Junction", state: "West Bengal" },
  { code: "BLS", name: "Balasore", state: "Odisha" },
  
  // West India
  { code: "SUR", name: "Surat", state: "Gujarat" },
  { code: "BRC", name: "Vadodara Junction", state: "Gujarat" },
  { code: "RTM", name: "Ratlam Junction", state: "Madhya Pradesh" },
  { code: "KOTA", name: "Kota Junction", state: "Rajasthan" },
  { code: "JP", name: "Jaipur Junction", state: "Rajasthan" },
  { code: "AII", name: "Ajmer Junction", state: "Rajasthan" },
  { code: "JU", name: "Jodhpur Junction", state: "Rajasthan" },
  { code: "BKN", name: "Bikaner Junction", state: "Rajasthan" },
  { code: "UHP", name: "Udaipur City", state: "Rajasthan" },
  { code: "JSM", name: "Jaisalmer", state: "Rajasthan" },
  
  // Central India
  { code: "NGP", name: "Nagpur Junction", state: "Maharashtra" },
  { code: "CD", name: "Chandrapur", state: "Maharashtra" },
  { code: "G", name: "Gondia Junction", state: "Maharashtra" },
  { code: "WR", name: "Wardha Junction", state: "Maharashtra" },
  { code: "AK", name: "Akola Junction", state: "Maharashtra" },
  { code: "BSL", name: "Bhusaval Junction", state: "Maharashtra" },
  { code: "MMR", name: "Manmad Junction", state: "Maharashtra" },
  { code: "PUNE", name: "Pune Junction", state: "Maharashtra" },
  { code: "KOP", name: "Kolhapur", state: "Maharashtra" },
  { code: "SNSI", name: "Sainagar Shirdi", state: "Maharashtra" },
  
  // Northeast India
  { code: "GHY", name: "Guwahati", state: "Assam" },
  { code: "DIB", name: "Dibrugarh", state: "Assam" },
  { code: "JOR", name: "Jorhat Town", state: "Assam" },
  { code: "SLGR", name: "Silghat Town", state: "Assam" },
  { code: "DMR", name: "Dimapur", state: "Nagaland" },
  { code: "JIR", name: "Jiribam", state: "Manipur" },
  { code: "AGTL", name: "Agartala", state: "Tripura" },
  { code: "AHL", name: "Ahalyapur", state: "Arunachal Pradesh" },
  { code: "SHM", name: "Shillong", state: "Meghalaya" },
  { code: "AIL", name: "Aizawl", state: "Mizoram" },
  
  // Popular Tourist Destinations
  { code: "JAT", name: "Jammu Tawi", state: "Jammu & Kashmir" },
  { code: "SML", name: "Shimla", state: "Himachal Pradesh" },
  { code: "UHL", name: "Una Himachal", state: "Himachal Pradesh" },
  { code: "KGM", name: "Kathgodam", state: "Uttarakhand" },
  { code: "DDN", name: "Dehradun", state: "Uttarakhand" },
  { code: "HW", name: "Haridwar Junction", state: "Uttarakhand" },
  { code: "RBL", name: "Roorkee", state: "Uttarakhand" },
  { code: "RISH", name: "Rishikesh", state: "Uttarakhand" },
  { code: "PURI", name: "Puri", state: "Odisha" },
  { code: "BBS", name: "Bhubaneswar", state: "Odisha" },
  
  // Business Cities
  { code: "GNT", name: "Guntur Junction", state: "Andhra Pradesh" },
  { code: "VSKP", name: "Visakhapatnam", state: "Andhra Pradesh" },
  { code: "VJA", name: "Vijayawada Junction", state: "Andhra Pradesh" },
  { code: "TATA", name: "Tatanagar Junction", state: "Jharkhand" },
  { code: "BSP", name: "Bilaspur Junction", state: "Chhattisgarh" },
  { code: "R", name: "Raipur Junction", state: "Chhattisgarh" },
  { code: "DURG", name: "Durg Junction", state: "Chhattisgarh" },
  { code: "GKP", name: "Gorakhpur Junction", state: "Uttar Pradesh" },
  { code: "BARE", name: "Bareilly Junction", state: "Uttar Pradesh" },
  { code: "MB", name: "Moradabad", state: "Uttar Pradesh" }
];

// Sort cities alphabetically by name
export const sortedCities = cities.sort((a, b) => a.name.localeCompare(b.name));

// Group cities by state for better organization
export const citiesByState = cities.reduce((acc, city) => {
  if (!acc[city.state]) {
    acc[city.state] = [];
  }
  acc[city.state].push(city);
  return acc;
}, {} as Record<string, City[]>);

// Popular routes for quick selection
export const popularRoutes = [
  { origin: "NDLS", destination: "BCT", name: "Delhi → Mumbai" },
  { origin: "NDLS", destination: "HWH", name: "Delhi → Kolkata" },
  { origin: "NDLS", destination: "MAS", name: "Delhi → Chennai" },
  { origin: "NDLS", destination: "SBC", name: "Delhi → Bangalore" },
  { origin: "BCT", destination: "HWH", name: "Mumbai → Kolkata" },
  { origin: "BCT", destination: "MAS", name: "Mumbai → Chennai" },
  { origin: "HWH", destination: "MAS", name: "Kolkata → Chennai" },
  { origin: "MAS", destination: "SBC", name: "Chennai → Bangalore" },
  { origin: "ADI", destination: "BCT", name: "Ahmedabad → Mumbai" },
  { origin: "LKO", destination: "NDLS", name: "Lucknow → Delhi" }
];
