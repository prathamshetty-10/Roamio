import { IoArrowBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { editTripsRoute } from "../utils/APIRoutes.js";
import toast from "react-hot-toast";

export default function EditTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const tripDataFromState = location.state|| {}; // Get tripData from location.state
  const oldtripName=tripDataFromState.tripName;
  const [tripData, setTripData] = useState({
    oldtripName:oldtripName,
    newtripName: tripDataFromState.tripName,
    location: tripDataFromState.location,
    description: tripDataFromState.description,
    dateRange:tripDataFromState.dateRange,
    budget: tripDataFromState.budget ,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission status

  // Update tripData state on input change
  function handleUserInput(e) {
    const { name, value } = e.target;

    if (name === "from" || name === "to") {
      setTripData((prevData) => ({
        ...prevData,
        dateRange: {
          ...prevData.dateRange,
          [name]: value,
        },
      }));
    } else {
      setTripData({
        ...tripData,
        [name]: value,
      });
    }
  }

  // Handle form submission
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    if (
      !tripData.newtripName ||
      !tripData.oldtripName||
      !tripData.location ||
      !tripData.description ||
      !tripData.dateRange.from ||
      !tripData.dateRange.to ||
      !tripData.budget
    ) {
      toast.error("Please fill all the required fields");
      setIsSubmitting(false);
      return;
    }

    tripData.dateRange=JSON.stringify(tripData.dateRange);
   

    try {
      const { data } = await axios.post(`${editTripsRoute}`, tripData);

      if (data.status === false) {
        toast.error(data.msg);
      } else {
        toast.success("Trip updated successfully");
        navigate("/exploreTrips",{state:data.data});
      }
    } catch (error) {
        console.log(error)
      toast.error("Failed to update trip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      {/* Background with reduced opacity */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] px-4 w-full overflow-y-auto h-[calc(100vh-150px)]">
        {/* Back Button */}
        <div className="flex items-center w-full max-w-[800px] justify-start gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg hover:bg-blue-700"
            onClick={() => navigate("/exploreTrips",{state:tripDataFromState})}
          >
            <IoArrowBackSharp size={20} /> Back
          </button>
        </div>

        {/* Trip Details */}
        <div className="mt-6 w-full max-w-[800px] bg-yellow-50 p-8 rounded-lg shadow-md text-black">
          {/* Trip Header */}
          <div className="text-left">
            <h1 className="text-4xl font-bold text-[#651225] mb-4">Edit Trip</h1>

            {/* Trip Name, Date, and Budget Input */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 text-black">
              <input
                type="text"
                placeholder="Enter Trip Name"
                name="newtripName"
                value={tripData.newtripName}
                onChange={handleUserInput}
                className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-black w-full"
              />
              <input
                type="text"
                placeholder="Enter Trip Location"
                name="location"
                value={tripData.location}
                onChange={handleUserInput}
                className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-black w-full"
              />
              <div className="flex gap-4 my-[1rem] w-full">
                <input
                  type="date"
                  name="from"
                  value={tripData.dateRange.from ? new Date(tripData.dateRange.from).toISOString().split('T')[0] : ''}
                  onChange={handleUserInput}
                  className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-black w-[48%]"
                />
                <input
                  type="date"
                  name="to"
                  value={tripData.dateRange.to ? new Date(tripData.dateRange.to).toISOString().split('T')[0] : ''}
                  onChange={handleUserInput}
                  className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-black w-[48%]"
                />
              </div>
              <textarea
                name="description"
                placeholder="Enter trip description"
                value={tripData.description}
                onChange={handleUserInput}
                className="bg-transparent p-[2rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-black w-full h-[130px]"
              ></textarea>
              <input
                type="number"
                name="budget"
                value={tripData.budget}
                onChange={handleUserInput}
                placeholder="Enter trip budget"
                className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-black w-full"
              />
              <div className="flex justify-between">
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-[#651225] w-full  hover:bg-[#ebe7ff] text-white hover:text-[#651225] p-[1rem] rounded-2xl font-[1rem] ${
                    isSubmitting ? "bg-gray-400 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Edit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

