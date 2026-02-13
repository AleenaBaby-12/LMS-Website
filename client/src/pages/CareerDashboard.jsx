import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Target, CheckCircle, Circle, Briefcase, TrendingUp, Users, RefreshCw, Sparkles } from 'lucide-react';
import MentorshipModal from '../components/MentorshipModal';

const CareerDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [availablePaths, setAvailablePaths] = useState([]);
    const [showMentorModal, setShowMentorModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardRes, pathsRes] = await Promise.all([
                api.get('/career/dashboard'),
                api.get('/career/paths')
            ]);

            setAvailablePaths(pathsRes.data);
            if (dashboardRes.data.hasGoal) {
                setDashboardData(dashboardRes.data);
            }
        } catch (error) {
            console.error('Error fetching career data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetGoal = async (pathId) => {
        try {
            await api.post('/career/goal', { careerPathId: pathId });
            fetchData(); // Refresh to show dashboard
        } catch (error) {
            alert('Failed to set career goal');
        }
    };

    if (loading) return <div className="text-center mt-20 text-gray-500">Loading career insights...</div>;

    // 1. Goal Selection View
    if (!dashboardData) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Choose Your Career Path</h1>
                    <p className="text-xl text-gray-600">Select a path to get a personalized roadmap and job recommendations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availablePaths.map(path => (
                        <div key={path._id} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all flex flex-col items-center text-center cursor-pointer group" onClick={() => handleSetGoal(path._id)}>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{path.title}</h3>
                            <p className="text-gray-500 mb-6">{path.description}</p>
                            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Average Salary</div>
                            <p className="text-lg font-bold text-green-600 mb-8">{path.salaryRange}</p>
                            <button className="btn btn-primary w-full py-3 rounded-xl font-bold">Select This Path</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 2. Main Dashboard View
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            <Target className="text-red-500" size={40} />
                            {dashboardData.careerPath} Path
                        </h1>
                        {dashboardData.inferredPath && (
                            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-indigo-200">
                                <Sparkles size={12} /> Recommended for You
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl">{dashboardData.description}</p>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setDashboardData(null)}
                        className="text-gray-400 hover:text-gray-600 font-bold text-sm flex items-center gap-2"
                    >
                        <RefreshCw size={16} /> Change Path
                    </button>
                    <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Career Readiness</p>
                        <div className="flex items-end justify-center gap-1">
                            <span className="text-5xl font-black text-blue-600">{dashboardData.readinessScore}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Roadmap */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="text-green-500" size={24} />
                            Your Learning Roadmap
                        </h2>

                        {dashboardData.roadmap.length > 0 ? (
                            <div className="space-y-4 relative pl-4 border-l-2 border-gray-200 ml-2">
                                {dashboardData.roadmap.map((item, index) => (
                                    <div key={item.courseId} className="relative group">
                                        {/* Timeline Node */}
                                        <div className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white ${item.status === 'completed' ? 'bg-green-500 shadow-green-200 shadow-md' : 'bg-gray-300'}`} />

                                        <div className={`bg-white p-4 rounded-xl border ${item.status === 'completed' ? 'border-green-100 shadow-sm' : 'border-gray-100'} flex items-center gap-4 transition-all`}>
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={item.thumbnail || "https://placehold.co/100x80"} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-base font-bold ${item.status === 'completed' ? 'text-gray-900' : 'text-gray-500'}`}>{item.title}</h4>
                                                <p className={`text-xs font-medium ${item.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {item.status === 'completed' ? 'Completed' : 'Pending'}
                                                </p>
                                            </div>
                                            {item.status !== 'completed' && (
                                                <button
                                                    onClick={() => navigate(`/courses/${item.courseId}`)}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    Start
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 text-center">
                                No courses are currently mapped to this career path.
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Jobs & Mentors */}
                <div className="space-y-12">
                    {/* Job Recommendations */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Briefcase className="text-blue-500" size={24} />
                            Recommended Jobs
                        </h2>
                        <div className="space-y-4">
                            {dashboardData.jobs.map(job => (
                                <div key={job.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                    <p className="text-sm text-gray-500 mb-3">{job.company} • {job.location}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{job.salary}</span>
                                        <button className="text-sm font-bold text-blue-600">Apply</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Mentors Preview */}
                    <section className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Users size={24} className="text-white/80" />
                            <h3 className="text-xl font-bold">Find a Mentor</h3>
                        </div>
                        <p className="text-white/80 text-sm mb-6">Connect with alumni and professionals working as {dashboardData.careerPath}s.</p>
                        <button
                            onClick={() => setShowMentorModal(true)}
                            className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                        >
                            Browse Mentors
                        </button>
                    </section>
                </div>
            </div>

            {/* Mentorship Modal */}
            <MentorshipModal
                isOpen={showMentorModal}
                onClose={() => setShowMentorModal(false)}
                careerPath={dashboardData?.careerPath}
            />
        </div>
    );
};

export default CareerDashboard;
