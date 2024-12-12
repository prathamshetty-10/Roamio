import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/navbar.jsx";
export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("login-user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!userData) return null;

  return (
    <div className="h-[100vh] w-[100vw] bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed flex items-center justify-center">
      <Navbar/>
      <div className="bg-[#0000005d] flex flex-col rounded-3xl px-[4rem] pt-[2.5rem] pb-[2rem] shadow-[0_0_5px_gray] gap-4 items-center">
        <div className="flex items-center justify-center">
          <h1 className="font-bold text-4xl text-[#7a1919]">Profile</h1>
        </div>
        <div className="flex flex-col items-center gap-4">
          <img
            src={userData.avatar.secure_url}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-[#6f1420] mb-4"
          />
          <span className="bg-[#651225] text-white px-4 py-2 rounded-full font-bold text-lg mb-2">
            Username: {userData.username}
          </span>
          <span className="bg-[#00bcd4] text-white px-4 py-2 rounded-full font-bold text-lg mb-2">
            Email: {userData.email}
          </span>
          <div className="flex items-center mt-4">
            <div className="text-lg text-white font-bold mr-4">-----</div>
            <div className="text-red-800 font-bold text-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] px-6 py-2 rounded-full shadow-lg text-center">
              {userData.badge.toUpperCase()}
            </div>
            <div className="text-lg text-white font-bold ml-4">-----</div>
          </div>
        </div>
      </div>
    </div>
  );
}
