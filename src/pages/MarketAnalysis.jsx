import { useMemo, useState } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush, ComposedChart
} from 'recharts';
import { Home, Building2, MapPin, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import { generateHistoricalData, generateTransactionData } from '../data';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 시장 분석 페이지
 */
const MarketAnalysis = () => {
    const [activeTab, setActiveTab] = useState('price');
    const [region, setRegion] = useState('all');
    const [period, setPeriod] = useState('5y');

    const historicalData = useMemo(() => generateHistoricalData(), []);
    const transactionData = useMemo(() => generateTransactionData(), []);

    // 기간 필터링
    const getFilteredData = () => {
        const periodMap = { '1y': 12, '3y': 36, '5y': 60, '10y': 120, 'all': historicalData.length };
        return historicalData.slice(-periodMap[period]);
    };

    const filteredData = getFilteredData();
    const latestData = historicalData[historicalData.length - 1];
    const startData = filteredData[0];

    // 변화율 계산
    const calcChange = (end, start) => ((end - start) / start * 100);
    const seoulChange = calcChange(latestData.hpiSeoul, startData.hpiSeoul);
    const nationChange = calcChange(latestData.hpiNation, startData.hpiNation);
    const gyeonggiChange = calcChange(latestData.hpiGyeonggi, startData.hpiGyeonggi);
    const localChange = calcChange(latestData.hpiLocal, startData.hpiLocal);

    const tabs = [
        { id: 'price', label: '가격지수', icon: TrendingUp },
        { id: 'jeonse', label: '매매/전세', icon: Home },
        { id: 'volume', label: '거래량', icon: Building2 },
    ];

    const periodOptions = [
        { id: '1y', label: '1년' },
        { id: '3y', label: '3년' },
        { id: '5y', label: '5년' },
        { id: '10y', label: '10년' },
        { id: 'all', label: '전체' },
    ];

    return (
        <div className="page-container">
            {/* Header Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 16,
            }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                <div style={{ display: 'flex', gap: 8 }}>
                    {periodOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setPeriod(opt.id)}
                            className={`btn ${period === opt.id ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '8px 14px' }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울"
                    value={latestData.hpiSeoul}
                    change={seoulChange}
                    changeLabel={`${startData.date} 대비`}
                    icon={MapPin}
                    iconColor="#ef4444"
                    iconBg="var(--color-danger-light)"
                />
                <StatCard
                    title="경기"
                    value={latestData.hpiGyeonggi}
                    change={gyeonggiChange}
                    changeLabel={`${startData.date} 대비`}
                    icon={MapPin}
                    iconColor="#f97316"
                    iconBg="#ffedd5"
                />
                <StatCard
                    title="전국"
                    value={latestData.hpiNation}
                    change={nationChange}
                    changeLabel={`${startData.date} 대비`}
                    icon={MapPin}
                    iconColor="#3b82f6"
                    iconBg="#dbeafe"
                />
                <StatCard
                    title="지방"
                    value={latestData.hpiLocal}
                    change={localChange}
                    changeLabel={`${startData.date} 대비`}
                    icon={MapPin}
                    iconColor="#64748b"
                    iconBg="#f1f5f9"
                />
            </div>

            {/* Main Chart */}
            {activeTab === 'price' && (
                <ChartContainer
                    title="지역별 주택가격지수 비교"
                    subtitle={`${startData.date} ~ ${latestData.date}`}
                    height={450}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickMargin={10}
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
                            <Line type="monotone" dataKey="hpiSeoul" name="서울" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="hpiGyeonggi" name="경기" stroke="#f97316" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="hpiNation" name="전국" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="hpiLocal" name="지방" stroke="#64748b" strokeWidth={1.5} dot={false} />
                            <Brush
                                dataKey="date"
                                height={30}
                                stroke="var(--color-border)"
                                fill="var(--color-bg-tertiary)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {activeTab === 'jeonse' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="서울 매매/전세 비교"
                        subtitle="갭 분석"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={filteredData}>
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
                                <Area
                                    type="monotone"
                                    dataKey="hpiSeoul"
                                    name="매매"
                                    fill="#ef444420"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="jeonseSeoul"
                                    name="전세"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="전국 매매/전세 비교"
                        subtitle="갭 분석"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={filteredData}>
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
                                <Area
                                    type="monotone"
                                    dataKey="hpiNation"
                                    name="매매"
                                    fill="#3b82f620"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="jeonseNation"
                                    name="전세"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {activeTab === 'volume' && (
                <ChartContainer
                    title="월별 거래량 추이"
                    subtitle="전국 아파트 매매"
                    height={450}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={transactionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                minTickGap={30}
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
                                formatter={(v) => [formatNumber(v), '거래량']}
                            />
                            <Bar
                                dataKey="volume"
                                fill="var(--color-primary)"
                                radius={[2, 2, 0, 0]}
                            />
                            <Brush
                                dataKey="date"
                                height={30}
                                stroke="var(--color-border)"
                                fill="var(--color-bg-tertiary)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            )}

            {/* Insight Box */}
            <div
                className="card"
                style={{
                    marginTop: 24,
                    background: 'linear-gradient(135deg, var(--color-primary), #7c3aed)',
                    border: 'none',
                    color: 'white',
                }}
            >
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>
                    📊 시장 분석 인사이트
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    <div>
                        <strong style={{ display: 'block', marginBottom: 4 }}>2020-2021 폭등기</strong>
                        <p style={{ opacity: 0.9, fontSize: '0.875rem', lineHeight: 1.6 }}>
                            저금리와 유동성 공급으로 서울 아파트 가격이 급등했습니다.
                            패닉바잉 현상이 두드러졌으며, 전국적으로 동조화 현상이 나타났습니다.
                        </p>
                    </div>
                    <div>
                        <strong style={{ display: 'block', marginBottom: 4 }}>2022 조정기</strong>
                        <p style={{ opacity: 0.9, fontSize: '0.875rem', lineHeight: 1.6 }}>
                            급격한 금리 인상으로 매수세가 위축되며 가격 조정이 시작되었습니다.
                            거래량이 급감하고 급매물이 증가했습니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysis;
