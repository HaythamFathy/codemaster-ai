"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, AlertCircle, Loader2, BookOpen, BrainCircuit } from "lucide-react";
import api from "@/lib/api";
import confetti from "canvas-confetti";

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
    const [activeTab, setActiveTab] = useState<"learn">("learn");

    // Code State
    const [code, setCode] = useState("");
    const [output, setOutput] = useState<{ passed: boolean; feedback: string; stdout?: string; stderr?: string } | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // 1. Fetch Course (which includes lessons and challenges)
                const res = await api.get(`/courses/${params.courseId}`);
                setCourse(res.data);

                // Find current lesson
                const currentLesson = res.data.lessons?.find((l: any) => l.id == params.lessonId);

                if (currentLesson) {
                    setLesson(currentLesson);

                    // Set Challenge Data
                    if (currentLesson.challenge) {
                        setCode(currentLesson.challenge.starter_code || "# Write your code here\n");
                    } else {
                        setCode("# Write your code here\n");
                    }
                }
            } catch (err) {
                console.error("Failed to fetch course data", err);
            }
        };
        if (params.courseId) fetchCourseData();
    }, [params.courseId, params.lessonId]);

    const handleCodeChange = (value: string | undefined) => {
        if (value) setCode(value);
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            const res = await api.post("/submissions/submit_code", {
                code_content: code,
                lesson_id: parseInt(params.lessonId as string)
            });
            setOutput({
                passed: res.data.status === "Passed",
                feedback: res.data.status === "Passed" ? "Great job! Check the output." : "Test failed.",
                stdout: res.data.stdout || res.data.status, // Fallback if stdout missing
                stderr: res.data.stderr
            });

            if (res.data.status === "Passed") {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } catch (err) {
            console.error(err);
            setOutput({ passed: false, feedback: "Error connecting to server." });
        } finally {
            setIsRunning(false);
        }
    };

    if (!course || !lesson) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading lesson...</span>
        </div>
    );

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header */}
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

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                {/* Left Panel: Content */}
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
                </div>

                {/* Right Panel: IDE */}
                <div className="flex flex-1 flex-col bg-[#1e1e1e] lg:w-1/2">
                    <div className="flex items-center justify-between border-b border-gray-700 bg-[#252526] px-4 py-2">
                        <span className="text-sm font-medium text-gray-300">solution.py</span>
                        <Button onClick={runCode} disabled={isRunning} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Run Code
                        </Button>
                    </div>
                    <div className="flex-1">
                        <CodeEditor initialCode={code} onChange={handleCodeChange} />
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
                </div>
            </div>
        </div>
    );
}


