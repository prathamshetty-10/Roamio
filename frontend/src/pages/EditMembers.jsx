import { IoArrowBackSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {editMembersRoute, getFriendsRoute } from "../utils/APIRoutes.js";
import Navbar from "../components/navbar.jsx";
import toast from "react-hot-toast";
import axios from "axios";

export default function EditMembers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const [friends, setFriends] = useState([]);
  const tripData=location.state;
  const [members, setMembers] = useState(tripData.members || []);
  const [removedMembers, setRemovedMembers] = useState([]);

  // Set the logged-in user when the component loads
  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      SetMe(JSON.parse(storedUser)); // Parse the stored user string into an object
    } else {
      navigate("/login"); // Redirect to login if user is not found
    }
  }, [navigate]);

  // Fetch friends list for adding/removing members
  useEffect(() => {
    if (Me.username) {
      const getFriendsFunc = async () => {
        try {
          const response = await axios.post(`${getFriendsRoute}`, {
            username: Me.username,
          });
          if (response.data.status) {
            console.log(response.data.data)
            setFriends(response.data.data);
          } else {
            toast.error("Failed to fetch friends.");
          }
        } catch (error) {
          console.error("Error fetching friends:", error);
          toast.error("Failed to load friends. Please try again.");
        }
      };
      getFriendsFunc();
    }
  }, [Me]);

  const handleAddMember = (username) => {
    // Add the member to the members array
    setMembers((prevMembers) => [...prevMembers, { username:username }]);
    
  };

  const handleRemoveMember = (username) => {
    // Remove the member from the members array
    setRemovedMembers((prevRemoved) => [
      ...prevRemoved,
      { username:username }
    ]);
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.username !== username)
    );
  };

  const handleUpdateMembers = async () => {
    try {
      const response = await axios.post(`${editMembersRoute}`, {
        tripName: tripData.tripName,
        members: JSON.stringify(members),
        Removedmembers: JSON.stringify(removedMembers)
      });
      if (response.data.status) {
        toast.success("Members updated successfully.");
        // Redirect to the trips page or wherever needed
        navigate("/exploreTrips",{state:response.data.data});
      } else {
        toast.error("Failed to update members.");
      }
    } catch (error) {
      console.error("Error updating members:", error);
      toast.error("Failed to update members. Please try again.");
    }
  };

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
            onClick={() => navigate("/exploreTrips",{state:tripData})}
          >
            <IoArrowBackSharp size={20} /> Back
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-[#651225] mt-6">Add/Remove Members</h1>

        {/* Friends List */}
        <div className="mt-6 w-full max-w-[800px]  p-6 rounded-lg ">
          <div className="flex flex-wrap gap-4">
            {/* Display Friends with Add/Remove Buttons */}
            {friends.map((friend, index) => (
                <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl shadow-md mb-4 bg-yellow-50 w-full"
              >
                {/* Profile Photo */}
                <img
                  src={friend.user2.avatar.secure_url}
                  alt={friend.user2.username}
                  className="w-20 h-20 rounded-full border-2 border-[#6f1420] mx-4"
                />
                {/* User Details */}
                <div className="flex flex-col text-center flex-grow">
                  <span className="text-xl font-bold text-[#651225]">{friend.user2.username}</span>
                  <span className="text-xl text-[#555555] font-bold">{friend.user2.email}</span>
                </div>
                {/* Badge */}
                <span className="bg-[#ff7e5f] text-white px-4 py-2 rounded-full font-bold text-lg mr-[70px]">{friend.user2.badge}</span>

                {members.some((member) => member.username === friend.user2.username) ? (
                    <button
                      className="bg-red-600 text-white px-6 py-3 rounded-full text-xl hover:bg-red-700"
                      onClick={() => handleRemoveMember(friend.user2.username)}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      className="bg-blue-600 text-white px-6 py-3 rounded-full text-xl hover:bg-blue-700"
                      onClick={() => handleAddMember(friend.user2.username)}
                    >
                      Add
                    </button>
                  )}
              </div>
              
            ))}
          </div>

          {/* Update Members Button */}
          <div className="mt-6">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-full text-lg hover:bg-green-700"
              onClick={handleUpdateMembers}
            >
              Update Members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


