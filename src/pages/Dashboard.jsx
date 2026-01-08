import { useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, Home, Calculator,
    DollarSign, Activity, BarChart3, ArrowUpRight
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import {
    generateHistoricalData,
    generateInterestRateData,
    generateTransactionData,
    generateRegionalData
} from '../data';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 대시보드 페이지
 */
const Dashboard = () => {
    // 데이터 생성
    const historicalData = useMemo(() => generateHistoricalData(), []);
    const interestRates = useMemo(() => generateInterestRateData(), []);
    const transactions = useMemo(() => generateTransactionData(), []);
    const regions = useMemo(() => generateRegionalData(), []);

    // 최근 데이터
    const latestData = historicalData[historicalData.length - 1];
    const prevYearData = historicalData[historicalData.length - 13];

    // YoY 변화율 계산
    const seoulYoY = ((latestData.hpiSeoul - prevYearData.hpiSeoul) / prevYearData.hpiSeoul * 100);
    const nationYoY = ((latestData.hpiNation - prevYearData.hpiNation) / prevYearData.hpiNation * 100);
    const cpiYoY = ((latestData.cpi - prevYearData.cpi) / prevYearData.cpi * 100);

    // 최근 2년 데이터
    const recentData = historicalData.slice(-24);

    // 최근 금리
    const latestRate = interestRates[interestRates.length - 1];

    // 상위 상승 지역
    const topRegions = [...regions].sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);

    // 차트 색상
    const chartColors = {
        seoul: '#ef4444',
        nation: '#3b82f6',
        gyeonggi: '#f97316',
        cpi: '#94a3b8',
        jeonse: '#10b981',
        rate: '#8b5cf6',
    };

    return (
        <div className="page-container">
            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울 주택가격지수"
                    value={latestData.hpiSeoul}
                    change={seoulYoY}
                    changeLabel="전년 대비"
                    icon={Home}
                    iconColor="#ef4444"
                    iconBg="var(--color-danger-light)"
                />
                <StatCard
                    title="전국 주택가격지수"
                    value={latestData.hpiNation}
                    change={nationYoY}
                    changeLabel="전년 대비"
                    icon={TrendingUp}
                    iconColor="#3b82f6"
                    iconBg="#dbeafe"
                />
                <StatCard
                    title="소비자물가지수"
                    value={latestData.cpi}
                    change={cpiYoY}
                    changeLabel="전년 대비"
                    icon={Calculator}
                    iconColor="#64748b"
                    iconBg="#f1f5f9"
                />
                <StatCard
                    title="기준금리"
                    value={latestRate.rate}
                    suffix="%"
                    subtitle={`${latestRate.date} 기준`}
                    icon={DollarSign}
                    iconColor="#8b5cf6"
                    iconBg="#ede9fe"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid-charts" style={{ marginBottom: 24 }}>
                <ChartContainer
                    title="주택가격지수 추이"
                    subtitle="최근 2년 (월별)"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={recentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickMargin={10}
                                tickFormatter={(v) => v.slice(2)}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickMargin={10}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="hpiSeoul"
                                name="서울"
                                stroke={chartColors.seoul}
                                strokeWidth={2.5}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="hpiNation"
                                name="전국"
                                stroke={chartColors.nation}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="cpi"
                                name="물가"
                                stroke={chartColors.cpi}
                                strokeWidth={1.5}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer
                    title="매매 vs 전세 지수"
                    subtitle="서울 기준"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={recentData}>
                            <defs>
                                <linearGradient id="gradientSeoul" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.seoul} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={chartColors.seoul} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradientJeonse" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.jeonse} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={chartColors.jeonse} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickFormatter={(v) => v.slice(2)}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="hpiSeoul"
                                name="매매"
                                stroke={chartColors.seoul}
                                fill="url(#gradientSeoul)"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="jeonseSeoul"
                                name="전세"
                                stroke={chartColors.jeonse}
                                fill="url(#gradientJeonse)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Charts Row 2 */}
            <div className="grid-charts">
                <ChartContainer
                    title="월별 거래량 추이"
                    subtitle="전국 아파트"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={transactions.slice(-24)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickFormatter={(v) => v.slice(2)}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                formatter={(value) => [formatNumber(value), '거래량']}
                            />
                            <Bar
                                dataKey="volume"
                                fill="var(--color-primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Regional Rankings */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">지역별 상승률 순위</h3>
                            <p className="card-subtitle">전월 대비 변화율</p>
                        </div>
                        <button className="btn btn-ghost" style={{ fontSize: '0.75rem' }}>
                            전체보기 <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {topRegions.map((region, index) => (
                            <div
                                key={region.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <span style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 'var(--radius-sm)',
                                    background: index === 0 ? 'var(--color-warning)' : 'var(--color-bg-secondary)',
                                    color: index === 0 ? 'white' : 'var(--color-text-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                }}>
                                    {index + 1}
                                </span>
                                <span style={{ flex: 1, fontWeight: 500 }}>{region.name}</span>
                                <span style={{
                                    color: region.changeRate > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                    fontWeight: 600,
                                    fontFeatureSettings: "'tnum' 1",
                                }}>
                                    {formatPercent(region.changeRate)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
