import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
    Home, TrendingUp, TrendingDown, AlertTriangle,
    DollarSign, Percent, Calculator, Shield
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateConversionRateData,
    generateJeonseRatioDetail,
    generateRentalYieldData,
    generateGapInvestmentData,
    generateDeepWaterRiskData,
    generateRentalTransactionData,
    getRentalMarketSummary,
} from '../data/rentalData';

/**
 * 전월세 시장 분석 페이지
 */
const RentalMarket = () => {
    const [activeTab, setActiveTab] = useState('conversion');

    // 데이터 생성
    const conversionData = useMemo(() => generateConversionRateData(), []);
    const jeonseRatioDetail = useMemo(() => generateJeonseRatioDetail(), []);
    const rentalYieldData = useMemo(() => generateRentalYieldData(), []);
    const gapInvestmentData = useMemo(() => generateGapInvestmentData(), []);
    const deepWaterRiskData = useMemo(() => generateDeepWaterRiskData(), []);
    const transactionData = useMemo(() => generateRentalTransactionData(), []);
    const summary = useMemo(() => getRentalMarketSummary(), []);

    const tabs = [
        { id: 'conversion', label: '전월세 전환율', icon: Percent },
        { id: 'jeonse', label: '전세가율', icon: Home },
        { id: 'yield', label: '월세 수익률', icon: DollarSign },
        { id: 'risk', label: '깡통전세 위험', icon: AlertTriangle },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    전월세 시장 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    전월세 전환율, 전세가율, 월세 수익률, 깡통전세 위험도를 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="전월세 전환율"
                    value={summary.avgConversionRate}
                    suffix="%"
                    icon={Percent}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="서울 전세가율"
                    value={summary.seoulAvgJeonseRatio}
                    suffix="%"
                    icon={Home}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="평균 월세 수익률"
                    value={summary.avgRentalYield}
                    suffix="%"
                    icon={DollarSign}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
                <StatCard
                    title="월세 비중"
                    value={summary.monthlyRentRatio}
                    suffix="%"
                    change={3.5}
                    changeLabel="전년 대비"
                    icon={TrendingUp}
                    iconColor="#3b82f6"
                    iconBg="#dbeafe"
                />
            </div>

            {/* Charts */}
            {activeTab === 'conversion' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="전월세 전환율 추이"
                        subtitle="지역별 전환율 (%)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={conversionData.filter((_, i) => i % 3 === 0)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    minTickGap={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[3, 7]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}%`]}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="seoul" name="서울" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="gyeonggi" name="경기" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="national" name="전국" stroke="#94a3b8" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="전월세 거래량 추이"
                        subtitle="월세 비중 증가 추세"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={transactionData.filter((_, i) => i % 3 === 0)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    minTickGap={40}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}천`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[30, 60]}
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
                                <Bar yAxisId="left" dataKey="jeonse" name="전세" fill="#6366f1" stackId="a" />
                                <Bar yAxisId="left" dataKey="monthlyRent" name="월세" fill="#10b981" stackId="a" />
                                <Line yAxisId="right" type="monotone" dataKey="monthlyRatio" name="월세비중(%)" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'jeonse' && (
                <div>
                    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            서울 구별 전세가율 현황
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: 12,
                        }}>
                            {jeonseRatioDetail.map(district => (
                                <div
                                    key={district.id}
                                    style={{
                                        padding: 12,
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        borderLeft: `3px solid ${district.riskLevel === 'high' ? 'var(--color-danger)' :
                                                district.riskLevel === 'medium' ? 'var(--color-warning)' :
                                                    'var(--color-success)'
                                            }`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{district.name}</span>
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            color: district.riskLevel === 'high' ? 'var(--color-danger)' :
                                                district.riskLevel === 'medium' ? 'var(--color-warning)' :
                                                    'var(--color-success)',
                                        }}>
                                            {district.ratio}%
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: district.monthChange >= 0 ? 'var(--color-danger)' : 'var(--color-success)',
                                    }}>
                                        전월 {district.monthChange >= 0 ? '+' : ''}{district.monthChange}%p
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 갭투자 수익률 */}
                    <ChartContainer
                        title="갭투자 예상 수익률"
                        subtitle="전세가율 기반 레버리지 수익률"
                        height={350}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gapInvestmentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}%`}
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
                                    formatter={(v, name) => {
                                        if (name === 'expectedReturn') return [`${v}%`, '예상 수익률'];
                                        return [v];
                                    }}
                                />
                                <Bar dataKey="expectedReturn" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {gapInvestmentData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.riskLevel === 'high' ? '#ef4444' : entry.riskLevel === 'medium' ? '#f59e0b' : '#10b981'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'yield' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="지역별 월세 수익률"
                        subtitle="연간 총수익률 기준 (%)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rentalYieldData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}%`]}
                                />
                                <Legend />
                                <Bar dataKey="annualYield" name="총수익률" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="netYield" name="순수익률" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calculator size={18} style={{ color: 'var(--color-primary)' }} />
                            월세 수익률 분석
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {rentalYieldData.slice(0, 5).map((item, index) => (
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
                                            평균 {item.avgPrice.toLocaleString()}만원 / 월세 {item.avgRent}만원
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                                            {item.annualYield}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                            순수익률 {item.netYield}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'risk' && (
                <div>
                    <ChartContainer
                        title="깡통전세 위험 지표 추이"
                        subtitle="전세가율 80% 이상 물건 비율 (%)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={deepWaterRiskData}>
                                <defs>
                                    <linearGradient id="gradientRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}%`]}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="highRiskRatio" name="위험 물건 비율" stroke="#ef4444" fill="url(#gradientRisk)" strokeWidth={2} />
                                <Line type="monotone" dataKey="seoulRiskRatio" name="서울" stroke="#6366f1" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="gyeonggiRiskRatio" name="경기" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={18} style={{ color: 'var(--color-success)' }} />
                            깡통전세 예방 체크리스트
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    ✅ 전세가율 확인
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    전세가율 70% 이하 물건 선택 권장. 매매가 대비 전세가 비율이 높을수록 위험
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    ✅ 근저당 확인
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    등기부등본의 근저당 설정 금액 확인. 전세보증금 + 대출금이 시세의 80% 이하
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    ✅ 전세보증보험 가입
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    HUG, SGI 전세보증보험 가입으로 보증금 미반환 위험 대비
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    ✅ 임대차보호법 요건
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    확정일자 + 전입신고 + 실거주로 대항력 확보
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalMarket;
