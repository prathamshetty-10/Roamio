import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { getRequestsRoute,acceptRequestsRoute,rejectRequestsRoute } from "../utils/APIRoutes.js";
import toast from "react-hot-toast";

export default function Requests() {
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const [requests, setRequests] = useState([]);

  // Fetch friend requests
  const getRequestsFunc = async () => {
    if (!Me.username) return;

    try {
      const data = await axios.post(`${getRequestsRoute}`, {
        uname: Me.username,
      });

      if (data.data.status === false) {
        toast.success("No Friend Requests");
        setRequests([]);
      } else {
        setRequests(data.data.data);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      toast.error("Failed to load friend requests. Please try again.");
    }
  };

  // Accept a friend request
  const acceptRequestFunc = async (request) => {
    try {
      await axios.post(`${acceptRequestsRoute}`, {
        requestz:request,
        me: Me,
      });
      toast.success(`Accepted request from ${request.from.username}`);
      setRequests(requests.filter((req) => req.from.username !== request.from.username));
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept the request. Please try again.");
    }
  };

  // Reject a friend request
  const rejectRequestFunc = async (request) => {
    try {
      await axios.post(`${rejectRequestsRoute}`, {
        requestz:request
      });
      toast.success(`Rejected request from ${request.from.username}`);
      setRequests(requests.filter((req) => req.from.username !== request.from.username));
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject the request. Please try again.");
    }
  };

  // Set the logged-in user when the component loads
  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      SetMe(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Fetch requests when Me is set
  useEffect(() => {
    if (Me.username) {
      getRequestsFunc();
    }
  }, [Me]);

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] px-4 w-full overflow-y-auto h-[calc(100vh-150px)]">
        {/* Heading */}
        <h1 className="text-7xl font-extrabold text-red-900 mb-6">Requests</h1>

        {/* Render requests */}
        {requests.length > 0 ? (
          <div className="flex flex-col gap-4 mt-6 w-[800px] rounded-3xl">
            {requests.map((request, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl shadow-md mb-4 bg-yellow-50"
              >
                {/* Profile Photo */}
                <img
                  src={request.from.avatar.secure_url}
                  alt={request.from.username}
                  className="w-20 h-20 rounded-full border-2 border-[#6f1420] mx-4"
                />

                {/* User Details */}
                <div className="flex flex-col text-center flex-grow">
                  <span className="text-xl font-bold text-[#651225]">{request.from.username}</span>
                  <span className="text-xl text-[#555555] font-bold">{request.from.email}</span>
                </div>

                {/* Badge */}
                <span className="bg-[#ff7e5f] text-white px-4 py-2 rounded-full font-bold text-lg mr-6">{request.from.badge}</span>

                {/* Accept and Reject Buttons */}
                <div className="flex gap-4 ml-[50px]">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg hover:bg-green-700"
                    onClick={() => acceptRequestFunc(request)}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg hover:bg-red-700"
                    onClick={() => rejectRequestFunc(request)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-2xl">No friend requests available.</h2>
          </div>
        )}
      </div>
    </div>
  );
}
