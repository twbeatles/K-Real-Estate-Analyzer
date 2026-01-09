import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell
} from 'recharts';
import {
    Users, Home, TrendingUp, TrendingDown, MapPin,
    ArrowRight, Building2, AlertTriangle
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generatePopulationPyramid,
    generateHouseholdData,
    generateMigrationData,
    generateMigrationTrend,
    generateHousingDemandForecast,
    generateWorkingAgePopulation,
    getPopulationSummary,
} from '../data/populationData';

/**
 * 인구/세대 구조 분석 페이지
 */
const PopulationAnalysis = () => {
    const [activeTab, setActiveTab] = useState('pyramid');

    // 데이터 생성
    const pyramidData = useMemo(() => generatePopulationPyramid(), []);
    const householdData = useMemo(() => generateHouseholdData(), []);
    const migrationData = useMemo(() => generateMigrationData(), []);
    const migrationTrend = useMemo(() => generateMigrationTrend(), []);
    const demandForecast = useMemo(() => generateHousingDemandForecast(), []);
    const workingAgePop = useMemo(() => generateWorkingAgePopulation(), []);
    const summary = useMemo(() => getPopulationSummary(), []);

    const tabs = [
        { id: 'pyramid', label: '인구 피라미드', icon: Users },
        { id: 'household', label: '세대 구성', icon: Home },
        { id: 'migration', label: '인구 이동', icon: MapPin },
        { id: 'forecast', label: '수요 예측', icon: TrendingUp },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    인구/세대 구조 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    부동산 수요의 핵심 동인인 인구 및 세대 구조 변화를 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="총 인구"
                    value={summary.totalPopulation.toLocaleString()}
                    suffix="천 명"
                    subtitle="2025년 기준"
                    icon={Users}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="총 세대 수"
                    value={summary.totalHouseholds.toLocaleString()}
                    suffix="천 세대"
                    icon={Home}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="1인 가구 비율"
                    value={summary.singleHouseholdRatio}
                    suffix="%"
                    change={2.1}
                    changeLabel="전년 대비"
                    icon={Users}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
                <StatCard
                    title="생산가능인구 비율"
                    value={summary.workingAgeRatio}
                    suffix="%"
                    change={-0.8}
                    changeLabel="전년 대비"
                    icon={TrendingDown}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
            </div>

            {/* Charts */}
            {activeTab === 'pyramid' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="연령별 인구 피라미드"
                        subtitle="2025년 기준 (전체 인구 대비 %)"
                        height={450}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={pyramidData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    domain={[-10, 10]}
                                    tickFormatter={(v) => `${Math.abs(v)}%`}
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="ageGroup"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    width={50}
                                />
                                <Tooltip
                                    formatter={(v, name) => [`${Math.abs(v).toFixed(1)}%`, name === 'male' ? '남성' : '여성']}
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend formatter={(v) => v === 'male' ? '남성' : '여성'} />
                                <Bar dataKey="male" fill="#3b82f6" name="male" radius={[4, 0, 0, 4]} />
                                <Bar dataKey="female" fill="#ec4899" name="female" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="생산가능인구 추이"
                        subtitle="15-64세 인구 (천 명)"
                        height={450}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={workingAgePop}>
                                <defs>
                                    <linearGradient id="gradientWorking" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                                    domain={[30000, 40000]}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}백만`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[60, 80]}
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
                                <ReferenceLine x={2025} stroke="var(--color-danger)" strokeDasharray="5 5" yAxisId="left" />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="workingAgePop"
                                    name="생산가능인구"
                                    stroke="#6366f1"
                                    fill="url(#gradientWorking)"
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="ratio"
                                    name="비율(%)"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'household' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="세대 구성 변화 추이"
                        subtitle="가구원 수별 비율 (%)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={householdData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
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
                                <Area type="monotone" dataKey="single" name="1인 가구" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.8} />
                                <Area type="monotone" dataKey="couple" name="2인 가구" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} />
                                <Area type="monotone" dataKey="threePerson" name="3인 가구" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                                <Area type="monotone" dataKey="fourPlus" name="4인+ 가구" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="1인 가구 비율 상승 추이"
                        subtitle="1인 가구 비율 및 총 세대 수"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={householdData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[20, 40]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}천만`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="right" dataKey="totalHouseholds" name="총 세대 수" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="left" type="monotone" dataKey="single" name="1인 가구 비율" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'migration' && (
                <div>
                    <ChartContainer
                        title="주요 지역 인구 순이동 추이"
                        subtitle="연간 순이동 인구 (천 명)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={migrationTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v >= 0 ? '+' : ''}${v}천 명`]}
                                />
                                <Legend />
                                <ReferenceLine y={0} stroke="var(--color-text-tertiary)" />
                                <Area type="monotone" dataKey="seoul" name="서울" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                                <Area type="monotone" dataKey="gyeonggi" name="경기" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                                <Area type="monotone" dataKey="incheon" name="인천" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* Migration Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 16,
                    }}>
                        {migrationData.slice(0, 8).map(region => (
                            <div
                                key={region.id}
                                className="card"
                                style={{ padding: 16 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontWeight: 600 }}>{region.name}</span>
                                    <span style={{
                                        color: region.netMigration >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                    }}>
                                        {region.netMigration >= 0 ? '+' : ''}{region.netMigration}천
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                    <span>전입: {region.inflow}천</span>
                                    <span>전출: {region.outflow}천</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'forecast' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="신규 주택 수요 전망"
                        subtitle="세대 수 증가 기반 추정 (천 호)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={demandForecast}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}천 호`]}
                                />
                                <Legend />
                                <Bar dataKey="newDemand" name="신규 수요" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="replacementDemand" name="대체 수요" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="supplyForecast" name="예상 공급" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />
                            주요 시사점
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    👥 1인 가구 급증
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    2025년 1인 가구 비율 35% 돌파. 소형 아파트, 오피스텔 수요 증가 전망
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    📉 생산가능인구 감소
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    2017년 정점 이후 지속 감소. 장기적 주택 수요 둔화 요인
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    🏃 탈서울 가속
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    서울 연간 8만명 순유출, 경기도 순유입 12만명. 수도권 외곽 수요 증가
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PopulationAnalysis;
