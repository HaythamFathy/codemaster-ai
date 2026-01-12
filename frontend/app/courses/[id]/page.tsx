"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { enrollInCourse, getMyEnrollments } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Code2, CheckCircle, Loader2, User, PlayCircle, Clock } from "lucide-react";
import confetti from "canvas-confetti";

interface Lesson {
    id: number;
    title: string;
    order_index: number;
    content?: string;
    video_url?: string;
}

interface Instructor {
    id: number;
    full_name: string;
    avatar_url?: string;
    bio?: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail_url: string;
    slug: string;
    course_type?: string;
    lessons: Lesson[];
    instructor?: Instructor;
}

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchCourseData();
        }
    }, [params.id]);

    const fetchCourseData = async () => {
        try {
            const courseId = parseInt(params.id as string);
            const [courseRes, enrollmentsRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                getMyEnrollments().catch(() => ({ data: [] }))
            ]);

            setCourse(courseRes.data);
            const enrolled = enrollmentsRes.data.some((e: any) => e.course_id === courseId);
            setIsEnrolled(enrolled);
        } catch (error) {
            console.error("Failed to fetch course details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!course) return;
        setEnrollmentLoading(true);
        try {
            await enrollInCourse(course.id);
            setIsEnrolled(true);
            confetti({ particleCount: 150, spread: 60 });
        } catch (error) {
            console.error("Failed to enroll", error);
            alert("Failed to enroll. Please try again.");
        } finally {
            setEnrollmentLoading(false);
        }
    };

    const handleStartLearning = () => {
        if (!course) return;
        // Logic to jump to first lesson or last progress? 
        // For simple MVP -> First lesson
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

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center flex-col">
                <p className="text-xl text-gray-500 mb-4">Course not found.</p>
                <Button onClick={() => router.push("/courses")}>Back to Courses</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col lg:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border
                                ${course.course_type === 'one_on_one' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                    course.course_type === 'group' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {course.course_type?.replace('_', ' ') || 'Course'}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" /> {course.lessons?.length || 0} Lessons
                            </span>
                        </div>

                        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                            {course.title}
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            {course.description}
                        </p>

                        {/* Instructor Info */}
                        {course.instructor && (
                            <div className="flex items-center gap-3 pt-4 border-t">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {course.instructor.avatar_url ? (
                                        <img src={course.instructor.avatar_url} alt={course.instructor.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Instructor</p>
                                    <p className="text-sm text-gray-600">{course.instructor.full_name}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
                            {isEnrolled ? (
                                <Button
                                    size="lg"
                                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                    onClick={handleStartLearning}
                                >
                                    <PlayCircle className="h-5 w-5" /> Continue Learning
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    onClick={handleEnroll}
                                    disabled={enrollmentLoading}
                                >
                                    {enrollmentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
                                    Enroll in Course
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Thumbnail Card */}
                    <div className="w-full lg:w-1/3">
                        <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-100 relative group">
                            {course.thumbnail_url ? (
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                    <Video className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Syllabus</h2>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {course.lessons && course.lessons.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {course.lessons.sort((a, b) => a.order_index - b.order_index).map((lesson, idx) => (
                                <div key={lesson.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-gray-900 font-medium">{lesson.title}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-1">Lesson {lesson.order_index}</p>
                                    </div>
                                    {isEnrolled && (
                                        <Button variant="ghost" size="sm" onClick={() => router.push(`/learn/${course.id}/${lesson.id}`)}>
                                            Start
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No lessons released yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
