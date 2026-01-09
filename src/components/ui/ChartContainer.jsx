import { memo, useState, useCallback } from 'react';
import { Download, Maximize2, Minimize2, X, MoreVertical, RefreshCw } from 'lucide-react';
import logger from '../../utils/logger';

/**
 * 차트 컨테이너 컴포넌트 (Enhanced with fullscreen mode)
 */
const ChartContainer = memo(({
    title,
    subtitle,
    children,
    actions,
    className = '',
    height = 350,
    loading = false,
    onRefresh,
    downloadable = true,
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleFullscreenToggle = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    const handleRefresh = useCallback(async () => {
        if (onRefresh) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
    }, [onRefresh]);

    const handleDownload = useCallback(() => {
        // Placeholder for download functionality
        logger.debug('Download chart:', title);
    }, [title]);

    // Fullscreen overlay
    if (isFullscreen) {
        return (
            <div className="chart-fullscreen-overlay">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                        }}>
                            {title}
                        </h2>
                        {subtitle && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-text-tertiary)',
                                marginTop: 4,
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {downloadable && (
                            <button
                                className="btn btn-secondary btn-ripple"
                                onClick={handleDownload}
                                title="다운로드"
                            >
                                <Download size={16} />
                                다운로드
                            </button>
                        )}
                        <button
                            className="btn btn-ghost btn-icon btn-ripple"
                            onClick={handleFullscreenToggle}
                            title="전체화면 닫기"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div style={{
                    height: 'calc(100vh - 120px)',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 24,
                }}>
                    {children}
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`card ${className}`}>
                <div className="card-header">
                    <div>
                        <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 8 }} />
                        <div className="skeleton" style={{ width: 200, height: 14 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }} />
                        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)' }} />
                    </div>
                </div>
                <div
                    className="skeleton"
                    style={{
                        width: '100%',
                        height,
                        marginTop: 16,
                    }}
                />
            </div>
        );
    }

    return (
        <div className={`card card-shine ${className} animate-fade-in`}>
            <div className="card-header">
                <div>
                    <h3 className="card-title">{title}</h3>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                    {actions}

                    {onRefresh && (
                        <button
                            className="btn btn-ghost btn-icon btn-ripple"
                            title="새로고침"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                size={16}
                                style={{
                                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                                }}
                            />
                        </button>
                    )}

                    <button
                        className="btn btn-ghost btn-icon btn-ripple chart-fullscreen-btn"
                        title="전체화면"
                        onClick={handleFullscreenToggle}
                    >
                        <Maximize2 size={16} />
                    </button>

                    {downloadable && (
                        <button
                            className="btn btn-ghost btn-icon btn-ripple"
                            title="다운로드"
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="chart-container" style={{ height }}>
                {children}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
});

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer;
