import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from "react-icons/io5";
import Navbar from "../components/navbar.jsx";
import axios from 'axios';
import { reccRoute } from '../utils/APIRoutes.js';
import { toast } from 'react-hot-toast';

export default function Recommendations() {
  const location = useLocation();
  const initialRecommendations = location.state.recommendations;
  const pref = location.state.pref;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  
  const [preferences, setPref] = useState(pref);
  
  // Handle the fetching of more recommendations
  const handleShowMoreRecommendations = async () => {
    setIsLoading(true);

    try {
      // Step 1: Iterate through recommendations and append their names to previous_recc
      const updatedPreviousRecc = ["none", ...recommendations.map(recc => recc.name)];
    
      // Step 2: Update preferences.previous with the updated previous_recc
      const updatedPref = { ...preferences, previous: updatedPreviousRecc };
      console.log("updated",updatedPref)
      

      
      const response = await axios.post(reccRoute, updatedPref);

      if (!response.data.status) {
        toast.error(response.data.msg);
        return;
      }

      // Step 4: Once recommendations are received, append them to the recommendations array
      setRecommendations((prevRecommendations) => [
        ...prevRecommendations,
        ...response.data.recommendations
      ])


      toast.success("Recommendations fetched successfully!");
    } catch (error) {
      toast.error("Error while fetching recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  // UseEffect to re-render the recommendations whenever they change
  useEffect(() => {
    // This hook ensures that when recommendations are updated, it causes a re-render with the new list
    console.log("Recommendations updated:", recommendations);
  }, [recommendations]);

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>
      <Navbar />

      <div className="flex flex-col items-center justify-start relative z-10 mt-[100px] px-4 w-full overflow-y-auto">
        {/* Back Button */}
        <div className="flex gap-[100px] mb-[70px]">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg hover:bg-blue-700 mb-6"
            onClick={() => navigate('/exploreDest')}
          >
            <IoArrowBackSharp size={20} /> Back
          </button>

          {/* Recommendations Title */}
          <h2 className="text-5xl font-bold mb-6 text-red-900">Recommendations</h2>
        </div>

        {/* Recommendations List */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
          {recommendations.map((recc, index) => (
            <div key={index} className="shadow-md p-4 rounded-lg bg-yellow-50">
              <h3 className="text-xl font-bold">{recc.name}</h3>
              <p className="mt-2"><strong>State:</strong> {recc.state}</p>
              <p className="mt-2"><strong>Type:</strong> {recc.type}</p>
              <p className="mt-2"><strong>Best Season:</strong> {JSON.parse(recc.bestSeason.replace(/'/g, '"')).join(", ")}</p>
              <p className="mt-2"><strong> Travel Cost:</strong> ₹{recc.costs.travel}</p>
              <p className="mt-2"><strong> Daily Cost:</strong> ₹{recc.costs.daily}</p>
              <p className="mt-2"><strong> Total Cost:</strong> ₹{recc.costs.total}</p>

              {/* Add Trip Button */}
              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onClick={()=>navigate('/addTripR',{state:{loc:recc.name,recommendations:recommendations,pref:preferences}})}>
                Add Trip
              </button>
            </div>
          ))}
        </div>

        {/* Show More Recommendations Button */}
        {!isLoading && (
          <button
            className="mt-[100px] bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-[100px]"
            onClick={handleShowMoreRecommendations}
          >
            Show More Recommendations
          </button>
        )}

        {/* Loading Indicator */}
        {isLoading && <p>Loading more recommendations...</p>}
      </div>
    </div>
  );
}
