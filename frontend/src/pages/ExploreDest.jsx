import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from "react-icons/io5";
import Navbar from "../components/navbar.jsx";

export default function ExploreDest(){
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentLocation: '',
    maxDistance: '1000',
    landscape: [],
    culture: [],
    activities: [],
    environment: []
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const options = {
    landscape: ['mountains', 'beaches', 'urban', 'rural', 'forest', 'desert', 'island'],
    culture: ['historical', 'modern', 'traditional', 'artistic', 'spiritual', 'culinary'],
    activities: ['adventure', 'relaxation', 'wellness', 'photography', 'nightlife', 'hiking'],
    environment: ['eco-friendly', 'sustainable', 'wildlife', 'conservation']
  };

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch location suggestions from Nominatim API
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.5',
          },
        }
      );
      const data = await response.json();
      const formattedSuggestions = data.map(item => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));
      setLocationSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of fetchLocationSuggestions
  const debouncedFetchSuggestions = debounce(fetchLocationSuggestions, 300);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'currentLocation') {
      debouncedFetchSuggestions(value);
    }
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      currentLocation: location.display_name
    }));
    setShowSuggestions(false);
  };

  const handleMultiSelect = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const preferences = {
      currentLocation: formData.currentLocation,
      maxDistance: formData.maxDistance,
      landscape: formData.landscape,
      culture: formData.culture,
      activities: formData.activities,
      environment: formData.environment
    };
    console.log(preferences);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>
      <Navbar />

      <div className="flex flex-col items-center justify-start relative z-10 mt-[100px] px-4 w-full overflow-y-auto">
        <div className="w-full max-w-[800px]">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg hover:bg-blue-700 mb-6"
            onClick={() => navigate(-1)}
          >
            <IoArrowBackSharp size={20} /> Back
          </button>

          <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-[#651225] mb-6 text-center">Discover Your Perfect Destination</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative location-search-container">
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Current Location
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your current city"
                  autoComplete="off"
                />
                {isLoading && (
                  <div className="absolute right-3 top-10 text-gray-500">
                    Loading...
                  </div>
                )}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleLocationSelect(location)}
                      >
                        {location.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Max Travel Distance (km)
                </label>
                <input
                  type="number"
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {Object.entries(options).map(([category, values]) => (
                <div key={category}>
                  <label className="block text-gray-700 text-lg font-semibold mb-2 capitalize">
                    {category} Preferences
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleMultiSelect(category, value)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          formData[category].includes(value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        } hover:opacity-80 transition-colors`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-blue-700 mt-6"
              >
                Find My Destination
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
