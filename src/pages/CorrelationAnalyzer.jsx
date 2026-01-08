import { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
    TrendingUp, TrendingDown, Activity, Percent, DollarSign,
    BarChart3, RefreshCw, Info
} from 'lucide-react';
import ChartContainer from '../components/ui/ChartContainer';
import { generateHistoricalData, generateInterestRateData, generateM2Data } from '../data';
import {
    calculateCorrelation,
    calculateLaggedCorrelation,
    linearRegression
} from '../data/advancedAnalytics';
import { formatPercent } from '../utils/formatters';

/**
 * 상관관계 분석기 페이지
 * 부동산과 거시경제 변수 간의 상관관계 분석
 */
const CorrelationAnalyzer = () => {
    const [variable1, setVariable1] = useState('hpiSeoul');
    const [variable2, setVariable2] = useState('rate');
    const [maxLag, setMaxLag] = useState(12);

    const historicalData = useMemo(() => generateHistoricalData(), []);
    const rateData = useMemo(() => generateInterestRateData(), []);
    const m2Data = useMemo(() => generateM2Data(), []);

    const variables = [
        { id: 'hpiSeoul', label: '서울 주택가격지수', color: '#ef4444' },
        { id: 'hpiNation', label: '전국 주택가격지수', color: '#3b82f6' },
        { id: 'cpi', label: '소비자물가지수', color: '#f59e0b' },
        { id: 'jeonseSeoul', label: '서울 전세지수', color: '#10b981' },
        { id: 'rate', label: '기준금리', color: '#8b5cf6' },
        { id: 'm2', label: 'M2 통화량', color: '#ec4899' },
    ];

    // 연간 데이터 준비
    const yearlyData = useMemo(() => {
        const result = [];

        for (let year = 2000; year <= 2025; year++) {
            const histYear = historicalData.filter(d => d.year === year);
            const rateYear = rateData.filter(d => d.year === year);
            const m2Year = m2Data.filter(d => d.year === year);

            if (histYear.length > 0) {
                result.push({
                    year,
                    hpiSeoul: histYear[histYear.length - 1].hpiSeoul,
                    hpiNation: histYear[histYear.length - 1].hpiNation,
                    cpi: histYear[histYear.length - 1].cpi,
                    jeonseSeoul: histYear[histYear.length - 1].jeonseSeoul,
                    rate: rateYear.length > 0 ? rateYear[rateYear.length - 1].rate : null,
                    m2: m2Year.length > 0 ? m2Year[0].amount : null,
                });
            }
        }

        return result;
    }, [historicalData, rateData, m2Data]);

    // 상관계수 계산
    const correlation = useMemo(() => {
        const x = yearlyData.map(d => d[variable1]).filter(v => v !== null);
        const y = yearlyData.map(d => d[variable2]).filter(v => v !== null);
        return calculateCorrelation(x, y);
    }, [yearlyData, variable1, variable2]);

    // 시차 상관관계
    const laggedCorrelation = useMemo(() => {
        const x = historicalData.map(d => d[variable1] || 0);
        const rateExtended = rateData.flatMap(d => Array(3).fill(d.rate));
        const y = variable2 === 'rate' ? rateExtended.slice(0, x.length) : historicalData.map(d => d[variable2] || 0);

        return calculateLaggedCorrelation(x, y, maxLag);
    }, [historicalData, rateData, variable1, variable2, maxLag]);

    // 회귀분석
    const regression = useMemo(() => {
        const x = yearlyData.map(d => d[variable2]).filter((v, i) => v !== null && yearlyData[i][variable1] !== null);
        const y = yearlyData.map(d => d[variable1]).filter((v, i) => v !== null && yearlyData[i][variable2] !== null);

        if (x.length < 2) return null;
        return linearRegression(x, y);
    }, [yearlyData, variable1, variable2]);

    // 산점도 데이터
    const scatterData = useMemo(() => {
        return yearlyData
            .filter(d => d[variable1] !== null && d[variable2] !== null)
            .map(d => ({
                x: d[variable2],
                y: d[variable1],
                year: d.year,
            }));
    }, [yearlyData, variable1, variable2]);

    const getCorrelationStrength = (r) => {
        const abs = Math.abs(r);
        if (abs >= 0.8) return { text: '매우 강함', color: 'var(--color-success)' };
        if (abs >= 0.6) return { text: '강함', color: 'var(--color-primary)' };
        if (abs >= 0.4) return { text: '보통', color: 'var(--color-warning)' };
        if (abs >= 0.2) return { text: '약함', color: 'var(--color-text-tertiary)' };
        return { text: '매우 약함', color: 'var(--color-text-tertiary)' };
    };

    const getCorrelationDirection = (r) => {
        if (r > 0.1) return { text: '정(+)의 상관', icon: TrendingUp };
        if (r < -0.1) return { text: '부(-)의 상관', icon: TrendingDown };
        return { text: '상관 없음', icon: Activity };
    };

    const correlationStrength = getCorrelationStrength(correlation);
    const correlationDirection = getCorrelationDirection(correlation);
    const DirectionIcon = correlationDirection.icon;

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
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}>
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>상관관계 분석기</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                부동산과 거시경제 변수 간 상관관계 분석
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Variable Selection */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>변수 선택</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 8 }}>
                            변수 1 (종속)
                        </label>
                        <select
                            className="input select"
                            value={variable1}
                            onChange={(e) => setVariable1(e.target.value)}
                        >
                            {variables.map(v => (
                                <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 8 }}>
                            변수 2 (독립)
                        </label>
                        <select
                            className="input select"
                            value={variable2}
                            onChange={(e) => setVariable2(e.target.value)}
                        >
                            {variables.map(v => (
                                <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 8 }}>
                            최대 시차 (개월)
                        </label>
                        <input
                            type="number"
                            className="input"
                            value={maxLag}
                            onChange={(e) => setMaxLag(Number(e.target.value))}
                            min={1}
                            max={24}
                        />
                    </div>
                </div>
            </div>

            {/* Correlation Result */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">상관계수 (r)</span>
                        <DirectionIcon size={20} style={{ color: correlationStrength.color }} />
                    </div>
                    <div className="stat-card-value" style={{ color: correlationStrength.color }}>
                        {correlation.toFixed(3)}
                    </div>
                    <div className="stat-card-label">{correlationDirection.text}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">상관 강도</span>
                    </div>
                    <div className="stat-card-value" style={{ fontSize: '1.2rem', color: correlationStrength.color }}>
                        {correlationStrength.text}
                    </div>
                    <div className="stat-card-label">|r| = {Math.abs(correlation).toFixed(3)}</div>
                </div>
                {regression && (
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <span className="stat-card-label">결정계수 (R²)</span>
                        </div>
                        <div className="stat-card-value">
                            {(regression.rSquared * 100).toFixed(1)}%
                        </div>
                        <div className="stat-card-label">설명력</div>
                    </div>
                )}
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-label">데이터 포인트</span>
                    </div>
                    <div className="stat-card-value">{scatterData.length}</div>
                    <div className="stat-card-label">연간 데이터</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-charts" style={{ marginBottom: 24 }}>
                {/* Scatter Plot */}
                <ChartContainer
                    title="산점도 및 회귀선"
                    subtitle={`${variables.find(v => v.id === variable1)?.label} vs ${variables.find(v => v.id === variable2)?.label}`}
                    height={400}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis
                                dataKey="x"
                                name={variables.find(v => v.id === variable2)?.label}
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <YAxis
                                dataKey="y"
                                name={variables.find(v => v.id === variable1)?.label}
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                formatter={(value, name) => [value?.toFixed(2), name]}
                                labelFormatter={(label) => `연도: ${scatterData.find(d => d.x === label)?.year || label}`}
                            />
                            <Scatter
                                data={scatterData}
                                fill="var(--color-primary)"
                            />
                            {regression && (
                                <ReferenceLine
                                    segment={[
                                        { x: Math.min(...scatterData.map(d => d.x)), y: regression.intercept + regression.slope * Math.min(...scatterData.map(d => d.x)) },
                                        { x: Math.max(...scatterData.map(d => d.x)), y: regression.intercept + regression.slope * Math.max(...scatterData.map(d => d.x)) },
                                    ]}
                                    stroke="var(--color-danger)"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                />
                            )}
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Lagged Correlation */}
                <ChartContainer
                    title="시차 상관관계"
                    subtitle="선행/후행 관계 분석"
                    height={400}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={laggedCorrelation}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="lag"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                label={{ value: '시차 (개월)', position: 'bottom', offset: -5, fontSize: 11 }}
                            />
                            <YAxis
                                domain={[-1, 1]}
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                                formatter={(v) => [v.toFixed(3), '상관계수']}
                                labelFormatter={(lag) => `시차: ${lag}개월`}
                            />
                            <ReferenceLine y={0} stroke="var(--color-text-tertiary)" />
                            <Bar
                                dataKey="correlation"
                                fill="var(--color-primary)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Interpretation */}
            <div className="card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={18} />
                    분석 해석
                </h3>
                <div style={{
                    padding: 16,
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.7,
                }}>
                    <p>
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                            {variables.find(v => v.id === variable1)?.label}
                        </strong>와
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                            {' '}{variables.find(v => v.id === variable2)?.label}
                        </strong>의
                        상관계수는 <strong style={{ color: correlationStrength.color }}>{correlation.toFixed(3)}</strong>으로
                        <strong style={{ color: correlationStrength.color }}>{' '}{correlationStrength.text}</strong>
                        {' '}{correlationDirection.text}관계를 보입니다.
                    </p>
                    {regression && (
                        <p style={{ marginTop: 12 }}>
                            회귀분석 결과, {variables.find(v => v.id === variable2)?.label}가 1단위 증가할 때
                            {variables.find(v => v.id === variable1)?.label}는 평균적으로
                            <strong>{' '}{regression.slope.toFixed(2)}</strong> 변화합니다.
                            이 모델은 변동의 <strong>{(regression.rSquared * 100).toFixed(1)}%</strong>를 설명합니다.
                        </p>
                    )}
                    <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                        ※ 시차 상관관계에서 양(+)의 시차는 변수1이 변수2보다 선행함을 의미합니다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CorrelationAnalyzer;
