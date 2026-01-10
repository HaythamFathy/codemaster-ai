"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, AlertCircle, Loader2, BookOpen, BrainCircuit } from "lucide-react";
import api from "@/lib/api";
import confetti from "canvas-confetti";
import { LessonComments } from "@/components/LessonComments";
import { VoiceTutor } from "@/components/VoiceTutor";

interface Challenge {
    slug: string;
    problem_statement: string;
    starter_code: string;
}

interface Lesson {
    id: number;
    title: string;
    video_url: string;
    content: string;
    challenge?: Challenge;
}

interface Course {
    id: number;
    title: string;
    description: string;
    lessons: Lesson[];
}

export default function LessonPage() {
    const params = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [isHintLoading, setIsHintLoading] = useState(false);

    useEffect(() => {
        if (params.courseId && params.lessonId) {
            fetchCourseData();
        }
    }, [params.courseId, params.lessonId]);

    const fetchCourseData = async () => {
        try {
            const courseId = parseInt(params.courseId as string);
            const lessonId = parseInt(params.lessonId as string);

            const [courseRes, lessonRes, enrollmentRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/lessons/${lessonId}`),
                api.get(`/enrollments/${courseId}/status`).catch(() => ({ data: { enrolled: false, progress: [] } }))
            ]);

            const courseData = courseRes.data;
            const progressData = enrollmentRes.data.progress || [];

            // Merge progress into lessons
            if (courseData.lessons) {
                courseData.lessons = courseData.lessons.map((l: any) => ({
                    ...l,
                    isCompleted: progressData.some((p: any) => p.lesson_id === l.id && p.is_completed)
                })).sort((a: any, b: any) => a.order_index - b.order_index);
            }

            setCourse(courseData);
            setLesson(lessonRes.data);

            // Set initial code if challenge exists
            if (lessonRes.data.challenge && lessonRes.data.challenge.starter_code) {
                setCode(lessonRes.data.challenge.starter_code);
            } else {
                setCode("# Write your python code here\nprint('Hello World')");
            }

        } catch (error) {
            console.error("Failed to fetch lesson data", error);
        }
    };

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
    };

    if (!course || !lesson) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading lesson...</span>
        </div>
    );

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* ... (Header remains same) ... */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">
                    {course.title}: <span className="font-normal text-gray-600">{lesson.title}</span>
                </h1>
                <div className="flex space-x-2">
                    <Button
                        variant={activeTab === "learn" ? "default" : "ghost"}
                        onClick={() => setActiveTab("learn")}
                        className="gap-2"
                    >
                        <BookOpen className="h-4 w-4" /> Learn
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                {/* Sidebar Navigation */}
                <div className="hidden w-64 flex-col border-r bg-gray-50 lg:flex">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-gray-700">Course Content</h2>
                        <div className="mt-2 text-xs text-gray-500">
                            {course.lessons?.filter((l: any) => l.isCompleted).length}/{course.lessons?.length} Completed
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full">
                            <div
                                className="h-1.5 bg-green-500 rounded-full transition-all"
                                style={{ width: `${course.lessons && course.lessons.length > 0 ? (course.lessons.filter((l: any) => l.isCompleted).length / course.lessons.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {course.lessons?.map((l: any, idx) => (
                            <Button
                                key={l.id}
                                variant={l.id === lesson.id ? "secondary" : "ghost"}
                                className={`w-full justify-start text-sm ${l.id === lesson.id ? 'bg-white shadow-sm border border-gray-100 font-medium' : 'text-gray-600'}`}
                                asChild
                            >
                                <a href={`/learn/${course.id}/${l.id}`} className="flex items-center gap-3">
                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] border 
                                        ${l.isCompleted ? 'bg-green-100 border-green-200 text-green-700' :
                                            l.id === lesson.id ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                        {l.isCompleted ? <CheckCircle className="h-3 w-3" /> : idx + 1}
                                    </div>
                                    <span className="truncate">{l.title}</span>
                                </a>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Left Panel */}
                <div className="flex flex-1 flex-col overflow-y-auto border-r bg-white p-6 lg:w-1/2">
                    <div className="mb-6">
                        {lesson.video_url && <VideoPlayer url={lesson.video_url} />}
                    </div>
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-bold">Instructions</h2>
                        {lesson.content && (
                            <div className="text-gray-700 mb-6">{lesson.content}</div>
                        )}

                        {lesson.challenge ? (
                            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5" /> Challenge
                                </h3>
                                <div className="text-blue-800 whitespace-pre-wrap font-medium">
                                    {lesson.challenge.problem_statement}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                                No challenge available for this lesson.
                            </div>
                        )}
                    </div>
                    <LessonComments lessonId={lesson.id} />
                </div>

                {/* Right Panel: IDE */}
                <div className="flex flex-1 flex-col bg-[#1e1e1e] lg:w-1/2">
                    <div className="flex items-center justify-between border-b border-gray-700 bg-[#252526] px-4 py-2">
                        <span className="text-sm font-medium text-gray-300">solution.py</span>
                        <div className="flex gap-2">
                            {output && !output.passed && (
                                <Button
                                    onClick={getHint}
                                    disabled={isHintLoading}
                                    size="sm"
                                    variant="secondary"
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                                >
                                    {isHintLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                                    Get Hint
                                </Button>
                            )}
                            <Button onClick={runCode} disabled={isRunning} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                Run Code
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <CodeEditor initialCode={code} onChange={handleCodeChange} />
                        {/* Hint Overlay / Chat Bubble */}
                        {hint && (
                            <div className="absolute bottom-4 right-4 max-w-sm bg-yellow-50 border border-yellow-200 p-4 rounded-lg shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-yellow-800 flex items-center gap-1">
                                        <BrainCircuit className="h-4 w-4" /> AI Tutor Hint
                                    </h4>
                                    <button onClick={() => setHint(null)} className="text-yellow-600 hover:text-yellow-900">
                                        <span className="sr-only">Close</span>
                                        &times;
                                    </button>
                                </div>
                                <p className="text-sm text-yellow-900">{hint}</p>
                            </div>
                        )}
                    </div>
                    <div className="h-1/3 border-t border-gray-700 bg-[#1e1e1e] p-4 text-sm font-mono text-gray-300 overflow-y-auto">
                        <h3 className="mb-2 font-bold text-gray-500 uppercase tracking-wider text-xs">Output / Feedback</h3>
                        {output ? (
                            <div className={`rounded p-3 ${output.passed ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    {output.passed ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <span className="font-bold">{output.passed ? "passed" : "failed"}</span>
                                </div>
                                {output.stdout && <div className="mt-2 p-2 bg-black/50 rounded"><span className="text-xs text-gray-500 block mb-1">STDOUT:</span>{output.stdout}</div>}
                                {output.stderr && <div className="mt-2 p-2 bg-black/50 rounded"><span className="text-xs text-red-500 block mb-1">STDERR:</span>{output.stderr}</div>}
                                <div className="mt-2 text-sm opacity-90">{output.feedback}</div>
                            </div>
                        ) : <p className="text-gray-500 italic">Run your code to see output...</p>}
                    </div>
                    <VoiceTutor lessonId={lesson.id} context={code || ""} />
                </div>
            </div>
        </div>

    );
}


