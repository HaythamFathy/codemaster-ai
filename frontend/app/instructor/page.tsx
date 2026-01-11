"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Book, Users, Loader2, Code, TrendingUp } from "lucide-react";

export default function InstructorDashboard() {
    const [courses, setCourses] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/instructor/courses"),
            api.get("/instructor/stats"),
            api.get("/instructor/submissions")
        ])
            .then(([coursesRes, statsRes, submissionsRes]) => {
                setCourses(coursesRes.data);
                setStats(statsRes.data);
                setSubmissions(submissionsRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Instructor Portal</h1>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Book className="h-6 w-6" /></div>
                        <div>
                            <h3 className="text-gray-500 text-sm">My Courses</h3>
                            <p className="text-2xl font-bold">{stats?.total_courses || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Users className="h-6 w-6" /></div>
                        <div>
                            <h3 className="text-gray-500 text-sm">Total Students</h3>
                            <p className="text-2xl font-bold">{stats?.total_students || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full"><Code className="h-6 w-6" /></div>
                        <div>
                            <h3 className="text-gray-500 text-sm">Submissions</h3>
                            <p className="text-2xl font-bold">{stats?.total_submissions || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Courses List */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Book className="h-6 w-6" /></div>
                        <h2 className="text-xl font-semibold">My Courses</h2>
                    </div>
                    <p className="text-gray-500 mb-4">You are teaching {courses.length} courses.</p>
                    <div className="space-y-2">
                        {courses.map(c => (
                            <div key={c.id} className="p-3 bg-gray-50 rounded border flex justify-between items-center">
                                <div>
                                    <span className="font-medium block">{c.title}</span>
                                    <span className="text-xs text-gray-500 capitalize">{c.course_type?.replace('_', ' ') || 'Pre-recorded'}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${c.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {c.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full"><Code className="h-6 w-6" /></div>
                        <h2 className="text-xl font-semibold">Recent Submissions</h2>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {submissions.length > 0 ? submissions.slice(0, 10).map(sub => (
                            <div key={sub.id} className="p-3 bg-gray-50 rounded border">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-medium">User #{sub.user_id}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${sub.status === 'Passed' ? 'bg-green-100 text-green-700' :
                                            sub.status === 'Failed' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">Challenge #{sub.challenge_id}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(sub.submitted_at).toLocaleString()}
                                </p>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-sm">No submissions yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
