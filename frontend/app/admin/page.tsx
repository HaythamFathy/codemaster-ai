"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        api.get("/admin/stats").then((res) => setStats(res.data)).catch(console.error);
    }, []);

    if (!stats) return <div>Loading stats...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Overview</h1>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{stats.total_users}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
                    <p className="text-3xl font-bold mt-2">{stats.total_courses}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium">Code Submissions</h3>
                    <p className="text-3xl font-bold mt-2">{stats.total_submissions}</p>
                </div>
            </div>
        </div>
    );
}
