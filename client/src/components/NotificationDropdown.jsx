import { useRef, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const getIcon = (type) => {
    switch (type) {
        case 'success': return <Check size={16} className="text-green-500" />;
        case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
        case 'error': return <AlertCircle size={16} className="text-red-500" />;
        default: return <Info size={16} className="text-blue-500" />;
    }
};

const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        // Mark as read
        if (!notification.isRead) {
            onMarkAsRead(notification._id);
        }

        // Navigate based on type/model
        if (notification.relatedId) {
            if (notification.onModel === 'Assignment') {
                const msgLower = notification.message.toLowerCase();
                if (msgLower.includes('submission') || msgLower.includes('submitted')) {
                    // Redirect to submissions page for teachers
                    navigate(`/assignments/${notification.relatedId}/submissions`);
                } else {
                    navigate(`/assignments/${notification.relatedId}`);
                }
            } else if (notification.onModel === 'Course') {
                navigate(`/courses/${notification.relatedId}`);
            }
        } else {
            // Fallback navigation based on message content
            const msg = notification.message.toLowerCase();
            if (msg.includes('assignment')) {
                navigate('/assignments');
            } else if (msg.includes('course') || msg.includes('enroll')) {
                navigate('/my-courses'); // or /dashboard for teacher
            }
        }

        onClose();
    };

    return (
        <div ref={dropdownRef} className="w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Bell size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 shrink-0 h-fit`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
                    <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
