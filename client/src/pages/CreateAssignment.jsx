import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../services/api'; // Import api instance directly
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';

const CreateAssignment = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if editing
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        points: 100
    });

    useEffect(() => {
        // Fetch courses taught by this teacher
        const fetchCourses = async () => {
            try {
                // Determine appropriate endpoint based on role/API capabilities
                // Assuming we have an endpoint to get courses created by the teacher
                // Or we filter the public courses list for now if specific endpoint missing
                const { data } = await api.get('/courses');
                // Filter client-side if API doesn't filter (fallback)
                const myCourses = data.filter(c => c.instructor._id === user._id || c.instructor === user._id);
                setCourses(myCourses);

                if (myCourses.length > 0 && !isEditMode) {
                    setFormData(prev => ({ ...prev, courseId: myCourses[0]._id }));
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
                setError('Failed to load your courses.');
            } finally {
                if (!isEditMode) setLoading(false);
            }
        };

        const fetchAssignment = async () => {
            if (!isEditMode) return;
            try {
                // We reuse the getMyAssignments and find by ID for now since we don't have a direct getPublicById for teachers easily exposed 
                // OR we can rely on the fact that we created a getSubmissions which expects ID, so maybe we can just GET /assignments/my-assignments and filter
                // Ideally we should have a GET /assignments/:id endpoint
                // But for now, let's fetch my-assignments and filter.
                const { data } = await api.get('/assignments/my-assignments');
                const found = data.find(a => a._id === id || a.id === id);
                if (found) {
                    setFormData({
                        title: found.title,
                        description: found.description,
                        courseId: found.course?._id || found.course,
                        dueDate: found.dueDate ? new Date(found.dueDate).toISOString().slice(0, 16) : '', // Format for datetime-local
                        points: found.points
                    });
                } else {
                    setError('Assignment not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load assignment details');
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchCourses().then(() => fetchAssignment());
        }
    }, [user, id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (isEditMode) {
                await api.put(`/assignments/${id}`, formData);
            } else {
                await api.post('/assignments', formData);
            }
            navigate('/assignments');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save assignment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    if (courses.length === 0) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col md:ml-64">
                    <TopHeader />
                    <div className="p-8 text-center max-w-2xl mx-auto mt-10">
                        <h2 className="text-2xl font-bold text-gray-800">No Courses Found</h2>
                        <p className="text-gray-600 mt-2">You need to create a course before adding an assignment.</p>
                        <button onClick={() => navigate('/create-course')} className="btn btn-primary mt-4">
                            Create a Course
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <TopHeader />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back
                        </button>

                        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                            <div className="mb-8 border-b border-gray-100 pb-4">
                                <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Assignment' : 'Create New Assignment'}</h1>
                                <p className="text-gray-500 mt-1">{isEditMode ? 'Update assignment details.' : 'Add a task for your students to complete.'}</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="input w-full"
                                        placeholder="e.g. React Components Quiz"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question / Description</label>
                                    <textarea
                                        name="description"
                                        rows="12"
                                        className="input w-full resize-y min-h-[300px]"
                                        placeholder="Describe what the students need to do..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Grid Row for Course & Points */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Course Selector */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course</label>
                                        <select
                                            name="courseId"
                                            className="input w-full"
                                            value={formData.courseId}
                                            onChange={handleChange}
                                            required
                                            disabled={isEditMode} // Usually shouldn't change course after creation
                                        >
                                            {courses.map(course => (
                                                <option key={course._id} value={course._id}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Points */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Points</label>
                                        <input
                                            type="number"
                                            name="points"
                                            className="input w-full"
                                            min="0"
                                            value={formData.points}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="dueDate"
                                        className="input w-full md:w-1/2"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-8 py-3 flex items-center gap-2"
                                        disabled={submitting}
                                    >
                                        <Save size={20} />
                                        {submitting ? 'Saving...' : (isEditMode ? 'Update Assignment' : 'Publish Assignment')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CreateAssignment;
