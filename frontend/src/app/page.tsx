import Link from "next/link";
import { ArrowRight, Calendar, Users, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white border-b border-gray-200">
        <Link className="flex items-center justify-center font-bold text-2xl text-indigo-600" href="/">
          AAU Clubs
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 text-gray-700" href="/login">
            Sign In
          </Link>
          <Link className="text-sm font-medium text-white bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors" href="/register">
            Get Started
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-gray-900">
                  Connect, Grow, lead at AAU
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover vibrant student communities, join exciting events, and build your network at Addis Ababa University.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50"
                  href="/register"
                >
                  Join Now
                </Link>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  href="/clubs"
                >
                  Explore Clubs
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                  <Users className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Join Communities</h2>
                <p className="text-gray-500">
                  Find clubs that match your interests, from tech to arts, sports to debate.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <Calendar className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attend Events</h2>
                <p className="text-gray-500">
                  Never miss out on workshops, hackathons, and social gatherings happening on campus.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                  <Target className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Lead & Check</h2>
                <p className="text-gray-500">
                  Take on leadership roles, manage club activities, and build your resume.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2026 AAU Club Management. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
