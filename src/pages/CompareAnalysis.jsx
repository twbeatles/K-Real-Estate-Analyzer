import { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart2, Plus, X, MapPin, TrendingUp, ArrowLeftRight } from 'lucide-react';
import ChartContainer from '../components/ui/ChartContainer';
import { generateHistoricalData, generateRegionalData } from '../data';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 비교 분석 페이지
 */
const CompareAnalysis = () => {
    const [compareType, setCompareType] = useState('region'); // region or apartment
    const [selectedItems, setSelectedItems] = useState(['seoul', 'gyeonggi']);
    const [period, setPeriod] = useState('5y');

    const historicalData = useMemo(() => generateHistoricalData(), []);
    const regions = useMemo(() => generateRegionalData(), []);

    const periodMap = { '1y': 12, '3y': 36, '5y': 60, '10y': 120, 'all': historicalData.length };
    const chartData = historicalData.slice(-periodMap[period]);

    const regionColors = {
        seoul: '#ef4444',
        gyeonggi: '#f97316',
        incheon: '#eab308',
        busan: '#22c55e',
        daegu: '#14b8a6',
        daejeon: '#0ea5e9',
        gwangju: '#6366f1',
        sejong: '#ec4899',
    };

    const regionOptions = [
        { id: 'seoul', name: '서울', dataKey: 'hpiSeoul' },
        { id: 'gyeonggi', name: '경기', dataKey: 'hpiGyeonggi' },
        { id: 'nation', name: '전국', dataKey: 'hpiNation' },
        { id: 'local', name: '지방', dataKey: 'hpiLocal' },
    ];

    const addItem = (id) => {
        if (!selectedItems.includes(id) && selectedItems.length < 4) {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const removeItem = (id) => {
        if (selectedItems.length > 1) {
            setSelectedItems(selectedItems.filter(i => i !== id));
        }
    };

    // 비교 통계 계산
    const compareStats = useMemo(() => {
        const start = chartData[0];
        const end = chartData[chartData.length - 1];

        return selectedItems.map(id => {
            const option = regionOptions.find(r => r.id === id);
            if (!option) return null;

            const startValue = start[option.dataKey];
            const endValue = end[option.dataKey];
            const change = ((endValue - startValue) / startValue) * 100;

            return {
                id,
                name: option.name,
                startValue,
                endValue,
                change,
                color: regionColors[id] || 'var(--color-primary)',
            };
        }).filter(Boolean);
    }, [chartData, selectedItems]);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <BarChart2 size={20} style={{ color: 'var(--color-primary)' }} />
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>비교 분석</h2>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {['1y', '3y', '5y', '10y', 'all'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`btn ${period === p ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                                {p === 'all' ? '전체' : p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selection Area */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 className="card-title" style={{ marginBottom: 16 }}>비교 대상 선택 (최대 4개)</h3>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                    {/* Selected Items */}
                    {selectedItems.map(id => {
                        const option = regionOptions.find(r => r.id === id);
                        if (!option) return null;

                        return (
                            <div
                                key={id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: 'var(--color-primary-light)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${regionColors[id] || 'var(--color-primary)'}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        background: regionColors[id] || 'var(--color-primary)'
                                    }}
                                />
                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{option.name}</span>
                                {selectedItems.length > 1 && (
                                    <button
                                        onClick={() => removeItem(id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-tertiary)',
                                            padding: 2,
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Add Button */}
                    {selectedItems.length < 4 && (
                        <div style={{ position: 'relative' }}>
                            <select
                                onChange={(e) => { addItem(e.target.value); e.target.value = ''; }}
                                className="input select"
                                style={{ paddingRight: 40 }}
                                value=""
                            >
                                <option value="" disabled>+ 추가</option>
                                {regionOptions
                                    .filter(r => !selectedItems.includes(r.id))
                                    .map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Comparison Stats */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                {compareStats.map(stat => (
                    <div
                        key={stat.id}
                        className="stat-card"
                        style={{ borderTop: `3px solid ${stat.color}` }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <MapPin size={16} style={{ color: stat.color }} />
                            <span style={{ fontWeight: 600 }}>{stat.name}</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
                            {stat.endValue.toFixed(1)}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.875rem',
                            color: stat.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        }}>
                            <TrendingUp size={14} />
                            {formatPercent(stat.change)} (기간 내)
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison Chart */}
            <ChartContainer
                title="지역별 주택가격지수 비교"
                subtitle={`${chartData[0]?.date} ~ ${chartData[chartData.length - 1]?.date}`}
                height={450}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
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
                        {selectedItems.map(id => {
                            const option = regionOptions.find(r => r.id === id);
                            if (!option) return null;

                            return (
                                <Line
                                    key={id}
                                    type="monotone"
                                    dataKey={option.dataKey}
                                    name={option.name}
                                    stroke={regionColors[id] || 'var(--color-primary)'}
                                    strokeWidth={2.5}
                                    dot={false}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Comparison Table */}
            <div className="card" style={{ marginTop: 24 }}>
                <h3 className="card-title" style={{ marginBottom: 16 }}>상세 비교</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>지역</th>
                                <th>시작 지수</th>
                                <th>현재 지수</th>
                                <th>변화율</th>
                                <th>순위</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...compareStats]
                                .sort((a, b) => b.change - a.change)
                                .map((stat, idx) => (
                                    <tr key={stat.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: stat.color }} />
                                                {stat.name}
                                            </div>
                                        </td>
                                        <td style={{ fontFeatureSettings: "'tnum' 1" }}>{stat.startValue.toFixed(1)}</td>
                                        <td style={{ fontFeatureSettings: "'tnum' 1", fontWeight: 600 }}>{stat.endValue.toFixed(1)}</td>
                                        <td style={{
                                            color: stat.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                            fontWeight: 600,
                                        }}>
                                            {formatPercent(stat.change)}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: idx === 0 ? 'var(--color-warning)' : 'var(--color-bg-tertiary)',
                                                color: idx === 0 ? 'white' : 'var(--color-text-secondary)',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                            }}>
                                                {idx + 1}위
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompareAnalysis;
