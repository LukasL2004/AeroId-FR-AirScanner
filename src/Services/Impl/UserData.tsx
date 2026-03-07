import type { LoginCall, LoginResponse } from "../Interfaces/UserDataInterface";

const API_LINK = "https://aeroid-be.onrender.com/api";

const login = async (call: LoginCall): Promise<LoginResponse> => {
    try {
        const queryParams = new URLSearchParams({
            name: call.name,
            flight: call.flight
        }).toString();

        console.log("📡 Calling flight-info with:", { name: call.name, flight: call.flight });
        console.log("📡 Full URL:", `${API_LINK}/flight-info?${queryParams}`);

        const response: Response = await fetch(`${API_LINK}/flight-info?${queryParams}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const text = await response.text();
        console.log("📡 Raw response:", text);

        if (!response.ok) {
            throw new Error(`Server error ${response.status}: ${text}`);
        }

        const data: LoginResponse = JSON.parse(text);
        return data;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}

export default {
    login
}