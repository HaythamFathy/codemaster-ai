"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, BookOpen, Code, TrendingUp, Activity } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any>(null);

    useEffect(() => {
        Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/activity")
        ]).then(([statsRes, activityRes]) => {
            setStats(statsRes.data);
            setActivity(activityRes.data);
        }).catch(console.error);
    }, []);

    if (!stats || !activity) return <div className="flex items-center justify-center h-64">Loading...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    trend={`+${stats.new_users_this_week} this week`}
                    icon={<Users className="h-6 w-6" />}
                    color="blue"
                />
                <StatCard
                    title="Total Courses"
                    value={stats.total_courses}
                    icon={<BookOpen className="h-6 w-6" />}
                    color="green"
                />
                <StatCard
                    title="Code Submissions"
                    value={stats.total_submissions}
                    trend={`+${stats.new_submissions_this_week} this week`}
                    icon={<Code className="h-6 w-6" />}
                    color="purple"
                />
                <StatCard
                    title="Total Enrollments"
                    value={stats.total_enrollments}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="orange"
                />
            </div>

            {/* Activity Feed */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {/* Recent Users */}
                    {activity.recent_users.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">New Users</h3>
                            <div className="space-y-2">
                                {activity.recent_users.map((user: any) => (
                                    <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                            {user.full_name?.[0] || user.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{user.full_name || user.email}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Submissions */}
                    {activity.recent_submissions.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Recent Submissions</h3>
                            <div className="space-y-2">
                                {activity.recent_submissions.slice(0, 5).map((sub: any) => (
                                    <div key={sub.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div>
                                            <p className="text-sm">User #{sub.user_id} submitted code</p>
                                            <p className="text-xs text-gray-500">Challenge #{sub.challenge_id}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${sub.status === 'Passed' ? 'bg-green-100 text-green-700' :
                                                sub.status === 'Failed' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon, color }: any) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600'
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <div className={`p-2 rounded-lg ${colors[color as keyof typeof colors]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold">{value}</p>
            {trend && <p className="text-sm text-green-600 mt-2">{trend}</p>}
        </div>
    );
}
