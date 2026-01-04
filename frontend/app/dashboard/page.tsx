"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StatsCard } from "@/components/StatsCard";

export default function DashboardPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [userStats, setUserStats] = useState({ streak: 0, xp: 0 });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch courses
                const res = await api.get("/courses");
                setCourses(res.data);

                // Fetch User Stats
                const userRes = await api.get("/auth/me");
                setUserStats({
                    streak: userRes.data.current_streak,
                    xp: userRes.data.xp_points
                });
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        };

        fetchData();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
                        <p className="text-gray-500">Welcome back, Student!</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <StatsCard streak={userStats.streak} xp={userStats.xp} />
                    </div>
                </header>

                <section>
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Available Courses</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.length === 0 ? (
                            <p className="text-gray-500">No courses available yet.</p>
                        ) : (
                            courses.map((course) => (
                                <div key={course.id} className="rounded-lg border bg-white p-4 shadow-sm">
                                    <h3 className="text-lg font-bold">{course.title}</h3>
                                    <p className="text-sm text-gray-500">{course.difficulty}</p>
                                    <Link href={`/learn/${course.id}/1`}>
                                        <Button className="mt-4 w-full">Start Learning</Button>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
