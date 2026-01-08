import { memo, useState, useCallback } from 'react';
import { Sun, Moon, Bell, Search, Menu, X, Sparkles, ChevronRight } from 'lucide-react';

/**
 * 헤더 컴포넌트 - Premium Edition (Enhanced)
 */
const Header = memo(({
    title,
    theme,
    onToggleTheme,
    sidebarCollapsed,
    onToggleMobileSidebar,
    isMobileSidebarOpen,
}) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [notificationCount] = useState(3); // Example notification count

    const handleSearchToggle = useCallback(() => {
        setSearchOpen(prev => !prev);
        if (!searchOpen) {
            setSearchValue('');
        }
    }, [searchOpen]);

    const handleSearchChange = useCallback((e) => {
        setSearchValue(e.target.value);
    }, []);

    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            console.log('Searching for:', searchValue);
            // Implement search functionality
        }
    }, [searchValue]);

    return (
        <header
            className="header glass"
            style={{
                left: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
            }}
        >
            {/* Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Mobile Menu Button */}
                <button
                    className="btn btn-ghost btn-icon btn-ripple hide-desktop"
                    onClick={onToggleMobileSidebar}
                    aria-label={isMobileSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
                >
                    {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                {/* Breadcrumb / Title */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.02em',
                        }}>
                            {title}
                        </h2>
                    </div>
                    <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-tertiary)',
                        marginTop: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                    }}>
                        <span>홈</span>
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--color-text-secondary)' }}>{title}</span>
                        <span style={{ marginLeft: 8 }}>•</span>
                        <span style={{ marginLeft: 8 }}>
                            {new Date().toLocaleDateString('ko-KR', {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short'
                            })}
                        </span>
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Search */}
                <div className="header-search">
                    {searchOpen ? (
                        <form
                            onSubmit={handleSearchSubmit}
                            className="header-search-expanded"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <Search
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        left: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-tertiary)',
                                        pointerEvents: 'none',
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="페이지, 지역, 지표 검색..."
                                    className="input header-search-input"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-icon btn-ripple"
                                onClick={handleSearchToggle}
                                aria-label="검색 닫기"
                            >
                                <X size={18} />
                            </button>
                        </form>
                    ) : (
                        <button
                            className="btn btn-ghost btn-icon btn-ripple"
                            onClick={handleSearchToggle}
                            title="검색 (Ctrl+K)"
                            aria-label="검색 열기"
                        >
                            <Search size={18} />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <button
                    className="btn btn-ghost btn-icon btn-ripple header-notification"
                    title="알림"
                    aria-label={`알림 ${notificationCount}개`}
                >
                    <Bell size={18} />
                    {notificationCount > 0 && (
                        <span className="header-notification-badge">
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </span>
                    )}
                </button>

                {/* Theme Toggle */}
                <button
                    className="btn btn-ghost btn-icon btn-ripple"
                    onClick={onToggleTheme}
                    title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                    aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                >
                    <div style={{
                        transition: 'transform var(--transition-normal)',
                        transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </div>
                </button>

                {/* Data Source Indicator */}
                <div
                    className="badge hide-mobile"
                    style={{
                        padding: '8px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                        animation: 'buttonGlow 3s ease-in-out infinite',
                    }}
                >
                    <Sparkles size={14} />
                    시뮬레이션 데이터
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .header {
                        left: 0 !important;
                        padding: 0 16px !important;
                    }
                }
                @media (max-width: 768px) {
                    .header-search-input {
                        width: 180px !important;
                    }
                    .header-search-input:focus {
                        width: 200px !important;
                    }
                }
            `}</style>
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
