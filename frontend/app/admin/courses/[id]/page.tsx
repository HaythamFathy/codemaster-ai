"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api, { getLessons, createLesson, updateLesson, deleteLesson, getChallenge, updateChallenge } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Code, FileText, Video, Save, X } from "lucide-react";

interface Lesson {
    id?: number;
    title: string;
    video_url?: string;
    content?: string;
    order_index: number;
    course_id?: number;
}

interface Challenge {
    slug: string;
    problem_statement: string;
    starter_code: string;
    test_cases: any[]; // List of dicts
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const courseId = parseInt(id);

    const [activeTab, setActiveTab] = useState<"details" | "curriculum">("details");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Course Data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thumbnail_url: "",
        course_type: "",
        slug: ""
    });

    // Lesson Data
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [currentLesson, setCurrentLesson] = useState<Lesson>({ title: "", order_index: 0 });

    // Challenge Data
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState<Challenge>({ slug: "", problem_statement: "", starter_code: "", test_cases: [] });
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, lessonsRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    getLessons(courseId).catch(() => ({ data: [] }))
                ]);

                setFormData({
                    title: courseRes.data.title,
                    description: courseRes.data.description || "",
                    thumbnail_url: courseRes.data.thumbnail_url || "",
                    course_type: courseRes.data.course_type || "pre_recorded",
                    slug: courseRes.data.slug
                });
                setLessons(lessonsRes.data.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index));
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert("Failed to load course details");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, courseId]);

    // --- Course Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCourseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/courses/${id}`, formData);
            alert("Course updated!");
        } catch (error) {
            console.error(error);
            alert("Failed to update course");
        } finally {
            setSaving(false);
        }
    };

    // --- Lesson Handlers ---
    const openLessonModal = (lesson?: Lesson) => {
        if (lesson) {
            setCurrentLesson(lesson);
        } else {
            setCurrentLesson({ title: "", order_index: lessons.length + 1, course_id: courseId });
        }
        setIsLessonModalOpen(true);
    };

    const saveLesson = async () => {
        try {
            if (currentLesson.id) {
                await updateLesson(currentLesson.id, currentLesson);
            } else {
                await createLesson({ ...currentLesson, course_id: courseId });
            }
            // Refresh
            const res = await getLessons(courseId);
            setLessons(res.data.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index));
            setIsLessonModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save lesson");
        }
    };

    const handleDeleteLesson = async (lessonId: number) => {
        if (!confirm("Are you sure? This will delete the lesson and its challenge.")) return;
        try {
            await deleteLesson(lessonId);
            setLessons(lessons.filter(l => l.id !== lessonId));
        } catch (err) {
            alert("Failed to delete lesson");
        }
    };

    // --- Challenge Handlers ---
    const openChallengeModal = async (lessonId: number) => {
        setActiveLessonId(lessonId);
        try {
            const res = await getChallenge(lessonId);
            if (res.data) {
                setCurrentChallenge(res.data);
            } else {
                // Default template
                setCurrentChallenge({
                    slug: `lesson-${lessonId}-challenge`,
                    problem_statement: "## Problem Description\n\nWrite a function...",
                    starter_code: "def solution():\n    pass",
                    test_cases: []
                });
            }
            setIsChallengeModalOpen(true);
        } catch (err) {
            console.error(err);
            alert("Failed to load challenge");
        }
    };

    const saveChallenge = async () => {
        if (!activeLessonId) return;
        try {
            await updateChallenge(activeLessonId, currentChallenge);
            alert("Challenge saved!");
            setIsChallengeModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save challenge");
        }
    };

    const generateAIChallenge = async () => {
        if (!currentLesson.title) {
            alert("Please ensure the lesson has a title first.");
            return;
        }

        const topic = prompt("Enter a topic for the challenge:", currentLesson.title);
        if (!topic) return;

        try {
            const btn = document.getElementById("ai-gen-btn") as HTMLButtonElement | null;
            if (btn) btn.innerText = "Generating...";

            const res = await api.post("/ai/generate_challenge", { video_topic: topic });
            const aiData = res.data;

            setCurrentChallenge({
                slug: aiData.title.toLowerCase().replace(/\s+/g, '-'),
                problem_statement: `## ${aiData.title}\n\n${aiData.description}`,
                starter_code: aiData.initial_code,
                test_cases: aiData.test_cases
            });

            if (btn) btn.innerText = "✨ Generate with AI";
            alert("Challenge generated! Review and save.");

        } catch (err) {
            console.error(err);
            alert("Failed to generate challenge. Check server logs.");
            const btn = document.getElementById("ai-gen-btn") as HTMLButtonElement | null;
            if (btn) btn.innerText = "✨ Generate with AI";
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading editor...</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow min-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{formData.title}</h1>
                    <p className="text-sm text-gray-500">Editing Course</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/admin/courses")}>Back to List</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-gray-50">
                <button
                    onClick={() => setActiveTab("details")}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === "details" ? "bg-white border-t-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Course Details
                </button>
                <button
                    onClick={() => setActiveTab("curriculum")}
                    className={`px-6 py-3 text-sm font-medium ${activeTab === "curriculum" ? "bg-white border-t-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Curriculum (Lessons)
                </button>
            </div>

            {/* Content */}
            <div className="p-8 flex-1">
                {activeTab === "details" ? (
                    <form onSubmit={handleCourseSubmit} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Course Type</label>
                                <select
                                    name="course_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    value={formData.course_type}
                                    onChange={handleChange}
                                >
                                    <option value="pre_recorded">Pre-recorded</option>
                                    <option value="one_on_one">One-on-One</option>
                                    <option value="group">Group</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                                <input
                                    type="url"
                                    name="thumbnail_url"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                    value={formData.thumbnail_url}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Lessons</h2>
                            <Button onClick={() => openLessonModal()} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Lesson
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="border rounded-lg p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                                            {lesson.order_index}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                                {lesson.video_url && <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>}
                                                {lesson.content && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> Text</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => openChallengeModal(lesson.id!)} className="gap-1 text-purple-600 border-purple-200 hover:bg-purple-50">
                                            <Code className="h-4 w-4" /> Challenge
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => openLessonModal(lesson)}>
                                            <Edit className="h-4 w-4 text-gray-500" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteLesson(lesson.id!)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {lessons.length === 0 && <p className="text-gray-500 text-center py-8">No lessons yet. Click "Add Lesson" to start.</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Lesson Modal */}
            {isLessonModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">{currentLesson.id ? "Edit Lesson" : "New Lesson"}</h3>
                        <div className="space-y-4">
                            <input
                                placeholder="Lesson Title"
                                className="w-full border p-2 rounded"
                                value={currentLesson.title}
                                onChange={e => setCurrentLesson({ ...currentLesson, title: e.target.value })}
                            />
                            <input
                                placeholder="Order Index"
                                type="number"
                                className="w-full border p-2 rounded"
                                value={currentLesson.order_index}
                                onChange={e => setCurrentLesson({ ...currentLesson, order_index: parseInt(e.target.value) })}
                            />
                            <input
                                placeholder="Video URL (Optional)"
                                className="w-full border p-2 rounded"
                                value={currentLesson.video_url || ""}
                                onChange={e => setCurrentLesson({ ...currentLesson, video_url: e.target.value })}
                            />
                            <textarea
                                placeholder="Content (Markdown)"
                                rows={3}
                                className="w-full border p-2 rounded"
                                value={currentLesson.content || ""}
                                onChange={e => setCurrentLesson({ ...currentLesson, content: e.target.value })}
                            />
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={() => setIsLessonModalOpen(false)}>Cancel</Button>
                                <Button onClick={saveLesson}>Save</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Challenge Modal */}
            {isChallengeModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-xl font-bold flex items-center gap-2"><Code className="h-5 w-5" /> Coding Challenge</h3>
                            <button onClick={() => setIsChallengeModalOpen(false)}><X className="h-6 w-6 text-gray-400" /></button>
                        </div>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            <div className="flex justify-end">
                                <Button
                                    id="ai-gen-btn"
                                    type="button"
                                    onClick={generateAIChallenge}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                                >
                                    ✨ Generate with AI
                                </Button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Slug</label>
                                <input
                                    className="w-full border p-2 rounded font-mono text-sm"
                                    value={currentChallenge.slug}
                                    onChange={e => setCurrentChallenge({ ...currentChallenge, slug: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Problem Statement (Markdown)</label>
                                <textarea
                                    className="w-full border p-2 rounded font-mono text-sm h-32"
                                    value={currentChallenge.problem_statement}
                                    onChange={e => setCurrentChallenge({ ...currentChallenge, problem_statement: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Starter Code</label>
                                <textarea
                                    className="w-full border p-2 rounded font-mono text-sm bg-gray-50 h-32"
                                    value={currentChallenge.starter_code}
                                    onChange={e => setCurrentChallenge({ ...currentChallenge, starter_code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Test Cases (JSON)</label>
                                {/* Simple text area for JSON for now, can improve later */}
                                <textarea
                                    className="w-full border p-2 rounded font-mono text-sm h-32"
                                    placeholder='[{"input": "1, 2", "expected_output": "3"}]'
                                    value={JSON.stringify(currentChallenge.test_cases, null, 2)}
                                    onChange={e => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            setCurrentChallenge({ ...currentChallenge, test_cases: parsed });
                                        } catch (err) {
                                            // Handle invalid JSON gracefully (maybe just ignore until valid)
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-400 mt-1">Format: List of objects with `input` and `expected_output` keys.</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t flex justify-end gap-2 mt-4">
                            <Button variant="ghost" onClick={() => setIsChallengeModalOpen(false)}>Cancel</Button>
                            <Button onClick={saveChallenge} className="bg-purple-600 hover:bg-purple-700 text-white">Save Challenge</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
