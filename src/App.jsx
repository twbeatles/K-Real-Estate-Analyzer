import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { DataProvider } from './context/DataContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIChatbot from './components/AIChatbot';
import { useTheme } from './hooks/useTheme';

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MarketAnalysis = lazy(() => import('./pages/MarketAnalysis'));
const MacroEconomics = lazy(() => import('./pages/MacroEconomics'));
const RegionalAnalysis = lazy(() => import('./pages/RegionalAnalysis'));
const InvestmentTools = lazy(() => import('./pages/InvestmentTools'));
const InvestmentSimulator = lazy(() => import('./pages/InvestmentSimulator'));
const TransportAnalysis = lazy(() => import('./pages/TransportAnalysis'));
const EconomicCalendar = lazy(() => import('./pages/EconomicCalendar'));
const TaxCalculator = lazy(() => import('./pages/TaxCalculator'));
const PropertySearch = lazy(() => import('./pages/PropertySearch'));
const CompareAnalysis = lazy(() => import('./pages/CompareAnalysis'));
const NewsFeed = lazy(() => import('./pages/NewsFeed'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const DataExport = lazy(() => import('./pages/DataExport'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CorrelationAnalyzer = lazy(() => import('./pages/CorrelationAnalyzer'));
const ScenarioSimulator = lazy(() => import('./pages/ScenarioSimulator'));
const CycleAnalysis = lazy(() => import('./pages/CycleAnalysis'));
const LeadingIndicators = lazy(() => import('./pages/LeadingIndicators'));
const PortfolioManager = lazy(() => import('./pages/PortfolioManager'));
const AlertSystem = lazy(() => import('./pages/AlertSystem'));
const MortgageSimulator = lazy(() => import('./pages/MortgageSimulator'));
const DataSync = lazy(() => import('./pages/DataSync'));

// New pages
const PopulationAnalysis = lazy(() => import('./pages/PopulationAnalysis'));
const SalesMarket = lazy(() => import('./pages/SalesMarket'));
const RentalMarket = lazy(() => import('./pages/RentalMarket'));
const IncomeAnalysis = lazy(() => import('./pages/IncomeAnalysis'));
const FinancialMarket = lazy(() => import('./pages/FinancialMarket'));
const CommercialRealEstate = lazy(() => import('./pages/CommercialRealEstate'));
const LoanComparison = lazy(() => import('./pages/LoanComparison'));
const GlobalComparison = lazy(() => import('./pages/GlobalComparison'));

/**
 * 페이지 로딩 컴포넌트
 */
const PageLoader = () => (
    <div className="page-loader">
        <div className="spinner" />
        <p>페이지 로딩 중...</p>
    </div>
);

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
        population: '인구/세대 분석',
        salesmarket: '분양 시장 분석',
        rentalmarket: '전월세 시장 분석',
        incomeanalysis: '소득/고용 분석',
        financialmarket: '금융 시장 분석',
        commercial: '상업용 부동산 분석',
        loancompare: '대출 상품 비교',
        globalcompare: '글로벌 비교 분석',
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

    // 페이지 컴포넌트 맵 (useMemo로 캐싱)
    const pageComponents = useMemo(() => ({
        dashboard: Dashboard,
        market: MarketAnalysis,
        macro: MacroEconomics,
        regional: RegionalAnalysis,
        population: PopulationAnalysis,
        salesmarket: SalesMarket,
        rentalmarket: RentalMarket,
        incomeanalysis: IncomeAnalysis,
        financialmarket: FinancialMarket,
        commercial: CommercialRealEstate,
        loancompare: LoanComparison,
        globalcompare: GlobalComparison,
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
    }), []);

    const renderPage = useCallback(() => {
        const PageComponent = pageComponents[currentPage] || Dashboard;
        return (
            <Suspense fallback={<PageLoader />}>
                <PageComponent />
            </Suspense>
        );
    }, [currentPage, pageComponents]);

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

// DataProvider와 ErrorBoundary로 앱 감싸기
function App() {
    return (
        <ErrorBoundary>
            <DataProvider>
                <AppContent />
            </DataProvider>
        </ErrorBoundary>
    );
}

export default App;

