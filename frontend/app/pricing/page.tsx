"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function PricingPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login?redirect=/pricing");
                return;
            }
            const res = await createCheckoutSession();
            if (res.data.url) {
                window.location.href = res.data.url;
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong initializing checkout.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                    <div className="mt-4 flex items-baseline text-gray-900">
                        <span className="text-5xl font-extrabold tracking-tight">$0</span>
                        <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                    </div>
                    <p className="mt-5 text-lg text-gray-500">Perfect for trying out CodeMaster AI.</p>
                    <ul className="mt-8 space-y-4 flex-1">
                        {['Access to free courses', 'Basic AI Hints', 'Community Support'].map((feat) => (
                            <li key={feat} className="flex items-center">
                                <Check className="h-5 w-5 text-green-500 mr-3" />
                                <span className="text-gray-600">{feat}</span>
                            </li>
                        ))}
                    </ul>
                    <Button className="mt-8 w-full" variant="outline" onClick={() => router.push("/courses")}>
                        Browse Free Courses
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-600 relative flex flex-col transform hover:scale-105 transition-transform duration-300">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        POPULAR
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">CodeMaster Pro</h3>
                    <div className="mt-4 flex items-baseline text-gray-900">
                        <span className="text-5xl font-extrabold tracking-tight">$20</span>
                        <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                    </div>
                    <p className="mt-5 text-lg text-gray-500">Supercharge your learning with AI.</p>
                    <ul className="mt-8 space-y-4 flex-1">
                        {['Unlimited AI Code Reviews', 'Advanced Voice Mode', 'Priority Support', 'Verified Certificate'].map((feat) => (
                            <li key={feat} className="flex items-center">
                                <Check className="h-5 w-5 text-blue-600 mr-3" />
                                <span className="text-gray-700 font-medium">{feat}</span>
                            </li>
                        ))}
                    </ul>
                    <Button
                        className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                        onClick={handleUpgrade}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Upgrade to Pro"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
