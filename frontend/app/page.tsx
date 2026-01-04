"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white from-blue-50 to-indigo-50 bg-gradient-to-br">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center sm:px-20">
        <h1 className="mb-6 text-6xl font-bold text-gray-900">
          Master Coding with <span className="text-blue-600">AI</span>
        </h1>

        <p className="mb-10 max-w-2xl text-xl text-gray-600">
          The world's first interactive coding platform that uses an AI Tutor to guide you through every line of code.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login?mode=signup">
            <Button size="lg" className="h-12 px-8 text-lg">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              I have an account
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <FeatureCard
            title="Instant Feedback"
            desc="Get real-time explanations for your errors, not just stack traces."
          />
          <FeatureCard
            title="Socratic Method"
            desc="Our AI asks questions to help you solve problems yourself."
          />
          <FeatureCard
            title="Safe Execution"
            desc="Run your code in a secure, isolated sandboxed environment."
          />
        </div>
      </main>

      <footer className="w-full border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
        © 2024 CodeMaster AI. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  )
}
