import { useState } from 'react';
import { X, Send } from 'lucide-react';
import api from '../services/api';

const ConnectionRequestModal = ({ isOpen, onClose, mentor, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        try {
            console.log('Sending connection request to mentor:', mentor._id);
            setLoading(true);
            const response = await api.post('/mentor-connections/request', {
                mentorId: mentor._id,
                message
            });
            console.log('Connection request sent successfully:', response.data);
            onSuccess();
            onClose();
            setMessage('');
        } catch (error) {
            console.error('Error sending connection request:', error);
            console.error('Error response:', error.response);
            alert(error.response?.data?.message || 'Failed to send request. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mentor) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-t-2xl flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">Send Connection Request</h3>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                            {mentor.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{mentor.name}</h4>
                            {mentor.role === 'teacher' && (
                                <span className="text-xs text-blue-600 font-semibold">Instructor</span>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Add a personal message to introduce yourself (optional):
                    </p>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Hi ${mentor.name}, I'd like to connect with you to learn more about...`}
                        className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-400 mt-1">{message.length}/500 characters</p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Send size={16} />
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectionRequestModal;
