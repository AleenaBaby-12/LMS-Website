import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../services/api';
import {
    BookOpen,
    Clock,
    CheckCircle,
    TrendingUp,
    AlertCircle,
    PlayCircle,
    Calendar,
    Award,
    ShoppingCart
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

const AvailableCoursesList = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        api.get('/courses').then(({ data }) => setCourses(data.slice(0, 3))).catch(console.error);
    }, []);

    if (courses.length === 0) return null;

    return (
        <div className="space-y-4">
            {courses.map(course => (
                <div key={course._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4 items-center">
                    <div className="w-48 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`}
                                alt={course.title}
                                className="w-full h-full object-cover object-center"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen size={24} /></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{course.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{course.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-500">
                            <span>{course.instructor?.name || 'Instructor'}</span>
                            <span>•</span>
                            <span className="text-green-600">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
                        </div>
                    </div>
                    <Link to={`/courses/${course._id}`} className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                        <ShoppingCart size={20} />
                    </Link>
                </div>
            ))}
        </div>
    );
};

const StudentDashboard = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        completed: 0,
        inProgress: 0,
        totalHours: 0,
        assignmentsPending: 2 // Mock data for now
    });

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const { data } = await api.get('/enrollments/my-courses');
            setEnrollments(data);

            // Calculate stats
            const completed = data.filter(e => e.progress === 100).length;
            const inProgress = data.length - completed;
            setStats(prev => ({ ...prev, completed, inProgress }));
        } catch (error) {
            console.error('Error fetching student data:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // Mock data for charts
    const chartData = [
        { name: 'Completed', value: stats.completed, color: '#10B981' },
        { name: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <TopHeader />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
                            <p className="text-gray-500 mt-1">Track your progress and continue learning.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <BookOpen size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Enrolled Courses</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{enrollments.length}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Completed</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stats.completed}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Hours Spent</p>
                                    <h3 className="text-2xl font-bold text-gray-900">12.5h</h3>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Avg. Grade</p>
                                    <h3 className="text-2xl font-bold text-gray-900">A-</h3>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content: Enrolled Courses */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">In Progress</h2>
                                    <Link to="/my-learning" className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</Link>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <p>Loading your courses...</p>
                                    ) : enrollments.length > 0 ? (
                                        enrollments.map((enrollment) => (
                                            <div key={enrollment._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-4 items-center">
                                                {/* Course Image */}
                                                <div className="w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                                                    {enrollment.course?.thumbnail ? (
                                                        <img
                                                            src={enrollment.course.thumbnail}
                                                            alt={enrollment.course.title}
                                                            className="w-full h-full object-cover object-center"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <BookOpen size={20} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-900 truncate">{enrollment.course?.title || 'Unknown Course'}</h3>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{enrollment.course?.description}</p>

                                                    {/* Progress Bar */}
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                                                            <span>{Math.round(enrollment.progress || 0)}% Complete</span>
                                                            <span>{enrollment.completedLessons?.length || 0} Lessons Completed</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${enrollment.progress || 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <Link
                                                    to={`/learn/${enrollment.course?._id}`}
                                                    className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                >
                                                    <PlayCircle size={20} />
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                            <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-3">
                                                <BookOpen size={24} />
                                            </div>
                                            <h3 className="font-medium text-gray-900">No courses yet</h3>
                                            <p className="text-sm text-gray-500 mt-1 mb-4">Explore our catalog and start learning.</p>
                                            <Link to="/courses" className="btn btn-primary btn-sm">Browse Courses</Link>
                                        </div>
                                    )}
                                </div>

                                {/* Available Courses Section ADDED HERE */}
                                <div className="pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Available Courses</h2>
                                        <Link to="/courses" className="text-sm text-blue-600 font-medium hover:text-blue-700">Browse Catalog</Link>
                                    </div>
                                    <AvailableCoursesList />
                                </div>
                            </div>

                            {/* Sidebar: Assignments & Analytics */}
                            <div className="space-y-8">
                                {/* Assignments */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-900">Up Next</h3>
                                        <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded-full">2 Pending</span>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                                <div className="mt-1 text-gray-400">
                                                    <AlertCircle size={16} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-800">React Components Quiz</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <Calendar size={10} /> Due tomorrow, 11:59 PM
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-4 btn btn-outline btn-sm">View All Assignments</button>
                                </div>

                                {/* Mini Analytics */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Learning Activity</h3>
                                    <div className="h-48 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-4 text-xs text-gray-500 mt-2">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span> In Progress
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;
