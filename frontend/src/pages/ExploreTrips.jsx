import { IoArrowBackSharp } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { BsCalendarDate } from "react-icons/bs";
import { MdLocationOn } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { leaveTripsRoute } from "../utils/APIRoutes.js";
import Navbar from "../components/navbar.jsx";
import toast from "react-hot-toast";
import axios from "axios";
import PhotoVault from "../components/photoVault.jsx"; // Importing PhotoVault component

export default function ExploreTrips() {
  const location = useLocation();
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const tripData = location.state;
  const [showPhotoVault, setShowPhotoVault] = useState(false); // State to toggle PhotoVault

  const handleLeave = async () => {
    const confirmDelete = window.confirm("Are you sure you want to leave this trip?");
    if (!confirmDelete) return;

    try {
      const response = await axios.post(`${leaveTripsRoute}`, {
        tripName: tripData.tripName,
        username: Me.username,
      });
      if (response.data.status) {
        toast.success("Trip Left successfully");
        navigate("/trips");
      } else {
        toast.error(response.data.msg || "Failed to leave trip");
      }
    } catch (error) {
      console.error("Error leaving trip:", error);
      toast.error("Failed to leave trip. Please try again.");
    }
  };

  // Set the logged-in user when the component loads
  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      SetMe(JSON.parse(storedUser)); // Parse the stored user string into an object
    } else {
      navigate("/login"); // Redirect to login if user is not found
    }
  }, [navigate]);

  if (!tripData) {
    toast.error("No trip data found. Redirecting to trips page.");
    navigate("/trips");
    return null;
  }

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      {/* Background with reduced opacity */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] px-4 w-full overflow-y-auto h-[calc(100vh-150px)]">
        <div className="flex items-center w-full max-w-[800px] justify-start gap-4">
          {/* Back Button */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg hover:bg-blue-700"
            onClick={() => navigate("/trips")}
          >
            <IoArrowBackSharp size={20} /> Back
          </button>
        </div>

        {/* Trip Details */}
        <div className="mt-6 w-full max-w-[800px] bg-yellow-50 p-6 rounded-lg shadow-md">
          {/* Trip Header */}
          <div className="text-left">
            <div className="flex gap-8">
              <h1 className="text-4xl font-bold text-[#651225] mb-4">{tripData.tripName}</h1>
              {tripData.admin.username === Me.username && (
                <button
                  className="bg-red-600 text-white px-4 py-2 mt-0 rounded-full font-bold text-lg hover:bg-red-700"
                  onClick={() => navigate("/editTrip", { state: tripData })}
                >
                  Edit Details
                </button>
              )}
              {tripData.admin.username !== Me.username && (
                <button
                  className="bg-red-600 text-white px-4 py-2 mt-0 rounded-full font-bold text-lg hover:bg-red-700"
                  onClick={() => handleLeave()}
                >
                  Leave Trip
                </button>
              )}
            </div>
            <p className="flex items-center text-xl text-gray-600 mb-2 font-semibold">
              <BsCalendarDate className="mr-2" />
              {` From:${new Date(tripData.dateRange.from).toLocaleDateString()} To: ${new Date(tripData.dateRange.to).toLocaleDateString()}`}
            </p>
            <p className="text-lg text-green-600 font-semibold mb-4">
              {`Created by: ${tripData.admin.username}`}
            </p>
            <p className="text-lg text-gray-700 mb-4 ml-2">{tripData.description}</p>
            <p className="flex items-center text-lg text-gray-700 font-semibold">
              <MdLocationOn className="mr-2" /> Location: {tripData.location}
            </p>
            <div className="mt-8 w-full max-w-[800px] rounded-lg text-left">
              <div className="flex mb-3">
                <h2 className="text-2xl font-bold text-[#651225] mb-4">Members</h2>
                {tripData.admin.username === Me.username && (
                  <button
                    className="bg-red-600 text-white px-4 py-1 mt-0 ml-6 rounded-full font-bold text-md hover:bg-red-700"
                    onClick={() => navigate("/editMembers", { state: tripData })}
                  >
                    Add/Remove Members
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {tripData.members.map((member, index) => (
                  <div
                    key={index}
                    className="text-lg text-gray-700 flex items-center gap-2 bg-gray-100 p-2 rounded-3xl shadow w-1/4 border-2 border-black"
                  >
                    <FaUsers className="text-blue-600" /> {member.username}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-blue-700"
            onClick={() => navigate("/itinerary", { state: tripData })}
          >
            Itinerary
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-blue-700"
            onClick={() => setShowPhotoVault(!showPhotoVault)} // Toggle PhotoVault
          >
            Photo Vault
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-blue-700"
            onClick={() => navigate("/financeManagement", { state: tripData })}
          >
            Finance Management
          </button>
        </div>

        {/* Conditionally render PhotoVault */}
        {showPhotoVault && <PhotoVault tripData={tripData} Me={Me} />}
      </div>
    </div>
  );
}
