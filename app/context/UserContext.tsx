"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface UserDetails {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    // zone: string;
    // Add other fields if necessary
}

interface UserContextType {
    userId: string | null;
    userDetails: UserDetails | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [ userDetails, setUserDetails ] = useState<UserDetails | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get("/api/auth/tokenverify", { withCredentials: true });
                setUserId(response.data.user.id);
                setUserDetails(response.data.user);
                console.log({"loggedin userDetails": response.data.user})
                console.log({"loggedin userId": response.data.user.id})

            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };
        fetchUserId();
    }, []);

    return (
        <UserContext.Provider value={{ userId, userDetails }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
