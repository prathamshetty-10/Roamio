import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { searchFriendsRoute, sendRequestsRoute } from "../utils/APIRoutes.js";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";

export default function AddFriends() {
  const location = useLocation();
  const users = location.state; // Array of current friends
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      SetMe(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchSearchResults = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (query === Me.username) {
      setSearchResults([]); // Show no results if user searches for their own name
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${searchFriendsRoute}`, { data: query });
      if (data.status === false) {
        setSearchResults([]);
      } else {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSearchResults = debounce(fetchSearchResults, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetchSearchResults(value);
  };

  useEffect(() => {
    return () => {
      debouncedFetchSearchResults.cancel(); // Clean up debounce
    };
  }, []);

  const sendFriendRequest = async (user) => {
    try {
      const { data } = await axios.post(`${sendRequestsRoute}`, {
        to: user.username,
        from: Me,
      });

      if (data.status === true) {
        toast.success("Friend request sent!");
      } else {
        toast.error(data.msg || "Failed to send friend request.");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>
      <Navbar />
      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] px-4 w-full overflow-y-auto h-[calc(100vh-150px)]">
        <h1 className="text-7xl font-extrabold text-red-900 mb-6">Add Friends</h1>
        <div className="flex items-center gap-4 w-full max-w-[700px] mb-8">
          <input
            type="text"
            placeholder="Search for a username"
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl text-[#ffffff] w-full"
          />
        </div>
        {isLoading && <div className="text-white">Loading...</div>}
        {searchResults.length > 0 ? (
          <div className="flex flex-col gap-4 mt-6 w-full max-w-[700px] rounded-3xl">
            {searchResults
              .filter(user => user.username !== Me.username) // Exclude the logged-in user
              .map((user, index) => {
                const isAlreadyFriend = users.some(friend => friend.username === user.username);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl shadow-md bg-yellow-50"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar.secure_url}
                        alt={user.username}
                        className="w-12 h-12 rounded-full border-2 border-[#6f1420]"
                      />
                      <div className="flex flex-col text-left">
                        <span className="text-xl font-bold text-[#651225]">
                          {user.username}
                        </span>
                        <span className="text-lg text-[#555555]">{user.email}</span>
                        {user.badge && (
                          <span className="text-sm text-[#ff5722] font-semibold">
                            {user.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {isAlreadyFriend ? (
                      <div className="text-sm font-bold text-green-700">Already Friends</div>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(user)}
                        className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg hover:bg-green-700"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center text-white">
              <h2 className="text-2xl">No search results available.</h2>
            </div>
          )
        )}
      </div>
    </div>
  );
}
