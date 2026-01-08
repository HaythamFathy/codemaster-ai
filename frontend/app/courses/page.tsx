"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Code2 } from "lucide-react";

interface Lesson {
    id: number;
    title: string;
    order_index: number;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_url: string;
    slug: string;
    lessons: Lesson[];
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get("/courses/");
                console.log("Courses:", response.data);
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleStartLesson = (course: Course) => {
        if (course.lessons && course.lessons.length > 0) {
            // Sort by order_index just in case
            const firstLesson = course.lessons.sort((a, b) => a.order_index - b.order_index)[0];
            router.push(`/learn/${course.id}/${firstLesson.id}`);
        } else {
            // Fallback if no lessons loaded (or empty course)
            // Just go to the generic lesson 1 route and handle 404 there or specific course page
            router.push(`/learn/${course.id}/1`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Available Courses
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Master coding with our interactive, gamified lessons.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {!Array.isArray(courses) || courses.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-lg shadow">
                            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-lg">No courses available yet.</p>
                        </div>
                    ) : (
                        courses.map((course) => (
                            <div key={course.id} className="bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow duration-300 flex flex-col group">
                                <div className="h-48 w-full relative overflow-hidden bg-gray-200">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Video className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-3">
                                        {course.description || "No description available."}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span className="flex items-center">
                                            <BookOpen className="h-4 w-4 mr-1" />
                                            {course.lessons?.length || 0} Lessons
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => handleStartLesson(course)}
                                    >
                                        <Code2 className="h-4 w-4" />
                                        Start Learning
                                    </Button>
                                </div>
                            </div>
                        )))}
                </div>
            </div>
        </div>
    );
}
