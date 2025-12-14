import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopHeader = () => {
    const { user } = useAuth();

    // Get initials
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';

    return (
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 md:ml-64 sticky top-0 z-20">
            <div className="flex items-center gap-4 w-1/3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="h-8 w-px bg-gray-200 mx-1"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-1 uppercase">{user?.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-200">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
