import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, User } from 'lucide-react';
import api from '../services/api';

const Register = () => {
    // Basic fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    // Common profile fields
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [country, setCountry] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Instructor-specific fields
    const [qualifications, setQualifications] = useState('');
    const [professionalTitle, setProfessionalTitle] = useState('');
    const [organization, setOrganization] = useState('');
    const [website, setWebsite] = useState('');
    const [linkedIn, setLinkedIn] = useState('');

    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/upload/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfilePicture(data.url);
        } catch (err) {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userData = {
                name, email, password, role,
                phone, bio, country, profilePicture
            };

            if (role === 'teacher') {
                userData.qualifications = qualifications;
                userData.professionalTitle = professionalTitle;
                userData.organization = organization;
                userData.website = website;
                userData.linkedIn = linkedIn;
            }

            await registerUser(name, email, password, role, userData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h2>
                        <p className="text-gray-600 text-lg">Join our learning community today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Selection */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-3">I am a:</label>
                            <select
                                className="input w-full text-lg"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <label className="block text-sm font-semibold text-gray-800 mb-4">Profile Picture (Optional)</label>
                            <div className="flex items-center gap-6">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={48} className="text-blue-400" />
                                    )}
                                </div>
                                <label className="btn btn-outline cursor-pointer flex items-center gap-2 px-6 py-3 text-base">
                                    <Upload size={20} />
                                    {uploading ? 'Uploading...' : 'Upload Photo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Basic Information Section */}
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-2">
                                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="input w-full"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="input w-full"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="input w-full"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Minimum 6 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                        className="input w-full"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    placeholder="United States"
                                    className="input w-full"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Bio {role === 'teacher' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    placeholder={role === 'teacher' ? "Tell students about your expertise and teaching experience..." : "Tell us about yourself..."}
                                    className="input w-full resize-none"
                                    rows="4"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength="500"
                                    required={role === 'teacher'}
                                />
                                <p className="text-xs text-gray-500 mt-2">{bio.length}/500 characters</p>
                            </div>
                        </div>

                        {/* Instructor-Specific Fields */}
                        {role === 'teacher' && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-200 space-y-6">
                                <div className="border-b border-purple-200 pb-2">
                                    <h3 className="text-xl font-bold text-gray-900">Instructor Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Professor, Senior Developer"
                                            className="input w-full"
                                            value={professionalTitle}
                                            onChange={(e) => setProfessionalTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., University, Company"
                                            className="input w-full"
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Qualifications</label>
                                    <textarea
                                        placeholder="Degrees, certifications, achievements..."
                                        className="input w-full resize-none"
                                        rows="3"
                                        value={qualifications}
                                        onChange={(e) => setQualifications(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                        <input
                                            type="url"
                                            placeholder="https://yourwebsite.com"
                                            className="input w-full"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                                        <input
                                            type="url"
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className="input w-full"
                                            value={linkedIn}
                                            onChange={(e) => setLinkedIn(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="btn btn-primary w-full py-4 text-lg font-semibold"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading Image...' : 'Create Account'}
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
