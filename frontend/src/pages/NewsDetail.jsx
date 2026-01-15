/**
 * NewsDetail Page - Full news article view
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { newsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import VerificationBadge from '../components/VerificationBadge';

function NewsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchNews();
    }, [id]);

    const fetchNews = async () => {
        try {
            const response = await newsAPI.getOne(id);
            setNews(response.data.news);
        } catch (err) {
            setError('News article not found');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        setDeleting(true);
        try {
            await newsAPI.delete(id);
            navigate('/');
        } catch (err) {
            setError('Failed to delete post');
            setDeleting(false);
        }
    };

    const canEdit = news && user && (user.id === news.author?.id || isAdmin);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-custom"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>😕</div>
                    <h3 className="mt-3" style={{ color: '#94a3b8' }}>{error}</h3>
                    <Link to="/" className="btn btn-primary mt-3">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const timeAgo = formatDistanceToNow(new Date(news.created_at), { addSuffix: true });
    const fullDate = format(new Date(news.created_at), 'MMMM d, yyyy \'at\' h:mm a');

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="mb-4">
                        <Link to="/" style={{ color: '#94a3b8' }}>← Back to Home</Link>
                    </div>

                    <article className="glass-card p-4 p-md-5 fade-in">
                        {/* Header */}
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <CategoryBadge category={news.category} />
                            <VerificationBadge status={news.status} />
                        </div>

                        <h1 className="mb-3" style={{ color: '#f1f5f9', fontSize: '2rem' }}>
                            {news.title}
                        </h1>

                        {/* Meta info */}
                        <div className="d-flex flex-wrap gap-3 mb-4" style={{ color: '#64748b' }}>
                            <span>📍 {news.district}</span>
                            <span title={fullDate}>🕐 {timeAgo}</span>
                            {news.author && <span>👤 {news.author.name}</span>}
                            <span>👁️ {news.view_count} views</span>
                        </div>

                        {/* Image */}
                        {news.image_url && (
                            <div className="mb-4">
                                <img
                                    src={news.image_url}
                                    alt={news.title}
                                    className="w-100"
                                    style={{
                                        borderRadius: '0.75rem',
                                        maxHeight: '400px',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="mb-4"
                            style={{
                                color: '#cbd5e1',
                                lineHeight: 1.8,
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {news.content}
                        </div>

                        {/* Actions */}
                        {canEdit && (
                            <div className="d-flex gap-2 pt-4 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? 'Deleting...' : '🗑️ Delete'}
                                </button>
                            </div>
                        )}
                    </article>

                    {/* Share section */}
                    <div className="glass-card p-4 mt-4 text-center">
                        <h5 style={{ color: '#94a3b8' }}>Share this story</h5>
                        <div className="d-flex justify-content-center gap-3 mt-3">
                            <button
                                className="btn btn-outline-light"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied!');
                                }}
                            >
                                🔗 Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsDetail;
