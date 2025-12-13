"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Play,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-zinc-900 dark:text-zinc-100" />
              <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                BudhHub
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/sign-in"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`space-y-8 ${
                mounted ? "animate-fade-in" : "opacity-0"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Modern Learning Platform</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Learn Anything,{" "}
                <span className="bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                  Anytime
                </span>
              </h1>

              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Transform your learning journey with our modern LMS platform.
                Create courses, track progress, and achieve your goals with
                ease.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/onboarding"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-8 py-4 text-base font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all transform hover:scale-105"
                >
                  Start Learning Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-8 py-4 text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Play className="h-5 w-5" />
                  Browse Courses
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    100+
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Courses
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    5K+
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Learners
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    50+
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Instructors
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image/Illustration */}
            <div
              className={`relative ${
                mounted ? "animate-slide-in-right" : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative z-10">
                {/* Placeholder for hero image - Replace with your image URL */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                    alt="Students learning together"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient if image fails to load
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Fallback SVG if image doesn't load */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LearningIllustration />
                  </div>
                </div>

                {/* Floating Cards Animation */}
                <div className="absolute -top-6 -right-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Progress
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        85% Complete
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-4 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Achievement
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        Course Completed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-zinc-200/50 to-transparent dark:from-zinc-800/50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-zinc-200/50 to-transparent dark:from-zinc-800/50 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Powerful features designed to make learning engaging and effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <FeatureCard
              icon={<BookOpen className="h-8 w-8" />}
              title="Structured Courses"
              description="Organize content into modules and lessons. Create comprehensive learning paths that guide learners step by step."
              delay="0"
            />

            {/* Feature 2 */}
            <FeatureCard
              icon={<Play className="h-8 w-8" />}
              title="Video Lessons"
              description="Upload and stream high-quality video content. Support for multiple formats with secure, fast delivery."
              delay="100"
            />

            {/* Feature 3 */}
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Progress Tracking"
              description="Monitor your learning journey with detailed progress tracking. See completion rates and achievements."
              delay="200"
            />

            {/* Feature 4 */}
            <FeatureCard
              icon={<Award className="h-8 w-8" />}
              title="Study Materials"
              description="Download PDFs, documents, and resources. Access supplementary materials anytime, anywhere."
              delay="0"
            />

            {/* Feature 5 */}
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Analytics Dashboard"
              description="Track your performance with detailed analytics. Understand your learning patterns and improve."
              delay="100"
            />

            {/* Feature 6 */}
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Private"
              description="Your data is protected with enterprise-grade security. Learn with confidence and peace of mind."
              delay="200"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Sign Up"
              description="Create your account in seconds. Choose your role as a learner or instructor."
              icon={<Users className="h-6 w-6" />}
            />
            <StepCard
              number="2"
              title="Explore Courses"
              description="Browse our catalog of courses. Filter by category, difficulty, or search by topic."
              icon={<BookOpen className="h-6 w-6" />}
            />
            <StepCard
              number="3"
              title="Start Learning"
              description="Enroll in courses and begin your learning journey. Track progress and earn achievements."
              icon={<Award className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-zinc-300 mb-8">
            Join thousands of learners already on their journey to success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-zinc-900 hover:bg-zinc-100 transition-all transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-zinc-700 bg-transparent px-8 py-4 text-base font-semibold text-white hover:bg-zinc-800 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 dark:bg-zinc-950 border-t border-zinc-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-white" />
                <span className="text-lg font-bold text-white">BudhHub</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Modern learning management system for the digital age.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link
                    href="/courses"
                    className="hover:text-white transition-colors"
                  >
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <span className="text-zinc-400 cursor-default">Features</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <span className="text-zinc-400 cursor-default">
                    Documentation
                  </span>
                </li>
                <li>
                  <span className="text-zinc-400 cursor-default">
                    Test Credentials
                  </span>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link
                    href="/auth/sign-in"
                    className="hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/onboarding"
                    className="hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-zinc-400">
            <p>&copy; 2024 BudhHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className="group p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-500 transition-all hover:shadow-lg"
      style={{
        animationDelay: `${delay}ms`,
        animation: "fade-in 0.6s ease-out forwards",
      }}
    >
      <div className="h-14 w-14 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative text-center">
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm z-10">
        {number}
      </div>
      <div className="pt-8 p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:shadow-lg transition-all">
        <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

// Learning Illustration SVG Component
function LearningIllustration() {
  return (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Background Circle */}
      <circle cx="200" cy="150" r="120" fill="url(#gradient1)" opacity="0.1" />

      {/* Person with Book */}
      <g transform="translate(150, 80)">
        {/* Head */}
        <circle cx="50" cy="30" r="25" fill="#3b82f6" />

        {/* Body */}
        <rect x="35" y="55" width="30" height="40" rx="5" fill="#60a5fa" />

        {/* Book */}
        <rect x="70" y="60" width="25" height="30" rx="2" fill="#fbbf24" />
        <line
          x1="82.5"
          y1="60"
          x2="82.5"
          y2="90"
          stroke="#92400e"
          strokeWidth="1"
        />

        {/* Arms */}
        <ellipse cx="25" cy="70" rx="8" ry="15" fill="#60a5fa" />
        <ellipse cx="75" cy="70" rx="8" ry="15" fill="#60a5fa" />
      </g>

      {/* Learning Icons */}
      <g opacity="0.6">
        <circle cx="100" cy="80" r="15" fill="#10b981" />
        <path
          d="M95 80 L98 83 L105 76"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />

        <circle cx="300" cy="220" r="15" fill="#8b5cf6" />
        <path
          d="M295 220 L298 223 L305 216"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
      </g>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
