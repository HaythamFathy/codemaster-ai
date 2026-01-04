"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import api from "@/lib/api";

function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to 'login' unless 'mode=signup' is present
    const isSignupInitial = searchParams.get("mode") === "signup";

    // Use state to track current mode, but update it when searchParams change
    const [isLogin, setIsLogin] = useState(!isSignupInitial);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Sync state with URL params
    useEffect(() => {
        setIsLogin(searchParams.get("mode") !== "signup");
        setError(""); // Clear errors on mode switch
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isLogin) {
                const response = await api.post("/auth/login", { email, password });
                const token = response.data.access_token;
                localStorage.setItem("token", token);
                document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
                router.push("/dashboard");
            } else {
                await api.post("/auth/register", { name, email, password });
                // Switch to login mode after successful register, or auto-login
                // For MVP, simplified flow: just switch to login and ask them to sign in
                setIsLogin(true);
                setError("Account created! Please sign in.");
                // Clear password for security/convenience balance
                setPassword("");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Authentication failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {isLogin ? "Sign In" : "Create Account"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? "Welcome back to CodeMaster" : "Start your coding journey today"}
                    </p>
                </div>

                <div className="mt-8">

                    <div className="mt-8">
                        <GoogleLoginButton />
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {!isLogin && (
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}

                            <Input
                                type="email"
                                placeholder="Email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <p className={`text-sm ${error.includes("created") ? "text-green-600" : "text-red-600"}`}>
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full">
                            {isLogin ? "Sign In" : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
                        >
                            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <AuthForm />
        </Suspense>
    );
}
