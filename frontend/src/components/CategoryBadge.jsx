/**
 * CategoryBadge Component - Color-coded category display
 */

const CATEGORY_CONFIG = {
    Outdoors: { icon: '🌳', className: 'badge-outdoors' },
    Transport: { icon: '🚗', className: 'badge-transport' },
    Events: { icon: '🎉', className: 'badge-events' },
    Danger: { icon: '⚠️', className: 'badge-danger' },
    Announcements: { icon: '📢', className: 'badge-announcements' },
};

function CategoryBadge({ category }) {
    const config = CATEGORY_CONFIG[category] || { icon: '📰', className: 'badge-announcements' };

    return (
        <span className={`badge-category ${config.className}`}>
            {config.icon} {category}
        </span>
    );
}

export default CategoryBadge;
