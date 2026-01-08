import { memo, useCallback } from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    Globe,
    MapPin,
    Calculator,
    Calendar,
    Receipt,
    Search,
    Bell,
    BarChart2,
    Newspaper,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Settings,
    Train,
    LineChart,
    Activity,
    Target,
    Gauge,
    FlaskConical,
    Briefcase,
    CreditCard,
    BellRing,
    RefreshCw,
} from 'lucide-react';

/**
 * 사이드바 네비게이션 컴포넌트 - Premium Edition (Refactored)
 */
const Sidebar = memo(({ currentPage, onPageChange, isCollapsed, onToggle }) => {
    const menuGroups = [
        {
            title: '분석',
            items: [
                { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
                { id: 'market', label: '시장 분석', icon: TrendingUp },
                { id: 'macro', label: '거시경제', icon: Globe },
                { id: 'regional', label: '지역별 분석', icon: MapPin },
            ]
        },
        {
            title: '고급 분석',
            items: [
                { id: 'correlation', label: '상관관계 분석', icon: Activity },
                { id: 'scenario', label: '시나리오 시뮬레이터', icon: FlaskConical },
                { id: 'cycle', label: '사이클/리스크', icon: Gauge },
                { id: 'leading', label: '선행지표', icon: Target },
            ]
        },
        {
            title: '도구',
            items: [
                { id: 'investment', label: '투자 도구', icon: Calculator },
                { id: 'simulator', label: '투자 시뮬레이터', icon: LineChart },
                { id: 'mortgage', label: '대출 시뮬레이터', icon: CreditCard },
                { id: 'portfolio', label: '포트폴리오', icon: Briefcase },
                { id: 'tax', label: '세금 계산기', icon: Receipt },
                { id: 'search', label: '실거래가 검색', icon: Search },
                { id: 'compare', label: '비교 분석', icon: BarChart2 },
                { id: 'transport', label: '교통호재 분석', icon: Train },
            ]
        },
        {
            title: '정보',
            items: [
                { id: 'calendar', label: '경제 캘린더', icon: Calendar },
                { id: 'news', label: '부동산 뉴스', icon: Newspaper },
                { id: 'watchlist', label: '관심 지역', icon: Bell },
                { id: 'alerts', label: '알림 설정', icon: BellRing },
                { id: 'insights', label: 'AI 인사이트', icon: Sparkles },
            ]
        },
    ];

    const handleNavClick = useCallback((id) => {
        onPageChange(id);
    }, [onPageChange]);

    return (
        <aside className={`sidebar glass ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <TrendingUp size={22} />
                </div>
                {!isCollapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <h1 className="gradient-text" style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                        }}>
                            부동산 통계
                        </h1>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'var(--color-text-tertiary)',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.02em',
                        }}>
                            Real Estate Analytics Pro
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuGroups.map((group, groupIndex) => (
                    <div key={group.title} className="sidebar-group">
                        {!isCollapsed && (
                            <div className="sidebar-group-title">
                                {group.title}
                            </div>
                        )}

                        {group.items.map(item => {
                            const isActive = currentPage === item.id;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                                >
                                    <Icon size={18} className="sidebar-item-icon" />
                                    {!isCollapsed && (
                                        <span className="sidebar-item-label">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <span className="sidebar-item-dot" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="sidebar-footer">
                {!isCollapsed ? (
                    <>
                        <button
                            onClick={() => handleNavClick('datasync')}
                            className="btn btn-secondary btn-ripple"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                marginBottom: 8,
                            }}
                        >
                            <RefreshCw size={16} />
                            데이터 동기화
                        </button>
                        <button
                            onClick={() => handleNavClick('settings')}
                            className="btn btn-ghost btn-ripple"
                            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                        >
                            <Settings size={16} />
                            설정
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => handleNavClick('settings')}
                        className="btn btn-ghost btn-icon"
                        style={{ width: '100%', justifyContent: 'center' }}
                        title="설정"
                    >
                        <Settings size={18} />
                    </button>
                )}
            </div>

            {/* Collapse Toggle - Always visible with label */}
            <div style={{
                padding: '14px',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-bg-tertiary)',
            }}>
                <button
                    onClick={onToggle}
                    className="btn btn-ghost btn-ripple"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: 'var(--color-text-secondary)',
                    }}
                    title={isCollapsed ? '메뉴 펼치기' : '메뉴 접기'}
                >
                    {isCollapsed ? (
                        <ChevronRight size={18} />
                    ) : (
                        <>
                            <ChevronLeft size={18} />
                            <span>메뉴 접기</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
