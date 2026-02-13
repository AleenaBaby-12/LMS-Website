import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { X, Send, User, MessageSquare } from 'lucide-react';

const ChatModal = ({ isOpen, onClose, peer, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/messages/${peer._id}`);
            setMessages(data);
            setLoading(false);

            // Mark conversation as read
            await api.put(`/messages/mark-conversation-read/${peer._id}`);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && peer) {
            fetchMessages();
            // Poll for new messages every 5 seconds
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, peer]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await api.get('/auth/profile'); // To ensure user object is fresh
            const sentMessage = await api.post('/messages', {
                recipientId: peer._id,
                content: newMessage
            });

            setMessages(prev => [...prev, sentMessage.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 overflow-hidden">
                            {peer.profilePicture ? (
                                <img src={peer.profilePicture} alt={peer.name} className="w-full h-full object-cover" />
                            ) : (
                                peer.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-none">{peer.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 uppercase font-semibold">{peer.role || 'Mentorship'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender._id === user._id
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${msg.sender._id === user._id ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
