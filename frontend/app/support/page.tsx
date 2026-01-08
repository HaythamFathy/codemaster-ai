"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Search, UserCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportDashboard() {
    const [userId, setUserId] = useState("");
    const [impersonationToken, setImpersonationToken] = useState<string | null>(null);

    const handleImpersonate = async () => {
        try {
            const res = await api.post(`/auth/impersonate/${userId}`);
            setImpersonationToken(res.data.access_token);
        } catch (err: any) {
            alert("Failed to impersonate: " + (err.response?.data?.detail || err.message));
        }
    };

    const accessUserAccount = () => {
        if (!impersonationToken) return;
        localStorage.setItem("token", impersonationToken);
        document.cookie = `token=${impersonationToken}; path=/; max-age=604800; SameSite=Lax`;
        window.open("/dashboard", "_blank"); // Open in new tab to keep support portal open
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Customer Support Portal</h1>

            <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-700">
                    <UserCheck className="h-6 w-6" />
                    User Diagnostics & Impersonation
                </h2>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Target User ID
                    </label>
                    <div className="flex gap-4">
                        <Input
                            placeholder="Enter User ID (e.g., 5)"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                        <Button onClick={handleImpersonate} className="bg-indigo-600 hover:bg-indigo-700">
                            Generate Access
                        </Button>
                    </div>

                    {impersonationToken && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Ready to Impersonate
                            </h3>
                            <p className="text-sm text-yellow-700 mt-1 mb-4">
                                You have successfully generated a session token for User #{userId}.
                                Proceed with caution. Any actions taken will be recorded as this user.
                            </p>
                            <Button onClick={accessUserAccount} variant="destructive" className="w-full">
                                Log In as User #{userId}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
