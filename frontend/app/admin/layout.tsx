"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            try {
                const decoded: any = jwtDecode(token);
                if (decoded.role !== "admin") {
                    router.push("/dashboard");
                } else {
                    setIsLoading(false);
                }
            } catch (e) {
                localStorage.removeItem("token");
                router.push("/login");
            }
        };
        checkToken();
    }, [router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Checking privileges...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-900 text-white p-6">
                <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
                <nav className="space-y-4">
                    <a href="/admin" className="block hover:text-gray-300">Overview</a>
                    <a href="/admin/courses/new" className="block hover:text-gray-300">Create Course</a>
                    <a href="/dashboard" className="block text-gray-500 hover:text-white mt-8">Exit to App</a>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-50 p-8">
                {children}
            </main>
        </div>
    );
}
