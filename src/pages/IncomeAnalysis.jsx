import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell
} from 'recharts';
import {
    Wallet, TrendingUp, TrendingDown, Users,
    Briefcase, DollarSign, Home, AlertTriangle
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateHAIData,
    generateRegionalIncomeData,
    generateEmploymentData,
    generateSectorEmployment,
    generateUnemploymentHousePriceData,
    generateHouseholdDebtData,
    getIncomeEmploymentSummary,
} from '../data/incomeData';

/**
 * 소득/고용 분석 페이지
 */
const IncomeAnalysis = () => {
    const [activeTab, setActiveTab] = useState('hai');

    // 데이터 생성
    const haiData = useMemo(() => generateHAIData(), []);
    const regionalIncomeData = useMemo(() => generateRegionalIncomeData(), []);
    const employmentData = useMemo(() => generateEmploymentData(), []);
    const sectorEmployment = useMemo(() => generateSectorEmployment(), []);
    const unemploymentHouseData = useMemo(() => generateUnemploymentHousePriceData(), []);
    const householdDebtData = useMemo(() => generateHouseholdDebtData(), []);
    const summary = useMemo(() => getIncomeEmploymentSummary(), []);

    const tabs = [
        { id: 'hai', label: '주택구입능력(HAI)', icon: Home },
        { id: 'income', label: '소득 분석', icon: Wallet },
        { id: 'employment', label: '고용 지표', icon: Briefcase },
        { id: 'debt', label: '가계부채', icon: DollarSign },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    소득/고용 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    주택구입능력지수(HAI), 지역별 소득, 고용 지표를 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울 HAI"
                    value={summary.seoulHAI}
                    subtitle="100 이상 = 구입 가능"
                    icon={Home}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
                <StatCard
                    title="전국 HAI"
                    value={summary.nationHAI}
                    icon={Home}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="실업률"
                    value={summary.unemploymentRate}
                    suffix="%"
                    icon={Users}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="가계부채"
                    value={summary.householdDebt.toLocaleString()}
                    suffix="조 원"
                    icon={DollarSign}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
            </div>

            {/* Charts */}
            {activeTab === 'hai' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="주택구입능력지수(HAI) 추이"
                        subtitle="100 이상: 중위소득 가구가 중위가격 주택 구입 가능"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={haiData}>
                                <defs>
                                    <linearGradient id="gradientSeoulHAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientNationHAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 120]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <ReferenceLine y={100} stroke="var(--color-text-tertiary)" strokeDasharray="5 5" label={{ value: '구입 가능 기준', fill: 'var(--color-text-tertiary)', fontSize: 11 }} />
                                <Area type="monotone" dataKey="seoul" name="서울" stroke="#ef4444" fill="url(#gradientSeoulHAI)" strokeWidth={2} />
                                <Area type="monotone" dataKey="nation" name="전국" stroke="#10b981" fill="url(#gradientNationHAI)" strokeWidth={2} />
                                <Area type="monotone" dataKey="gyeonggi" name="경기" stroke="#3b82f6" fill="#dbeafe" fillOpacity={0.3} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                            HAI 해석 가이드
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 8 }}>
                                    🚨 서울 HAI {summary.seoulHAI}
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    중위소득 가구가 서울 중위가격 아파트를 구입하려면 소득의 약 240%가 필요합니다.
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    📊 HAI 계산 방식
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    HAI = (중위 가구소득 ÷ 대출상환 필요소득) × 100<br />
                                    100 이상: 소득만으로 주택 구입 가능
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    💡 개선 방향
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    금리 인하, 주택가격 안정, 소득 증가가 HAI 개선 요인
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'income' && (
                <div>
                    <ChartContainer
                        title="지역별 평균 소득 및 PIR"
                        subtitle="연소득 (만원) 및 PIR (주택가격/연소득)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={regionalIncomeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}천만`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 25]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="avgIncome" name="평균 소득" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="pir" name="PIR" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 16,
                    }}>
                        {regionalIncomeData.map(region => (
                            <div
                                key={region.id}
                                className="card"
                                style={{ padding: 16 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontWeight: 600 }}>{region.name}</span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 8px',
                                        background: region.growthRate >= 3 ? 'var(--color-success-light)' : 'var(--color-bg-tertiary)',
                                        color: region.growthRate >= 3 ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}>
                                        +{region.growthRate}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>
                                    {region.avgIncome.toLocaleString()}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: 4 }}>만원</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                    <span>PIR: {region.pir}</span>
                                    <span>주택가격: {(region.avgHomePrice / 10000).toFixed(1)}억</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'employment' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="실업률 vs 주택가격지수"
                        subtitle="고용 상황과 부동산 시장 연관성"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={unemploymentHouseData}>
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
                                    domain={[80, 150]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="unemploymentRate" name="실업률(%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="housePriceIndex" name="주택가격지수" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="업종별 고용자 수"
                        subtitle="2025년 기준 (천 명)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sectorEmployment} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="sector"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v, name, props) => {
                                        if (name === 'employment') {
                                            return [`${v.toLocaleString()}천 명 (${props.payload.change >= 0 ? '+' : ''}${props.payload.change}%)`, '고용자 수'];
                                        }
                                        return [v];
                                    }}
                                />
                                <Bar dataKey="employment" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {sectorEmployment.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.change >= 3 ? '#10b981' : entry.change >= 0 ? '#6366f1' : '#ef4444'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'debt' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="가계부채 추이"
                        subtitle="가계부채 및 주담대 (조 원)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={householdDebtData}>
                                <defs>
                                    <linearGradient id="gradientDebt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}조`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}조 원`]}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="householdDebt" name="가계부채" stroke="#ef4444" fill="url(#gradientDebt)" strokeWidth={2} />
                                <Area type="monotone" dataKey="mortgageDebt" name="주담대" stroke="#6366f1" fill="#e0e7ff" fillOpacity={0.5} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="가계부채/가처분소득 비율"
                        subtitle="DTI 추이 (%)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={householdDebtData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[150, 220]}
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
                                <ReferenceLine y={180} stroke="var(--color-danger)" strokeDasharray="5 5" label={{ value: '위험 수준', fill: 'var(--color-danger)', fontSize: 11 }} />
                                <Line type="monotone" dataKey="debtToIncomeRatio" name="DTI 비율" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}
        </div>
    );
};

export default IncomeAnalysis;
