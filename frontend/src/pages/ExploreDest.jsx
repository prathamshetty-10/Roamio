import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from "react-icons/io5";
import { reccRoute } from '../utils/APIRoutes.js';
import { toast } from "react-hot-toast";
import Navbar from "../components/navbar.jsx";
import axios from "axios";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

export default function ExploreDest() {
  const navigate = useNavigate();
  const [previous_recc, setPrev] = useState(["none"]);
  const [formData, setFormData] = useState({
    currentCity: '',
    currentState: '',
    budget: '',
    days: '',
    travelMonth: 0,
    interests: {
      adventure: 0,
      relaxation: 0,
      culture: 0,
      nature: 0,
      nightlife: 0,
    },
    importance: {
      accessibility: 0,
      crowd: 0,
      familyFriendly: 0,
      food: 0,
      shopping: 0,
    },
    previous: previous_recc
  });
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [monthSuggestions, setMonthSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "currentState") {
      const suggestions = indianStates.filter(state => state.toLowerCase().startsWith(value.toLowerCase()));
      setStateSuggestions(suggestions);
    } else if (name === "travelMonth") {
      const suggestions = monthNames.filter(month => month.toLowerCase().startsWith(value.toLowerCase()));
      setMonthSuggestions(suggestions);
    }
  };

  const handleRatingClick = (category, key, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleStateSelect = (state) => {
    setFormData(prev => ({ ...prev, currentState: state }));
    setStateSuggestions([]);
  };

  const handleMonthSelect = (month) => {
    const monthIndex = monthNames.indexOf(month) + 1;
    setFormData(prev => ({ ...prev, travelMonth: monthIndex }));
    setMonthSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (
      !formData.currentCity || 
      !formData.currentState || 
      !formData.budget || parseInt(formData.budget, 10) <= 0 || 
      !formData.days || parseInt(formData.days, 10) <= 0 || 
      !formData.travelMonth || parseInt(formData.travelMonth, 10) <= 0 || 
      !formData.interests.adventure || 
      !formData.interests.relaxation || 
      !formData.interests.culture || 
      !formData.interests.nature || 
      !formData.interests.nightlife || 
      !formData.importance.accessibility || 
      !formData.importance.crowd || 
      !formData.importance.familyFriendly || 
      !formData.importance.food || 
      !formData.importance.shopping
    ) {
      console.log(formData);
      toast.error("Please fill all fields");
      setIsLoading(false);
      return;
    }
    

    const city = formData.currentCity.toLowerCase();
    formData.currentCity = city;
    formData.previous = previous_recc;

    try {
      const response = await axios.post(reccRoute, formData);
      if (!response.data.status) {
        toast.error(response.data.msg);
        
      }
      if (response.data.status) {
        toast.success("Successful");
        setRecommendations(response.data.recommendations);

      

        // Navigate to /recc page with the recommendations state
        navigate('/recc', { state: { recommendations: response.data.recommendations,pref:formData} });
      }
    } catch (error) {
      toast.error("Error while fetching recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (category, key) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <span
          key={index}
          onClick={() => handleRatingClick(category, key, starValue)}
          className={`cursor-pointer text-4xl align-middle mx-1 ${
            formData[category][key] >= starValue ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    });
  };

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
            <h1 className="text-4xl font-bold text-[#651225] mb-6 text-center">
              Plan Your Ideal Trip
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block text-gray-700 text-lg font-semibold mb-2">Current State</label>
                <input
                  type="text"
                  name="currentState"
                  value={formData.currentState}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your state"
                />
                {stateSuggestions.length > 0 && (
                  <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto w-full z-50">
                    {stateSuggestions.map((state, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleStateSelect(state)}
                      >
                        {state}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Other form inputs */}
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">Current City</label>
                <input
                  type="text"
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your city"
                />
              </div>

              <div className="relative">
                <label className="block text-gray-700 text-lg font-semibold mb-2">Travel Month</label>
                <input
                  type="text"
                  name="travelMonth"
                  value={formData.travelMonth}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter the month (e.g., Jan)"
                />
                {monthSuggestions.length > 0 && (
                  <ul className="absolute bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto w-full z-50">
                    {monthSuggestions.map((month, index) => (
                      <li
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleMonthSelect(month)}
                      >
                        {month}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">Budget (₹)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter your budget"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">Travel Days</label>
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter number of days"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Rate Your Interests:</h2>
                {Object.keys(formData.interests).map(key => (
                  <div key={key} className="mb-4 flex items-center">
                    <label className="text-gray-700 font-medium capitalize mr-4 w-32">{key}</label>
                    {renderStars("interests", key)}
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Rate Importance of Factors:</h2>
                {Object.keys(formData.importance).map(key => (
                  <div key={key} className="mb-4 flex items-center">
                    <label className="text-gray-700 font-medium capitalize mr-4 w-32">{key}</label>
                    {renderStars("importance", key)}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
