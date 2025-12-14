import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../services/api';
import { Plus, Trash2, Users, BookOpen, Clock, TrendingUp, PlusCircle, FileText } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock Data for Analytics
const analyticsData = [
    { name: 'Mon', students: 4, views: 24 },
    { name: 'Tue', students: 7, views: 35 },
    { name: 'Wed', students: 5, views: 20 },
    { name: 'Thu', students: 12, views: 45 },
    { name: 'Fri', students: 10, views: 50 },
    { name: 'Sat', students: 15, views: 65 },
    { name: 'Sun', students: 18, views: 78 },
];

const TeacherDashboard = () => {
    const [view, setView] = useState('overview'); // overview, courses, students, analytics
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/courses/mine');
                setCourses(data);
                setStats({
                    totalCourses: data.length,
                    totalStudents: data.reduce((acc, curr) => acc + (curr.studentsEnrolled?.length || 0), 0)
                });
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (e, courseId) => {
        e.preventDefault();
        if (window.confirm('Are you sure? This cannot be undone.')) {
            try {
                await api.delete(`/courses/${courseId}`);
                setCourses(prev => prev.filter(c => c._id !== courseId));
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    const handlePublish = async (courseId, currentStatus) => {
        try {
            const { data } = await api.put(`/courses/${courseId}`, { isPublished: !currentStatus });
            setCourses(prev => prev.map(c => c._id === courseId ? { ...c, isPublished: data.isPublished } : c));
        } catch (error) {
            console.error('Publish update failed', error);
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Courses</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalCourses}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Students</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Hours Content</p>
                        <h3 className="text-2xl font-bold text-gray-800">12.5</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Avg Rating</p>
                        <h3 className="text-2xl font-bold text-gray-800">4.8</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Student Engagement</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="students" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Courses List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Recent Courses</h3>
                        <Link to="#" onClick={() => setView('courses')} className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {courses.slice(0, 3).map(course => (
                            <div key={course._id} className="flex gap-3 items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <img
                                    src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`}
                                    alt=""
                                    className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 text-sm truncate">{course.title}</h4>
                                    <p className="text-xs text-gray-500">{course.studentsEnrolled?.length || 0} students</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {course.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-6">
                        <Link to="/create-course" className="btn btn-primary w-full justify-center">
                            <Plus size={18} /> Add New Course
                        </Link>
                        <Link to="/create-assignment" className="btn btn-outline w-full justify-center">
                            <FileText size={18} /> Add New Assignment
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCourses = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
                    <p className="text-gray-500">Manage your existing courses and create new ones.</p>
                </div>
                <Link to="/create-course" className="btn btn-primary">
                    <Plus size={18} /> Create Course
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map(course => (
                    <div key={course._id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                            <img
                                src={course.thumbnail?.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                                    {course.price === 0 ? 'Free' : `$${course.price}`}
                                </span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span
                                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide cursor-pointer ${course.isPublished ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}
                                    onClick={() => handlePublish(course._id, course.isPublished)}
                                >
                                    {course.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <button onClick={(e) => handleDelete(e, course._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{course.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users size={14} /> {course.studentsEnrolled?.length || 0} Students
                                </span>
                                <Link to={`/courses/${course._id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                    Manage &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <Sidebar />
            <TopHeader />
            <main className="md:ml-64 p-6 md:p-10">
                {view === 'overview' && renderOverview()}
                {view === 'courses' && renderCourses()}
                {/* Placeholders for other views could be added here */}
                {view !== 'overview' && view !== 'courses' && (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-300">Feature Coming Soon</h2>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;
