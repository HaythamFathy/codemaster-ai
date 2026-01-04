"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { StatsCard } from "@/components/StatsCard";
import { User, Mail, Shield, Trophy, Flame } from "lucide-react";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    xp_points: number;
    current_streak: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl">Loading profile...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-6">
                    <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-12 w-12 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                        <div className="flex items-center text-gray-500 mt-1">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                            <Shield className="h-4 w-4 mr-2" />
                            <span className="capitalize">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatsCard
                        title="Total XP"
                        value={user.xp_points}
                        icon={<Trophy className="h-8 w-8 text-yellow-500" />}
                        description="Experience Points earned"
                    />
                    <StatsCard
                        title="Current Streak"
                        value={user.current_streak}
                        icon={<Flame className="h-8 w-8 text-orange-500" />}
                        description="Consecutive days active"
                    />
                </div>

                {/* Recent Activity (Placeholder) */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="p-6 text-center text-gray-500">
                        No recent activity to show yet. Complete lessons to see them here!
                    </div>
                </div>
            </div>
        </div>
    );
}
