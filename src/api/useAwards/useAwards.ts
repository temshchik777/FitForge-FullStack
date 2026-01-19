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
                console.log("Запрос всех наград и наград пользователя");
                
                // Отримуємо всі нагороди та нагороди користувача
                const [allAwards, userData] = await Promise.all([
                    apiService.get(Quries.API.AWARDS.GET_ALL),
                    apiService.get(Quries.API.USERS.GET_CURRENT)
                ]);
                
                console.log("Все награды:", allAwards);
                console.log("Награды пользователя:", userData.awards);
                
                // Створюємо set з ID нагород користувача для швидкої перевірки
                const userAwardIds = new Set(
                    (userData.awards || []).map((award: any) => award._id)
                );
                
                // Позначаємо які нагороди отримані
                const awardsWithStatus = allAwards.map((award: any) => ({
                    ...award,
                    unlocked: userAwardIds.has(award._id)
                }));
                
                console.log("Награды со статусом:", awardsWithStatus);
                setAwards(awardsWithStatus);
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
