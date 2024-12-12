import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";
export default function Home() {
    const navigate = useNavigate();

    const handleClick1 = async () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="h-[100vh] w-[100vw] flex flex-col relative">
            {/* Background with reduced opacity */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('./assets/bg.jpg')] bg-cover bg-center bg-fixed opacity-90"></div>
            
            {/* Navbar */}
            
            <Navbar/>
            {/* Main Body */}
            <div className="flex flex-col items-center justify-center text-center text-white relative z-10 mt-[100px]">
                <h1 className="text-7xl font-extrabold mb-4 text-red-900">Roamio</h1>
                <p className="text-2xl max-w-3xl mb-8 px-4 text-red-950 font-semibold">
                Roamio is an AI-driven travel planner that simplifies trip organization, offers real-time expense tracking, AI-generated itineraries, and dynamic recommendations. With features like travel badges, clan affiliations, and challenges, it delivers a fun, personalized travel experience.
                </p>
                <button
                    onClick={handleClick1}
                    className="bg-[#651225] text-2xl p-[0.6rem] rounded-2xl cursor-pointer hover:bg-[#ebe7ff] hover:text-blue-700 font-bold w-[200px]"
                >
                    Explore Destinations
                </button>
            </div>
        </div>
    );
}



