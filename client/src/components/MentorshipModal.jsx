import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, Briefcase, X, UserPlus, Clock, CheckCircle, MessageSquare, Award, Globe } from 'lucide-react';
import ConnectionRequestModal from './ConnectionRequestModal';

const MentorshipModal = ({ isOpen, onClose, careerPath }) => {
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMentors();
        }
    }, [isOpen, careerPath]);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/mentors?careerPath=${careerPath}`);
            setMentors(data);

            // Fetch connection status for each mentor
            const statuses = {};
            for (const mentor of data) {
                try {
                    const { data: statusData } = await api.get(`/mentor-connections/status/${mentor._id}`);
                    statuses[mentor._id] = statusData;
                } catch (error) {
                    statuses[mentor._id] = { status: 'none' };
                }
            }
            setConnectionStatuses(statuses);
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectClick = (mentor) => {
        setSelectedMentor(mentor);
        setShowRequestModal(true);
    };

    const handleRequestSuccess = () => {
        fetchMentors(); // Refresh to update statuses
    };

    const getActionButton = (mentor) => {
        const status = connectionStatuses[mentor._id];

        if (!status || status.status === 'none') {
            return (
                <button
                    onClick={() => handleConnectClick(mentor)}
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                    <UserPlus size={16} />
                    Send Connection Request
                </button>
            );
        }

        if (status.status === 'pending') {
            return (
                <button
                    disabled
                    className="w-full bg-yellow-50 text-yellow-700 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-yellow-200"
                >
                    <Clock size={16} />
                    Request Pending
                </button>
            );
        }

        if (status.status === 'accepted') {
            return (
                <button
                    onClick={() => navigate(`/mentor-connections?chatWith=${mentor._id}`)}
                    className="w-full bg-green-50 text-green-700 py-2.5 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2 border border-green-200"
                >
                    <MessageSquare size={16} />
                    Open Chat
                </button>
            );
        }

        if (status.status === 'rejected') {
            return (
                <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                >
                    Request Declined
                </button>
            );
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="text-white" size={28} />
                            <h2 className="text-2xl font-bold text-white">Find a Mentor</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading mentors...</div>
                        ) : mentors.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto text-gray-300 mb-4" size={64} />
                                <p className="text-gray-500 text-lg">No mentors available for this career path yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {mentors.map(mentor => (
                                    <div
                                        key={mentor._id}
                                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group flex flex-col"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden border-2 border-white shadow-md">
                                                {mentor.profilePicture ? (
                                                    <img src={mentor.profilePicture} alt={mentor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    mentor.name.charAt(0)
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{mentor.name}</h3>
                                                {mentor.professionalTitle ? (
                                                    <p className="text-sm font-semibold text-blue-600 mt-0.5">
                                                        {mentor.professionalTitle} {mentor.organization && <span className="text-gray-400 font-normal">at {mentor.organization}</span>}
                                                    </p>
                                                ) : (
                                                    mentor.role === 'teacher' && (
                                                        <span className="inline-block bg-blue-50 text-blue-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 border border-blue-100">
                                                            LMS Instructor
                                                        </span>
                                                    )
                                                )}
                                                {mentor.careerGoal && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5 bg-gray-50 py-1 px-2 rounded-lg w-fit">
                                                        <Briefcase size={12} />
                                                        <span>{mentor.careerGoal.title}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {mentor.mentorBio || mentor.bio || "Experienced professional ready to help you grow through personalized mentorship."}
                                            </p>

                                            {(mentor.qualifications || mentor.linkedIn || mentor.website) && (
                                                <div className="pt-4 border-t border-gray-50 space-y-3">
                                                    {mentor.qualifications && (
                                                        <div className="flex items-start gap-2">
                                                            <div className="p-1 bg-blue-50 rounded text-blue-600">
                                                                <Award size={14} />
                                                            </div>
                                                            <p className="text-xs text-gray-500 italic"><span className="font-bold text-gray-700 not-italic">Qualifications:</span> {mentor.qualifications}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3">
                                                        {mentor.linkedIn && (
                                                            <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                                            </a>
                                                        )}
                                                        {mentor.website && (
                                                            <a href={mentor.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-all shadow-sm">
                                                                <Globe size={16} />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-gray-100">
                                            {getActionButton(mentor)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Connection Request Modal */}
            <ConnectionRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                mentor={selectedMentor}
                onSuccess={handleRequestSuccess}
            />
        </>
    );
};

export default MentorshipModal;
