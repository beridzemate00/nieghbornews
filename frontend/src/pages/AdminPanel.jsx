/**
 * AdminPanel Page - Dashboard for managing news posts
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { adminAPI } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

function AdminPanel() {
    const [stats, setStats] = useState(null);
    const [pendingPosts, setPendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getPending()
            ]);
            setStats(statsRes.data.stats);
            setPendingPosts(pendingRes.data.news);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        setActionLoading(id);
        try {
            await adminAPI.verify(id);
            setPendingPosts(prev => prev.filter(p => p.id !== id));
            setStats(prev => ({
                ...prev,
                pending_posts: prev.pending_posts - 1,
                verified_posts: prev.verified_posts + 1
            }));
        } catch (error) {
            alert('Failed to verify post');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this post?')) return;

        setActionLoading(id);
        try {
            await adminAPI.reject(id);
            setPendingPosts(prev => prev.filter(p => p.id !== id));
            setStats(prev => ({
                ...prev,
                pending_posts: prev.pending_posts - 1,
                rejected_posts: prev.rejected_posts + 1
            }));
        } catch (error) {
            alert('Failed to reject post');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="d-flex justify-content-center">
                    <div className="spinner-custom"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="mb-4">
                <Link to="/" style={{ color: '#94a3b8' }}>← Back to Home</Link>
            </div>

            <h2 className="mb-4" style={{ color: '#f1f5f9' }}>🛡️ Admin Dashboard</h2>

            {/* Stats Cards */}
            {stats && (
                <div className="row g-4 mb-5">
                    <div className="col-6 col-md-3">
                        <div className="glass-card stat-card">
                            <div className="stat-value">{stats.total_posts}</div>
                            <div className="stat-label">Total Posts</div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="glass-card stat-card">
                            <div className="stat-value" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stats.pending_posts}
                            </div>
                            <div className="stat-label">Pending Review</div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="glass-card stat-card">
                            <div className="stat-value" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stats.verified_posts}
                            </div>
                            <div className="stat-label">Verified</div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="glass-card stat-card">
                            <div className="stat-value" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {stats.total_users}
                            </div>
                            <div className="stat-label">Users</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Posts */}
            <div className="glass-card p-4">
                <h4 className="mb-4" style={{ color: '#f1f5f9' }}>
                    ⏳ Pending Posts ({pendingPosts.length})
                </h4>

                {pendingPosts.length === 0 ? (
                    <div className="text-center py-4">
                        <div style={{ fontSize: '3rem', opacity: 0.3 }}>✅</div>
                        <p style={{ color: '#94a3b8' }} className="mt-2">All caught up! No pending posts.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-hover" style={{ background: 'transparent' }}>
                            <thead>
                                <tr style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>District</th>
                                    <th>Author</th>
                                    <th>Posted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPosts.map(post => (
                                    <tr key={post.id} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                        <td>
                                            <Link
                                                to={`/news/${post.id}`}
                                                style={{ color: '#f1f5f9', textDecoration: 'none' }}
                                            >
                                                {post.title.length > 40 ? post.title.slice(0, 40) + '...' : post.title}
                                            </Link>
                                        </td>
                                        <td><CategoryBadge category={post.category} /></td>
                                        <td style={{ color: '#94a3b8' }}>{post.district}</td>
                                        <td style={{ color: '#94a3b8' }}>{post.author?.name}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleVerify(post.id)}
                                                    disabled={actionLoading === post.id}
                                                >
                                                    {actionLoading === post.id ? '...' : '✓ Verify'}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleReject(post.id)}
                                                    disabled={actionLoading === post.id}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
