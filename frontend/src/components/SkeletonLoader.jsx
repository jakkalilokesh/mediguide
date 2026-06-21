import './SkeletonLoader.css'

export default function SkeletonLoader({ type = 'response' }) {
    if (type === 'card-grid') {
        return (
            <div className="skeleton-grid" role="status" aria-label="Loading content">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="skeleton-card">
                        <div className="skeleton-line skeleton-icon"></div>
                        <div className="skeleton-line skeleton-title"></div>
                        <div className="skeleton-line skeleton-text"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="skeleton-container" role="status" aria-label="Loading response">
            <div className="skeleton-header">
                <div className="skeleton-line skeleton-badge"></div>
                <div className="skeleton-line skeleton-badge-sm"></div>
            </div>
            <div className="skeleton-line skeleton-category"></div>
            <div className="skeleton-divider"></div>

            {/* Section 1 */}
            <div className="skeleton-section">
                <div className="skeleton-line skeleton-heading"></div>
                <div className="skeleton-line skeleton-text-full"></div>
                <div className="skeleton-line skeleton-text-full"></div>
                <div className="skeleton-line skeleton-text-90"></div>
                <div className="skeleton-line skeleton-text-70"></div>
                <div className="skeleton-line skeleton-text-full"></div>
            </div>

            {/* Section 2 */}
            <div className="skeleton-section">
                <div className="skeleton-line skeleton-heading"></div>
                <div className="skeleton-line skeleton-text-full"></div>
                <div className="skeleton-line skeleton-text-80"></div>
                <div className="skeleton-line skeleton-text-60"></div>
            </div>

            {/* Section 3 */}
            <div className="skeleton-section">
                <div className="skeleton-line skeleton-heading"></div>
                <div className="skeleton-line skeleton-text-full"></div>
                <div className="skeleton-line skeleton-text-90"></div>
            </div>

            <div className="skeleton-actions">
                <div className="skeleton-line skeleton-btn"></div>
                <div className="skeleton-line skeleton-btn"></div>
            </div>
            <span className="sr-only">Analyzing your query, please wait...</span>
        </div>
    )
}
