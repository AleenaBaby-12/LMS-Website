import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Calendar, Phone, Globe, MapPin, Save, X } from 'lucide-react';

const Profile = () => {
    const { user: contextUser, login } = useAuth(); // login used to update context if needed
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});

    // Fetch latest profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                setProfile(data);
                setFormData({
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                    bio: data.bio || '',
                    country: data.country || '',
                    professionalTitle: data.professionalTitle || '',
                    organization: data.organization || '',
                    qualifications: data.qualifications || '',
                    linkedIn: data.linkedIn || '',
                    website: data.website || ''
                });
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const { data } = await api.put('/auth/profile', formData);
            setProfile(data);
            setIsEditing(false);
            // Optionally update global auth context here if name/email changed
            // login(data); // This might require adjusting how login works to accept user obj directly
        } catch (error) {
            console.error('Error updating profile', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading profile...</div>;
    if (!profile) return <div className="p-10 text-center">Profile not found</div>;

    // Get initials
    const initials = profile.name
        ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 p-6 md:p-10 md:ml-64">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Header / Banner */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                        <div className="px-8 pb-8">
                            <div className="relative flex justify-between items-start -mt-12 mb-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white uppercase overflow-hidden">
                                            {profile.profilePicture ? (
                                                <img
                                                    src={profile.profilePicture}
                                                    alt={profile.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                initials
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-12">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="text-3xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                                            />
                                        ) : (
                                            <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                                        )}
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{profile.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-16">
                                    {isEditing ? (
                                        <>
                                            <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm text-red-500 gap-2">
                                                <X size={16} /> Cancel
                                            </button>
                                            <button onClick={handleSave} className="btn btn-primary btn-sm gap-2">
                                                <Save size={16} /> Save Changes
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">Edit Profile</button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                                    <div className="space-y-4">
                                        {/* Bio */}
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                                <User size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Bio</p>
                                                {isEditing ? (
                                                    <textarea
                                                        name="bio"
                                                        value={formData.bio}
                                                        onChange={handleChange}
                                                        className="w-full mt-1 p-2 border rounded-md text-sm"
                                                        rows="3"
                                                        placeholder="Tell us about yourself..."
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{profile.bio || 'No bio provided'}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <Mail size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Email Address</p>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full font-medium text-gray-900 border-b focus:border-blue-500 outline-none"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{profile.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Phone size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Phone</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="+1 234 567 890"
                                                        className="w-full font-medium text-gray-900 border-b focus:border-blue-500 outline-none"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{profile.phone || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Country</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleChange}
                                                        placeholder="United States"
                                                        className="w-full font-medium text-gray-900 border-b focus:border-blue-500 outline-none"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{profile.country || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Details</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Shield size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Professional Title</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="professionalTitle"
                                                        value={formData.professionalTitle}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Senior Software Engineer"
                                                        className="w-full font-medium text-gray-900 border-b focus:border-blue-500 outline-none"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{profile.professionalTitle || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <Globe size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">Organization</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="organization"
                                                        value={formData.organization}
                                                        onChange={handleChange}
                                                        placeholder="e.g. Google"
                                                        className="w-full font-medium text-gray-900 border-b focus:border-blue-500 outline-none"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-gray-900">{profile.organization || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-500">LinkedIn Profile URL</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="linkedIn"
                                                        value={formData.linkedIn}
                                                        onChange={handleChange}
                                                        placeholder="https://linkedin.com/in/username"
                                                        className="w-full font-medium text-gray-900 border-b focus:border-blue-500 outline-none text-xs"
                                                    />
                                                ) : (
                                                    profile.linkedIn ? (
                                                        <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                                                            {profile.linkedIn}
                                                        </a>
                                                    ) : <p className="font-medium text-gray-400 italic text-xs">Not provided</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Joined Date</p>
                                                <p className="font-medium text-gray-900">
                                                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
