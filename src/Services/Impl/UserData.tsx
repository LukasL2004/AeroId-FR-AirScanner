import type { LoginCall, LoginResponse } from "../Interfaces/UserDataInterface";

const API_LINK = "https://aeroid-be.onrender.com/api";

const login = async (call:LoginCall):Promise<LoginResponse> => {
    try {
        const response:Response = await fetch(`${API_LINK}/flight-info`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(call),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error
    }
}   

export default {
    login
}