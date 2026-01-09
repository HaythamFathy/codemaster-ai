"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { enrollInCourse, getMyEnrollments } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Code2, CheckCircle, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

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
    course_type?: string;
    lessons: Lesson[];
}

interface Enrollment {
    course_id: number;
}

export default function CoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    api.get("/courses"),
                    getMyEnrollments().catch(() => ({ data: [] })) // Handle uncaught if not logged in
                ]);

                setCourses(coursesRes.data);
                const enrolledIds = new Set(enrollmentsRes.data.map((e: any) => e.course_id));
                setEnrolledCourseIds(enrolledIds as Set<number>);

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEnroll = async (courseId: number) => {
        setEnrollingId(courseId);
        try {
            await enrollInCourse(courseId);
            setEnrolledCourseIds(prev => new Set(prev).add(courseId));
            confetti({ particleCount: 150, spread: 60 });
        } catch (error) {
            console.error("Failed to enroll", error);
            alert("Failed to enroll. Please try again.");
        } finally {
            setEnrollingId(null);
        }
    };

    const handleStartLesson = (course: Course) => {
        if (course.lessons && course.lessons.length > 0) {
            const firstLesson = course.lessons.sort((a, b) => a.order_index - b.order_index)[0];
            router.push(`/learn/${course.id}/${firstLesson.id}`);
        } else {
            router.push(`/learn/${course.id}/1`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
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
                        courses.map((course) => {
                            const isEnrolled = enrolledCourseIds.has(course.id);

                            return (
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
                                        {isEnrolled && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Enrolled
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
                                            {course.course_type && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                                                ${course.course_type === 'one_on_one' ? 'bg-purple-100 text-purple-700' :
                                                        course.course_type === 'group' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'}`}>
                                                    {course.course_type.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>

                                        {isEnrolled ? (
                                            <Button
                                                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleStartLesson(course)}
                                            >
                                                <Code2 className="h-4 w-4" />
                                                Continue Learning
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => handleEnroll(course.id)}
                                                disabled={enrollingId === course.id}
                                            >
                                                {enrollingId === course.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <BookOpen className="h-4 w-4" />
                                                )}
                                                Enroll Now
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
