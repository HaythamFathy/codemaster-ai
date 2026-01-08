"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use() or await depending on Next.js version. 
    // Since this is Next.js 15+, params is a Promise.
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        thumbnail_url: "",
        course_type: "",
        slug: ""
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}`);
                setFormData({
                    title: res.data.title,
                    description: res.data.description || "",
                    thumbnail_url: res.data.thumbnail_url || "",
                    course_type: res.data.course_type || "pre_recorded",
                    slug: res.data.slug
                });
            } catch (error) {
                console.error("Failed to fetch course", error);
                alert("Failed to load course details");
                router.push("/admin/courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/courses/${id}`, formData);
            router.push("/admin/courses");
        } catch (error) {
            console.error(error);
            alert("Failed to update course");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

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
                        placeholder="https://example.com/image.jpg"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={formData.thumbnail_url}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug (URL Path)</label>
                    <input
                        type="text"
                        name="slug"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-50"
                        value={formData.slug}
                        readOnly={true}
                    />
                    <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation.</p>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
