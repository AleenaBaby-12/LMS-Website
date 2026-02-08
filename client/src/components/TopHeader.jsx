import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const TopHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const bellRef = useRef(null);
    const profileRef = useRef(null);

    // Get initials
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showNotifications &&
                bellRef.current &&
                !bellRef.current.contains(event.target) &&
                !event.target.closest('.notification-dropdown')
            ) {
                setShowNotifications(false);
            }

            if (
                showProfileMenu &&
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications, showProfileMenu]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    const toggleNotifications = (e) => {
        e.stopPropagation();
        setShowNotifications(!showNotifications);
        setShowProfileMenu(false);
    };

    const toggleProfileMenu = (e) => {
        e.stopPropagation();
        setShowProfileMenu(!showProfileMenu);
        setShowNotifications(false);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 md:ml-64 sticky top-0 z-20">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        ref={bellRef}
                        onClick={toggleNotifications}
                        className={`relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors ${showNotifications ? 'bg-gray-100 text-blue-600' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown absolute right-0 top-full mt-2 z-50">
                            <NotificationDropdown
                                notifications={notifications}
                                onMarkAsRead={handleMarkAsRead}
                                onMarkAllAsRead={handleMarkAllAsRead}
                                onClose={() => setShowNotifications(false)}
                            />
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <div className="relative" ref={profileRef}>
                    <button
                        onClick={toggleProfileMenu}
                        className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
                            <p className="text-xs text-gray-500 mt-1 uppercase text-right">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200 overflow-hidden">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                initials
                            )}
                        </div>
                        <ChevronDown size={16} className="text-gray-400" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <User size={16} /> My Profile
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <LayoutDashboard size={16} /> Dashboard
                                </Link>
                            </div>
                            <div className="border-t border-gray-100 p-2">
                                <button
                                    onClick={() => { logout(); setShowProfileMenu(false); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
