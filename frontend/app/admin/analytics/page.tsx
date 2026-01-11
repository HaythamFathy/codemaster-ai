"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Code, BookOpen, Activity } from "lucide-react";

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/admin/stats"),
            api.get("/admin/activity")
        ]).then(([statsRes, activityRes]) => {
            setStats(statsRes.data);
            setActivity(activityRes.data);
            setLoading(false);
        }).catch(console.error);
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64">Loading analytics...</div>;

    // Prepare user growth data
    const userGrowthData = activity?.recent_users?.map((user: any, index: number) => ({
        date: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: index + 1
    })) || [];

    // Prepare submission data
    const submissionData = activity?.recent_submissions?.slice(0, 10).map((sub: any) => ({
        challenge: `#${sub.challenge_id}`,
        status: sub.status === 'Passed' ? 1 : 0,
        time: new Date(sub.submitted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })) || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights into platform performance</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Users"
                    value={stats?.total_users || 0}
                    change={`+${stats?.new_users_this_week || 0} this week`}
                    icon={<Users className="h-6 w-6" />}
                    color="blue"
                />
                <MetricCard
                    title="Active Courses"
                    value={stats?.total_courses || 0}
                    icon={<BookOpen className="h-6 w-6" />}
                    color="green"
                />
                <MetricCard
                    title="Submissions"
                    value={stats?.total_submissions || 0}
                    change={`+${stats?.new_submissions_this_week || 0} this week`}
                    icon={<Code className="h-6 w-6" />}
                    color="purple"
                />
                <MetricCard
                    title="Enrollments"
                    value={stats?.total_enrollments || 0}
                    icon={<TrendingUp className="h-6 w-6" />}
                    color="orange"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        User Growth Trend
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="users"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                name="New Users"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Submission Success Rate */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        Recent Submissions
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={submissionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="challenge" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}
                            />
                            <Legend />
                            <Bar
                                dataKey="status"
                                fill="#10b981"
                                name="Success Rate"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Enrollment Activity */}
                <div className="bg-white p-6 rounded-lg shadow border lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Recent Platform Activity</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-700">New Enrollments</h3>
                            <div className="space-y-2">
                                {activity?.recent_enrollments?.slice(0, 5).map((enrollment: any) => (
                                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-sm">User #{enrollment.user_id}</p>
                                            <p className="text-xs text-gray-500">Course #{enrollment.course_id}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )) || <p className="text-gray-500 text-sm">No recent enrollments</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-700">New Users</h3>
                            <div className="space-y-2">
                                {activity?.recent_users?.slice(0, 5).map((user: any) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-sm">{user.full_name || user.email}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )) || <p className="text-gray-500 text-sm">No recent users</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, icon, color }: any) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600'
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <div className={`p-2 rounded-lg ${colors[color as keyof typeof colors]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && <p className="text-sm text-green-600 mt-2 font-medium">{change}</p>}
        </div>
    );
}
