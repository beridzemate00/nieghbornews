/**
 * VerificationBadge Component - Status indicator for news posts
 */

const STATUS_CONFIG = {
    verified: { icon: '✓', label: 'Verified', className: 'badge-verified' },
    pending: { icon: '⏳', label: 'Pending', className: 'badge-pending' },
    rejected: { icon: '✗', label: 'Rejected', className: 'badge-rejected' },
};

function VerificationBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    return (
        <span className={`badge rounded-pill ${config.className} px-3 py-2`}>
            {config.icon} {config.label}
        </span>
    );
}

export default VerificationBadge;
