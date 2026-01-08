"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";
import { BookOpen, Video } from "lucide-react";

interface Lesson {
    id: number;
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

export default function DashboardPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [userStats, setUserStats] = useState({ streak: 0, xp: 0, full_name: "Student" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch User Stats first
                const userRes = await api.get("/auth/me");
                setUserStats({
                    streak: userRes.data?.current_streak || 0,
                    xp: userRes.data?.xp_points || 0,
                    full_name: userRes.data?.full_name || "Student"
                });

                // Fetch courses
                const res = await api.get("/courses");
                setCourses(res.data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const getStartLink = (course: Course) => {
        if (course.lessons && course.lessons.length > 0) {
            const firstLesson = course.lessons.sort((a, b) => a.order_index - b.order_index)[0];
            return `/learn/${course.id}/${firstLesson.id}`;
        }
        return `/learn/${course.id}/1`;
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            Welcome back, <span className="font-semibold text-gray-800">{userStats.full_name}</span>! Ready to code?
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <StatsCard streak={userStats.streak} xp={userStats.xp} />
                    </div>
                </header>

                <section>
                    <h2 className="mb-6 text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Available Courses
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {!Array.isArray(courses) || courses.length === 0 ? (
                            <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No courses available yet.</p>
                            </div>
                        ) : (
                            courses.map((course) => (
                                <div key={course.id} className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md flex flex-col group">
                                    <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <Video className="h-10 w-10 icon-placeholder" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{course.description}</p>

                                        <div className="mt-auto">
                                            <Link href={getStartLink(course)}>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Learning</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
