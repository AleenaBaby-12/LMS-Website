import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    BarChart2,
    LogOut,
    GraduationCap,
    FileText
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const teacherLinks = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/my-courses', label: 'My Courses', icon: BookOpen },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/assignments', label: 'Assignments', icon: FileText },
        { path: '/analytics', label: 'Analytics', icon: BarChart2 },
    ];

    const studentLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/courses', label: 'Browse Courses', icon: BookOpen },
        { path: '/my-learning', label: 'My Learning', icon: GraduationCap },
        { path: '/assignments', label: 'Assignments', icon: FileText },
        { path: '/progress', label: 'My Progress', icon: BarChart2 },
    ];

    const navItems = user?.role === 'student' ? studentLinks : teacherLinks;

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen hidden md:flex flex-col fixed left-0 top-0 overflow-y-auto sidebar-scroll z-50">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <GraduationCap className="text-white" size={20} />
                </div>
                <h1 className="font-bold text-xl text-gray-900 tracking-tight">
                    {user?.role === 'student' ? 'LMS Student' : 'LMS Teacher'}
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.path) || (item.path === '/dashboard' && location.pathname === '/')
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
