import {useEffect, useState} from "react";
import {Quries} from "@/api/quries.ts";
import {apiService} from "@/api/api";

const useAwards = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAwards = async () => {
            try {
                console.log("Запрос наград");
                const data = await apiService.get(Quries.API.AWARDS.GET_ALL);
                console.log("Полученные награды:", data);
                setAwards(data);
            } catch (error) {
                console.error("Error fetching awards", error);
                setError('Error loading awards');
            } finally {
                setLoading(false);
            }
        };
        fetchAwards();
    }, []);


    return {awards, loading, error};
};

export default useAwards;
