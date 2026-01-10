import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | CodeMaster AI",
    default: "CodeMaster AI | Learn to Code with AI Tutors",
  },
  description: "Master Python programming with interactive lessons, AI-powered code reviews, and gamified challenges.",
};

import ErrorBoundary from "@/components/ErrorBoundary";
import { BugReportModal } from "@/components/BugReportModal";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";

// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
            <BugReportModal />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
