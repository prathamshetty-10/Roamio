import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { getFriendsRoute,removeFriendsRoute } from "../utils/APIRoutes.js";
import toast from "react-hot-toast";

export default function Friends() {
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const [users, setUsers] = useState([]);
  const [apiCalled, setApiCalled] = useState(false); // Add a flag to track the API call
  const removeFriendFunc=async(uname)=>{
    await  axios.post(`${removeFriendsRoute}`,{
        username:uname,
        me:Me.username
    })
  }
  const getFriendsFunc = async () => {
    if (!Me.username) return;

    try {
      const data = await axios.post(`${getFriendsRoute}`, {
        username: Me.username,
      });

      if (data.data.status === false) {
        toast.success("No Friends");
        setUsers([]); // Clear users if no friends
      } else {
        setUsers(data.data.data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends. Please try again.");
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

  // Call getFriendsFunc only if Me is set and the API hasn't been called yet
  useEffect(() => {
    if (Me.username && !apiCalled) {
      getFriendsFunc();
      setApiCalled(true); // Set the flag to prevent further API calls
    }
  }, [Me, apiCalled]);

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      {/* Background with reduced opacity (fixed) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>

      {/* Navbar (fixed) */}
      <Navbar />

      {/* Main Body (scrollable part only) */}
      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] px-4 w-full overflow-y-auto h-[calc(100vh-150px)]">
        
        {/* Heading and Add Friends Button in Same Row */}
        <div className="flex items-center justify-center gap-[250px] w-full mb-6">
          <h1 className="text-7xl font-extrabold text-red-900">Friends</h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-xl hover:bg-blue-700 mt-6" onClick={()=>navigate("/addFriend")}>
            Add Friends
          </button>
        </div>

        {/* Render users only when the array is not empty */}
        {users.length > 0 ? (
          <div className="flex flex-col gap-4 mt-6 w-[700px] rounded-3xl ">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl shadow-md mb-4 bg-yellow-50"
              >
                {/* Profile Photo */}
                <img
                  src={user.public_url}
                  alt={user.username}
                  className="w-20 h-20 rounded-full border-2 border-[#6f1420] mx-4"
                />
                {/* User Details */}
                <div className="flex flex-col text-center flex-grow">
                  <span className="text-xl font-bold text-[#651225]">{user.username}</span>
                  <span className="text-xl text-[#555555] font-bold">{user.email}</span>
                </div>
                {/* Badge */}
                <span className="bg-[#ff7e5f] text-white px-4 py-2 rounded-full font-bold text-lg">{user.badge}</span>

                {/* Remove Button */}
                <button className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg ml-4 hover:bg-red-700" onClick={()=>removeFriendFunc(user.username)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-2xl">No friends available.</h2>
          </div>
        )}
      </div>
    </div>
  );
}
