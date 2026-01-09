"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getMyEnrollments } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Flame, Zap, BookOpen, Video, Code2, Loader2, GraduationCap, CheckCircle, Trophy } from "lucide-react";

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

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ full_name: string; current_streak: number; xp_points: number } | null>(null);
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch User, All Courses, and Enrollments in parallel
                const [userRes, coursesRes, enrollmentsRes] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/courses"),
                    getMyEnrollments().catch(() => ({ data: [] }))
                ]);

                setUser(userRes.data);
                setAllCourses(coursesRes.data);

                // Enrollment API returns list of { id, course: {...}, ... }
                // We extract the course object from each enrollment
                const enrolled = enrollmentsRes.data.map((e: any) => e.course).filter((c: any) => c !== null);
                setMyCourses(enrolled);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    // Filter out enrolled courses from "Explore" list to avoid duplication
    const exploreCourses = allCourses.filter(c => !myCourses.some(mc => mc.id === c.id));

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Welcome & Stats */}
                <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.full_name}!</h1>
                        <p className="text-gray-500 mt-2 text-lg">Ready to likely continue your coding journey?</p>
                    </div>
                    <div className="flex gap-4">
                        <StatsCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="Streak" value={`${user.current_streak} days`} />
                        <StatsCard icon={<Zap className="h-5 w-5 text-yellow-500" />} label="XP" value={`${user.xp_points} XP`} />
                    </div>
                </header>

                {/* My Learning */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        My Learning
                    </h2>
                    {myCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.map((course) => (
                                <CourseCard key={course.id} course={course} isEnrolled={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-10 rounded-xl shadow-sm text-center border-2 border-dashed border-gray-200">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No active enrollments</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">You haven't enrolled in any courses yet. Browse our catalog to get started!</p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <a href="/courses">Browse Courses</a>
                            </Button>
                        </div>
                    )}
                </section>

                {/* Explore Courses */}
                {exploreCourses.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-green-600" />
                            Explore More Courses
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exploreCourses.slice(0, 3).map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Button variant="outline" asChild size="lg">
                                <a href="/courses">View Full Catalog</a>
                            </Button>
                        </div>
                    </section>
                )}

                {/* Leaderboard Preview */}
                <section className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Trophy className="h-64 w-64 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-yellow-400" /> Leaderboard
                            </h2>
                            <p className="text-blue-100 max-w-md text-lg mb-6">
                                Compete with other learners and climb the ranks! Complete lessons and challenges to earn XP.
                            </p>
                            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold border-none">
                                <a href="/leaderboard">View Full Standings</a>
                            </Button>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full md:w-96 border border-white/20">
                            <h3 className="font-bold text-blue-100 mb-4 uppercase text-sm tracking-wider">Top Learners</h3>
                            <div className="space-y-4">
                                <LeaderboardPreviewRow rank={1} name="Alex Chen" xp={1250} />
                                <LeaderboardPreviewRow rank={2} name="Sarah Smith" xp={980} />
                                <LeaderboardPreviewRow rank={3} name="Mike Johnson" xp={850} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function LeaderboardPreviewRow({ rank, name, xp }: { rank: number; name: string; xp: number }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${rank === 1 ? 'bg-yellow-500 text-blue-900' : 
                      rank === 2 ? 'bg-gray-300 text-gray-800' : 
                      'bg-orange-400 text-white'}`}>
                    {rank}
                </div>
                <span className="font-medium text-white">{name}</span>
            </div>
            <span className="text-blue-200 text-sm font-mono">{xp} XP</span>
        </div>
    );
}

function StatsCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 min-w-[160px]">
            <div className="bg-gray-50 p-2.5 rounded-full">{icon}</div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function CourseCard({ course, isEnrolled }: { course: Course, isEnrolled?: boolean }) {
    const getStartLink = () => {
        if (course.lessons && course.lessons.length > 0) {
            const firstLesson = [...course.lessons].sort((a, b) => a.order_index - b.order_index)[0];
            return `/learn/${course.id}/${firstLesson.id}`;
        }
        return `/learn/${course.id}/1`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
            <div className="h-44 bg-gray-200 relative overflow-hidden">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <Video className="h-12 w-12 opacity-50" />
                    </div>
                )}
                {course.course_type && (
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm
                        ${course.course_type === 'one_on_one' ? 'bg-white/90 text-purple-700 backdrop-blur-sm' :
                            course.course_type === 'group' ? 'bg-white/90 text-orange-700 backdrop-blur-sm' :
                                'bg-white/90 text-blue-700 backdrop-blur-sm'}`}>
                        {course.course_type.replace('_', ' ')}
                    </span>
                )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{course.description || "No description available."}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                    {isEnrolled ? (
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2" asChild>
                            <a href={getStartLink()}>
                                <Code2 className="h-4 w-4" /> Continue Learning
                            </a>
                        </Button>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="w-full" asChild>
                                <a href="/courses">Details</a>
                            </Button>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                                <a href="/courses">Enroll</a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
