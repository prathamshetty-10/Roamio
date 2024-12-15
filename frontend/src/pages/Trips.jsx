import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { getTripsRoute } from "../utils/APIRoutes.js";
import toast from "react-hot-toast";

export default function Trips() {
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const [trips, setTrips] = useState([]);
  const [apiCalled, setApiCalled] = useState(false);

  // Function to fetch trips
  const getTripsFunc = async () => {
    if (!Me.username) return;

    try {
      const response = await axios.post(`${getTripsRoute}`, {
        username: Me.username,
      });

      if (response.data.status === false || !response.data.data.length) {
        toast.success("No trips available");
        setTrips([]); // Set empty array when no trips are available
      } else {
        // Sort trips by the closest start date
        const sortedTrips = response.data.data.sort((a, b) => {
          return new Date(a.dateRange.from) - new Date(b.dateRange.from);
        });
        toast.success("Loaded trips");
        setTrips(sortedTrips);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast.error("Failed to load trips. Please try again.");
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

  // Call getTripsFunc only if Me is set and the API hasn't been called yet
  useEffect(() => {
    if (Me.username && !apiCalled) {
      getTripsFunc();
      setApiCalled(true); // Set the flag to prevent further API calls
    }
  }, [Me, apiCalled]);

  // Function to calculate the countdown until the trip
  const getCountdown = (startDate) => {
    const now = new Date();
    const timeDiff = new Date(startDate) - now;
    const days = Math.floor(timeDiff / (1000 * 3600 * 24)); // Days left
    if (days <= 0) return "Trip has already started!";
    return `${days} day${days === 1 ? "" : "s"} left`;
  };

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      {/* Background with reduced opacity (fixed) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>

      {/* Navbar (fixed) */}
      <Navbar />

      {/* Main Body (scrollable part only) */}
      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] px-4 w-full overflow-y-auto h-[calc(100vh-150px)]">
        
        {/* Heading */}
        <h1 className="text-7xl font-extrabold text-red-900 mb-6">Trips</h1>

        {/* Render trips only when the array is not empty */}
        {trips.length > 0 ? (
          <div className="flex flex-col gap-6 mt-6 w-[800px] ">
            {trips.map((trip, index) => (
              <div
                key={index}
                className="flex p-4 rounded-xl shadow-md mb-4 bg-yellow-50"
                style={{ height: "250px" }}
              >
                {/* Left-hand side: Avatar */}
                <div className="w-1/3 h-full flex items-center justify-center bg-[#f0f0f0] rounded-l-xl">
                  <img
                    src={trip.avatar.secure_url}
                    alt={trip.tripName}
                    className="w-[150px] h-[150px] rounded-lg object-cover"
                  />
                </div>

                {/* Right-hand side: Trip Details */}
                <div className="flex flex-col justify-between flex-grow p-4 gap-3">
                  <div>
                    <span className="text-3xl font-bold text-[#651225]">{trip.tripName}</span>
                    <p className="text-xl text-gray-600 mt-2 font-semibold">
                      {`From: ${new Date(trip.dateRange.from).toLocaleDateString()} To: ${new Date(trip.dateRange.to).toLocaleDateString()}`}
                    </p>
                    {/* Countdown */}
                    <p className="text-lg text-green-600 font-semibold mt-2">{getCountdown(trip.dateRange.from)}</p>
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 mt-5 rounded-full font-bold text-lg hover:bg-blue-700"
                    onClick={() => navigate(`/trip/${trip._id}`)}
                  >
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-2xl">No trips available.</h2>
          </div>
        )}
      </div>
    </div>
  );
}


