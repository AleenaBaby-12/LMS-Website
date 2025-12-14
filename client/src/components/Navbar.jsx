import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="card mt-4 mb-4 mx-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                <BookOpen size={24} color="var(--primary)" />
                <span>LMS Platform</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-gray-500">Welcome, {user.name}</span>
                        <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
                        <button onClick={handleLogout} className="btn btn-primary">
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-outline">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Dropdown (Simple implementation) */}
            {isOpen && (
                <div className="absolute top-20 right-4 p-4 card flex flex-col gap-4 shadow-lg md:hidden z-50">
                    {user ? (
                        <>
                            <span className="text-gray-500">Welcome, {user.name}</span>
                            <Link to="/dashboard" className="btn btn-outline" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn btn-primary">
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
