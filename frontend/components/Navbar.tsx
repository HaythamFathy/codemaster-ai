"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Code2, LayoutDashboard, BookOpen, ShieldCheck } from "lucide-react";

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // Check token and role on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
        if (storedToken) {
            try {
                const decoded: any = jwtDecode(storedToken);
                setRole(decoded.role || null);
            } catch (e) {
                console.error("Invalid token", e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setRole(null);
        router.push("/login");
    };

    return (
        <nav className="border-b bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <Code2 className="h-6 w-6" />
                    CodeMaster AI
                </Link>

                <div className="flex items-center gap-4">
                    {token ? (
                        <>
                            {role === "admin" && (
                                <Link
                                    href="/admin"
                                    className={`flex items-center px-3 py-2 text-sm font-medium ${pathname.startsWith("/admin") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                        }`}
                                >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Admin Panel
                                </Link>
                            )}
                            <Link
                                href="/courses"
                                className={`flex items-center px-3 py-2 text-sm font-medium ${pathname === "/courses" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                    }`}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Courses
                            </Link>
                            <Link
                                href="/dashboard"
                                className={`flex items-center px-3 py-2 text-sm font-medium ${pathname === "/dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                    }`}
                            >
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Link>
                            <Link
                                href="/profile"
                                className={`flex items-center px-3 py-2 text-sm font-medium ${pathname === "/profile" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                                    }`}
                            >
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 mr-2 text-xs font-bold">
                                    U
                                </span>
                                Profile
                            </Link>
                            <Button variant="ghost" onClick={handleLogout}>
                                Logout
                            </Button>
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
