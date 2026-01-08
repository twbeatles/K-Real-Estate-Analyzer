import { useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Activity, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle, Clock, Target, BarChart3
} from 'lucide-react';
import ChartContainer from '../components/ui/ChartContainer';
import StatCard from '../components/ui/StatCard';
import { generateHistoricalData, generateTransactionData } from '../data';
import {
    analyzeCycle,
    generatePIRData,
    generateJeonseRatioData,
    calculateBubbleIndex
} from '../data/advancedAnalytics';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 사이클 분석 & 리스크 지표 페이지
 * 현재 시장 사이클 단계 진단 및 버블 위험도 분석
 */
const CycleAnalysis = () => {
    const historicalData = useMemo(() => generateHistoricalData(), []);
    const transactionData = useMemo(() => generateTransactionData(), []);
    const pirData = useMemo(() => generatePIRData(), []);
    const jeonseRatioData = useMemo(() => generateJeonseRatioData(), []);

    // 사이클 분석
    const cycleResult = useMemo(() => analyzeCycle(historicalData), [historicalData]);

    // 버블 지수
    const bubbleResult = useMemo(() =>
        calculateBubbleIndex(pirData, jeonseRatioData, transactionData),
        [pirData, jeonseRatioData, transactionData]);

    // 사이클 단계별 정보
    const cyclePhases = [
        { phase: '회복기', description: '바닥에서 상승 전환', color: '#3b82f6', range: [-5, 0] },
        { phase: '상승기', description: '본격적인 가격 상승', color: '#10b981', range: [0, 10] },
        { phase: '과열기', description: '급등 및 투기 과열', color: '#f59e0b', range: [10, 20] },
        { phase: '조정기', description: '고점 후 하락', color: '#ef4444', range: [-10, -5] },
        { phase: '하락기', description: '본격적인 가격 하락', color: '#8b5cf6', range: [-20, -10] },
    ];

    const getCurrentPhaseColor = () => {
        const phase = cyclePhases.find(p => p.phase === cycleResult.phase);
        return phase?.color || '#6b7280';
    };

    // 사이클 게이지 데이터
    const gaugeData = [
        { name: '현재 위치', value: 100 },
    ];

    // PIR 차트 데이터
    const pirChartData = pirData.slice(-10);

    // 전세가율 차트 데이터
    const jeonseChartData = jeonseRatioData.slice(-36);

    // 리스크 게이지
    const riskGaugeData = [
        { name: '버블 지수', value: bubbleResult.bubbleIndex, fill: getRiskColor(bubbleResult.bubbleIndex) },
        { name: '남은', value: 100 - bubbleResult.bubbleIndex, fill: 'var(--color-bg-tertiary)' },
    ];

    function getRiskColor(value) {
        if (value < 30) return '#10b981';
        if (value < 50) return '#3b82f6';
        if (value < 70) return '#f59e0b';
        return '#ef4444';
    }

    const getPhaseIcon = (phase) => {
        switch (phase) {
            case '상승기': return TrendingUp;
            case '회복기': return Activity;
            case '조정기': return Clock;
            case '하락기': return TrendingDown;
            case '과열기': return AlertTriangle;
            default: return Activity;
        }
    };

    const PhaseIcon = getPhaseIcon(cycleResult.phase);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>사이클 분석 & 리스크 지표</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                            현재 시장 단계 진단 및 버블 위험도 분석
                        </p>
                    </div>
                </div>
            </div>

            {/* Cycle Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                {/* Current Cycle Phase */}
                <div className="card" style={{
                    background: `linear-gradient(135deg, ${getCurrentPhaseColor()}15, ${getCurrentPhaseColor()}05)`,
                    border: `2px solid ${getCurrentPhaseColor()}30`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: 'var(--radius-lg)',
                            background: getCurrentPhaseColor(),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}>
                            <PhaseIcon size={32} />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                                현재 사이클 단계
                            </p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: getCurrentPhaseColor() }}>
                                {cycleResult.phase}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                {cycleResult.description}
                            </p>
                        </div>
                    </div>
                    <div style={{ marginTop: 20, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>모멘텀</p>
                                <p style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    color: cycleResult.momentum >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                }}>
                                    {cycleResult.momentum >= 0 ? '+' : ''}{cycleResult.momentum}%
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>변동성</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{cycleResult.volatility}</p>
                            </div>
                        </div>
                        <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            💡 <strong>전망:</strong> {cycleResult.outlook}
                        </p>
                    </div>
                </div>

                {/* Bubble Index */}
                <div className="card">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>버블 위험 지수</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ width: 150, height: 150 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={riskGaugeData}
                                        innerRadius={50}
                                        outerRadius={70}
                                        startAngle={180}
                                        endAngle={0}
                                        dataKey="value"
                                    >
                                        {riskGaugeData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{
                                textAlign: 'center',
                                marginTop: -50,
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: getRiskColor(bubbleResult.bubbleIndex),
                            }}>
                                {bubbleResult.bubbleIndex.toFixed(0)}
                            </div>
                        </div>
                        <div>
                            <div style={{
                                padding: '8px 16px',
                                background: `${getRiskColor(bubbleResult.bubbleIndex)}20`,
                                borderRadius: 'var(--radius-full)',
                                color: getRiskColor(bubbleResult.bubbleIndex),
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                display: 'inline-block',
                                marginBottom: 12,
                            }}>
                                {bubbleResult.riskLevel}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                {bubbleResult.description}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 12,
                        marginTop: 20,
                        padding: 16,
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>PIR 과열도</p>
                            <p style={{ fontSize: '1rem', fontWeight: 600 }}>{bubbleResult.pirScore.toFixed(1)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>전세가율 과열도</p>
                            <p style={{ fontSize: '1rem', fontWeight: 600 }}>{bubbleResult.jeonseScore.toFixed(1)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="서울 PIR"
                    value={pirData[pirData.length - 1]?.seoulPIR}
                    subtitle="소득대비 주택가격"
                    icon={Target}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
                <StatCard
                    title="전국 PIR"
                    value={pirData[pirData.length - 1]?.nationPIR}
                    subtitle="소득대비 주택가격"
                    icon={Target}
                    iconColor="#3b82f6"
                    iconBg="#dbeafe"
                />
                <StatCard
                    title="서울 전세가율"
                    value={jeonseRatioData[jeonseRatioData.length - 1]?.seoul}
                    suffix="%"
                    subtitle="매매가 대비 전세가"
                    icon={BarChart3}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="전국 전세가율"
                    value={jeonseRatioData[jeonseRatioData.length - 1]?.nation}
                    suffix="%"
                    subtitle="매매가 대비 전세가"
                    icon={BarChart3}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
            </div>

            {/* Charts */}
            <div className="grid-charts">
                {/* PIR Chart */}
                <ChartContainer
                    title="PIR (소득대비 주택가격) 추이"
                    subtitle="연평균 소득 대비 주택가격 배수"
                    height={350}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={pirChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="seoulPIR"
                                name="서울 PIR"
                                stroke="#ef4444"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#ef4444' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="nationPIR"
                                name="전국 PIR"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#3b82f6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {/* Jeonse Ratio Chart */}
                <ChartContainer
                    title="전세가율 추이"
                    subtitle="매매가 대비 전세가 비율"
                    height={350}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={jeonseChartData}>
                            <defs>
                                <linearGradient id="gradientSeoul" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                minTickGap={50}
                            />
                            <YAxis
                                domain={[40, 80]}
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
                            <Area
                                type="monotone"
                                dataKey="seoul"
                                name="서울"
                                stroke="#10b981"
                                fill="url(#gradientSeoul)"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="nation"
                                name="전국"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Cycle Guide */}
            <div className="card" style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>부동산 사이클 가이드</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                    {cyclePhases.map(phase => (
                        <div
                            key={phase.phase}
                            style={{
                                padding: 16,
                                borderRadius: 'var(--radius-md)',
                                background: cycleResult.phase === phase.phase ? `${phase.color}15` : 'var(--color-bg-tertiary)',
                                border: cycleResult.phase === phase.phase ? `2px solid ${phase.color}` : '1px solid transparent',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                                color: phase.color,
                                fontWeight: 600,
                            }}>
                                <div style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: phase.color,
                                }} />
                                {phase.phase}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                {phase.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CycleAnalysis;
