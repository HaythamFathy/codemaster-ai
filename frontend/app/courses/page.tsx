"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Code2 } from "lucide-react";

interface Course {
    id: number;
    title: string;
    video_url: string;
    difficulty: string;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get("/courses/");
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleStartLesson = (courseId: number) => {
        // For MVP, we route to a generic lesson ID "1" for all courses 
        // until we have a real Lesson model. 
        // In the future this would be /learn/[courseId]/[lessonId]
        router.push(`/learn/${courseId}/1`);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl">Loading courses...</div>
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
                        Master Python with our interactive, gamified lessons.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300 flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide 
                                        ${course.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                            course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {course.difficulty}
                                    </span>
                                    <Video className="h-5 w-5 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {course.title}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Learn key concepts through video tutorials and interactive coding challenges.
                                </p>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t">
                                <Button className="w-full flex items-center justify-center gap-2" onClick={() => handleStartLesson(course.id)}>
                                    <Code2 className="h-4 w-4" />
                                    Start Learning
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
