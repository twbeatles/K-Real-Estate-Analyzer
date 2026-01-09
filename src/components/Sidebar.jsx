import { memo, useCallback, useState } from 'react';
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
    ChevronDown,
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
    Users,
    Building2,
    Home,
    Wallet,
    Landmark,
    Store,
    Globe2,
} from 'lucide-react';

/**
 * 사이드바 네비게이션 컴포넌트 - Premium Edition (Enhanced with Collapsible Groups)
 */
const Sidebar = memo(({ currentPage, onPageChange, isCollapsed, onToggle }) => {
    // 접이식 그룹 상태 관리
    const [expandedGroups, setExpandedGroups] = useState({
        '분석': true,
        '시장 심층분석': true,
        '고급 분석': false,
        '도구': true,
        '정보': false,
    });

    const menuGroups = [
        {
            title: '분석',
            items: [
                { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
                { id: 'market', label: '시장 분석', icon: TrendingUp },
                { id: 'macro', label: '거시경제', icon: Globe },
                { id: 'regional', label: '지역별 분석', icon: MapPin },
                { id: 'population', label: '인구/세대 분석', icon: Users },
            ]
        },
        {
            title: '시장 심층분석',
            items: [
                { id: 'salesmarket', label: '분양 시장', icon: Building2 },
                { id: 'rentalmarket', label: '전월세 시장', icon: Home },
                { id: 'incomeanalysis', label: '소득/고용 분석', icon: Wallet },
                { id: 'financialmarket', label: '금융 시장', icon: Landmark },
                { id: 'commercial', label: '상업용 부동산', icon: Store },
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
                { id: 'loancompare', label: '대출 상품 비교', icon: CreditCard },
                { id: 'portfolio', label: '포트폴리오', icon: Briefcase },
                { id: 'tax', label: '세금 계산기', icon: Receipt },
                { id: 'search', label: '실거래가 검색', icon: Search },
                { id: 'compare', label: '비교 분석', icon: BarChart2 },
                { id: 'globalcompare', label: '글로벌 비교', icon: Globe2 },
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

    const toggleGroup = useCallback((groupTitle) => {
        if (isCollapsed) return; // 접힌 상태에서는 그룹 토글 비활성화
        setExpandedGroups(prev => ({
            ...prev,
            [groupTitle]: !prev[groupTitle]
        }));
    }, [isCollapsed]);

    // 현재 페이지가 속한 그룹을 자동으로 펼침
    const isGroupActive = useCallback((group) => {
        return group.items.some(item => item.id === currentPage);
    }, [currentPage]);

    return (
        <aside
            className={`sidebar glass ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
            role="navigation"
            aria-label="주 메뉴"
        >
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
                {menuGroups.map((group) => {
                    const isExpanded = expandedGroups[group.title] || isGroupActive(group);

                    return (
                        <div key={group.title} className="sidebar-group">
                            {!isCollapsed ? (
                                <button
                                    className={`sidebar-group-header ${!isExpanded ? 'collapsed' : ''}`}
                                    onClick={() => toggleGroup(group.title)}
                                    aria-expanded={isExpanded}
                                    aria-controls={`group-${group.title}`}
                                >
                                    <span>{group.title}</span>
                                    <ChevronDown
                                        size={14}
                                        className="chevron-icon"
                                        style={{
                                            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        }}
                                    />
                                </button>
                            ) : null}

                            <div
                                id={`group-${group.title}`}
                                className={`sidebar-group-items ${isCollapsed || isExpanded ? 'expanded' : 'collapsed'}`}
                            >
                                {group.items.map(item => {
                                    const isActive = currentPage === item.id;
                                    const Icon = item.icon;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleNavClick(item.id)}
                                            title={isCollapsed ? item.label : undefined}
                                            className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                                            aria-current={isActive ? 'page' : undefined}
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
                        </div>
                    );
                })}
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
