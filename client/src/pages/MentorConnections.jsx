import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../services/api';
import { Users, Check, X, Mail, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import ChatModal from '../components/ChatModal';

const MentorConnections = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myConnections, setMyConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeer, setSelectedPeer] = useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, connectionsRes] = await Promise.all([
                user.role === 'teacher' ? api.get('/mentor-connections/pending') : Promise.resolve({ data: [] }),
                api.get('/mentor-connections/my-connections')
            ]);

            setPendingRequests(pendingRes.data);
            setMyConnections(connectionsRes.data);

            // Handle auto-opening chat if chatWith query param exists (Only ONCE per page load)
            if (!hasAutoOpened) {
                const queryParams = new URLSearchParams(location.search);
                const chatWithId = queryParams.get('chatWith');

                if (chatWithId && connectionsRes.data.length > 0) {
                    const connToChat = connectionsRes.data.find(c =>
                        c.student._id === chatWithId || c.mentor._id === chatWithId
                    );
                    if (connToChat) {
                        const peer = user.role === 'teacher' ? connToChat.student : connToChat.mentor;
                        setSelectedPeer(peer);
                        setIsChatOpen(true);
                        setHasAutoOpened(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching mentorship data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (id, status) => {
        try {
            await api.put(`/mentor-connections/${id}/respond`, { status });
            // Refresh data
            fetchData();
        } catch (error) {
            alert('Failed to respond to request');
        }
    };

    const handleChat = (peer) => {
        setSelectedPeer(peer);
        setIsChatOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                <TopHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mentorship Management</h1>
                            <p className="text-gray-500 mt-1">Manage your professional connections and mentorship requests.</p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Pending Requests Section (For Mentors) */}
                                {user.role === 'teacher' && pendingRequests.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Clock className="text-yellow-500" size={20} />
                                            Pending Requests
                                        </h2>
                                        <div className="grid grid-cols-1 gap-4">
                                            {pendingRequests.map(req => (
                                                <div key={req._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer">
                                                            {req.student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{req.student.name}</h3>
                                                            <p className="text-xs text-gray-500">{req.student.email}</p>
                                                        </div>
                                                    </div>

                                                    {req.message && (
                                                        <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm italic text-gray-600">
                                                            "{req.message}"
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleRespond(req._id, 'accepted')}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Check size={16} /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespond(req._id, 'rejected')}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} /> Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* My Connections Section */}
                                <section className="space-y-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Users className="text-blue-600" size={20} />
                                        Connected {user.role === 'teacher' ? 'Students' : 'Mentors'}
                                    </h2>
                                    {myConnections.length === 0 ? (
                                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                                            <Users className="mx-auto text-gray-300 mb-4" size={48} />
                                            <p className="text-gray-500">No active connections yet.</p>
                                            {user.role === 'student' && (
                                                <button
                                                    onClick={() => window.location.href = '/career'}
                                                    className="mt-4 text-blue-600 font-bold hover:underline"
                                                >
                                                    Browse Mentors in Career Dashboard
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {myConnections.map(conn => {
                                                const peer = user.role === 'teacher' ? conn.student : conn.mentor;
                                                return (
                                                    <div key={conn._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 overflow-hidden border border-blue-100">
                                                                {peer.profilePicture ? (
                                                                    <img src={peer.profilePicture} alt={peer.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="font-bold text-xl">{peer.name.charAt(0)}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{peer.name}</h3>
                                                                <p className="text-xs text-gray-500 uppercase font-semibold">{peer.role || 'Mentorship'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <button
                                                                onClick={() => handleChat(peer)}
                                                                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <MessageSquare size={16} />
                                                                <span>Chat Now</span>
                                                                {conn.unreadCount > 0 && (
                                                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse shadow-sm">
                                                                        {conn.unreadCount} New
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {selectedPeer && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => {
                        setIsChatOpen(false);
                        // Clear the chatWith param from URL to prevent re-opening loop
                        if (location.search.includes('chatWith')) {
                            navigate('/mentor-connections', { replace: true });
                        }
                        fetchData();
                    }}
                    peer={selectedPeer}
                    user={user}
                />
            )}
        </div>
    );
};

export default MentorConnections;
