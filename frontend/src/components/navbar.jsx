import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar(){
    const navigate=useNavigate();
    const handleClick1 = async () => {
        localStorage.clear();
        navigate("/");
    };

    return(

        <nav className="w-full bg-black bg-opacity-60 text-white p-4 flex justify-between items-center absolute top-0 left-0 z-10">
                <div className="text-2xl font-bold px-6">Roamio</div>
                <div className="space-x-9">
                    <button className="text-xl hover:text-blue-400 font-semibold" onClick={()=>{navigate("/home")}}>Home</button>
                    <button className="text-xl hover:text-blue-400 font-semibold">Friends</button>
                    <button className="text-xl hover:text-blue-400 font-semibold">Dashboard</button>
                    <button className="text-xl hover:text-blue-400 font-semibold" onClick={()=>{navigate("/profile")}}>Profile</button>
                    <button
                        onClick={handleClick1}
                        className="text-xl hover:text-blue-400 font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </nav>
        
    )
}