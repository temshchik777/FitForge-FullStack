import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {Quries} from "@/api/quries.ts";

const BASE_API_URL = "http://localhost:4000"; // это твой backend

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
            // Backend returns created user object, not a token
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
                throw new Error(error.message || "Ошибка при входе");
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            navigate(Quries.CLIENT.PROFILE.DASHBOARD);
        } catch (error) {
            throw error;
        }
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        navigate(Quries.CLIENT.AUTH.LOGIN);
    }, [navigate]);

    const isAuthenticated = !!localStorage.getItem("token");

    return {
        register,
        login,
        logout,
        isAuthenticated,
    };
}
