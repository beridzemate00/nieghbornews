/**
 * NewsCard Component - Display a single news item
 */
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import CategoryBadge from './CategoryBadge';
import VerificationBadge from './VerificationBadge';

function NewsCard({ news }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/news/${news.id}`);
    };

    const timeAgo = formatDistanceToNow(new Date(news.created_at), { addSuffix: true });

    return (
        <div className="glass-card news-card fade-in" onClick={handleClick}>
            {news.image_url && (
                <img
                    src={news.image_url}
                    alt={news.title}
                    className="news-card-image w-100"
                />
            )}
            {!news.image_url && (
                <div
                    className="news-card-image w-100 d-flex align-items-center justify-content-center"
                    style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))' }}
                >
                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>📰</span>
                </div>
            )}

            <div className="news-card-body">
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                    <CategoryBadge category={news.category} />
                    <VerificationBadge status={news.status} />
                </div>

                <h5 className="news-card-title">{news.title}</h5>

                <div className="news-card-meta">
                    <span>📍 {news.district}</span>
                    <span>🕐 {timeAgo}</span>
                    {news.author && <span>👤 {news.author.name}</span>}
                </div>
            </div>
        </div>
    );
}

// Skeleton loading card
export function NewsCardSkeleton() {
    return (
        <div className="glass-card">
            <div className="skeleton" style={{ height: '180px' }}></div>
            <div className="news-card-body">
                <div className="skeleton mb-2" style={{ height: '24px', width: '60%' }}></div>
                <div className="skeleton mb-2" style={{ height: '20px', width: '100%' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '40%' }}></div>
            </div>
        </div>
    );
}

export default NewsCard;
