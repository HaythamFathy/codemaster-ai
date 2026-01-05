"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CodeEditor } from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, AlertCircle, Loader2, BookOpen, BrainCircuit, Trophy } from "lucide-react";
import api, { getLessonTask } from "@/lib/api";
import confetti from "canvas-confetti";

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    lessons: any[];
}

export default function LessonPage() {
    const params = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [lesson, setLesson] = useState<any>(null);
    const [task, setTask] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");

    // Quiz State
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);

    // Code State
    const [code, setCode] = useState("");
    const [output, setOutput] = useState<{ passed: boolean; feedback: string; stdout?: string; stderr?: string } | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Course & Lesson
                const res = await api.get(`/courses/${params.courseId}`);
                setCourse(res.data);

                // Find current lesson
                const currentLesson = res.data.lessons?.find((l: any) => l.id == params.lessonId);
                setLesson(currentLesson);

                if (currentLesson) {
                    if (currentLesson.quiz_data) {
                        try {
                            setQuizQuestions(JSON.parse(currentLesson.quiz_data));
                        } catch (e) {
                            console.error("Failed to parse quiz data", e);
                        }
                    }

                    // 2. Fetch Unique AI Task
                    try {
                        const taskRes = await getLessonTask(params.lessonId as string);
                        setTask(taskRes.data);
                        setCode(taskRes.data.initial_code || "# Write your code here\n");
                    } catch (e) {
                        console.error("Failed to fetch task", e);
                        setCode("# Write your code here\n"); // Fallback
                    }
                }
            } catch (err) {
                console.error("Failed to fetch course", err);
            }
        };
        if (params.courseId && params.lessonId) fetchData();
    }, [params.courseId, params.lessonId]);

    const handleCodeChange = (value: string | undefined) => {
        if (value) setCode(value);
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            // Updated to use named export and pass lesson_id
            const res = await api.post("/submissions/submit_code", {
                code_content: code,
                lesson_id: parseInt(params.lessonId as string)
            });
            setOutput({
                passed: res.data.passed_boolean,
                feedback: res.data.ai_feedback,
                stdout: res.data.stdout,
                stderr: res.data.stderr
            });

            if (res.data.passed_boolean) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
        } catch (err) {
            console.error(err);
            setOutput({ passed: false, feedback: "Error connecting to server." });
        } finally {
            setIsRunning(false);
        }
    };

    const handleQuizSubmit = async () => {
        if (!selectedOption) return;

        const currentQ = quizQuestions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQ.correctAnswer;

        // Calculate new score based on this answer
        let newScore = score;
        if (isCorrect) {
            newScore += 10;
            setScore(newScore); // Update local state for UI
            confetti({ particleCount: 50, spread: 50, origin: { x: 0.2, y: 0.5 } });
        }

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            setQuizCompleted(true);
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });

            // Submit final score to backend
            try {
                await api.post(`/courses/${params.courseId}/complete_quiz`, { score: newScore });
                // We could also refresh the user profile context if we had one, but next navigation will fetch it.
            } catch (err) {
                console.error("Failed to submit quiz score", err);
            }
        }
    };

    if (!course) return <div className="flex h-screen items-center justify-center">Loading lesson...</div>;

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">
                    {course.title}: <span className="font-normal text-gray-600">{lesson?.title || "Lesson"}</span>
                </h1>
                <div className="flex space-x-2">
                    <Button
                        variant={activeTab === "learn" ? "default" : "ghost"}
                        onClick={() => setActiveTab("learn")}
                        className="gap-2"
                    >
                        <BookOpen className="h-4 w-4" /> Learn
                    </Button>
                    <Button
                        variant={activeTab === "quiz" ? "default" : "ghost"}
                        onClick={() => setActiveTab("quiz")}
                        className="gap-2"
                    >
                        <BrainCircuit className="h-4 w-4" /> Quiz
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">

                {activeTab === "learn" ? (
                    <>
                        {/* Left Panel: Video */}
                        <div className="flex flex-1 flex-col overflow-y-auto border-r bg-white p-6 lg:w-1/2">
                            <div className="mb-6">
                                {lesson?.video_url && <VideoPlayer url={lesson.video_url} />}
                            </div>
                            <div className="prose max-w-none">
                                <h2 className="text-2xl font-bold">Instructions</h2>
                                {task ? (
                                    <>
                                        <h3 className="text-lg font-semibold text-blue-700">{task.title}</h3>
                                        <div className="text-gray-700 whitespace-pre-wrap">{task.description}</div>
                                    </>
                                ) : (
                                    <p className="text-gray-600">Loading your unique challenge...</p>
                                )}

                                {lesson?.ai_prompt && (
                                    <div className="mt-4 rounded-md bg-gray-50 p-4 text-xs text-gray-500">
                                        <strong>Context:</strong> {lesson.ai_prompt}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Panel: IDE */}
                        <div className="flex flex-1 flex-col bg-[#1e1e1e] lg:w-1/2">
                            <div className="flex items-center justify-between border-b border-gray-700 bg-[#252526] px-4 py-2">
                                <span className="text-sm font-medium text-gray-300">main.py</span>
                                <Button onClick={runCode} disabled={isRunning} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                    {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Run Code
                                </Button>
                            </div>
                            <div className="flex-1">
                                <CodeEditor initialCode={code} onChange={handleCodeChange} />
                            </div>
                            <div className="h-1/3 border-t border-gray-700 bg-[#1e1e1e] p-4 text-sm font-mono text-gray-300">
                                <h3 className="mb-2 font-bold text-gray-500 uppercase tracking-wider text-xs">Output / Feedback</h3>
                                {output ? (
                                    <div className={`rounded p-3 ${output.passed ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {output.passed ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            <span className="font-bold">{output.passed ? "Test Passed!" : "Test Failed"}</span>
                                        </div>
                                        {output.stdout && <pre className="whitespace-pre-wrap mt-2 p-2 bg-black/50 rounded text-gray-200">{output.stdout}</pre>}
                                        {output.stderr && <pre className="whitespace-pre-wrap mt-2 p-2 bg-black/50 rounded text-red-300">{output.stderr}</pre>}
                                        <div className="mt-2 text-sm opacity-90"><strong>AI Feedback:</strong> {output.feedback}</div>
                                    </div>
                                ) : <p className="text-gray-500 italic">Run your code to see output...</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    // Quiz Interface
                    <div className="flex flex-1 items-center justify-center bg-gray-50 p-6">
                        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                            {!quizCompleted ? (
                                <>
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-2xl font-bold text-gray-900">Quiz Challenge</h2>
                                            <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex) / quizQuestions.length) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-xl font-medium text-gray-800 mb-6">{quizQuestions[currentQuestionIndex]?.question}</h3>
                                        <div className="space-y-3">
                                            {quizQuestions[currentQuestionIndex]?.options.map((option, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedOption(option)}
                                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedOption === option
                                                        ? "border-blue-500 bg-blue-50 text-blue-700"
                                                        : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleQuizSubmit} disabled={!selectedOption} size="lg">
                                            {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="mb-6 inline-flex p-4 rounded-full bg-green-100 text-green-600">
                                        <Trophy className="h-12 w-12" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                                    <p className="text-gray-600 mb-8">You earned <span className="font-bold text-green-600">+{score} XP</span></p>
                                    <Button onClick={() => setActiveTab("learn")} variant="outline" size="lg">
                                        Back to Lesson
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


