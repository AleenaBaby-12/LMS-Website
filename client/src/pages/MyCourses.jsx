import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const MyCourses = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                const { data } = await api.get('/enrollments/my-courses');
                setEnrollments(data);
            } catch (error) {
                console.error('Failed to fetch enrollments', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading your courses...</div>;

    return (
        <div className="max-w-7xl mx-auto mt-8 px-8">
            <h1 className="text-2xl font-bold mb-6">My Learning</h1>

            {enrollments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                    <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="card hover:shadow-lg transition-shadow">
                            {enrollment.course.thumbnail ? (
                                <img
                                    src={enrollment.course.thumbnail}
                                    alt={enrollment.course.title}
                                    className="w-full h-32 object-cover rounded-md mb-4"
                                />
                            ) : (
                                <div className="w-full h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}

                            <h3 className="font-bold text-lg mb-2 line-clamp-1">{enrollment.course.title}</h3>

                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(enrollment.progress || 0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${enrollment.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <Link
                                to={`/courses/${enrollment.course._id}`}
                                className="btn btn-outline w-full text-center"
                            >
                                Continue Learning
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;
