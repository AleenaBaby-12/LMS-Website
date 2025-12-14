import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../services/api';
import { ArrowLeft, Calendar, FileText, Send, Paperclip } from 'lucide-react';

const AssignmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                // We might need a specific endpoint for fetching single assignment details
                // or we can reuse the list and filter (less efficient but works for now)
                // Let's assume we can fetch by ID or filter from the list logic
                // For now, let's try to fetch all and find (since we didn't implement getById in controller yet explicitly for students generally, but getAssignmentsByCourse or getMyAssignments returns it)

                // Ideally backend should have GET /api/assignments/:id
                // But let's check what we have. 
                // We implemented getMyAssignments which returns everything. 
                // We can use that or implement getById. 
                // Let's try to fetch specifically.

                const { data } = await api.get(`/assignments/my-assignments`);
                const found = data.find(a => a._id === id);

                if (found) {
                    setAssignment(found);
                    // If already submitted, pre-fill content? 
                    // The backend response of getMyAssignments has merged submission data?
                    // Yes, we did that. 
                    // Let's check if we have submission content in the response.
                    // The controller merges 'status', 'grade', 'submittedAt'. 
                    // It does NOT merge 'content' of submission currently in getMyAssignments
                    // We might need to fetch submission details if status is submitted.
                } else {
                    setError('Assignment not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load assignment details');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await api.post(`/assignments/${id}/submit`, {
                content,
                // attachments: [] // Implement file upload later
            });
            navigate('/assignments');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit assignment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;
    if (!assignment) return <div className="p-20 text-center">Assignment not found</div>;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <TopHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <button
                            onClick={() => navigate('/assignments')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back to Assignments
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Col: Details */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide
                                            ${assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                    assignment.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {assignment.status}
                                        </span>
                                    </div>

                                    <div className="prose max-w-none text-gray-600 mb-8 shadow-sm p-6 bg-gray-50 rounded-lg border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Question / Instructions</h3>
                                        <p className="whitespace-pre-wrap text-base text-gray-800">{assignment.description}</p>
                                    </div>

                                    {/* Submission Form */}
                                    {assignment.status !== 'graded' && (
                                        <div className="border-t border-gray-100 pt-8">
                                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <FileText size={20} /> Your Submission
                                            </h3>

                                            {error && (
                                                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                                    {error}
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Answer / Content
                                                    </label>
                                                    <textarea
                                                        rows="8"
                                                        className="input w-full p-4 font-mono text-sm"
                                                        placeholder="Type your answer here..."
                                                        value={content}
                                                        onChange={(e) => setContent(e.target.value)}
                                                        required
                                                        disabled={assignment.status === 'submitted'} // Disable editing if already submitted? Or allow resubmit?
                                                    // Let's allow editing for now or just standard text
                                                    ></textarea>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    {/* Placeholder for attachment button */}
                                                    <button type="button" className="btn btn-outline gap-2" disabled>
                                                        <Paperclip size={18} /> Attach File (Coming Soon)
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary gap-2"
                                                        disabled={submitting}
                                                    >
                                                        <Send size={18} />
                                                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {assignment.status === 'graded' && (
                                        <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                                            <h3 className="text-lg font-bold text-green-900 mb-2">Graded</h3>
                                            <p className="text-green-800">
                                                You scored <strong>{assignment.grade}</strong> / {assignment.points}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Meta */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Assignment Info</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Due Date</p>
                                                <p>{new Date(assignment.dueDate).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Total Points</p>
                                                <p>{assignment.points} Points</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                Course: <span className="font-medium text-gray-900">{assignment.course?.title}</span>
                                            </p>
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

export default AssignmentDetails;
