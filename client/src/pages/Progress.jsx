import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const Progress = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completed: 0,
        inProgress: 0,
        averageProgress: 0
    });

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const { data } = await api.get('/enrollments/my-courses');
                setEnrollments(data);

                // Calculate statistics
                const total = data.length;
                const completed = data.filter(e => e.progress === 100).length;
                const inProgress = total - completed;
                const avgProgress = total > 0
                    ? Math.round(data.reduce((sum, e) => sum + (e.progress || 0), 0) / total)
                    : 0;

                setStats({
                    totalCourses: total,
                    completed,
                    inProgress,
                    averageProgress: avgProgress
                });
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading your progress...</div>;

    return (
        <div className="max-w-7xl mx-auto mt-8 px-8">
            <h1 className="text-3xl font-bold mb-8">My Progress</h1>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <BookOpen className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Completed</p>
                            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">In Progress</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Avg Progress</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.averageProgress}%</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Progress List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6">Course Progress Details</h2>

                {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <Link
                                            to={`/courses/${enrollment.course._id}`}
                                            className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                                        >
                                            {enrollment.course.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Instructor: {enrollment.course.instructor?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${enrollment.progress === 100
                                                ? 'bg-green-100 text-green-700'
                                                : enrollment.progress > 0
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {enrollment.progress === 100 ? 'Completed' : enrollment.progress > 0 ? 'In Progress' : 'Not Started'}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span className="font-semibold">{Math.round(enrollment.progress || 0)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-500 ${enrollment.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${enrollment.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-3">
                                    <Link
                                        to={`/courses/${enrollment.course._id}`}
                                        className="text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline"
                                    >
                                        {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning →'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;
