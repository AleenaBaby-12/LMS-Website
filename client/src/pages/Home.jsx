import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, BarChart2, Users, Shield, Smartphone, ArrowRight, Mail, Github, Twitter, Linkedin, TrendingUp } from 'lucide-react';

const Home = () => {
    return (
        <div className="font-sans text-gray-900">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 to-white pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left z-10">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 mb-6">
                            Empower Your <span className="text-blue-600">Learning Journey</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0">
                            Unlock your potential with our advanced learning platform. Master new skills through interactive assignments, real-time progress tracking, and seamless collaboration.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to="/register" className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1">
                                Get Started <ArrowRight className="ml-2" size={20} />
                            </Link>
                            <Link to="/courses" className="btn btn-outline text-lg px-8 py-4 border-2">
                                Browse Courses
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 relative z-10 w-full max-w-xl md:max-w-none">
                        <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="/assets/hero-dashboard.png"
                                alt="LMS Dashboard Preview"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {/* Decorative background blobs */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide">Features</h2>
                        <h3 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Everything You Need to Succeed</h3>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Our platform provides comprehensive tools for both students and instructors to enhance the educational experience.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: BookOpen, title: 'Course Management', desc: 'Create and organize diverse courses with rich multimedia content.' },
                            { icon: CheckCircle, title: 'Assignments & Quizzes', desc: 'Test your knowledge with interactive quizzes and practical assignments.' },
                            { icon: BarChart2, title: 'Progress Tracking', desc: 'Monitor your growth with detailed analytics and performance insights.' },
                            { icon: Users, title: 'Teacher Dashboard', desc: 'Instructors can easily grade assignments and manage student enrollments.' }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-8 transition-all hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 group">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="about" className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Platform?</h2>
                        <div className="space-y-8">
                            {[
                                { icon: Shield, title: 'Easy & Secure Access', desc: 'Login securely from anywhere using our robust authentication system.' },
                                { icon: CheckCircle, title: 'Transparent Grading', desc: 'Get instant feedback and clear grading criteria for all your submissions.' },
                                { icon: Smartphone, title: 'Mobile Friendly', desc: 'Learn on the go with our fully responsive design optimized for all devices.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            <item.icon size={20} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                                        <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-1/2 bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-6 animate-pulse">
                                <BarChart2 size={40} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Real-Time Analytics</h3>
                            <p className="text-gray-400 mb-6">Visualise your learning curve.</p>
                            <div className="h-4 bg-gray-700 rounded-full w-3/4 mx-auto mb-3 overflow-hidden">
                                <div className="h-full bg-blue-500 w-2/3"></div>
                            </div>
                            <div className="h-4 bg-gray-700 rounded-full w-1/2 mx-auto"></div>
                        </div>
                    </div>
                </div>
                {/* Background overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <Link to="/" className="flex items-center gap-2 text-3xl font-bold tracking-tight mb-6">
                                <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-lg text-white">
                                    <TrendingUp size={28} strokeWidth={2.5} />
                                </div>
                                <span className="text-gray-900">Skill<span className="text-blue-600">Spire</span></span>
                            </Link>
                            <p className="text-gray-500 leading-relaxed">
                                Empowering learners worldwide with accessible, high-quality education technology.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Product</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                                <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Courses</Link></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li><a href="#about" className="hover:text-blue-600 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
                            <ul className="space-y-3 text-gray-600">
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} SkillSpire. All rights reserved.</p>
                        <div className="flex gap-6 text-gray-400">
                            <a href="#" className="hover:text-blue-600 transition-colors"><Github size={20} /></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><Linkedin size={20} /></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><Mail size={20} /></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
