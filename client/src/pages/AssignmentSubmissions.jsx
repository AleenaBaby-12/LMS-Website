import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../services/api';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

const AssignmentSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [loading, setLoading] = useState(true);

    // Grading state
    const [gradingId, setGradingId] = useState(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch submissions
                const { data: subData } = await api.get(`/assignments/${id}/submissions`);
                setSubmissions(subData);

                // Fetch assignment details for title (optional, or just pass it in/store it)
                // For now, let's try to get it from the first submission or a separate call if needed.
                // Or we can just show "Assignment Submissions" generic title if we don't have a getById endpoint.
                // We'll rely on generic title for now or try to extract from previous cache if possible.
                // Actually, let's just use a generic header. 

            } catch (err) {
                console.error("Failed to fetch submissions", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleGradeClick = (sub) => {
        setGradingId(sub._id);
        setGrade(sub.grade || '');
        setFeedback(sub.feedback || '');
    };

    const handleSaveGrade = async (subId) => {
        try {
            const { data } = await api.put(`/assignments/submission/${subId}/grade`, {
                grade: Number(grade),
                feedback
            });

            // Update local state
            setSubmissions(prev => prev.map(s => s._id === subId ? { ...s, ...data } : s));
            setGradingId(null);
            alert('Grade saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save grade');
        }
    };

    if (loading) return <div className="p-20 text-center">Loading submissions...</div>;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <TopHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto">
                        <button
                            onClick={() => navigate('/assignments')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back to Assignments
                        </button>

                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {submissions.length} Submissions
                            </span>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {submissions.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">
                                    No submissions yet for this assignment.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Content</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Grade / Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {submissions.map(sub => (
                                                <tr key={sub._id} className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                                {sub.student?.name?.charAt(0) || 'S'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{sub.student?.name}</p>
                                                                <p className="text-xs text-gray-500">{sub.student?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${sub.status === 'graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {sub.status === 'graded' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                            {sub.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs" title={sub.content}>
                                                            {sub.content}
                                                        </p>
                                                    </td>
                                                    <td className="p-4">
                                                        {gradingId === sub._id ? (
                                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        className="input w-20 py-1 text-sm"
                                                                        placeholder="Pts"
                                                                        value={grade}
                                                                        onChange={e => setGrade(e.target.value)}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleSaveGrade(sub._id)}
                                                                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setGradingId(null)}
                                                                        className="text-gray-500 text-xs hover:text-gray-700"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                                <textarea
                                                                    className="input w-full text-xs p-2"
                                                                    rows="2"
                                                                    placeholder="Feedback..."
                                                                    value={feedback}
                                                                    onChange={e => setFeedback(e.target.value)}
                                                                ></textarea>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-4">
                                                                {sub.status === 'graded' ? (
                                                                    <div>
                                                                        <span className="font-bold text-gray-900">{sub.grade}</span>
                                                                        <span className="text-gray-400 text-xs"> pts</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400 text-sm">-</span>
                                                                )}
                                                                <button
                                                                    onClick={() => handleGradeClick(sub)}
                                                                    className="text-blue-600 text-sm hover:underline font-medium"
                                                                >
                                                                    {sub.status === 'graded' ? 'Edit' : 'Grade'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AssignmentSubmissions;
