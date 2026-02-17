"use client";

import React from 'react';
import Link from 'next/link';
import {
    Users, Calendar, Trophy, Globe, ArrowRight,
    Sparkles, BookOpen, Heart, Zap, Menu, X
} from 'lucide-react';

const HomePage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const featuredClubs = [
        { id: 1, name: 'Robotics Club', members: 45, category: 'Technology', image: '🤖' },
        { id: 2, name: 'Basketball Team', members: 28, category: 'Sports', image: '🏀' },
        { id: 3, name: 'Debate Society', members: 35, category: 'Academic', image: '🎯' },
        { id: 4, name: 'Music Collective', members: 52, category: 'Arts', image: '🎵' },
    ];

    const upcomingEvents = [
        { id: 1, title: 'Club Fair 2024', date: 'Mar 15', time: '10:00 AM', location: 'Student Center' },
        { id: 2, title: 'Hackathon', date: 'Mar 20', time: '9:00 AM', location: 'Engineering Bldg' },
        { id: 3, title: 'Sports Tournament', date: 'Mar 25', time: '2:00 PM', location: 'Sports Complex' },
    ];

    const stats = [
        { icon: Users, value: '500+', label: 'Active Members' },
        { icon: Trophy, value: '25+', label: 'Clubs' },
        { icon: Calendar, value: '100+', label: 'Events/Year' },
        { icon: Globe, value: '10+', label: 'Categories' },
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'rgb(2 116 181 / 50%)' }}>
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Trophy className="h-8 w-8 text-[rgb(2_116_181_/_50%)]" />
                            <span className="ml-2 text-xl font-bold text-gray-800">AAU Clubs</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-gray-600 hover:text-[rgb(2_116_181_/_50%)]">Home</a>
                            <a href="#featured-clubs" className="text-gray-600 hover:text-[rgb(2_116_181_/_50%)]">Clubs</a>
                            <a href="#upcoming-events" className="text-gray-600 hover:text-[rgb(2_116_181_/_50%)]">Events</a>
                            <a href="#about" className="text-gray-600 hover:text-[rgb(2_116_181_/_50%)]">About</a>
                            <Link href="/login" className="px-4 py-2 bg-[rgb(2_116_181_/_50%)] text-white rounded-lg hover:bg-[rgb(2_116_181_/_70%)]">
                                Sign In
                            </Link>
                            <Link href="/register" className="px-4 py-2 bg-[rgb(2_116_181)] text-white rounded-lg hover:bg-[rgb(2_116_181_/_80%)]">
                                Register
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden flex items-center"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">Home</a>
                            <a href="#featured-clubs" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">Clubs</a>
                            <a href="#upcoming-events" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">Events</a>
                            <a href="#about" className="block px-3 py-2 text-gray-600 hover:bg-gray-50">About</a>
                            <div className="pt-4 space-y-2">
                                <Link href="/login" className="block w-full text-center px-4 py-2 bg-[rgb(2_116_181_/_50%)] text-white rounded-lg">Sign In</Link>
                                <Link href="/register" className="block w-full text-center px-4 py-2 bg-[rgb(2_116_181)] text-white rounded-lg">Register</Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="bg-[rgb(2_116_181_/_50%)] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                Discover Your Passion at AAU
                            </h1>
                            <p className="text-xl mb-8 text-white/90">
                                Join clubs, connect with like-minded students, and make the most of your university life.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/clubs" className="px-8 py-3 bg-white text-[rgb(2_116_181_/_50%)] rounded-lg font-semibold hover:bg-gray-100 flex items-center">
                                    Explore Clubs <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
                                    Learn More
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                                    <Users className="h-8 w-8 mb-4" />
                                    <h3 className="font-semibold">Community</h3>
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                                    <Trophy className="h-8 w-8 mb-4" />
                                    <h3 className="font-semibold">Achievement</h3>
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                                    <Heart className="h-8 w-8 mb-4" />
                                    <h3 className="font-semibold">Growth</h3>
                                </div>
                                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                                    <Zap className="h-8 w-8 mb-4" />
                                    <h3 className="font-semibold">Innovation</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <stat.icon className="h-8 w-8 mx-auto mb-3 text-[rgb(2_116_181_/_50%)]" />
                                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            Empowering student communities through digital club management
                        </p>
                    </div>

                    {/* Who We Are */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Who We Are</h3>
                        <p className="text-gray-700 leading-relaxed">
                            The Club Registration and Management System is a centralized web platform developed to support student clubs and organizations at{' '}
                            <span className="font-medium">Addis Ababa University</span>.
                            It provides an efficient and transparent way for students to discover clubs, register as members, and participate in university activities.
                        </p>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid gap-8 md:grid-cols-2 mb-12">
                        <div className="rounded-xl bg-gray-50 p-6 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Our mission is to enhance student engagement by simplifying club registration, improving communication, and supporting organized extracurricular activities across the university.
                            </p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-6 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Vision</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We envision a connected university community where every student can easily access clubs aligned with their interests and actively contribute to campus life.
                            </p>
                        </div>
                    </div>

                    {/* What We Offer */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6">What the Platform Offers</h3>
                        <ul className="grid gap-4 md:grid-cols-2 text-gray-700">
                            <li className="rounded-lg bg-gray-50 p-4 shadow-sm border border-gray-100">Centralized club registration and management</li>
                            <li className="rounded-lg bg-gray-50 p-4 shadow-sm border border-gray-100">Secure student authentication and role-based access</li>
                            <li className="rounded-lg bg-gray-50 p-4 shadow-sm border border-gray-100">Event creation, scheduling, and RSVP tracking</li>
                            <li className="rounded-lg bg-gray-50 p-4 shadow-sm border border-gray-100">Announcements and notifications for club members</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Featured Clubs */}
            <section id="featured-clubs" className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Clubs</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover the most active and exciting clubs on campus
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredClubs.map((club) => (
                            <div key={club.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                                <div className="text-4xl mb-4">{club.image}</div>
                                <h3 className="font-semibold text-gray-800 mb-1">{club.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{club.category}</p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-1" />
                                    {club.members} members
                                </div>
                                <button className="mt-4 text-[rgb(2_116_181_/_50%)] hover:text-[rgb(2_116_181_/_70%)] text-sm font-medium flex items-center">
                                    View Club <ArrowRight className="ml-1 h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            View All Clubs
                        </button>
                    </div>
                </div>
            </section>

            {/* Upcoming Events */}
            <section id="upcoming-events" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
                            <p className="text-gray-600 mt-2">Don't miss out on these exciting activities</p>
                        </div>
                        <button className="text-[rgb(2_116_181_/_50%)] hover:text-[rgb(2_116_181_/_70%)] font-medium hidden md:block">
                            View Calendar →
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 bg-[rgb(2_116_181_/_10%)] text-[rgb(2_116_181)] text-sm font-medium rounded-full">
                                        {event.date}
                                    </span>
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
                                <p className="text-gray-600 text-sm mb-1">{event.time}</p>
                                <p className="text-gray-600 text-sm">{event.location}</p>
                                <button className="mt-4 text-[rgb(2_116_181_/_50%)] hover:text-[rgb(2_116_181_/_70%)] text-sm font-medium">
                                    Learn More →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-[rgb(2_116_181_/_50%)]">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Involved?</h2>
                    <p className="text-xl text-white/90 mb-8">
                        Join a community of passionate students and make your mark at AAU
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-3 bg-white text-[rgb(2_116_181_/_50%)] rounded-lg font-semibold hover:bg-gray-100">
                            Browse All Clubs
                        </button>
                        <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Trophy className="h-6 w-6 text-[rgb(2_116_181_/_50%)]" />
                                <span className="ml-2 text-white font-bold">AAU Clubs</span>
                            </div>
                            <p className="text-sm">Empowering students to connect, learn, and grow through campus clubs.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                                <li><a href="#" className="hover:text-white">FAQ</a></li>
                                <li><a href="#" className="hover:text-white">Support</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Facebook</a></li>
                                <li><a href="#" className="hover:text-white">Twitter</a></li>
                                <li><a href="#" className="hover:text-white">Instagram</a></li>
                                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                        <p>&copy; 2024 AAU Club Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;