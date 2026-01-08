import { useState, useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Calculator, TrendingUp, TrendingDown, Percent, DollarSign,
    BarChart3, Play, RefreshCw, Info, AlertTriangle
} from 'lucide-react';
import ChartContainer from '../components/ui/ChartContainer';
import { generateHistoricalData } from '../data';
import { simulateScenario } from '../data/advancedAnalytics';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 시나리오 시뮬레이터 페이지
 * "금리가 1% 오르면 주택가격은?" 조건별 예측 도구
 */
const ScenarioSimulator = () => {
    const [rateChange, setRateChange] = useState(0);
    const [m2Change, setM2Change] = useState(0);
    const [gdpChange, setGdpChange] = useState(2);
    const [years, setYears] = useState(5);
    const [selectedPreset, setSelectedPreset] = useState(null);

    const historicalData = useMemo(() => generateHistoricalData(), []);
    const latestHPI = historicalData[historicalData.length - 1].hpiSeoul;

    // 시뮬레이션 결과
    const simulationResult = useMemo(() => {
        return simulateScenario(latestHPI, rateChange, m2Change, gdpChange, years);
    }, [latestHPI, rateChange, m2Change, gdpChange, years]);

    // 프리셋 시나리오
    const presets = [
        {
            id: 'hawkish',
            label: '긴축 시나리오',
            icon: TrendingDown,
            description: '금리 인상 + 유동성 축소',
            rate: 1.5, m2: -2, gdp: 1.5,
            color: '#ef4444',
        },
        {
            id: 'neutral',
            label: '현상 유지',
            icon: BarChart3,
            description: '현재 정책 기조 유지',
            rate: 0, m2: 3, gdp: 2,
            color: '#f59e0b',
        },
        {
            id: 'dovish',
            label: '완화 시나리오',
            icon: TrendingUp,
            description: '금리 인하 + 유동성 확대',
            rate: -1, m2: 8, gdp: 2.5,
            color: '#10b981',
        },
        {
            id: 'crisis',
            label: '위기 시나리오',
            icon: AlertTriangle,
            description: '경기 침체 + 급격한 금리 인하',
            rate: -2, m2: 15, gdp: -1,
            color: '#8b5cf6',
        },
    ];

    const applyPreset = (preset) => {
        setSelectedPreset(preset.id);
        setRateChange(preset.rate);
        setM2Change(preset.m2);
        setGdpChange(preset.gdp);
    };

    const resetScenario = () => {
        setSelectedPreset(null);
        setRateChange(0);
        setM2Change(0);
        setGdpChange(2);
    };

    // 차트 데이터
    const chartData = useMemo(() => {
        const base = [{ year: 0, hpi: latestHPI, label: '현재' }];
        return [...base, ...simulationResult.map(r => ({ ...r, label: `${r.year}년 후` }))];
    }, [latestHPI, simulationResult]);

    const finalResult = simulationResult[simulationResult.length - 1];
    const isPositive = finalResult?.cumulative >= 0;

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}>
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>시나리오 시뮬레이터</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                거시경제 변수 변화에 따른 주택가격 예측
                            </p>
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={resetScenario}>
                        <RefreshCw size={16} />
                        초기화
                    </button>
                </div>
            </div>

            {/* Preset Scenarios */}
            <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>프리셋 시나리오</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    {presets.map(preset => {
                        const Icon = preset.icon;
                        const isSelected = selectedPreset === preset.id;

                        return (
                            <button
                                key={preset.id}
                                onClick={() => applyPreset(preset)}
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    border: isSelected ? `2px solid ${preset.color}` : '1px solid var(--color-border)',
                                    padding: 16,
                                    textAlign: 'left',
                                    background: isSelected ? `${preset.color}10` : 'var(--color-bg-secondary)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <Icon size={18} style={{ color: preset.color }} />
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{preset.label}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                    {preset.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Input Controls */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>시나리오 설정</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                    {/* 금리 변화 */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Percent size={16} style={{ color: '#8b5cf6' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>금리 변화</span>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: rateChange > 0 ? 'var(--color-danger)' : rateChange < 0 ? 'var(--color-success)' : 'var(--color-text-primary)',
                            }}>
                                {rateChange > 0 ? '+' : ''}{rateChange}%p
                            </span>
                        </label>
                        <input
                            type="range"
                            min={-3}
                            max={3}
                            step={0.25}
                            value={rateChange}
                            onChange={(e) => { setRateChange(Number(e.target.value)); setSelectedPreset(null); }}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                            <span>-3%p</span>
                            <span>+3%p</span>
                        </div>
                    </div>

                    {/* M2 변화 */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <DollarSign size={16} style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>M2 증가율</span>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: m2Change > 5 ? 'var(--color-success)' : 'var(--color-text-primary)',
                            }}>
                                {m2Change > 0 ? '+' : ''}{m2Change}%
                            </span>
                        </label>
                        <input
                            type="range"
                            min={-5}
                            max={20}
                            step={1}
                            value={m2Change}
                            onChange={(e) => { setM2Change(Number(e.target.value)); setSelectedPreset(null); }}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                            <span>-5%</span>
                            <span>+20%</span>
                        </div>
                    </div>

                    {/* GDP 성장률 */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <BarChart3 size={16} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>GDP 성장률</span>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: gdpChange > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                            }}>
                                {gdpChange > 0 ? '+' : ''}{gdpChange}%
                            </span>
                        </label>
                        <input
                            type="range"
                            min={-3}
                            max={6}
                            step={0.5}
                            value={gdpChange}
                            onChange={(e) => { setGdpChange(Number(e.target.value)); setSelectedPreset(null); }}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                            <span>-3%</span>
                            <span>+6%</span>
                        </div>
                    </div>

                    {/* 예측 기간 */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Play size={16} style={{ color: '#3b82f6' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>예측 기간</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 600 }}>
                                {years}년
                            </span>
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            step={1}
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                            <span>1년</span>
                            <span>10년</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">현재 HPI</span>
                    </div>
                    <div className="stat-card-value">{latestHPI.toFixed(1)}</div>
                    <div className="stat-card-label">서울 주택가격지수</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">{years}년 후 예상</span>
                        {isPositive ? <TrendingUp size={20} style={{ color: 'var(--color-success)' }} /> : <TrendingDown size={20} style={{ color: 'var(--color-danger)' }} />}
                    </div>
                    <div className="stat-card-value" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {finalResult?.hpi.toFixed(1)}
                    </div>
                    <div className="stat-card-label">예상 HPI</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">누적 변화율</span>
                    </div>
                    <div className="stat-card-value" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {isPositive ? '+' : ''}{finalResult?.cumulative.toFixed(1)}%
                    </div>
                    <div className="stat-card-label">{years}년간</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">연평균 변화</span>
                    </div>
                    <div className="stat-card-value" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {finalResult?.change > 0 ? '+' : ''}{finalResult?.change.toFixed(2)}%
                    </div>
                    <div className="stat-card-label">연간</div>
                </div>
            </div>

            {/* Chart */}
            <ChartContainer
                title="주택가격지수 예측"
                subtitle={`시나리오: 금리 ${rateChange > 0 ? '+' : ''}${rateChange}%p, M2 ${m2Change > 0 ? '+' : ''}${m2Change}%, GDP ${gdpChange > 0 ? '+' : ''}${gdpChange}%`}
                height={400}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                            }}
                            formatter={(v) => [v.toFixed(1), 'HPI']}
                        />
                        <Area
                            type="monotone"
                            dataKey="hpi"
                            stroke={isPositive ? '#10b981' : '#ef4444'}
                            fill="url(#gradientForecast)"
                            strokeWidth={3}
                            dot={{ fill: isPositive ? '#10b981' : '#ef4444', r: 5 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Methodology */}
            <div className="card" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={18} />
                    모델 설명
                </h3>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                }}>
                    <p>이 시뮬레이터는 역사적 데이터를 기반으로 추정된 회귀계수를 사용합니다:</p>
                    <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                        <li>금리 1%p 상승 → HPI 약 <strong>3.5%</strong> 하락</li>
                        <li>M2 1% 증가 → HPI 약 <strong>0.8%</strong> 상승</li>
                        <li>GDP 1% 성장 → HPI 약 <strong>1.2%</strong> 상승</li>
                    </ul>
                    <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                        ※ 실제 시장은 다양한 요인에 의해 영향을 받으며, 본 예측은 참고용입니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScenarioSimulator;
