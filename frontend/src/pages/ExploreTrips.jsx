import { IoArrowBackSharp } from "react-icons/io5";
import { useLocation } from "react-router-dom";
export default function ExploreTrips(){
    const location=useLocation();
    const tripData=location.state;
};