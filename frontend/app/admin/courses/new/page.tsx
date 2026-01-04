"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have this or use Input
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Course Info, 2: Add Lessons
    const [courseId, setCourseId] = useState<number | null>(null);

    // Course State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("Beginner");

    // Lesson State
    const [lessonTitle, setLessonTitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [aiPrompt, setAiPrompt] = useState("");
    const [quizJson, setQuizJson] = useState('[]');

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/admin/courses", { title, description, difficulty });
            setCourseId(res.data.id);
            setStep(2);
        } catch (err) {
            console.error(err);
            alert("Failed to create course");
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return;

        try {
            await api.post("/admin/lessons", {
                course_id: courseId,
                title: lessonTitle,
                video_url: videoUrl,
                ai_prompt: aiPrompt,
                quiz_data: quizJson
            });
            alert("Lesson added!");
            // Reset lesson form
            setLessonTitle("");
            setVideoUrl("");
            setAiPrompt("");
        } catch (err) {
            console.error(err);
            alert("Failed to add lesson");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Create New Course</h1>

            {step === 1 && (
                <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Course Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <select
                            className="w-full border rounded p-2"
                            value={difficulty}
                            onChange={e => setDifficulty(e.target.value)}
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                    <Button type="submit">Create Course & Continue</Button>
                </form>
            )}

            {step === 2 && (
                <div>
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded">
                        Course Created! Now add lessons to it.
                    </div>
                    <form onSubmit={handleAddLesson} className="space-y-4">
                        <h2 className="text-lg font-semibold">Add Lesson</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">Lesson Title</label>
                            <Input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Video URL (YouTube)</label>
                            <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">AI Prompt (Context)</label>
                            <Input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quiz JSON</label>
                            <textarea
                                className="w-full border rounded p-2 text-sm font-mono h-24"
                                value={quizJson}
                                onChange={e => setQuizJson(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-1">Example: [{`{"question": "...", "options": [], "correctAnswer": "..."}`}]</p>
                        </div>
                        <div className="flex gap-4">
                            <Button type="submit">Add Lesson</Button>
                            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
                                Finish & Exit
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
