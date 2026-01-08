"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            // Set cookie for Middleware (expires in 7 days)
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
            // Force a small delay or event dispatch if navbar needs to listen to storage, 
            // but Navbar usually reads on mount. A hard refresh might be needed or Context. 
            // For now, simple push.
            // Force a hard refresh to update Navbar state
            window.location.href = "/dashboard";
        } else {
            router.push("/login?error=oauth_failed");
        }
    }, [searchParams, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackHandler />
        </Suspense>
    );
}
