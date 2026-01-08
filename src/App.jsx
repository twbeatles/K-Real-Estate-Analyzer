import { useState, useCallback, useMemo } from 'react';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MarketAnalysis from './pages/MarketAnalysis';
import MacroEconomics from './pages/MacroEconomics';
import RegionalAnalysis from './pages/RegionalAnalysis';
import InvestmentTools from './pages/InvestmentTools';
import InvestmentSimulator from './pages/InvestmentSimulator';
import TransportAnalysis from './pages/TransportAnalysis';
import EconomicCalendar from './pages/EconomicCalendar';
import TaxCalculator from './pages/TaxCalculator';
import PropertySearch from './pages/PropertySearch';
import CompareAnalysis from './pages/CompareAnalysis';
import NewsFeed from './pages/NewsFeed';
import Watchlist from './pages/Watchlist';
import AIInsights from './pages/AIInsights';
import DataExport from './pages/DataExport';
import SettingsPage from './pages/SettingsPage';
import CorrelationAnalyzer from './pages/CorrelationAnalyzer';
import ScenarioSimulator from './pages/ScenarioSimulator';
import CycleAnalysis from './pages/CycleAnalysis';
import LeadingIndicators from './pages/LeadingIndicators';
import PortfolioManager from './pages/PortfolioManager';
import AlertSystem from './pages/AlertSystem';
import MortgageSimulator from './pages/MortgageSimulator';
import DataSync from './pages/DataSync';
import AIChatbot from './components/AIChatbot';
import { useTheme } from './hooks/useTheme';

/**
 * 페이지 전환 래퍼 컴포넌트
 */
const PageTransition = ({ children, pageKey }) => {
    return (
        <div key={pageKey} className="page-slide-up">
            {children}
        </div>
    );
};

/**
 * 부동산 통계 플랫폼 메인 앱 (Pro 버전 - Enhanced UI/UX)
 */
function AppContent() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        setMobileSidebarOpen(false);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed(prev => !prev);
    }, []);

    const toggleMobileSidebar = useCallback(() => {
        setMobileSidebarOpen(prev => !prev);
    }, []);

    const pageTitle = useMemo(() => ({
        dashboard: '대시보드',
        market: '시장 분석',
        macro: '거시경제 분석',
        regional: '지역별 분석',
        correlation: '상관관계 분석',
        scenario: '시나리오 시뮬레이터',
        cycle: '사이클/리스크 분석',
        leading: '선행지표 분석',
        investment: '투자 도구',
        simulator: '투자 시뮬레이터',
        mortgage: '대출 시뮬레이터',
        portfolio: '포트폴리오 관리',
        transport: '교통호재 분석',
        tax: '세금 계산기',
        search: '실거래가 검색',
        compare: '비교 분석',
        calendar: '경제 캘린더',
        news: '부동산 뉴스',
        watchlist: '관심 지역',
        alerts: '알림 설정',
        insights: 'AI 인사이트',
        export: '데이터 내보내기',
        datasync: '데이터 동기화',
        settings: '설정',
    }), []);

    const renderPage = useCallback(() => {
        const pageComponents = {
            dashboard: Dashboard,
            market: MarketAnalysis,
            macro: MacroEconomics,
            regional: RegionalAnalysis,
            correlation: CorrelationAnalyzer,
            scenario: ScenarioSimulator,
            cycle: CycleAnalysis,
            leading: LeadingIndicators,
            investment: InvestmentTools,
            simulator: InvestmentSimulator,
            mortgage: MortgageSimulator,
            portfolio: PortfolioManager,
            transport: TransportAnalysis,
            tax: TaxCalculator,
            search: PropertySearch,
            compare: CompareAnalysis,
            calendar: EconomicCalendar,
            news: NewsFeed,
            watchlist: Watchlist,
            alerts: AlertSystem,
            insights: AIInsights,
            export: DataExport,
            datasync: DataSync,
            settings: SettingsPage,
        };

        const PageComponent = pageComponents[currentPage] || Dashboard;
        return <PageComponent />;
    }, [currentPage]);

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isCollapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
            />

            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Main Content */}
            <div
                className="main-content"
                style={{
                    marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                    transition: 'margin-left var(--transition-normal)',
                }}
            >
                <Header
                    title={pageTitle[currentPage]}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleMobileSidebar={toggleMobileSidebar}
                    isMobileSidebarOpen={mobileSidebarOpen}
                />

                <main style={{ paddingTop: 'var(--header-height)' }}>
                    <PageTransition pageKey={currentPage}>
                        {renderPage()}
                    </PageTransition>
                </main>
            </div>

            {/* Mobile Responsive Styles */}
            <style>{`
                @media (max-width: 1024px) {
                    .main-content {
                        margin-left: 0 !important;
                    }
                    
                    .sidebar {
                        transform: translateX(-100%);
                        transition: transform var(--transition-normal);
                    }
                    
                    ${mobileSidebarOpen ? `
                        .sidebar {
                            transform: translateX(0) !important;
                            width: var(--sidebar-width) !important;
                        }
                    ` : ''}
                }
            `}</style>

            {/* AI Chatbot - 글로벌 */}
            <AIChatbot />
        </div>
    );
}

// DataProvider로 앱 감싸기
function App() {
    return (
        <DataProvider>
            <AppContent />
        </DataProvider>
    );
}

export default App;
