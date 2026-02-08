import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Lock, PlayCircle, FileText, Trash2, Save, X, Star, Edit2 } from 'lucide-react';
import StarRating from '../components/StarRating';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]); // Local state for editing
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isInstructor, setIsInstructor] = useState(false);

    // Edit States
    const [newModuleTitle, setNewModuleTitle] = useState('');
    const [activeModuleIdx, setActiveModuleIdx] = useState(null); // Which module is open for adding a lesson
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', fileUrl: '' });
    const [uploading, setUploading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Progress Tracking States
    const [completedLessons, setCompletedLessons] = useState([]);
    const [courseProgress, setCourseProgress] = useState(0);

    // Review States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [canReview, setCanReview] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const courseRes = await api.get(`/courses/${id}`);
                setCourse(courseRes.data);
                setModules(courseRes.data.modules || []);

                if (user) {
                    setIsInstructor(courseRes.data.instructor._id === user._id || user.role === 'admin');

                    if (user.role === 'student') {
                        const { data: myEnrollments } = await api.get('/enrollments/my-courses');
                        const isEnrolled = myEnrollments.some(e => e.course._id === id);
                        setEnrolled(isEnrolled);

                        // Fetch progress if enrolled
                        if (isEnrolled) {
                            const progressData = await fetchProgress();
                            // Check if student can review (100% progress)
                            const enrollment = myEnrollments.find(e => e.course._id === id);
                            if (enrollment && enrollment.progress === 100) {
                                setCanReview(true);
                                fetchMyReview();
                            }
                        }
                    }
                }

                // Fetch reviews for everyone (public)
                fetchReviews();
            } catch (error) {
                console.error('Error loading course:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id, user]);

    const fetchProgress = async () => {
        try {
            const { data } = await api.get(`/enrollments/${id}/progress`);
            setCompletedLessons(data.completedLessons || []);
            setCourseProgress(data.progress || 0);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const toggleLesson = async (moduleIdx, lessonIdx) => {
        try {
            const lessonId = `${moduleIdx}-${lessonIdx}`;
            const { data } = await api.post(`/enrollments/${id}/lesson/toggle`, { lessonId });
            setCompletedLessons(data.completedLessons || []);
            setCourseProgress(data.progress || 0);
        } catch (error) {
            console.error('Error toggling lesson:', error);
        }
    };

    // Review Functions
    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/${id}`);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const fetchMyReview = async () => {
        try {
            const { data } = await api.get(`/reviews/${id}/my-review`);
            setMyReview(data);
            setReviewRating(data.rating);
            setReviewComment(data.comment || '');
        } catch (error) {
            // No review yet, that's okay
            setMyReview(null);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/reviews/${id}`, {
                rating: reviewRating,
                comment: reviewComment
            });
            setShowReviewModal(false);
            fetchReviews();
            fetchMyReview();
            alert('Review submitted successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleDeleteReview = async () => {
        if (!confirm('Are you sure you want to delete your review?')) return;
        try {
            await api.delete(`/reviews/${myReview._id}`);
            setMyReview(null);
            setReviewRating(5);
            setReviewComment('');
            fetchReviews();
            alert('Review deleted successfully');
        } catch (error) {
            alert('Failed to delete review');
        }
    };

    const openReviewModal = () => {
        if (myReview) {
            setReviewRating(myReview.rating);
            setReviewComment(myReview.comment || '');
        } else {
            setReviewRating(5);
            setReviewComment('');
        }
        setShowReviewModal(true);
    };

    const handleEnroll = async () => {
        if (!user) return navigate('/login');

        if (course.price > 0) {
            try {
                const { data } = await api.post('/payments/create-checkout-session', { courseId: id });
                if (data.url) {
                    window.location.href = data.url; // Redirect to Stripe
                } else {
                    alert('Payment init failed');
                }
            } catch (error) {
                console.error('--- STRIPE PAYMENT ERROR ---');
                console.error('Error Object:', error);
                console.error('Response Data:', error.response?.data);

                const serverDetails = error.response?.data?.details;
                const serverError = error.response?.data?.error;
                const errorMsg = serverDetails || serverError || error.response?.data?.message || error.message || 'Could not initiate payment';

                alert(`Payment Failure: ${errorMsg}\n\n(Console F12 for more details)`);
            }
        } else {
            // Free enrollment
            try {
                await api.post('/enrollments', { courseId: id });
                setEnrolled(true);
                alert('Enrolled successfully!');
            } catch (error) {
                alert('Enrollment failed');
            }
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you certain you want to delete this course? This action is permanent.')) {
            try {
                await api.delete(`/courses/${id}`);
                navigate('/dashboard');
            } catch (error) {
                console.error('Delete failed', error);
                alert('Could not delete course');
            }
        }
    };

    const handleAddModule = () => {
        if (!newModuleTitle.trim()) return;
        setModules([...modules, { title: newModuleTitle, lessons: [] }]);
        setNewModuleTitle('');
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);

        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Cloudinary returns full URL string in data
            setNewLesson(prev => ({ ...prev, [type]: data }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleAddLesson = (moduleIdx) => {
        if (!newLesson.title) return alert('Lesson title is required');

        const updatedModules = [...modules];
        updatedModules[moduleIdx].lessons.push(newLesson);
        setModules(updatedModules);

        // Reset
        setNewLesson({ title: '', videoUrl: '', fileUrl: '' });
        setActiveModuleIdx(null);
    };

    const handleSaveContent = async () => {
        try {
            await api.put(`/courses/${id}`, { ...course, modules });
            alert('Course content saved successfully!');
            // Refresh to sync
            navigate(0);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save changes');
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!course) return <div className="text-center mt-10">Course not found</div>;

    return (
        <div className="max-w-7xl mx-auto mt-8 px-8 pb-20 relative">
            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedVideo(null)}>
                    <div className="bg-black w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-1"
                        >
                            <X className="relative" size={24} />
                        </button>
                        <video
                            src={selectedVideo.url}
                            controls
                            autoPlay
                            className="w-full h-full"
                            onEnded={() => {
                                // Auto-mark lesson as complete when video finishes
                                if (enrolled && !isInstructor && selectedVideo.moduleIdx !== undefined && selectedVideo.lessonIdx !== undefined) {
                                    const lessonId = `${selectedVideo.moduleIdx}-${selectedVideo.lessonIdx}`;
                                    // Only mark as complete if not already completed
                                    if (!completedLessons.includes(lessonId)) {
                                        toggleLesson(selectedVideo.moduleIdx, selectedVideo.lessonIdx);
                                    }
                                }
                            }}
                        >
                            Your browser does not support the video tag.
                        </video>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <h3 className="text-lg font-bold">{selectedVideo.title}</h3>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Side: Thumbnail & Actions */}
                    <div className="md:w-1/3">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail} /* Cloudinary/Local URL */
                                alt={course.title}
                                className="w-full h-48 object-cover rounded-lg shadow-sm border border-gray-100"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">No Image</div>
                        )}

                        {!isInstructor && !enrolled && user?.role === 'student' && (
                            <button onClick={handleEnroll} className="btn btn-primary w-full mt-4 text-lg py-3">
                                {course.price > 0 ? `Buy Now ₹${course.price}` : 'Enroll Now'}
                            </button>
                        )}
                        {enrolled && (
                            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded border border-green-200 flex items-center gap-2">
                                <CheckCircle size={20} /> You are enrolled
                            </div>
                        )}
                        {isInstructor && (
                            <div className="flex flex-col gap-3 mt-6">
                                <button onClick={handleSaveContent} className="btn btn-primary w-full flex items-center justify-center gap-2">
                                    <Save size={18} /> Save Changes
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                                >
                                    <Trash2 size={18} /> Delete Course
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Content */}
                    <div className="md:w-2/3">
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                        <p className="text-gray-500 mb-6">{course.description}</p>

                        {/* Progress Bar for Enrolled Students */}
                        {enrolled && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Course Progress</span>
                                    <span className="text-sm font-bold text-blue-600">{courseProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${courseProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Modules Section */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Course Curriculum</h3>
                        </div>

                        <div className="border rounded-md overflow-hidden bg-white">
                            {modules.map((module, mIdx) => (
                                <div key={mIdx} className="border-b last:border-b-0">
                                    <div className="bg-gray-100 p-4 font-bold flex justify-between items-center">
                                        {module.title}
                                        {isInstructor && <span className="text-xs text-gray-500 font-normal">Module {mIdx + 1}</span>}
                                    </div>

                                    {/* Lessons List */}
                                    <div>
                                        {module.lessons.map((lesson, lIdx) => {
                                            const isLocked = !isInstructor && !enrolled && !lesson.isFree;
                                            const lessonId = `${mIdx}-${lIdx}`;
                                            const isCompleted = completedLessons.includes(lessonId);

                                            return (
                                                <div key={lIdx} className={`p-3 pl-6 flex items-center justify-between border-t first:border-t-0 ${isLocked ? 'bg-gray-50 opacity-75' : 'hover:bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {/* Checkbox for enrolled students */}
                                                        {enrolled && !isInstructor && (
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompleted}
                                                                onChange={() => toggleLesson(mIdx, lIdx)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        )}

                                                        {lesson.videoUrl ? (
                                                            isLocked ? (
                                                                <div className="flex items-center gap-2 text-gray-500">
                                                                    <Lock size={16} /> {lesson.title}
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setSelectedVideo({
                                                                        url: lesson.videoUrl,
                                                                        title: lesson.title,
                                                                        moduleIdx: mIdx,
                                                                        lessonIdx: lIdx
                                                                    })}
                                                                    className="flex items-center gap-2 text-blue-600 hover:underline text-left"
                                                                >
                                                                    <PlayCircle size={16} />
                                                                    <span>
                                                                        {lesson.title}
                                                                        <span className="text-xs text-gray-400 font-normal ml-2">
                                                                            ({lesson.isFree ? 'Preview' : 'Paid'})
                                                                        </span>
                                                                    </span>
                                                                </button>
                                                            )
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-gray-700">
                                                                <FileText size={16} /> {lesson.title}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {lesson.isFree && !enrolled && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Preview</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add Lesson Form (Instructor Only) */}
                                    {isInstructor && (
                                        <div className="p-4 bg-gray-50 border-t">
                                            {activeModuleIdx === mIdx ? (
                                                <div className="flex flex-col gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Lesson Title"
                                                        className="input text-sm"
                                                        value={newLesson.title}
                                                        onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex gap-2 items-center">
                                                            <label className="btn btn-outline btn-sm text-xs">
                                                                {uploading ? 'Uploading...' : 'Upload Video'}
                                                                <input type="file" onChange={(e) => handleFileUpload(e, 'videoUrl')} className="hidden" accept="video/*" disabled={uploading} />
                                                            </label>
                                                            {newLesson.videoUrl && <span className="text-xs text-green-600">Video Attached</span>}
                                                        </div>
                                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={newLesson.isFree || false}
                                                                onChange={e => setNewLesson({ ...newLesson, isFree: e.target.checked })}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            Free Preview
                                                        </label>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAddLesson(mIdx)}
                                                            className="btn btn-primary btn-sm"
                                                            disabled={uploading}
                                                        >
                                                            Add Lesson
                                                        </button>
                                                        <button onClick={() => setActiveModuleIdx(null)} className="btn btn-outline btn-sm text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setActiveModuleIdx(mIdx)} className="text-sm text-primary font-medium hover:underline">
                                                    + Add Lesson
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {modules.length === 0 && <p className="p-8 text-center text-gray-400">No curriculum created yet.</p>}
                        </div>

                        {/* Add Module Input (Instructor Only) */}
                        {isInstructor && (
                            <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="New Module Title (e.g. Introduction)"
                                        className="input"
                                        value={newModuleTitle}
                                        onChange={e => setNewModuleTitle(e.target.value)}
                                    />
                                    <button onClick={handleAddModule} className="btn btn-secondary whitespace-nowrap">Add Module</button>
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold">Course Reviews</h3>
                                    {course.totalReviews > 0 && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <StarRating rating={Math.round(course.averageRating)} readonly size={20} />
                                            <span className="text-sm text-gray-600">
                                                {course.averageRating.toFixed(1)} ({course.totalReviews} {course.totalReviews === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Write Review Button */}
                                {canReview && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={openReviewModal}
                                            className="btn btn-primary flex items-center gap-2"
                                        >
                                            {myReview ? <><Edit2 size={16} /> Edit Review</> : 'Write a Review'}
                                        </button>
                                        {myReview && (
                                            <button
                                                onClick={handleDeleteReview}
                                                className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review this course!</p>
                                ) : (
                                    reviews.map((review) => (
                                        <div key={review._id} className="border border-gray-200 rounded-lg p-4 bg-white">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{review.student?.name || 'Anonymous'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <StarRating rating={review.rating} readonly size={16} />
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-700 mt-2">{review.comment}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowReviewModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{myReview ? 'Edit Review' : 'Write a Review'}</h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <StarRating rating={reviewRating} onRatingChange={setReviewRating} size={32} />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="4"
                                    placeholder="Share your experience with this course..."
                                    maxLength="1000"
                                />
                                <p className="text-xs text-gray-500 mt-1">{reviewComment.length}/1000 characters</p>
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary flex-1">
                                    {myReview ? 'Update Review' : 'Submit Review'}
                                </button>
                                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
