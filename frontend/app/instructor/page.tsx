"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Book, Users, Loader2 } from "lucide-react";

export default function InstructorDashboard() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/instructor/courses")
            .then((res) => setCourses(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Instructor Portal</h1>

            <div className="grid gap-6 md:grid-cols-2">
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

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Users className="h-6 w-6" /></div>
                        <h2 className="text-xl font-semibold">My Students</h2>
                    </div>
                    <p className="text-gray-500">
                        View analytics for students enrolled in your courses.
                        <br />
                        <span className="text-sm italic">(Detailed student list coming soon)</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
