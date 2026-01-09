import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Globe, TrendingUp, DollarSign, Home,
    Building2, MapPin
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';

/**
 * 글로벌 비교 분석 페이지
 */
const GlobalComparison = () => {
    const [activeTab, setActiveTab] = useState('price');

    // 주요 도시별 주택가격 지수 데이터
    const globalPriceData = useMemo(() => [
        { city: '서울', price: 125, change: 5.2, pir: 21.5, yieldRate: 2.1 },
        { city: '홍콩', price: 185, change: -8.5, pir: 20.8, yieldRate: 2.3 },
        { city: '싱가포르', price: 145, change: 3.2, pir: 14.2, yieldRate: 2.8 },
        { city: '도쿄', price: 118, change: 8.5, pir: 12.5, yieldRate: 3.2 },
        { city: '뉴욕', price: 135, change: 2.1, pir: 9.8, yieldRate: 4.1 },
        { city: '런던', price: 128, change: -1.5, pir: 12.1, yieldRate: 3.5 },
        { city: '시드니', price: 138, change: 4.8, pir: 11.5, yieldRate: 3.1 },
        { city: '밴쿠버', price: 142, change: -2.3, pir: 13.2, yieldRate: 2.9 },
    ], []);

    // 국가별 정책금리
    const globalRatesData = useMemo(() => [
        { country: '한국', rate: 2.75, previous: 3.5 },
        { country: '미국', rate: 4.5, previous: 5.5 },
        { country: '일본', rate: 0.5, previous: 0.0 },
        { country: '유로존', rate: 3.0, previous: 4.0 },
        { country: '영국', rate: 4.0, previous: 5.25 },
        { country: '호주', rate: 3.5, previous: 4.35 },
        { country: '캐나다', rate: 3.25, previous: 4.5 },
        { country: '중국', rate: 3.1, previous: 3.45 },
    ], []);

    // 가격 상승률 추이 (2020=100)
    const priceIndexTrend = useMemo(() => {
        const data = [];
        for (let year = 2018; year <= 2025; year++) {
            data.push({
                year,
                서울: year === 2018 ? 85 : year === 2019 ? 88 : year === 2020 ? 100 : year === 2021 ? 120 : year === 2022 ? 115 : year === 2023 ? 112 : year === 2024 ? 118 : 125,
                도쿄: year === 2018 ? 92 : year === 2019 ? 95 : year === 2020 ? 100 : year === 2021 ? 105 : year === 2022 ? 110 : year === 2023 ? 115 : year === 2024 ? 120 : 118,
                뉴욕: year === 2018 ? 95 : year === 2019 ? 98 : year === 2020 ? 100 : year === 2021 ? 115 : year === 2022 ? 125 : year === 2023 ? 128 : year === 2024 ? 132 : 135,
                런던: year === 2018 ? 105 : year === 2019 ? 102 : year === 2020 ? 100 : year === 2021 ? 110 : year === 2022 ? 118 : year === 2023 ? 120 : year === 2024 ? 125 : 128,
            });
        }
        return data;
    }, []);

    // 레이더 차트 데이터 (도시 비교)
    const radarData = useMemo(() => [
        { subject: '가격수준', 서울: 85, 도쿄: 75, 뉴욕: 90, 런던: 80 },
        { subject: '임대수익률', 서울: 50, 도쿄: 70, 뉴욕: 85, 런던: 75 },
        { subject: '가격안정성', 서울: 60, 도쿄: 75, 뉴욕: 70, 런던: 65 },
        { subject: '유동성', 서울: 70, 도쿄: 80, 뉴욕: 95, 런던: 90 },
        { subject: '정책지원', 서울: 75, 도쿄: 70, 뉴욕: 65, 런던: 60 },
        { subject: '성장잠재력', 서울: 65, 도쿄: 80, 뉴욕: 70, 런던: 60 },
    ], []);

    const tabs = [
        { id: 'price', label: '가격 비교', icon: DollarSign },
        { id: 'rates', label: '금리 비교', icon: TrendingUp },
        { id: 'trend', label: '가격 추이', icon: Building2 },
        { id: 'radar', label: '종합 비교', icon: Globe },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    글로벌 비교 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    전 세계 주요 도시와 한국 부동산 시장을 비교 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울 PIR"
                    value={21.5}
                    subtitle="세계 2위 수준"
                    icon={Home}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
                <StatCard
                    title="서울 임대수익률"
                    value={2.1}
                    suffix="%"
                    subtitle="주요 도시 중 최저"
                    icon={DollarSign}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
                <StatCard
                    title="한국 기준금리"
                    value={2.75}
                    suffix="%"
                    icon={TrendingUp}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="연간 가격 상승률"
                    value={5.2}
                    suffix="%"
                    icon={Building2}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
            </div>

            {/* Charts */}
            {activeTab === 'price' && (
                <div>
                    <ChartContainer
                        title="주요 도시 주택가격 비교"
                        subtitle="2020년 = 100 기준"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={globalPriceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="city"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 200]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Bar dataKey="price" name="가격지수" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 도시별 상세 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 16,
                    }}>
                        {globalPriceData.map((city, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    padding: 16,
                                    borderLeft: `4px solid ${city.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <MapPin size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                                    <span style={{ fontWeight: 600 }}>{city.city}</span>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{city.price}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>연간 변화</span>
                                        <span style={{ color: city.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                            {city.change >= 0 ? '+' : ''}{city.change}%
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>PIR</span>
                                        <span>{city.pir}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>수익률</span>
                                        <span>{city.yieldRate}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'rates' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="국가별 기준금리"
                        subtitle="현재 vs 전고점 (%)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={globalRatesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="country"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
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
                                    formatter={(v) => [`${v}%`]}
                                />
                                <Legend />
                                <Bar dataKey="rate" name="현재 금리" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="previous" name="전고점" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            🌍 글로벌 금리 동향
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    📉 금리 인하 사이클
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    주요국 중앙은행들이 금리 인하 사이클에 진입. 한국 포함 대부분 국가가 고점 대비 인하 중
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    🇯🇵 일본 예외
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    일본만 유일하게 금리 인상 중. 마이너스 금리에서 탈출하며 정상화 진행
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    💰 부동산 영향
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    금리 인하는 주담대 부담 완화로 주택 수요 증가 요인
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'trend' && (
                <ChartContainer
                    title="주요 도시 가격지수 추이"
                    subtitle="2020년 = 100"
                    height={450}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceIndexTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <YAxis
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
                            <Line type="monotone" dataKey="서울" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} />
                            <Line type="monotone" dataKey="도쿄" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                            <Line type="monotone" dataKey="뉴욕" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                            <Line type="monotone" dataKey="런던" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {activeTab === 'radar' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="도시별 종합 비교"
                        subtitle="100점 만점 기준"
                        height={450}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--color-border)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                                <Radar name="서울" dataKey="서울" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
                                <Radar name="도쿄" dataKey="도쿄" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                                <Radar name="뉴욕" dataKey="뉴욕" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                                <Radar name="런던" dataKey="런던" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
                                <Legend />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            📊 서울 vs 글로벌
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 8 }}>
                                    ⚠️ 높은 PIR (21.5)
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    서울 PIR은 홍콩에 이어 세계 2위. 년 소득 대비 21.5배의 주택가격
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-warning-light)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-warning)', display: 'block', marginBottom: 8 }}>
                                    ⚠️ 낮은 임대수익률 (2.1%)
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    서울 임대수익률은 주요 도시 중 최저. 가격 대비 임대료가 상대적으로 낮음
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    ✅ 안정적 성장
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    홍콩, 밴쿠버 등 하락세와 달리 서울은 연 5% 안정적 상승 지속
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalComparison;
