import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { MapPin, TrendingUp, TrendingDown, Users, Building2, Filter } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import { generateRegionalData } from '../data';
import { formatNumber, formatPercent, formatCompactCurrency } from '../utils/formatters';

/**
 * 지역별 분석 페이지
 */
const RegionalAnalysis = () => {
    const [sortBy, setSortBy] = useState('changeRate'); // changeRate, avgPrice, transactionVolume
    const [selectedRegion, setSelectedRegion] = useState(null);

    const regions = useMemo(() => generateRegionalData(), []);

    // 정렬된 데이터
    const sortedRegions = useMemo(() => {
        return [...regions].sort((a, b) => {
            if (sortBy === 'changeRate') return b.changeRate - a.changeRate;
            if (sortBy === 'avgPrice') return b.avgPrice - a.avgPrice;
            return b.transactionVolume - a.transactionVolume;
        });
    }, [regions, sortBy]);

    // 수도권 vs 비수도권 비교
    const capitalRegions = regions.filter(r => ['seoul', 'gyeonggi', 'incheon'].includes(r.id));
    const nonCapitalRegions = regions.filter(r => !['seoul', 'gyeonggi', 'incheon'].includes(r.id));

    const capitalAvg = capitalRegions.reduce((sum, r) => sum + r.currentIndex, 0) / capitalRegions.length;
    const nonCapitalAvg = nonCapitalRegions.reduce((sum, r) => sum + r.currentIndex, 0) / nonCapitalRegions.length;

    // 상승/하락 지역 카운트
    const upCount = regions.filter(r => r.changeRate > 0).length;
    const downCount = regions.filter(r => r.changeRate < 0).length;

    // 파이 차트 데이터
    const pieData = [
        { name: '수도권', value: capitalRegions.reduce((s, r) => s + r.transactionVolume, 0) },
        { name: '비수도권', value: nonCapitalRegions.reduce((s, r) => s + r.transactionVolume, 0) },
    ];

    const sortOptions = [
        { id: 'changeRate', label: '변화율순' },
        { id: 'avgPrice', label: '가격순' },
        { id: 'transactionVolume', label: '거래량순' },
    ];

    return (
        <div className="page-container">
            {/* Stats */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="수도권 평균 지수"
                    value={capitalAvg.toFixed(1)}
                    subtitle="서울·경기·인천"
                    icon={Building2}
                    iconColor="#ef4444"
                    iconBg="var(--color-danger-light)"
                />
                <StatCard
                    title="비수도권 평균 지수"
                    value={nonCapitalAvg.toFixed(1)}
                    subtitle="기타 지역"
                    icon={MapPin}
                    iconColor="#3b82f6"
                    iconBg="#dbeafe"
                />
                <StatCard
                    title="상승 지역"
                    value={upCount}
                    suffix="개"
                    subtitle="전월 대비"
                    icon={TrendingUp}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="하락 지역"
                    value={downCount}
                    suffix="개"
                    subtitle="전월 대비"
                    icon={TrendingDown}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                {/* Regional Chart */}
                <ChartContainer
                    title="지역별 현황"
                    subtitle="변화율 기준 정렬"
                    height={600}
                    actions={
                        <div style={{ display: 'flex', gap: 4 }}>
                            {sortOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortBy(opt.id)}
                                    className={`btn ${sortBy === opt.id ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={sortedRegions}
                            layout="vertical"
                            margin={{ left: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                tickFormatter={(v) => sortBy === 'changeRate' ? `${v}%` : formatCompactCurrency(v)}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                                width={50}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                formatter={(value) => {
                                    if (sortBy === 'changeRate') return [formatPercent(value), '변화율'];
                                    if (sortBy === 'avgPrice') return [formatCompactCurrency(value), '평균가격'];
                                    return [formatNumber(value), '거래량'];
                                }}
                            />
                            <Bar
                                dataKey={sortBy}
                                radius={[0, 4, 4, 0]}
                            >
                                {sortedRegions.map((entry, index) => (
                                    <Cell
                                        key={entry.id}
                                        fill={
                                            sortBy === 'changeRate'
                                                ? entry.changeRate > 0 ? '#10b981' : '#ef4444'
                                                : entry.color
                                        }
                                        opacity={selectedRegion === entry.id ? 1 : 0.85}
                                        cursor="pointer"
                                        onClick={() => setSelectedRegion(entry.id)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Side Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Pie Chart */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 16 }}>수도권 vs 비수도권 거래 비중</h3>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                        formatter={(value) => [formatNumber(value), '거래량']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top 5 Ranking */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 16 }}>
                            {sortBy === 'changeRate' && '상승률 TOP 5'}
                            {sortBy === 'avgPrice' && '고가 지역 TOP 5'}
                            {sortBy === 'transactionVolume' && '거래량 TOP 5'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {sortedRegions.slice(0, 5).map((region, index) => (
                                <div
                                    key={region.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                    onClick={() => setSelectedRegion(region.id)}
                                >
                                    <span style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: 'var(--radius-sm)',
                                        background: index === 0 ? 'var(--color-warning)' :
                                            index === 1 ? '#c0c0c0' :
                                                index === 2 ? '#cd7f32' : 'var(--color-bg-secondary)',
                                        color: index < 3 ? 'white' : 'var(--color-text-tertiary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                    }}>
                                        {index + 1}
                                    </span>
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: region.color
                                    }} />
                                    <span style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem' }}>
                                        {region.name}
                                    </span>
                                    <span style={{
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        color: sortBy === 'changeRate'
                                            ? region.changeRate > 0 ? 'var(--color-success)' : 'var(--color-danger)'
                                            : 'var(--color-text-primary)',
                                        fontFeatureSettings: "'tnum' 1",
                                    }}>
                                        {sortBy === 'changeRate' && formatPercent(region.changeRate)}
                                        {sortBy === 'avgPrice' && formatCompactCurrency(region.avgPrice)}
                                        {sortBy === 'transactionVolume' && formatNumber(region.transactionVolume)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Region Detail (if selected) */}
                    {selectedRegion && (() => {
                        const region = regions.find(r => r.id === selectedRegion);
                        if (!region) return null;

                        return (
                            <div className="card" style={{
                                background: 'linear-gradient(135deg, var(--color-primary), #7c3aed)',
                                color: 'white',
                                border: 'none',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{region.name}</h3>
                                    <button
                                        onClick={() => setSelectedRegion(null)}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        닫기
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>현재 지수</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{region.currentIndex}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>변화율</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatPercent(region.changeRate)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>평균가격</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCompactCurrency(region.avgPrice)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>거래량</p>
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatNumber(region.transactionVolume)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Responsive override */}
            <style>{`
        @media (max-width: 1024px) {
          .page-container > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default RegionalAnalysis;
