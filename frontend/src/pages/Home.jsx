/**
 * Home Page - Main news feed with hero section and filters
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NewsCard, { NewsCardSkeleton } from '../components/NewsCard';
import FilterBar from '../components/FilterBar';

function Home() {
    const { user } = useAuth();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ district: null, category: null });
    const [pagination, setPagination] = useState({ total: 0, pages: 1, current: 1 });

    useEffect(() => {
        fetchNews();
    }, [filters]);

    const fetchNews = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: 12,
                status: 'verified',
                ...(filters.district && { district: filters.district }),
                ...(filters.category && { category: filters.category }),
            };
            const response = await newsAPI.getAll(params);
            setNews(response.data.news);
            setPagination({
                total: response.data.total,
                pages: response.data.pages,
                current: response.data.current_page,
            });
        } catch (error) {
            console.error('Failed to fetch news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="container py-4">
            {/* Hero Section */}
            <section className="hero-section text-center mb-5">
                <h1 className="hero-title mb-3">Your Neighborhood News</h1>
                <p className="hero-subtitle mb-4">
                    Stay informed about what's happening in your community. Verified local news you can trust.
                </p>
                {!user && (
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Get Started
                        </Link>
                    </div>
                )}
                {user && (
                    <Link to="/add" className="btn btn-primary btn-lg">
                        ✏️ Post News
                    </Link>
                )}
            </section>

            {/* Filters */}
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {/* News Grid */}
            {loading ? (
                <div className="row g-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="col-md-6 col-lg-4">
                            <NewsCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : news.length === 0 ? (
                <div className="text-center py-5">
                    <div style={{ fontSize: '4rem', opacity: 0.3 }}>📭</div>
                    <h3 className="mt-3" style={{ color: '#94a3b8' }}>No News Found</h3>
                    <p style={{ color: '#64748b' }}>
                        {filters.district || filters.category
                            ? 'Try adjusting your filters to see more news.'
                            : 'Be the first to share news in your neighborhood!'}
                    </p>
                    {user && (
                        <Link to="/add" className="btn btn-primary mt-3">
                            Post the First Story
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="row g-4">
                        {news.map(item => (
                            <div key={item.id} className="col-md-6 col-lg-4">
                                <NewsCard news={item} />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <nav className="mt-5">
                            <ul className="pagination justify-content-center">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                                    <li key={page} className={`page-item ${pagination.current === page ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => fetchNews(page)}
                                            style={{
                                                background: pagination.current === page ? 'var(--gradient-primary)' : 'transparent',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#f1f5f9'
                                            }}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}

export default Home;
