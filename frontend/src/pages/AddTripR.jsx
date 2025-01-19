import { useState, useEffect } from "react";
import { useNavigate ,useLocation, useLinkClickHandler} from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { addTripsRoute} from "../utils/APIRoutes.js";
import toast from "react-hot-toast";

export default function AddTripR() {
  const navigate = useNavigate();
const location=useLocation();
 const recc=location.state.recommendations;
 const pref=location.state.pref;
 const loc=location.state.loc;
  const [Me, SetMe] = useState({});
  const [tripData, setTripData] = useState({
    tripName: "",
    dateRange: { from: "", to: "" },
    members: [],
    description: "",
    budget: "",
    location: loc,
    avatar: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      SetMe(user);
      setTripData((prevData) => ({
        ...prevData,
        members: [{ username: user.username }],
      }));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleUserInput = (e) => {
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
      setTripData({ ...tripData, [name]: value });
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(uploadedFile);
      setTripData({ ...tripData, avatar: uploadedFile });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", Me.username);
    formData.append("location", tripData.location);
    formData.append("tripName", tripData.tripName);
    formData.append("dateRange", JSON.stringify(tripData.dateRange));
    formData.append("members", JSON.stringify(tripData.members));
    formData.append("description", tripData.description);
    formData.append("budget", tripData.budget);
    formData.append("avatar", tripData.avatar);

    try {
      const { data } = await axios.post(addTripsRoute, formData);
      if (data.status === false) {
        toast.error(data.msg);
      } else {
        toast.success("Trip added successfully!");
        navigate("/trips");
      }
    } catch (error) {
      toast.error("Failed to add trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>
      <Navbar />
      <div className="flex flex-col items-center justify-start relative z-10 mt-[100px] px-4 w-full overflow-y-auto">
        <div className="w-full max-w-[800px]">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg hover:bg-blue-700 mb-6"
            onClick={() => navigate('/recc',{state:{recommendations:recc,pref:pref}})}
          >
            Back
          </button>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-[#651225] mb-6 text-center">
              Add Your Trip
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Trip Name
                </label>
                <input
                  type="text"
                  name="tripName"
                  value={tripData.tripName}
                  onChange={handleUserInput}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter trip name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={tripData.location}
                  onChange={handleUserInput}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter location"
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 text-lg font-semibold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="from"
                    value={tripData.dateRange.from}
                    onChange={handleUserInput}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 text-lg font-semibold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="to"
                    value={tripData.dateRange.to}
                    onChange={handleUserInput}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Budget (₹)
                </label>
                <input
                  type="number"
                  name="budget"
                  value={tripData.budget}
                  onChange={handleUserInput}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter budget"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={tripData.description}
                  onChange={handleUserInput}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter trip description"
                ></textarea>
              </div>
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Upload Trip Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {previewImage && (
                <div className="flex justify-center my-4">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full"
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg mt-4"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Add Trip"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}