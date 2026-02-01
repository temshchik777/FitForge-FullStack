import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {Quries} from "@/api/quries.ts";
import { ROUTS } from "@/routes/routes.tsx";

const BASE_API_URL = (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000'; // backend base URL from env or dev fallback

export function useAuth() {
    const navigate = useNavigate();

    const register = useCallback(async (
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        login: string,
    ) => {
        try {
            const response = await fetch(`${BASE_API_URL}${Quries.API.USERS.REGISTER}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, firstName, lastName, login }),
            });


            if (!response.ok) {
                let message = "Помилка при реєстрації";
                try {
                    const err = await response.json();
                    if (err?.message) message = err.message;
                    else if (typeof err === 'object' && err) {
                        const first = Object.values(err)[0] as string | undefined;
                        if (first) message = first;
                    }
                } catch {}
                throw new Error(message);
            }
       
            // За потреби обробіть успішну відповідь на реєстрацію тут
            await response.json();
        } catch (error) {
            throw error;
        }
    }, []);

    const login = useCallback(async (loginOrEmail: string, password: string) => {
        try {
            const response = await fetch(`${BASE_API_URL}${Quries.API.USERS.LOGIN}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ loginOrEmail, password }),
            });


            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Помилка при вході");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            navigate(ROUTS.ACCOUNT);
        } catch (error) {
            throw error;
        }
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        navigate(ROUTS.LOGIN);
    }, [navigate]);

    const isAuthenticated = !!localStorage.getItem("token");

    return {
        register,
        login,
        logout,
        isAuthenticated,
    };
}
