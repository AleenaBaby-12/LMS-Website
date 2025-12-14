import { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

const CourseCreate = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [thumbnail, setThumbnail] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const navigate = useNavigate();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setThumbnail(data);
            setPreviewUrl(URL.createObjectURL(file));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Image upload failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', {
                title,
                description,
                price,
                thumbnail
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Create course failed:', error);
            alert(error.response?.data?.message || 'Failed to create course');
        }
    };

    return (
        <div className="container flex justify-center mt-10">
            <div className="card w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Course Title"
                        className="input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        className="input h-32"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>

                    <div className="flex gap-4 items-center">
                        <label className="btn btn-outline cursor-pointer">
                            <Upload size={18} /> Upload Thumbnail
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                        </label>
                        {previewUrl && <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded shadow" />}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-500 mb-1">Price ($)</label>
                        <input
                            type="number"
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary mt-4">Create Course</button>
                </form>
            </div>
        </div>
    );
};

export default CourseCreate;
