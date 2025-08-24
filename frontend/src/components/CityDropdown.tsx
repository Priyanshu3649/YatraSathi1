import { useState, useRef, useEffect } from 'react';
import { City, sortedCities, citiesByState } from '../data/cities';

interface CityDropdownProps {
  value: string;
  onChange: (cityCode: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}

export default function CityDropdown({ 
  value, 
  onChange, 
  placeholder, 
  label, 
  className = "" 
}: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCity = sortedCities.find(city => city.code === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCities(sortedCities.slice(0, 20)); // Show first 20 cities by default
    } else {
      const filtered = sortedCities.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 30)); // Limit to 30 results
    }
  }, [searchTerm]);

  const handleCitySelect = (city: City) => {
    onChange(city.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm('');
    setFilteredCities(sortedCities.slice(0, 20));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm('');
    setFilteredCities(sortedCities.slice(0, 20));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selectedCity ? `${selectedCity.name} (${selectedCity.code})` : '')}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          readOnly={!isOpen}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Popular Routes */}
          {searchTerm === '' && (
            <div className="p-3 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                🚂 Popular Routes
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { origin: "NDLS", destination: "BCT", name: "Delhi → Mumbai" },
                  { origin: "NDLS", destination: "HWH", name: "Delhi → Kolkata" },
                  { origin: "BCT", destination: "MAS", name: "Mumbai → Chennai" },
                  { origin: "MAS", destination: "SBC", name: "Chennai → Bangalore" }
                ].map((route, index) => (
                  <button
                    key={index}
                    className="text-left p-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded border border-blue-200 transition duration-200"
                    onClick={() => {
                      if (label.toLowerCase().includes('origin')) {
                        onChange(route.origin);
                      } else {
                        onChange(route.destination);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="font-medium text-blue-800">{route.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities List */}
          <div className="py-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.code}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition duration-150"
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{city.name}</div>
                      <div className="text-sm text-gray-500">{city.state}</div>
                    </div>
                    <div className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {city.code}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-gray-500">
                No cities found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Show more results message */}
          {searchTerm && filteredCities.length === 30 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-200">
              Showing first 30 results. Refine your search for more.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
