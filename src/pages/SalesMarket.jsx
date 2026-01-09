import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell
} from 'recharts';
import {
    Building2, TrendingUp, TrendingDown, AlertTriangle,
    Calendar, MapPin, DollarSign, Home
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateSubscriptionData,
    generateMonthlyCompetition,
    generateSalesPriceData,
    generateUnsoldData,
    generateUnsoldTrend,
    generatePremiumData,
    generateSupplySchedule,
    getSalesMarketSummary,
} from '../data/salesData';

/**
 * 분양 시장 분석 페이지
 */
const SalesMarket = () => {
    const [activeTab, setActiveTab] = useState('subscription');

    // 데이터 생성
    const subscriptionData = useMemo(() => generateSubscriptionData(), []);
    const monthlyCompetition = useMemo(() => generateMonthlyCompetition(), []);
    const salesPriceData = useMemo(() => generateSalesPriceData(), []);
    const unsoldData = useMemo(() => generateUnsoldData(), []);
    const unsoldTrend = useMemo(() => generateUnsoldTrend(), []);
    const premiumData = useMemo(() => generatePremiumData(), []);
    const supplySchedule = useMemo(() => generateSupplySchedule(), []);
    const summary = useMemo(() => getSalesMarketSummary(), []);

    const tabs = [
        { id: 'subscription', label: '청약 경쟁률', icon: TrendingUp },
        { id: 'price', label: '분양가', icon: DollarSign },
        { id: 'unsold', label: '미분양', icon: AlertTriangle },
        { id: 'supply', label: '입주 물량', icon: Building2 },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    분양 시장 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    청약 경쟁률, 분양가 추이, 미분양 현황 등 신규 분양 시장을 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울 평균 청약 경쟁률"
                    value={summary.seoulAvgCompetition}
                    suffix=":1"
                    icon={TrendingUp}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="서울 분양가"
                    value={summary.seoulAvgPrice.toLocaleString()}
                    suffix="만원/평"
                    icon={DollarSign}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="전국 미분양"
                    value={summary.totalUnsold.toLocaleString()}
                    suffix="호"
                    icon={AlertTriangle}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
                <StatCard
                    title={`${new Date().getFullYear() + 1}년 공급 예정`}
                    value={summary.nextYearSupply.toLocaleString()}
                    suffix="호"
                    change={summary.supplyChangeRate}
                    changeLabel="전년 대비"
                    icon={Building2}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
            </div>

            {/* Charts */}
            {activeTab === 'subscription' && (
                <div>
                    {/* 최근 분양 단지 경쟁률 */}
                    <ChartContainer
                        title="최근 분양 단지 청약 경쟁률"
                        subtitle="1순위 평균 경쟁률"
                        height={350}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subscriptionData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}:1`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    width={130}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v.toFixed(1)}:1`, '경쟁률']}
                                />
                                <Bar dataKey="avgCompetition" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {subscriptionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.avgCompetition > 100 ? '#ef4444' : entry.avgCompetition > 50 ? '#f59e0b' : '#10b981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 월별 경쟁률 추이 */}
                    <ChartContainer
                        title="월별 청약 경쟁률 추이"
                        subtitle="지역별 1순위 평균 경쟁률"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyCompetition.filter((_, i) => i % 3 === 0)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    minTickGap={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}:1`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v.toFixed(1)}:1`]}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="seoul" name="서울" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="gyeonggi" name="경기" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="local" name="지방" stroke="#94a3b8" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'price' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="연도별 분양가 추이"
                        subtitle="3.3㎡당 평균 분양가 (만원)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesPriceData}>
                                <defs>
                                    <linearGradient id="gradientSeoul" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientGyeonggi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 100).toFixed(0)}백만`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v.toLocaleString()}만원`]}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="seoul" name="서울" stroke="#ef4444" fill="url(#gradientSeoul)" strokeWidth={2} />
                                <Area type="monotone" dataKey="gyeonggi" name="경기" stroke="#3b82f6" fill="url(#gradientGyeonggi)" strokeWidth={2} />
                                <Area type="monotone" dataKey="local" name="지방" stroke="#94a3b8" fill="#f1f5f9" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 분양권 프리미엄 */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            📈 분양권 프리미엄 현황
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {premiumData.map((item, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                            분양가 {item.salesPrice}억 → 시세 {item.currentPrice}억
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: item.isPositive ? 'var(--color-success)' : 'var(--color-danger)',
                                    }}>
                                        {item.isPositive ? '+' : ''}{item.premium}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'unsold' && (
                <div>
                    <ChartContainer
                        title="전국 미분양 추이"
                        subtitle="미분양 주택 (호)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={unsoldTrend.filter((_, i) => i % 2 === 0)}>
                                <defs>
                                    <linearGradient id="gradientUnsold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    minTickGap={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}천`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v.toLocaleString()}호`]}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="unsold" name="미분양" stroke="#f59e0b" fill="url(#gradientUnsold)" strokeWidth={2} />
                                <Line type="monotone" dataKey="prepaidUnsold" name="준공 후 미분양" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 지역별 미분양 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 12,
                    }}>
                        {unsoldData.map(region => (
                            <div
                                key={region.id}
                                className="card"
                                style={{
                                    padding: 16,
                                    borderLeft: `3px solid ${region.isHigh ? 'var(--color-danger)' : 'var(--color-success)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600 }}>{region.name}</span>
                                    {region.isHigh && <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
                                    {region.unsold.toLocaleString()}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: 4 }}>호</span>
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: region.monthChange >= 0 ? 'var(--color-danger)' : 'var(--color-success)',
                                }}>
                                    전월 대비 {region.monthChange >= 0 ? '+' : ''}{region.monthChange}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'supply' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="연도별 입주 예정 물량"
                        subtitle="지역별 입주 예정 (호)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={supplySchedule}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v.toLocaleString()}호`]}
                                />
                                <Legend />
                                <Bar dataKey="seoul" name="서울" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="gyeonggi" name="경기" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="local" name="지방" fill="#94a3b8" stackId="a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                            공급 전망 및 시사점
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 8 }}>
                                    🚨 2026년 서울 공급 절벽
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    2026년 서울 입주 물량 2.4만호로 전년(4.7만호) 대비 49% 급감 예상
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    📉 인허가 감소 지속
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    2023-2024년 인허가 물량 급감으로 2027-2028년 공급 부족 심화 전망
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    💰 분양가 상승 압력
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    공사비 상승, 공급 감소로 신규 분양가 고공행진 지속 예상
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesMarket;
