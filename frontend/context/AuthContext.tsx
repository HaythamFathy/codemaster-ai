"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Map JWT payload to User object
                // Note: The JWT typically contains minimal info, so we might need to fetch full profile
                // For MVP, we'll construct a basic User object from the token claims
                setUser({
                    id: decoded.user_id || decoded.sub, // Adjust based on your backend JWT structure
                    email: decoded.email || decoded.sub,
                    role: decoded.role,
                    is_active: true,
                    // Defaults for fields possibly not in token
                    is_pro: decoded.is_pro || false,
                    xp_points: 0,
                    current_streak: 0,
                    created_at: new Date().toISOString()
                });
            } catch (e) {
                console.error("Invalid token:", e);
                localStorage.removeItem("token");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
        try {
            const decoded: any = jwtDecode(token);
            setUser({
                id: decoded.user_id || decoded.sub,
                email: decoded.email || decoded.sub,
                role: decoded.role,
                is_active: true,
                is_pro: decoded.is_pro || false,
                xp_points: 0,
                current_streak: 0,
                created_at: new Date().toISOString()
            });
            // Redirect logic is usually handled by the Login Page component
        } catch (e) {
            console.error("Login failed:", e);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser(null);
        router.push("/login"); // Force redirect to login
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
