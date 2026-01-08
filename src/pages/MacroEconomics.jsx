import { useMemo, useState } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { Percent, DollarSign, TrendingUp, BarChart3, Activity } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateHistoricalData,
    generateInterestRateData,
    generateGDPData,
    generateM2Data
} from '../data';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 거시경제 분석 페이지
 */
const MacroEconomics = () => {
    const [activeTab, setActiveTab] = useState('rate');

    const historicalData = useMemo(() => generateHistoricalData(), []);
    const rateData = useMemo(() => generateInterestRateData(), []);
    const gdpData = useMemo(() => generateGDPData(), []);
    const m2Data = useMemo(() => generateM2Data(), []);

    const latestRate = rateData[rateData.length - 1];
    const prevRate = rateData[rateData.length - 5];
    const latestGDP = gdpData[gdpData.length - 1];
    const latestM2 = m2Data[m2Data.length - 1];
    const latestCPI = historicalData[historicalData.length - 1];
    const prevCPI = historicalData[historicalData.length - 13];

    const cpiYoY = ((latestCPI.cpi - prevCPI.cpi) / prevCPI.cpi * 100);

    // 금리와 주택가격 상관 데이터 (연도별)
    const correlationData = useMemo(() => {
        const yearlyHPI = {};
        historicalData.forEach(d => {
            if (!yearlyHPI[d.year]) yearlyHPI[d.year] = [];
            yearlyHPI[d.year].push(d.hpiSeoul);
        });

        return rateData
            .filter((_, i) => i % 4 === 3) // 연말 데이터만
            .map(r => ({
                year: r.year,
                rate: r.rate,
                hpi: yearlyHPI[r.year]
                    ? yearlyHPI[r.year][yearlyHPI[r.year].length - 1]
                    : null,
            }))
            .filter(d => d.hpi !== null);
    }, [historicalData, rateData]);

    const tabs = [
        { id: 'rate', label: '기준금리', icon: Percent },
        { id: 'gdp', label: 'GDP', icon: BarChart3 },
        { id: 'm2', label: '통화량(M2)', icon: DollarSign },
        { id: 'cpi', label: '물가(CPI)', icon: Activity },
    ];

    return (
        <div className="page-container">
            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="기준금리"
                    value={latestRate.rate}
                    suffix="%"
                    change={latestRate.rate - prevRate.rate}
                    changeLabel="전분기 대비"
                    icon={Percent}
                    iconColor="#8b5cf6"
                    iconBg="#ede9fe"
                />
                <StatCard
                    title="GDP 성장률"
                    value={latestGDP.rate}
                    suffix="%"
                    subtitle={`${latestGDP.year}년`}
                    icon={BarChart3}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="M2 통화량"
                    value={formatNumber(latestM2.amount)}
                    suffix="조원"
                    change={latestM2.growthRate}
                    changeLabel="연간 증가율"
                    icon={DollarSign}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
                <StatCard
                    title="소비자물가 상승률"
                    value={cpiYoY.toFixed(1)}
                    suffix="%"
                    subtitle="전년 동월 대비"
                    icon={Activity}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
            </div>

            {/* Charts */}
            {activeTab === 'rate' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="기준금리 추이"
                        subtitle="한국은행 기준금리"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={rateData}>
                                <defs>
                                    <linearGradient id="gradientRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                                    domain={[0, 6]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}%`, '기준금리']}
                                />
                                <ReferenceLine y={2} stroke="var(--color-text-tertiary)" strokeDasharray="5 5" />
                                <Area
                                    type="stepAfter"
                                    dataKey="rate"
                                    stroke="#8b5cf6"
                                    fill="url(#gradientRate)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="금리 vs 주택가격"
                        subtitle="상관관계 분석 (연도별)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={correlationData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 6]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
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
                                <Bar
                                    yAxisId="left"
                                    dataKey="rate"
                                    name="기준금리(%)"
                                    fill="#8b5cf6"
                                    opacity={0.6}
                                    radius={[4, 4, 0, 0]}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="hpi"
                                    name="서울 HPI"
                                    stroke="#ef4444"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#ef4444', r: 3 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'gdp' && (
                <ChartContainer
                    title="연간 GDP 성장률"
                    subtitle="실질 GDP 기준"
                    height={400}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gdpData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                domain={[-2, 10]}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                formatter={(v) => [`${v}%`, 'GDP 성장률']}
                            />
                            <ReferenceLine y={0} stroke="var(--color-text-primary)" />
                            <Bar
                                dataKey="rate"
                                fill="var(--color-success)"
                                radius={[4, 4, 0, 0]}
                            >
                                {gdpData.map((entry, index) => (
                                    <rect
                                        key={index}
                                        fill={entry.rate < 0 ? 'var(--color-danger)' : 'var(--color-success)'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {activeTab === 'm2' && (
                <ChartContainer
                    title="M2 통화량 추이"
                    subtitle="광의통화"
                    height={400}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={m2Data}>
                            <defs>
                                <linearGradient id="gradientM2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}천조`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickFormatter={(v) => `${v}%`}
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
                                yAxisId="left"
                                type="monotone"
                                dataKey="amount"
                                name="M2 잔액(조원)"
                                stroke="#f59e0b"
                                fill="url(#gradientM2)"
                                strokeWidth={2}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="growthRate"
                                name="증가율(%)"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {activeTab === 'cpi' && (
                <ChartContainer
                    title="소비자물가지수 vs 주택가격지수"
                    subtitle="2000년 = 100 기준"
                    height={400}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData.filter((_, i) => i % 6 === 0)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                minTickGap={50}
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
                            <Line type="monotone" dataKey="cpi" name="물가(CPI)" stroke="#94a3b8" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="hpiSeoul" name="서울 집값" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="hpiNation" name="전국 집값" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {/* Insight */}
            <div className="card" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    💡 거시경제와 부동산의 관계
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 16,
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                }}>
                    <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>📉 금리 ↑ → 주택가격 ↓</strong>
                        <p style={{ marginTop: 8 }}>
                            금리 인상은 대출 이자 부담을 증가시켜 주택 구매력을 약화시킵니다.
                            2022년 급격한 금리 인상이 주택시장 조정의 주요 원인이었습니다.
                        </p>
                    </div>
                    <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>💵 유동성 ↑ → 자산가격 ↑</strong>
                        <p style={{ marginTop: 8 }}>
                            M2 통화량 증가는 시중 유동성을 늘려 자산 시장으로 자금이 유입됩니다.
                            2020-2021년 유동성 공급 확대가 주택가격 급등의 배경입니다.
                        </p>
                    </div>
                    <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>📈 인플레이션 헤지</strong>
                        <p style={{ marginTop: 8 }}>
                            부동산은 전통적인 인플레이션 헤지 수단입니다. 장기적으로 주택가격은
                            물가 상승률을 상회하는 경향을 보입니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MacroEconomics;
