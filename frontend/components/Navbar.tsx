"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Code2, LayoutDashboard, BookOpen, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

interface UserProfile {
    full_name: string;
    avatar_url: string;
    email: string;
    role: string;
    is_pro: boolean;
}

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Check token and role on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);

        if (storedToken) {
            // Fetch full profile
            api.get("/auth/me")
                .then((res) => {
                    setUser(res.data);
                })
                .catch((err) => {
                    console.error("Failed to fetch user", err);
                    // Optionally logout if token is invalid
                    // localStorage.removeItem("token"); 
                });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    const role = user?.role || (token ? tryGetRole(token) : null);

    return (
        <nav className="border-b border-gray-200 bg-white z-50 relative shadow-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:text-blue-800 transition-colors">
                    <Code2 className="h-6 w-6" />
                    CodeMaster AI
                </Link>

                <div className="flex items-center gap-4">
                    {token ? (
                        <>
                            {!user?.is_pro ? (
                                <Link href="/pricing">
                                    <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hidden sm:flex">
                                        Pricing
                                    </Button>
                                </Link>
                            ) : (
                                <div className="hidden sm:flex items-center px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                                    PRO
                                </div>
                            )}

                            {role === "admin" && (
                                <Link
                                    href="/admin"
                                    className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${pathname.startsWith("/admin") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                        }`}
                                >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Admin Panel
                                </Link>
                            )}
                            <Link
                                href="/courses"
                                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${pathname === "/courses" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                    }`}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Courses
                            </Link>
                            <Link
                                href="/dashboard"
                                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${pathname === "/dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                    }`}
                            >
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>

                            <div className="flex items-center gap-4 pl-4 border-l">
                                <Link href="/profile" className="flex items-center gap-2 group">
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name || "User"}
                                            className="h-8 w-8 rounded-full border border-gray-200 group-hover:border-blue-400 transition-colors object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold group-hover:bg-blue-200 transition-colors">
                                            {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 hidden md:block">
                                        {user?.full_name?.split(' ')[0] || "Profile"}
                                    </span>
                                </Link>

                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-red-600">
                                    Logout
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/">
                                <Button variant="ghost">Home</Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/login?mode=signup">
                                <Button>Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

function tryGetRole(token: string) {
    try {
        const decoded: any = jwtDecode(token);
        return decoded.role;
    } catch {
        return null;
    }
}
