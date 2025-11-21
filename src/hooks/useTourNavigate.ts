import { useContext } from "react"
import { TourContext } from "../tour.js"
import { useNavigate } from "react-router-dom";

export default function useTourNavigate() {

    const { id } = useContext(TourContext);
    const navigate= useNavigate();

    function navigateTour(path : string){
        const val = JSON.parse(localStorage.getItem(`tour-${id}`)??"");
        val.route = path;
        localStorage.setItem(`tour-${id}`, JSON.stringify(val));
        navigate(path);
    }


    return { navigateTour };
}