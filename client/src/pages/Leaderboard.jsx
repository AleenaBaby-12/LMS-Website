import { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, Award, User } from 'lucide-react';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/gamification/leaderboard');
                setLeaders(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-500" size={24} />;
            case 1: return <Medal className="text-gray-400" size={24} />;
            case 2: return <Medal className="text-amber-600" size={24} />;
            default: return <span className="text-gray-400 font-bold ml-2">#{index + 1}</span>;
        }
    };

    if (loading) return <div className="text-center mt-10">Loading Leaderboard...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Global Leaderboard</h1>
                <p className="text-gray-600">See how you rank against other top learners on the platform.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="grid grid-cols-12 text-sm font-bold uppercase tracking-wider">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-6">Student</div>
                        <div className="col-span-4 text-center">Badges Earned</div>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {leaders.map((leader, index) => (
                        <div key={index} className={`grid grid-cols-12 items-center p-6 hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-blue-50/30' : ''}`}>
                            <div className="col-span-2 flex justify-center">
                                {getRankIcon(index)}
                            </div>
                            <div className="col-span-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                    {leader.profilePicture ? (
                                        <img src={leader.profilePicture} alt={leader.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{leader.name}</h3>
                                    {index === 0 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Grandmaster</span>}
                                </div>
                            </div>
                            <div className="col-span-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <Award className="text-indigo-600" size={20} />
                                    <span className="text-2xl font-black text-indigo-700">{leader.badgeCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {leaders.length === 0 && (
                        <div className="p-20 text-center text-gray-500">
                            No achievements recorded yet. Start learning to climb the leaderboard!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
