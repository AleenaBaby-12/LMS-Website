import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useSearchParams } from 'react-router-dom';
import StarRating from '../components/StarRating';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center mt-10">Loading courses...</div>;

    return (
        <div className="max-w-7xl mx-auto mt-8 px-8">
            <h2 className="text-2xl font-bold mb-6">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Available Courses'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCourses.map(course => (
                    <div key={course._id} className="card flex flex-col h-full">
                        <div className="flex-1">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`}
                                    alt={course.title}
                                    className="w-full h-40 object-cover rounded-md mb-3"
                                />
                            ) : (
                                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400 rounded-md mb-3">No Image</div>
                            )}
                            <div className="px-1">
                                <h3 className="text-lg font-bold mb-2 line-clamp-2">{course.title}</h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>

                                {/* Rating Display */}
                                {course.totalReviews > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <StarRating rating={Math.round(course.averageRating)} readonly size={14} />
                                        <span className="text-xs text-gray-600">
                                            {course.averageRating.toFixed(1)} ({course.totalReviews})
                                        </span>
                                    </div>
                                )}

                                <p className="text-xs text-gray-600 mb-2">
                                    <span className="font-medium">Instructor:</span> {course.instructor.name}
                                </p>
                                <p className="text-sm font-semibold text-green-600">
                                    {course.price === 0 ? 'Free' : `₹${course.price}`}
                                </p>
                            </div>
                        </div>
                        <Link to={`/courses/${course._id}`} className="btn btn-primary w-full mt-3">
                            View Course
                        </Link>
                    </div>
                ))}
            </div>
            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No courses found matching your search.</p>
                    {searchQuery && (
                        <Link to="/courses" className="text-blue-600 hover:underline mt-2 inline-block">View all courses</Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseList;
