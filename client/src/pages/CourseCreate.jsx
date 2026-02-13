import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    Upload, Plus, Trash2, Layers, FileText, Video,
    Link as LinkIcon, ChevronDown, ChevronUp, Save, Edit2, X
} from 'lucide-react';

const CourseCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Course Metadata
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [thumbnail, setThumbnail] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // Curriculum State
    const [modules, setModules] = useState([
        {
            title: 'Introduction',
            isOpen: true,
            lessons: [{ title: 'Welcome to the Course', content: '', videoUrl: '', isFree: true }]
        }
    ]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setThumbnail(data.url);
            setPreviewUrl(URL.createObjectURL(file));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed');
        }
    };

    // Module Management
    const addModule = () => {
        setModules([...modules, { title: 'New Module', isOpen: true, lessons: [] }]);
    };

    const removeModule = (mIndex) => {
        const newModules = modules.filter((_, i) => i !== mIndex);
        setModules(newModules);
    };

    const updateModuleTitle = (mIndex, newTitle) => {
        const newModules = [...modules];
        newModules[mIndex].title = newTitle;
        setModules(newModules);
    };

    const toggleModule = (mIndex) => {
        const newModules = [...modules];
        newModules[mIndex].isOpen = !newModules[mIndex].isOpen;
        setModules(newModules);
    };

    // Lesson Management
    const addLesson = (mIndex) => {
        const newModules = [...modules];
        newModules[mIndex].lessons.push({ title: 'New Lesson', content: '', videoUrl: '', isFree: false });
        setModules(newModules);
    };

    const removeLesson = (mIndex, lIndex) => {
        const newModules = [...modules];
        newModules[mIndex].lessons = newModules[mIndex].lessons.filter((_, i) => i !== lIndex);
        setModules(newModules);
    };

    const updateLesson = (mIndex, lIndex, field, value) => {
        const newModules = [...modules];
        newModules[mIndex].lessons[lIndex][field] = value;
        setModules(newModules);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (modules.length === 0) return alert('Please add at least one module');

        setLoading(true);
        try {
            await api.post('/courses', {
                title,
                description,
                price,
                thumbnail,
                modules: modules.map(({ title, lessons }) => ({ title, lessons }))
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Create course failed:', error);
            alert(error.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Course Creation</h1>
                        <p className="text-sm text-gray-500">Drafting: {title || 'Untitled Course'}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !title || modules.some(m => m.lessons.length === 0)}
                            className="btn btn-primary btn-sm px-6"
                        >
                            {loading ? 'Saving...' : 'Publish Course'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Course Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Save size={18} className="text-blue-600" /> Basic Info
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Master Web Development"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                                <textarea
                                    placeholder="What will students learn?"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 min-h-[120px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Price (₹)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Thumbnail</label>
                                <div className="mt-2 text-center">
                                    {previewUrl ? (
                                        <div className="relative group">
                                            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl shadow-md border border-gray-100" />
                                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-xl">
                                                <Upload className="text-white" size={24} />
                                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <span className="text-xs font-bold text-gray-400 uppercase">Upload Image</span>
                                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Curriculum Builder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Layers size={18} className="text-purple-600" /> Course Content
                            </h3>
                            <button
                                onClick={addModule}
                                className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 group"
                            >
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Module
                            </button>
                        </div>

                        {modules.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Layers size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">Your curriculum is empty</p>
                                <button onClick={addModule} className="text-blue-600 font-bold text-sm mt-2">Create your first module</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {modules.map((module, mIndex) => (
                                    <div key={mIndex} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        {/* Module Header */}
                                        <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
                                            <button
                                                onClick={() => toggleModule(mIndex)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {module.isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            <input
                                                className="flex-1 bg-transparent border-none outline-none font-bold text-gray-800 focus:ring-0 placeholder-gray-300"
                                                value={module.title}
                                                onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                                                placeholder="Module Title..."
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                    {module.lessons.length} Lessons
                                                </span>
                                                <button
                                                    onClick={() => removeModule(mIndex)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lessons List */}
                                        {module.isOpen && (
                                            <div className="p-4 space-y-3">
                                                {module.lessons.map((lesson, lIndex) => (
                                                    <div key={lIndex} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                                                <FileText size={14} />
                                                            </div>
                                                            <input
                                                                className="flex-1 font-bold text-sm text-gray-700 border-none outline-none p-0 focus:ring-0 placeholder-gray-300"
                                                                value={lesson.title}
                                                                onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                                                placeholder="Lesson Title..."
                                                            />
                                                            <button
                                                                onClick={() => removeLesson(mIndex, lIndex)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Quick Content (Text)</label>
                                                                <textarea
                                                                    className="w-full bg-gray-50 border border-gray-100 rounded p-2 text-xs outline-none focus:border-blue-400"
                                                                    value={lesson.content}
                                                                    onChange={(e) => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                                                                    placeholder="Optional text summary..."
                                                                    rows="2"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Video URL</label>
                                                                <div className="relative">
                                                                    <Video size={12} className="absolute left-2 top-2.5 text-gray-400" />
                                                                    <input
                                                                        className="w-full bg-gray-50 border border-gray-100 rounded pl-7 pr-2 py-2 text-xs outline-none focus:border-blue-400"
                                                                        value={lesson.videoUrl}
                                                                        onChange={(e) => updateLesson(mIndex, lIndex, 'videoUrl', e.target.value)}
                                                                        placeholder="YouTube/Vimeo link..."
                                                                    />
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`free-${mIndex}-${lIndex}`}
                                                                        checked={lesson.isFree}
                                                                        onChange={(e) => updateLesson(mIndex, lIndex, 'isFree', e.target.checked)}
                                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <label htmlFor={`free-${mIndex}-${lIndex}`} className="text-[10px] font-bold text-gray-500 cursor-pointer">
                                                                        PREVIEW LESSON (FREE)
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => addLesson(mIndex)}
                                                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs font-bold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-1"
                                                >
                                                    <Plus size={14} /> Add Lesson
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCreate;
