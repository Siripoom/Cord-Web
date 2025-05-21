import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

//setup axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "skip-browser-warning",
    },
});


export const register = async (data) => {
    try {
        const response = await api.post("/auth/register", data)
        return response.data
    } catch (error) {
        console.log(error)
    }


}
export const login = async (data) => {
    try {
        console.log("Login response:", data);
        const response = await api.post("/auth/login", data);
        return response.data;
    } catch (error) {
        console.log(error)
    }
}
