import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import {
    FileText,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    Trash2,
    Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Assignments = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // New Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [showCourseFilter, setShowCourseFilter] = useState(false);

    const matchRole = (roles) => roles.includes(user?.role);

    // Define tabs based on role
    const tabs = matchRole(['teacher', 'admin'])
        ? ['all', 'active', 'overdue']
        : ['all', 'pending', 'submitted', 'graded', 'overdue'];

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await api.get('/assignments/my-assignments');
                setAssignments(data);
            } catch (error) {
                console.error('Failed to fetch assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    // Extract unique courses for filter
    const uniqueCourses = [...new Map(assignments.filter(a => a.course).map(a => [a.course._id, a.course])).values()];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'graded': return 'bg-green-50 text-green-700 border-green-200';
            case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
            case 'active': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'submitted': return <CheckCircle size={16} />;
            case 'graded': return <CheckCircle size={16} />;
            case 'overdue': return <AlertCircle size={16} />;
            case 'active': return <CheckCircle size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    const filteredAssignments = assignments.filter(assignment => {
        // Tab Filter
        if (filter !== 'all') {
            if (filter === 'submitted') {
                // Show both submitted and graded assignments in 'submitted' tab
                if (assignment.status !== 'submitted' && assignment.status !== 'graded') return false;
            } else if (assignment.status !== filter) {
                return false;
            }
        }

        // Search Filter (Title or Course Name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesTitle = assignment.title.toLowerCase().includes(query);
            const matchesCourse = assignment.course?.title?.toLowerCase().includes(query);
            if (!matchesTitle && !matchesCourse) return false;
        }

        // Course Filter
        if (selectedCourse !== 'all' && assignment.course?._id !== selectedCourse) return false;

        return true;
    });

    if (loading) return <div className="text-center p-20">Loading assignments...</div>;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <TopHeader />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                                <p className="text-gray-500 mt-1">Manage your coursework and deadlines.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search assignments..."
                                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <button
                                        className={`btn gap-2 hidden md:flex ${showCourseFilter ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setShowCourseFilter(!showCourseFilter)}
                                    >
                                        <Filter size={20} /> Filter
                                    </button>

                                    {/* Filter Dropdown */}
                                    {showCourseFilter && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">By Course</div>
                                            <button
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCourse === 'all' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                                onClick={() => { setSelectedCourse('all'); setShowCourseFilter(false); }}
                                            >
                                                All Courses
                                            </button>
                                            {uniqueCourses.map(course => (
                                                <button
                                                    key={course._id}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${selectedCourse === course._id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                                    onClick={() => { setSelectedCourse(course._id); setShowCourseFilter(false); }}
                                                >
                                                    {course.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${filter === tab
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Assignments List */}
                        <div className="space-y-4">
                            {filteredAssignments.length > 0 ? (
                                filteredAssignments.map((assignment) => (
                                    <div key={assignment._id || assignment.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${getStatusColor(assignment.status)} bg-opacity-50`}>
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {assignment.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">{assignment.course?.title || 'Unknown Course'}</p>
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 md:line-clamp-1 max-w-2xl">
                                                        {assignment.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2 shrink-0">
                                                <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 uppercase tracking-wide ${getStatusColor(assignment.status)}`}>
                                                    {getStatusIcon(assignment.status)}
                                                    {assignment.status}
                                                </div>

                                                {assignment.status === 'graded' ? (
                                                    <div className="text-right">
                                                        <span className="text-lg font-bold text-gray-900">{assignment.grade}/{assignment.points}</span>
                                                        <span className="text-xs text-gray-500 block">Score</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-right text-gray-500 text-sm flex items-center gap-1.5">
                                                        <Calendar size={14} />
                                                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        {/* Action Footer */}
                                        {assignment.status === 'pending' && (
                                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                                <button
                                                    onClick={() => navigate(`/assignments/${assignment._id || assignment.id}`)}
                                                    className="btn btn-primary btn-sm gap-2"
                                                >
                                                    Start Assignment <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {assignment.status === 'active' && (
                                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete this assignment?')) {
                                                            try {
                                                                await api.delete(`/assignments/${assignment._id || assignment.id}`);
                                                                setAssignments(prev => prev.filter(a => (a._id || a.id) !== (assignment._id || assignment.id)));
                                                            } catch (err) {
                                                                console.error("Failed to delete", err);
                                                                alert('Failed to delete assignment');
                                                            }
                                                        }
                                                    }}
                                                    className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                                                    title="Delete Assignment"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/assignments/edit/${assignment._id || assignment.id}`)}
                                                    className="btn btn-ghost btn-sm text-gray-500 hover:bg-gray-100"
                                                    title="Edit Assignment"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/assignments/${assignment._id || assignment.id}/submissions`)}
                                                    className="btn btn-outline btn-sm gap-2"
                                                >
                                                    View Submissions <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                                    <div className="inline-flex p-4 rounded-full bg-gray-50 text-gray-400 mb-3">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="font-medium text-gray-900">No assignments found</h3>
                                    <p className="text-sm text-gray-500 mt-1">No assignments match the selected filter.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Assignments;
