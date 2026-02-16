import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | AAU Club Management System',
    description:
        'Learn about the Addis Ababa University Club Registration and Management System',
};

export default function AboutPage() {
    return (
        <section className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-14">
                    <h1 className="text-4xl font-bold text-gray-900">
                        About Us
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Empowering student communities through digital club management
                    </p>
                </div>

                {/* Who We Are */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Who We Are
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        The Club Registration and Management System is a centralized web
                        platform developed to support student clubs and organizations at{' '}
                        <span className="font-medium">
                            :contentReference[oaicite:0]{index = 0}
                        </span>
                        . It provides an efficient and transparent way for students to
                        discover clubs, register as members, and participate in university
                        activities.
                    </p>
                </div>

                {/* Mission & Vision */}
                <div className="grid gap-8 md:grid-cols-2 mb-12">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Our Mission
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            Our mission is to enhance student engagement by simplifying club
                            registration, improving communication, and supporting organized
                            extracurricular activities across the university.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Our Vision
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            We envision a connected university community where every student
                            can easily access clubs aligned with their interests and actively
                            contribute to campus life.
                        </p>
                    </div>
                </div>

                {/* What We Offer */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        What the Platform Offers
                    </h2>
                    <ul className="grid gap-4 md:grid-cols-2 text-gray-700">
                        <li className="rounded-lg bg-white p-4 shadow-sm">
                            Centralized club registration and management
                        </li>
                        <li className="rounded-lg bg-white p-4 shadow-sm">
                            Secure student authentication and role-based access
                        </li>
                        <li className="rounded-lg bg-white p-4 shadow-sm">
                            Event creation, scheduling, and RSVP tracking
                        </li>
                        <li className="rounded-lg bg-white p-4 shadow-sm">
                            Announcements and notifications for club members
                        </li>
                        <li className="rounded-lg bg-white p-4 shadow-sm">
                            Dashboards for administrators, club leaders, and members
                        </li>
                    </ul>
                </div>

                {/* Users */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Who Can Use This System
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p>
                            <span className="font-medium">Students:</span> Browse clubs, join
                            communities, attend events, and receive updates.
                        </p>
                        <p>
                            <span className="font-medium">Club Leaders:</span> Manage club
                            profiles, members, events, and announcements.
                        </p>
                        <p>
                            <span className="font-medium">Administrators:</span> Oversee all
                            clubs, users, and system activity.
                        </p>
                    </div>
                </div>

                {/* Security & Accessibility */}
                <div className="grid gap-8 md:grid-cols-2 mb-12">
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Security & Reliability
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            The system is built using modern security practices, including
                            secure authentication, data validation, and role-based access
                            control to protect user information.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            Accessibility & Inclusivity
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                            The platform is fully responsive and designed with accessibility
                            in mind, ensuring usability across devices and for all students.
                        </p>
                    </div>
                </div>

                {/* Academic Purpose */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Academic Purpose
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        This system was developed as an academic project to address real
                        university needs while applying modern full-stack development
                        technologies and best practices.
                    </p>
                </div>

                {/* Footer */}
                <div className="border-t pt-6 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} Addis Ababa University — Club Management
                    System
                </div>
            </div>
        </section>
    );
}
