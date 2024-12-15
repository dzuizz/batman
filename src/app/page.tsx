'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Globe, Shield, Gauge, BarChart, Users, Clock, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
    const stats = [
        { label: 'Cities Using Platform', value: '50+' },
        { label: 'Data Points Processed', value: '1M+' },
        { label: 'Response Time', value: '<2ms' },
        { label: 'User Satisfaction', value: '98%' },
    ];

    const testimonials = [
        {
            quote: "Transformed how we manage our city's infrastructure",
            author: "Sarah Chen",
            role: "City Manager, Metropolitan Hub",
            image: "/api/placeholder/64/64"
        },
        {
            quote: "Real-time insights that actually make a difference",
            author: "Marcus Rodriguez",
            role: "Urban Planning Director",
            image: "/api/placeholder/64/64"
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section with Animation */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-violet-100/30 dark:bg-grid-violet-700/30 animate-pulse"></div>
                <div className="relative">
                    <div className="text-center space-y-8">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-6 animate-fade-in">
                            Mahakam AI Dashboard
                        </h1>
                        <p className="text-xl text-violet-700 dark:text-violet-300 mb-8 max-w-3xl mx-auto animate-slide-up">
                            Empower your city management with real-time insights and data-driven decision making
                        </p>
                        <div className="flex justify-center gap-4 animate-fade-in-up">
                            <Link href="/dashboard">
                                <Button size="lg" variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white">
                                    Launch Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="https://github.com/dzuizz/batman">
                                <Button size="lg" variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-white">
                                    View on GitHub
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-violet-100/50 dark:bg-violet-900/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center transform hover:scale-105 transition-transform">
                            <div className="text-3xl font-bold text-purple-500 dark:text-purple-300">{stat.value}</div>
                            <div className="text-sm text-violet-700 dark:text-violet-400">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-violet-900 dark:text-violet-100 mb-12">
                    Powerful Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Globe, title: "Real-time Location", desc: "Precise geolocation tracking for accurate regional monitoring" },
                        { icon: Shield, title: "Emergency Response", desc: "Monitor and manage emergency situations with live updates" },
                        { icon: Gauge, title: "Infrastructure Metrics", desc: "Track utility systems and public infrastructure status" },
                        { icon: BarChart, title: "Data Visualization", desc: "Interactive charts and graphs for better insight" },
                        { icon: Users, title: "Community Engagement", desc: "Foster citizen participation and feedback" },
                        { icon: Clock, title: "Predictive Analytics", desc: "Forecast trends and optimize resource allocation" },
                        { icon: Zap, title: "Quick Actions", desc: "Rapid response protocols and automated workflows" },
                        { icon: Brain, title: "AI Integration", desc: "Smart algorithms for intelligent decision support" }
                    ].map((feature, index) => (
                        <Card key={index} className="transform hover:scale-105 transition-all hover:shadow-lg bg-white/80 dark:bg-violet-950/80 border-violet-100 dark:border-violet-400/20">
                            <CardHeader>
                                <feature.icon data-tip={feature.desc} className="h-8 w-8 text-purple-400 dark:text-purple-300 mb-2" />
                                <CardTitle className="text-violet-900 dark:text-violet-100">{feature.title}</CardTitle>
                                <CardDescription className="text-violet-700 dark:text-violet-300">{feature.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-violet-900 dark:text-violet-100 mb-12">
                    What Our Users Say
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                            <div className="flex items-center mb-4">
                                <Image
                                    src={testimonial.image}
                                    alt={testimonial.author}
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                    style={{ width: 'auto', height: 'auto' }}
                                />
                                <div className="ml-4">
                                    <p className="text-lg font-semibold text-violet-900 dark:text-violet-100">{testimonial.author}</p>
                                    <p className="text-sm text-violet-700 dark:text-violet-300">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{testimonial.quote}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-violet-900 dark:text-violet-100 mb-12">
                    Built With Modern Tech
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { name: "Next.js 14", desc: "React Framework" },
                        { name: "TypeScript", desc: "Type Safety" },
                        { name: "Tailwind CSS", desc: "Styling" },
                        { name: "Recharts", desc: "Data Visualization" }
                    ].map((tech, index) => (
                        <div key={index} className="p-6 rounded-lg bg-white/80 dark:bg-violet-950/80 shadow-lg transform hover:scale-105 transition-all border border-violet-100 dark:border-violet-400/20">
                            <h3 className="font-semibold mb-2 text-violet-900 dark:text-violet-100">{tech.name}</h3>
                            <p className="text-violet-700 dark:text-violet-300">{tech.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30">
                <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                        Ready to Transform Your City?
                    </h2>
                    <p className="text-xl text-violet-700 dark:text-violet-300 max-w-2xl mx-auto">
                        Join the growing network of smart cities using our platform
                    </p>
                    <Button size="lg" className="bg-violet-200 hover:bg-violet-300 text-violet-900 dark:bg-violet-300/80 dark:hover:bg-violet-300 dark:text-violet-950 transform transition-all hover:scale-105">
                        Get Started Today
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-violet-100 dark:border-violet-400/20">
                <div className="text-center text-violet-700 dark:text-violet-300 space-y-4">
                    <p>© 2024 Smart City Dashboard. All rights reserved.</p>
                    <div className="flex justify-center space-x-6">
                        <Link href="#" className="hover:text-violet-900 dark:hover:text-violet-100 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="hover:text-violet-900 dark:hover:text-violet-100 transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="#" className="hover:text-violet-900 dark:hover:text-violet-100 transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}