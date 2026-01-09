import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
    Building, Store, Truck, Server,
    Bed, TrendingUp, TrendingDown, Percent
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateOfficeVacancyData,
    generateOfficeVacancyTrend,
    generateRetailPremiumData,
    generateLogisticsData,
    generateDataCenterData,
    generateHotelData,
    getCommercialSummary,
} from '../data/commercialData';

/**
 * 상업용 부동산 분석 페이지
 */
const CommercialRealEstate = () => {
    const [activeTab, setActiveTab] = useState('office');

    // 데이터 생성
    const officeVacancy = useMemo(() => generateOfficeVacancyData(), []);
    const vacancyTrend = useMemo(() => generateOfficeVacancyTrend(), []);
    const retailPremium = useMemo(() => generateRetailPremiumData(), []);
    const logisticsData = useMemo(() => generateLogisticsData(), []);
    const dataCenterData = useMemo(() => generateDataCenterData(), []);
    const hotelData = useMemo(() => generateHotelData(), []);
    const summary = useMemo(() => getCommercialSummary(), []);

    const tabs = [
        { id: 'office', label: '오피스', icon: Building },
        { id: 'retail', label: '상가', icon: Store },
        { id: 'logistics', label: '물류/데이터센터', icon: Truck },
        { id: 'hotel', label: '호텔/숙박', icon: Bed },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    상업용 부동산 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    오피스, 상가, 물류센터, 호텔 등 상업용 부동산 시장을 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울 오피스 공실률"
                    value={summary.seoulOfficeVacancy}
                    suffix="%"
                    icon={Building}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="강남 오피스 임대료"
                    value={(summary.gangnamOfficeRent / 10000).toFixed(1)}
                    suffix="만/㎡"
                    icon={TrendingUp}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="호텔 객실점유율"
                    value={summary.hotelOccupancy}
                    suffix="%"
                    icon={Bed}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
                <StatCard
                    title="데이터센터 성장률"
                    value={summary.dataCenterGrowth}
                    suffix="%"
                    icon={Server}
                    iconColor="#3b82f6"
                    iconBg="#dbeafe"
                />
            </div>

            {/* Charts */}
            {activeTab === 'office' && (
                <div>
                    <ChartContainer
                        title="주요 업무지구 공실률 추이"
                        subtitle="분기별 공실률 (%)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={vacancyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    minTickGap={30}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 20]}
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
                                <Line type="monotone" dataKey="cbd" name="CBD (광화문)" stroke="#6366f1" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="gbd" name="GBD (강남)" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="ybd" name="YBD (여의도)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 업무지구별 현황 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 16,
                    }}>
                        {officeVacancy.map(district => (
                            <div
                                key={district.id}
                                className="card"
                                style={{
                                    padding: 20,
                                    borderLeft: `4px solid ${district.vacancy < 6 ? 'var(--color-success)' : district.vacancy < 10 ? 'var(--color-warning)' : 'var(--color-danger)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontWeight: 600 }}>{district.name}</span>
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        color: district.vacancy < 6 ? 'var(--color-success)' : district.vacancy < 10 ? 'var(--color-warning)' : 'var(--color-danger)',
                                    }}>
                                        {district.vacancy}%
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>평균 임대료</span>
                                        <span>{(district.avgRent / 10000).toFixed(1)}만/㎡</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>프라임 임대료</span>
                                        <span>{(district.primeRent / 10000).toFixed(1)}만/㎡</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'retail' && (
                <div>
                    <ChartContainer
                        title="서울 주요 상권 권리금"
                        subtitle="평균 권리금 (만원/3.3㎡)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={retailPremium} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    width={80}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${(v / 10000).toFixed(1)}만원`]}
                                />
                                <Bar dataKey="premium" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {retailPremium.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.trend === 'up' ? '#10b981' : '#ef4444'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 상권별 상세 정보 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 16,
                    }}>
                        {retailPremium.map((item, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{ padding: 16 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                    {item.trend === 'up' ? (
                                        <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
                                    ) : (
                                        <TrendingDown size={16} style={{ color: 'var(--color-danger)' }} />
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>권리금</span>
                                        <span style={{ fontWeight: 600 }}>{(item.premium / 10000).toFixed(0)}만원</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>월 임대료</span>
                                        <span>{(item.rent / 10000).toFixed(0)}만원</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>공실률</span>
                                        <span>{item.vacancyRate}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'logistics' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="물류센터 수급 추이"
                        subtitle="공급/수요 (만평)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={logisticsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 15]}
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
                                <Bar yAxisId="left" dataKey="supply" name="공급" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="left" dataKey="demand" name="수요" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="vacancy" name="공실률(%)" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="데이터센터 시장 전망"
                        subtitle="용량 (MW) 및 성장률"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={dataCenterData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 30]}
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
                                <Bar yAxisId="left" dataKey="capacity" name="용량(MW)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {dataCenterData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isProjection ? '#94a3b8' : '#3b82f6'}
                                        />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="growth" name="성장률(%)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'hotel' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="호텔 객실점유율 및 ADR"
                        subtitle="점유율(%) / 평균 객실료(원)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={hotelData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v, name) => {
                                        if (name === 'occupancy') return [`${v}%`, '점유율'];
                                        return [`${v.toLocaleString()}원`, name];
                                    }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="occupancy" name="객실점유율" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="adr" name="ADR" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                                <Line yAxisId="right" type="monotone" dataKey="revpar" name="RevPAR" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            🏨 호텔 시장 인사이트
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    📈 회복세 지속
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    2020년 코로나 충격 이후 객실점유율 회복. 2025년 코로나 이전 수준 상회
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    💰 ADR 상승
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    인플레이션과 수요 회복으로 평균 객실료(ADR) 역대 최고 수준 기록
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    🌍 관광 수요 증가
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    외국인 관광객 증가와 K-컬처 영향으로 호텔 투자 수익성 개선
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommercialRealEstate;
