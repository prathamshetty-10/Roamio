import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import axios from "axios";
import { addTripsRoute, getFriendsRoute } from "../utils/APIRoutes.js";
import toast from "react-hot-toast";

export default function AddTrip() {
  const navigate = useNavigate();
  const [Me, SetMe] = useState({});
  const [tripData, setTripData] = useState({
    tripName: "",
    dateRange: { from: "", to: "" },
    members: [], // Ensure members is an array of objects
    description: "",
    budget: "",
    avatar: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [friends, setFriends] = useState([]);
  const [step, setStep] = useState(1); // Step for navigating between form sections
  const [isSubmitting, setIsSubmitting] = useState(false); // To track the submit status

  // Set the logged-in user when the component loads
  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      SetMe(user); // Parse the stored user string into an object
      setTripData((prevData) => ({
        ...prevData,
        members: [{ username: user.username }], // Automatically add the logged-in user to members
      }));
    } else {
      navigate("/login"); // Redirect to login if user is not found
    }
  }, [navigate]);

  // Handle input change
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

  // Handle file input (for trip image)
  function getImage(e) {
    e.preventDefault();
    const uploadedImage = e.target.files[0];
    if (uploadedImage) {
      setTripData({
        ...tripData,
        avatar: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  }

  // Fetch friends for step 2
  const getFriendsFunc = async () => {
    if (!Me.username) return;

    try {
      const data = await axios.post(`${getFriendsRoute}`, {
        username: Me.username,
      });

      if (data.data.status === false) {
        toast.success("No Friends");
        setFriends([]); // Clear friends if no friends
      } else {
        setFriends(data.data.data);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends. Please try again.");
    }
  };

  // Proceed to next step and fetch friends
  const nextStep = () => {
    if (!tripData.tripName || !tripData.dateRange.from || !tripData.dateRange.to) {
      toast.error("Please fill all the required fields before proceeding");
      return;
    }
    setStep(2); // Move to next step
    getFriendsFunc(); // Fetch friends data
  };

  // Go to previous step
  const prevStep = () => {
    setStep(step - 1); // Move to the previous step
  };

  // Add selected friend to members array (as an object with 'username' key)
  const addFriendToMembers = (friend) => {
    setTripData((prevData) => ({
      ...prevData,
      members: [...prevData.members, { username: friend.username }], // Add member as an object
    }));
  };

  // Remove member from members array
  const removeFriendFromMembers = (friend) => {
    setTripData((prevData) => ({
      ...prevData,
      members: prevData.members.filter((member) => member.username !== friend.username),
    }));
  };

  // Check if the friend is already in the members array
  const isFriendAdded = (friend) => {
    return tripData.members.some((member) => member.username === friend.username);
  };

  // Submit form data
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true); // Disable the button when submitting

    // Ensure members is an array of objects with the correct structure
    const membersArray = tripData.members.map((member) => {
      return { username: member.username }; // Ensure each member is an object with 'username' key
    });

    if (
      !tripData.tripName ||
      !tripData.dateRange.from ||
      !tripData.dateRange.to ||
      !membersArray.length ||
      !tripData.location
    ) {
      toast.error("Please fill all the details");
      setIsSubmitting(false); // Re-enable the button if validation fails
      return;
    }

    const formData = new FormData();
    formData.append("username", Me.username);
    formData.append("location", tripData.location);
    formData.append("tripName", tripData.tripName);
    formData.append("dateRange", JSON.stringify(tripData.dateRange));
    formData.append("members", JSON.stringify(membersArray)); // Convert to array of objects
    formData.append("description", tripData.description);
    formData.append("budget", tripData.budget);
    formData.append("avatar", tripData.avatar);

    try {
      const { data } = await axios.post(addTripsRoute, formData);

      if (data.status === false) {
        toast.error(data.msg);
      } else {
        toast.success("Trip added successfully");
        navigate("/trips");
      }
    } catch (error) {
      toast.error("Failed to add trip. Please try again.");
    } finally {
      setIsSubmitting(false); // Re-enable the button after submission
    }
  }

  return (
    <div className="h-[100vh] w-[100vw] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>
      <Navbar />

      <div className="flex flex-col items-center justify-start text-center text-white relative z-10 mt-[100px] ml-[330px] px-8 py-3 w-[900px] overflow-y-auto h-[calc(100vh-120px)] bg-[#00000058] rounded-3xl">
        <h1 className="text-6xl md:text-7xl font-extrabold text-red-900 mb-6">Add Trip</h1>

        {/* Avatar upload */}
        <div className="flex justify-center items-center mb-6">
          <label htmlFor="image_uploads" className="cursor-pointer">
            {previewImage ? (
              <img className="w-24 h-24 rounded-full" src={previewImage} alt="Preview" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-400" />
            )}
          </label>
          <input
            onChange={getImage}
            className="hidden"
            type="file"
            id="image_uploads"
            accept=".jpg,.jpeg,.png,.svg"
          />
        </div>
        <p className="text-[#ebebeb] text-center mb-6">Click to upload trip image</p>

        {/* Trip Name, Date, and Budget Input (Step 1) */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter Trip Name"
              name="tripName"
              value={tripData.tripName}
              onChange={handleUserInput}
              className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-full mb-4"
            />
            <input
              type="text"
              placeholder="Enter Trip Location"
              name="location"
              value={tripData.location}
              onChange={handleUserInput}
              className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-full mb-4"
            />
            <div className="flex gap-4 my-[1rem] w-full mb-6">
              <input
                type="date"
                name="from"
                value={tripData.dateRange.from}
                onChange={handleUserInput}
                className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[48%]"
              />
              <input
                type="date"
                name="to"
                value={tripData.dateRange.to}
                onChange={handleUserInput}
                className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-[48%]"
              />
            </div>
            <textarea
              name="description"
              placeholder="Enter trip description"
              value={tripData.description}
              onChange={handleUserInput}
              className="bg-transparent p-[2rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-full mb-6 h-[130px]"
            ></textarea>
            <input
              type="number"
              name="budget"
              value={tripData.budget}
              onChange={handleUserInput}
              placeholder="Enter trip budget"
              className="bg-transparent p-[1rem] border-[0.1rem] border-[#6f1420] rounded-2xl font-[1rem] text-[#ffffff] w-full mb-8"
            />
            <button
              onClick={nextStep}
              className="bg-[#651225] hover:bg-[#ebe7ff] text-white hover:text-[#651225] p-[1rem] rounded-2xl font-[1rem] w-full"
            >
              Next
            </button>
          </>
        )}

        {/* Step 2 - Display Friends */}
        {step === 2 && (
          <div className="w-full flex flex-col gap-4 mt-6">
            <h2 className="text-3xl mb-4">Select Friends</h2>
            {friends.length > 0 ? (
              friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl shadow-md mb-4 bg-yellow-50"
                >
                  <img
                    src={friend.user2.avatar.secure_url}
                    alt={friend.user2.username}
                    className="w-20 h-20 rounded-full border-2 border-[#6f1420] mx-4"
                  />
                  <span className="text-xl font-bold text-[#651225]">{friend.user2.username}</span>
                  {isFriendAdded(friend.user2) ? (
                    <button
                      onClick={() => removeFriendFromMembers(friend.user2)}
                      className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => addFriendToMembers(friend.user2)}
                      className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-lg"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No friends to select.</p>
            )}
            
            <button
              onClick={prevStep} // Go to previous step
              className="bg-[#651225] hover:bg-[#ebe7ff] text-white hover:text-[#651225] p-[1rem] rounded-2xl font-[1rem] w-full mt-4"
            >
              Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting} // Disable button when submitting
              className={`bg-[#651225] hover:bg-[#ebe7ff] text-white hover:text-[#651225] p-[1rem] rounded-2xl font-[1rem] w-full mt-6 ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Adding..." : "Add Trip"}
            </button>
            
          </div>
        )}
      </div>
    </div>
  );
}

  