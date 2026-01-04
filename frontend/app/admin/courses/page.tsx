"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from "lucide-react";

interface Course {
    id: number;
    title: string;
    difficulty: string;
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            const res = await api.get("/courses/");
            setCourses(res.data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            await api.delete(`/courses/${id}`);
            fetchCourses(); // Refresh list
        } catch (error) {
            alert("Failed to delete course");
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Courses</h1>
                <Link href="/admin/courses/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Course
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                            course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {course.difficulty}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/courses/${course.id}`} className="text-blue-600 hover:text-blue-900 mr-4 inline-block">
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-900 inline-block">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
