/**
 * AddNews Page - Form to create new news posts
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { newsAPI } from '../services/api';

const CATEGORIES = ['Outdoors', 'Transport', 'Events', 'Danger', 'Announcements'];

function AddNews() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        district: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 16 * 1024 * 1024) {
                setError('Image must be less than 16MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = { ...formData };
            if (image) {
                data.image = image;
            }

            await newsAPI.create(data);
            setSuccess(true);

            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create news post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                        <div className="glass-card p-5 fade-in">
                            <div style={{ fontSize: '4rem' }}>✅</div>
                            <h3 className="mt-3" style={{ color: '#f1f5f9' }}>News Posted!</h3>
                            <p style={{ color: '#94a3b8' }}>
                                Your post is pending review. An admin will verify it soon.
                            </p>
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                Redirecting to home...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="glass-card p-4 p-md-5 fade-in">
                        <div className="mb-4">
                            <Link to="/" style={{ color: '#94a3b8' }}>← Back to Home</Link>
                        </div>

                        <h2 className="mb-4" style={{ color: '#f1f5f9' }}>📝 Post News</h2>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label" style={{ color: '#94a3b8' }}>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-control"
                                    placeholder="What's the headline?"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    maxLength={200}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: '#94a3b8' }}>Content *</label>
                                <textarea
                                    name="content"
                                    className="form-control"
                                    placeholder="Share the details..."
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                />
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6 mb-3 mb-md-0">
                                    <label className="form-label" style={{ color: '#94a3b8' }}>Category *</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" style={{ color: '#94a3b8' }}>District *</label>
                                    <input
                                        type="text"
                                        name="district"
                                        className="form-control"
                                        placeholder="e.g., Downtown, Westside"
                                        value={formData.district}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label" style={{ color: '#94a3b8' }}>Image (optional)</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {imagePreview && (
                                    <div className="mt-3">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                borderRadius: '0.75rem',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm mt-2"
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview(null);
                                            }}
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex gap-3">
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-grow-1"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Posting...
                                        </>
                                    ) : (
                                        '📤 Submit for Review'
                                    )}
                                </button>
                            </div>

                            <p className="text-center mt-3" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                Your post will be reviewed by an admin before publishing.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddNews;
