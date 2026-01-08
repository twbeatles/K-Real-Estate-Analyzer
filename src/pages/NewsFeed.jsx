import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Newspaper, ExternalLink, Calendar, TrendingUp, TrendingDown,
    RefreshCw, BookOpen, AlertCircle, Wifi, WifiOff, Link
} from 'lucide-react';
import { fetchRealEstateNews } from '../services/newsService';

/**
 * 부동산 뉴스 피드 페이지 - 실시간 뉴스
 */
const NewsFeed = () => {
    const [category, setCategory] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [news, setNews] = useState([]);
    const [isOnline, setIsOnline] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);

    const categories = [
        { id: 'all', label: '전체' },
        { id: 'market', label: '시장동향' },
        { id: 'policy', label: '정책' },
        { id: 'analysis', label: '분석' },
        { id: 'development', label: '개발' },
    ];

    // 시뮬레이션 데이터
    const getSimulationNews = useCallback(() => [
        {
            id: 1,
            title: '서울 아파트값 2주 연속 상승세...강남권 상승폭 확대',
            summary: '한국부동산원이 발표한 주간 아파트 가격 동향에 따르면 서울 아파트 매매가격이 2주 연속 상승한 것으로 나타났다.',
            source: '조선일보',
            date: new Date().toISOString().split('T')[0],
            category: 'market',
            sentiment: 'positive',
        },
        {
            id: 2,
            title: '기준금리 동결...부동산 시장 영향은?',
            summary: '한국은행 금융통화위원회가 기준금리를 동결하기로 결정했다. 전문가들은 당분간 금리 인하 가능성이 낮다고 전망했다.',
            source: '한국경제',
            date: new Date().toISOString().split('T')[0],
            category: 'policy',
            sentiment: 'neutral',
        },
        {
            id: 3,
            title: '전세가격 상승세 지속...서울 1.2% 올라',
            summary: '전세가격 상승세가 계속되고 있다. 서울의 경우 전주 대비 0.15% 상승하며 올해 들어 누적 1.2% 상승했다.',
            source: '매일경제',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            category: 'market',
            sentiment: 'negative',
        },
    ], []);

    // 뉴스 로드 (useCallback으로 래핑)
    const loadNews = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const fetchedNews = await fetchRealEstateNews(category);

            if (fetchedNews && fetchedNews.length > 0) {
                setNews(fetchedNews);
                setIsOnline(true);
                setLastUpdated(new Date());
            } else {
                throw new Error('뉴스를 가져올 수 없습니다.');
            }
        } catch (err) {
            console.error('뉴스 로드 실패:', err);
            setError(err.message);
            setIsOnline(false);

            // 폴백: 시뮬레이션 데이터
            setNews(getSimulationNews());
        } finally {
            setIsLoading(false);
        }
    }, [category, getSimulationNews]);

    // 카테고리 변경 또는 초기 로드
    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const filteredNews = category === 'all'
        ? news
        : news.filter(n => n.category === category);

    const getCategoryLabel = (cat) => {
        const found = categories.find(c => c.id === cat);
        return found ? found.label : cat;
    };

    const getSentimentIcon = (sentiment) => {
        switch (sentiment) {
            case 'positive': return <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />;
            case 'negative': return <TrendingDown size={14} style={{ color: 'var(--color-danger)' }} />;
            default: return null;
        }
    };

    const getSentimentLabel = (sentiment) => {
        switch (sentiment) {
            case 'positive': return '상승 요인';
            case 'negative': return '하락 요인';
            default: return '중립';
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Newspaper size={20} style={{ color: 'var(--color-primary)' }} />
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>부동산 뉴스</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                {isOnline ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Wifi size={12} /> 실시간 뉴스
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <WifiOff size={12} /> 오프라인 모드
                                    </span>
                                )}
                                {lastUpdated && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                        | 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-secondary"
                        onClick={() => loadNews(true)}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                        새로고침
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`btn ${category === cat.id ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '8px 16px' }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{
                    marginBottom: 20,
                    padding: 16,
                    background: 'var(--color-warning-light)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <AlertCircle size={18} style={{ color: 'var(--color-warning)' }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-warning)' }}>
                            실시간 뉴스 로드 실패
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            시뮬레이션 데이터를 표시합니다. 인터넷 연결을 확인해주세요.
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div className="skeleton" style={{ height: 160 }} />
                            <div style={{ padding: 20 }}>
                                <div className="skeleton" style={{ height: 24, marginBottom: 12 }} />
                                <div className="skeleton" style={{ height: 48, marginBottom: 16 }} />
                                <div className="skeleton" style={{ height: 16, width: '60%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* News Grid */}
            {!isLoading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {filteredNews.map(newsItem => (
                        <article
                            key={newsItem.id}
                            className="card"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'all var(--transition-fast)',
                                cursor: 'pointer',
                            }}
                            onClick={() => newsItem.link && window.open(newsItem.link, '_blank')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '';
                            }}
                        >
                            {/* Thumbnail placeholder */}
                            <div style={{
                                height: 140,
                                background: 'linear-gradient(135deg, var(--color-bg-tertiary), var(--color-border))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <BookOpen size={36} style={{ color: 'var(--color-text-tertiary)' }} />
                            </div>

                            <div style={{ padding: 20 }}>
                                {/* Meta */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <span className="badge badge-primary">{getCategoryLabel(newsItem.category)}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                        {getSentimentIcon(newsItem.sentiment)}
                                        <span>{getSentimentLabel(newsItem.sentiment)}</span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: 8,
                                    lineHeight: 1.4,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {newsItem.title}
                                </h3>

                                {/* Summary */}
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: 16,
                                    lineHeight: 1.6,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {newsItem.summary}
                                </p>

                                {/* Footer */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                        <span style={{ fontWeight: 500 }}>{newsItem.source}</span>
                                        <span>•</span>
                                        <span>{newsItem.date}</span>
                                    </div>
                                    {newsItem.link && <Link size={14} style={{ color: 'var(--color-text-tertiary)' }} />}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredNews.length === 0 && (
                <div className="empty-state">
                    <Newspaper className="empty-state-icon" />
                    <h3 className="empty-state-title">뉴스가 없습니다</h3>
                    <p className="empty-state-desc">다른 카테고리를 선택하거나 잠시 후 다시 시도해주세요</p>
                </div>
            )}

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default NewsFeed;
