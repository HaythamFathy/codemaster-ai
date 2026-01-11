"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Search, UserCheck, AlertTriangle, User, Mail, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportDashboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userActivity, setUserActivity] = useState<any>(null);
    const [impersonationToken, setImpersonationToken] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await api.get(`/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data);
        } catch (err: any) {
            alert("Search failed: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleSelectUser = async (user: any) => {
        setSelectedUser(user);
        setImpersonationToken(null);
        try {
            const res = await api.get(`/admin/users/${user.id}/activity`);
            setUserActivity(res.data);
        } catch (err: any) {
            alert("Failed to load user activity: " + (err.response?.data?.detail || err.message));
        }
    };

    const handleImpersonate = async () => {
        if (!selectedUser) return;
        try {
            const res = await api.post(`/auth/impersonate/${selectedUser.id}`);
            setImpersonationToken(res.data.access_token);
        } catch (err: any) {
            alert("Failed to impersonate: " + (err.response?.data?.detail || err.message));
        }
    };

    const accessUserAccount = () => {
        if (!impersonationToken) return;
        localStorage.setItem("token", impersonationToken);
        document.cookie = `token=${impersonationToken}; path=/; max-age=604800; SameSite=Lax`;
        window.open("/dashboard", "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Customer Support Portal</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Search */}
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-700">
                        <Search className="h-6 w-6" />
                        User Search
                    </h2>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Search by email or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                                Search
                            </Button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {searchResults.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className="p-3 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition"
                                    >
                                        <p className="font-medium">{user.full_name || user.email}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <p className="text-xs text-gray-400">ID: {user.id} | Role: {user.role}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* User Details & Impersonation */}
                {selectedUser && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-700">
                            <UserCheck className="h-6 w-6" />
                            User Details
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium">{selectedUser.full_name || 'Not set'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Stats</p>
                                    <p className="font-medium">
                                        {userActivity?.stats?.xp_points || 0} XP |
                                        {userActivity?.stats?.current_streak || 0} day streak
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button onClick={handleImpersonate} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    Generate Impersonation Token
                                </Button>
                            </div>

                            {impersonationToken && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Ready to Impersonate
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1 mb-4">
                                        You have successfully generated a session token for {selectedUser.email}.
                                        Proceed with caution.
                                    </p>
                                    <Button onClick={accessUserAccount} variant="destructive" className="w-full">
                                        Log In as User
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* User Activity */}
                {userActivity && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border lg:col-span-2">
                        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="font-semibold mb-3">Enrollments ({userActivity.enrollments?.length || 0})</h3>
                                <div className="space-y-2">
                                    {userActivity.enrollments?.slice(0, 5).map((enrollment: any) => (
                                        <div key={enrollment.id} className="p-2 bg-gray-50 rounded text-sm">
                                            <p>Course ID: {enrollment.course_id}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3">Recent Submissions ({userActivity.recent_submissions?.length || 0})</h3>
                                <div className="space-y-2">
                                    {userActivity.recent_submissions?.slice(0, 5).map((sub: any) => (
                                        <div key={sub.id} className="p-2 bg-gray-50 rounded text-sm">
                                            <div className="flex justify-between">
                                                <span>Challenge #{sub.challenge_id}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${sub.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(sub.submitted_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
