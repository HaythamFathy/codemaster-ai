"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
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
                // Allow both support and admin roles
                if (decoded.role !== "support" && decoded.role !== "admin") {
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

    return <>{children}</>;
}
