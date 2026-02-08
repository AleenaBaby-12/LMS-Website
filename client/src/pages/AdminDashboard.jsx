import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Users, BookOpen, CreditCard, Shield, Trash2,
    CheckCircle, XCircle, Megaphone, TrendingUp,
    MoreVertical, UserCheck, UserX, AlertCircle,
    LayoutDashboard, Send, DollarSign, ShieldAlert,
    Settings as SettingsIcon, Search, Key, RefreshCw, FileText
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const AdminDashboard = () => {
    const { user: authUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [isSendingMsg, setIsSendingMsg] = useState(false);
    const [settings, setSettings] = useState({ commissionPercentage: 20 });
    const [allCourses, setAllCourses] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, pendingRes, settingsRes, coursesRes, salesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/courses/pending'),
                api.get('/admin/settings'),
                api.get('/admin/courses'),
                api.get('/admin/sales')
            ]);
            setStats(statsRes.data.stats);
            setUsers(usersRes.data);
            setPendingCourses(pendingRes.data);
            setSettings(settingsRes.data);
            setAllCourses(coursesRes.data);
            setSalesHistory(salesRes.data);
        } catch (err) {
            setError('Failed to fetch admin data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleToggleBlock = async (userId) => {
        try {
            const { data } = await api.put(`/admin/users/${userId}/block`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: data.user.isBlocked } : u));
        } catch (err) {
            alert('Failed to update block status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to change role');
        }
    };

    const handleApproveCourse = async (courseId, status) => {
        try {
            await api.put(`/admin/courses/${courseId}/approve`, { status });
            setPendingCourses(prev => prev.filter(c => c._id !== courseId));
            // Update stats
            fetchInitialData();
        } catch (err) {
            alert('Failed to process approval');
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastMsg) return;
        setIsSendingMsg(true);
        try {
            await api.post('/admin/broadcast', { message: broadcastMsg });
            alert('Broadcast sent successfully!');
            setBroadcastMsg('');
        } catch (err) {
            alert('Failed to send broadcast');
        } finally {
            setIsSendingMsg(false);
        }
    };

    const handleResetPassword = async (userId) => {
        const newPassword = window.prompt('Enter new password for this user:');
        if (!newPassword) return;
        try {
            await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
            alert('Password reset successfully!');
        } catch (err) {
            alert('Failed to reset password');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This will remove it for all enrolled students.')) return;
        try {
            await api.delete(`/courses/${courseId}`);
            setAllCourses(prev => prev.filter(c => c._id !== courseId));
            alert('Course deleted');
        } catch (err) {
            alert('Failed to delete course');
        }
    };

    // --- Render Helpers ---

    const renderOverview = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Gross Sales', value: stats?.grossRevenue ? `₹${stats.grossRevenue.toLocaleString()}` : '₹0', icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Admin Earning', value: stats?.adminEarnings ? `₹${stats.adminEarnings.toLocaleString()}` : '₹0', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Teacher Payout', value: stats?.teacherPayouts ? `₹${stats.teacherPayouts.toLocaleString()}` : '₹0', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Platform Users', value: stats?.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`p-4 ${item.bg} ${item.color} rounded-xl`}>
                            <item.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">User Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Students', count: stats?.roles.students },
                                { name: 'Teachers', count: stats?.roles.teachers },
                                { name: 'Admins', count: stats?.roles.admins }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {['#3B82F6', '#10B981', '#EF4444'].map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <div className="text-center">
                        <AlertCircle className="mx-auto text-orange-500 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-800">Pending Approvals</h3>
                        <p className="text-gray-500 mt-2 mb-6">There are {pendingCourses.length} courses waiting for review.</p>
                        <button
                            onClick={() => setActiveTab('courses')}
                            className="btn btn-primary px-8"
                        >
                            Review Queue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => {
        const filteredUsers = users.filter(u =>
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase())
        );

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">User Management</h2>
                        <span className="text-sm text-gray-500">{filteredUsers.length} of {users.length} Users Found</span>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {filteredUsers.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{u.name}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleChangeRole(u._id, e.target.value)}
                                            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                                        >
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {u.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleResetPassword(u._id)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                title="Reset Password"
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleToggleBlock(u._id)}
                                                className={`p-2 rounded-lg ${u.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                                title={u.isBlocked ? 'Unblock User' : 'Block User'}
                                            >
                                                {u.isBlocked ? <UserCheck size={18} /> : <UserX size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCourses = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center p-12">
            <h2 className="text-xl font-bold text-gray-800 mb-8">Course Approval Queue</h2>
            {pendingCourses.length === 0 ? (
                <div className="text-gray-400">
                    <CheckCircle className="mx-auto mb-4 opacity-20" size={64} />
                    <p>No courses pending approval at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                    {pendingCourses.map(course => (
                        <div key={course._id} className="border rounded-xl p-5 hover:border-blue-400 transition-colors">
                            <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                            <p className="text-xs text-gray-500 mb-4 font-medium">By {course.instructor?.name || 'Unknown'}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleApproveCourse(course._id, 'approved')}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleApproveCourse(course._id, 'rejected')}
                                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAllCourses = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Course Catalog</h2>
                <span className="text-sm text-gray-500">{allCourses.length} Total Courses</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider">
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {allCourses.map((c) => (
                            <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{c.title}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-900 font-medium">{c.instructor?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{c.instructor?.email}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">₹{c.price}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${c.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {c.approvalStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDeleteCourse(c._id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSalesHistory = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Sales Transactions</h2>
                <span className="text-sm text-gray-500">Total Transactions: {salesHistory.length}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs font-medium uppercase tracking-wider">
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Course Purchased</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {salesHistory.map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{sale.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{sale.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {sale.course?.title || 'Deleted Course'}
                                </td>
                                <td className="px-6 py-4 font-bold text-green-600">₹{sale.course?.price || 0}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {sale.course?.instructor?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                    {new Date(sale.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBroadcast = () => (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <Megaphone size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Platform Broadcast</h2>
                    <p className="text-sm text-gray-500">Send an announcement to all students and teachers.</p>
                </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
                <textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Enter your announcement here..."
                    rows="4"
                    className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                />
                <button
                    disabled={isSendingMsg}
                    type="submit"
                    className="w-full btn btn-primary justify-center text-lg py-3"
                >
                    {isSendingMsg ? 'Sending...' : 'Send to Everyone'}
                </button>
            </form>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Platform Settings</h2>
                    <p className="text-sm text-gray-500">Configure global platform parameters.</p>
                </div>
            </div>

            <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                    await api.put('/admin/settings', settings);
                    alert('Settings updated successfully!');
                    fetchInitialData();
                } catch (err) {
                    alert('Failed to update settings');
                }
            }} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Percentage (%)</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.commissionPercentage}
                            onChange={(e) => setSettings({ ...settings, commissionPercentage: e.target.value })}
                            required
                        />
                        <span className="absolute right-4 top-4 text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 italic">* This percentage will be deducted from every course sale.</p>
                </div>

                <button type="submit" className="w-full btn btn-primary flex justify-center py-3">
                    Save Changes
                </button>
            </form>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col gap-4 justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 font-medium">Fetching secure data...</p>
        </div>
    );

    if (error) return <div className="text-red-500 text-center mt-10 p-6 bg-red-50 mx-auto max-w-xl rounded-xl border border-red-200">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Control Center</h1>
                        <p className="text-gray-500 mt-1">Manage users, content, and platform visibility.</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                        {[
                            { id: 'overview', icon: Shield, label: 'Overview' },
                            { id: 'users', icon: Users, label: 'Users' },
                            { id: 'all-courses', icon: BookOpen, label: 'Courses' },
                            { id: 'courses', icon: CheckCircle, label: 'Approvals' },
                            { id: 'sales', icon: FileText, label: 'Sales' },
                            { id: 'broadcast', icon: Megaphone, label: 'Broadcast' },
                            { id: 'settings', icon: SettingsIcon, label: 'Settings' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'all-courses' && renderAllCourses()}
                    {activeTab === 'courses' && renderCourses()}
                    {activeTab === 'sales' && renderSalesHistory()}
                    {activeTab === 'broadcast' && renderBroadcast()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
