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

    const validateForm = () => {
        // Required fields check - Common
        if (!name || !email || !password || !phone || !country) {
            setError('Please fill in Name, Email, Password, Phone, and Country');
            return false;
        }

        // Bio is required for teachers and admins, optional for students
        if (role !== 'student' && !bio) {
            setError('Please provide a Bio (Tell us about your teaching experience)');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }

        // Password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Phone validation
        if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
            setError('Please enter a valid phone number');
            return false;
        }

        // Teacher specific validation
        if (role === 'teacher') {
            if (!professionalTitle || !organization || !linkedIn || !qualifications) {
                setError('Please fill in all instructor details (Title, Organization, LinkedIn, Qualifications)');
                return false;
            }

            // URL validation
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
            if (website && !urlRegex.test(website)) {
                setError('Please enter a valid website URL');
                return false;
            }
            if (!urlRegex.test(linkedIn)) {
                setError('Please enter a valid LinkedIn URL');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            const userData = {
                name, email, password, role,
                phone, bio, country, profilePicture // profilePicture is optional
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
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Join our learning community today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection & Profile Pic Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Role Selection */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                <label className="block text-sm font-semibold text-gray-800 mb-2">I am a:</label>
                                <select
                                    className="input w-full text-base py-2"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Instructor</option>
                                </select>
                            </div>

                            {/* Profile Picture Upload */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                                <div className="w-16 h-16 shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-blue-400" />
                                    )}
                                </div>
                                <label className="btn btn-outline btn-sm cursor-pointer flex items-center gap-2 px-4 py-2 text-sm w-full justification-center">
                                    <Upload size={16} />
                                    <span className="truncate">{uploading ? '...' : 'Upload Photo (Optional)'}</span>
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
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-1">
                                <h3 className="text-lg font-bold text-gray-900">Basic Info</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="input w-full py-2"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="input w-full py-2"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="input w-full py-2"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                        className="input w-full py-2"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="United States"
                                        className="input w-full py-2"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Bio {role !== 'student' ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(Optional)</span>}
                                    </label>
                                    <textarea
                                        placeholder={role === 'teacher' ? "Teaching experience, expertise..." : "Short intro about yourself..."}
                                        className="input w-full resize-none py-1 min-h-[42px]"
                                        rows="1"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        maxLength="500"
                                        style={{ height: '42px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructor-Specific Fields */}
                        {role === 'teacher' && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-200 space-y-4">
                                <div className="border-b border-purple-200 pb-1">
                                    <h3 className="text-lg font-bold text-gray-900">Instructor Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Professor"
                                            className="input w-full py-2"
                                            value={professionalTitle}
                                            onChange={(e) => setProfessionalTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Organization <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="University/Company"
                                            className="input w-full py-2"
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Website <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://site.com"
                                            className="input w-full py-2"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            LinkedIn <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://linkedin.com/..."
                                            className="input w-full py-2"
                                            value={linkedIn}
                                            onChange={(e) => setLinkedIn(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Qualifications <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Degrees, certifications..."
                                        className="input w-full resize-none py-1"
                                        rows="2"
                                        value={qualifications}
                                        onChange={(e) => setQualifications(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="btn btn-primary w-full py-3 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Create Account'}
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
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
