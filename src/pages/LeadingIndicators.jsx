import { useState, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, ComposedChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
    Activity, TrendingUp, TrendingDown, AlertCircle,
    Building2, FileText, Home, Users
} from 'lucide-react';
import ChartContainer from '../components/ui/ChartContainer';
import StatCard from '../components/ui/StatCard';
import Tabs from '../components/ui/Tabs';
import {
    generateLeadingIndicators,
    generateSupplyDemandData,
    generateRealInterestRateData,
    generateLiquidityIndicators,
    generateGlobalComparisonData,
    generatePolicyData,
} from '../data/advancedAnalytics';

/**
 * 선행지표 & 고급 거시경제 분석 페이지
 */
const LeadingIndicators = () => {
    const [activeTab, setActiveTab] = useState('leading');

    const leadingData = useMemo(() => generateLeadingIndicators(), []);
    const supplyData = useMemo(() => generateSupplyDemandData(), []);
    const realRateData = useMemo(() => generateRealInterestRateData(), []);
    const liquidityData = useMemo(() => generateLiquidityIndicators(), []);
    const globalData = useMemo(() => generateGlobalComparisonData(), []);
    const policyData = useMemo(() => generatePolicyData(), []);

    const latestLeading = leadingData[leadingData.length - 1];
    const latestSupply = supplyData[supplyData.length - 1];
    const latestRealRate = realRateData[realRateData.length - 1];
    const latestLiquidity = liquidityData[liquidityData.length - 1];

    const tabs = [
        { id: 'leading', label: '선행지표', icon: Activity },
        { id: 'supply', label: '수급분석', icon: Building2 },
        { id: 'realrate', label: '실질금리', icon: TrendingDown },
        { id: 'liquidity', label: '유동성', icon: Users },
        { id: 'global', label: '글로벌비교', icon: Activity },
        { id: 'policy', label: '정책영향', icon: FileText },
    ];

    // 글로벌 비교 차트 데이터
    const globalChartData = useMemo(() => {
        return globalData.map(d => ({
            year: d.year,
            한국: d.korea.hpi,
            미국: d.usa.hpi,
            일본: d.japan.hpi,
            중국: d.china.hpi,
        }));
    }, [globalData]);

    const globalRateData = useMemo(() => {
        return globalData.map(d => ({
            year: d.year,
            한국: d.korea.rate,
            미국: d.usa.rate,
            일본: d.japan.rate,
            중국: d.china.rate,
        }));
    }, [globalData]);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>선행지표 & 고급 분석</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                            부동산 시장 선행지표 및 거시경제 심화 분석
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24, overflowX: 'auto' }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Leading Indicators Tab */}
            {activeTab === 'leading' && (
                <>
                    <div className="grid-stats" style={{ marginBottom: 24 }}>
                        <StatCard
                            title="건설허가"
                            value={latestLeading?.permits.toFixed(0)}
                            subtitle="선행 6-12개월"
                            icon={FileText}
                            iconColor="#8b5cf6"
                            iconBg="#ede9fe"
                        />
                        <StatCard
                            title="거래량 지수"
                            value={latestLeading?.transactions.toFixed(0)}
                            subtitle="선행 3-6개월"
                            icon={Activity}
                            iconColor="#10b981"
                            iconBg="#d1fae5"
                        />
                        <StatCard
                            title="미분양"
                            value={latestLeading?.unsold.toFixed(0)}
                            suffix="천호"
                            subtitle="역행 지표"
                            icon={Home}
                            iconColor="#f59e0b"
                            iconBg="#fef3c7"
                        />
                        <StatCard
                            title="심리지수"
                            value={latestLeading?.sentiment.toFixed(0)}
                            subtitle="50 기준선"
                            icon={Users}
                            iconColor="#3b82f6"
                            iconBg="#dbeafe"
                        />
                    </div>

                    <ChartContainer
                        title="선행지표 추이"
                        subtitle="건설허가, 거래량, 미분양, 심리지수"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={leadingData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="period"
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
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <ReferenceLine yAxisId="left" y={50} stroke="var(--color-text-tertiary)" strokeDasharray="5 5" />
                                <Line yAxisId="left" type="monotone" dataKey="permits" name="건설허가" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                <Line yAxisId="left" type="monotone" dataKey="transactions" name="거래량" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Bar yAxisId="right" dataKey="unsold" name="미분양" fill="#f59e0b" opacity={0.6} />
                                <Line yAxisId="left" type="monotone" dataKey="sentiment" name="심리지수" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </>
            )}

            {/* Supply Demand Tab */}
            {activeTab === 'supply' && (
                <>
                    <div className="grid-stats" style={{ marginBottom: 24 }}>
                        <StatCard
                            title="입주물량"
                            value={latestSupply?.newConstruction}
                            suffix="천호"
                            subtitle={`${latestSupply?.year}년`}
                            icon={Building2}
                            iconColor="#10b981"
                            iconBg="#d1fae5"
                        />
                        <StatCard
                            title="인허가"
                            value={latestSupply?.permits}
                            suffix="천호"
                            subtitle={`${latestSupply?.year}년`}
                            icon={FileText}
                            iconColor="#3b82f6"
                            iconBg="#dbeafe"
                        />
                        <StatCard
                            title="미분양"
                            value={latestSupply?.unsold}
                            suffix="천호"
                            subtitle={`${latestSupply?.year}년`}
                            icon={Home}
                            iconColor="#ef4444"
                            iconBg="#fee2e2"
                        />
                    </div>

                    <ChartContainer
                        title="주택 수급 추이"
                        subtitle="입주물량, 인허가, 미분양"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={supplyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}천호`]}
                                />
                                <Legend />
                                <Bar dataKey="newConstruction" name="입주물량" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="permits" name="인허가" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="unsold" name="미분양" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </>
            )}

            {/* Real Interest Rate Tab */}
            {activeTab === 'realrate' && (
                <>
                    <div className="grid-stats" style={{ marginBottom: 24 }}>
                        <StatCard
                            title="명목금리"
                            value={latestRealRate?.nominal}
                            suffix="%"
                            subtitle={`${latestRealRate?.year}년`}
                            icon={TrendingUp}
                            iconColor="#8b5cf6"
                            iconBg="#ede9fe"
                        />
                        <StatCard
                            title="물가상승률"
                            value={latestRealRate?.inflation}
                            suffix="%"
                            subtitle={`${latestRealRate?.year}년`}
                            icon={Activity}
                            iconColor="#f59e0b"
                            iconBg="#fef3c7"
                        />
                        <StatCard
                            title="실질금리"
                            value={latestRealRate?.real}
                            suffix="%"
                            subtitle="명목금리 - 물가상승률"
                            icon={TrendingDown}
                            iconColor={latestRealRate?.real > 0 ? '#10b981' : '#ef4444'}
                            iconBg={latestRealRate?.real > 0 ? '#d1fae5' : '#fee2e2'}
                        />
                    </div>

                    <ChartContainer
                        title="실질금리 vs 명목금리"
                        subtitle="실질금리 = 명목금리 - 인플레이션"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={realRateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    domain={[-4, 6]}
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
                                <ReferenceLine y={0} stroke="var(--color-text-primary)" strokeWidth={2} />
                                <Bar dataKey="nominal" name="명목금리" fill="#8b5cf6" opacity={0.6} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="inflation" name="인플레이션" fill="#f59e0b" opacity={0.6} radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="real" name="실질금리" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ marginTop: 24 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>💡 실질금리 해석</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                            <p><strong>실질금리 양(+)</strong>: 예금의 실질 가치 상승, 부동산 투자 매력도 하락</p>
                            <p><strong>실질금리 음(-)</strong>: 현금 보유 손해, 실물자산(부동산) 선호 증가</p>
                        </div>
                    </div>
                </>
            )}

            {/* Liquidity Tab */}
            {activeTab === 'liquidity' && (
                <>
                    <div className="grid-stats" style={{ marginBottom: 24 }}>
                        <StatCard
                            title="M2/GDP 비율"
                            value={latestLiquidity?.m2GdpRatio}
                            suffix="%"
                            subtitle="시중 유동성"
                            icon={Activity}
                            iconColor="#10b981"
                            iconBg="#d1fae5"
                        />
                        <StatCard
                            title="가계부채/GDP"
                            value={latestLiquidity?.householdDebtRatio}
                            suffix="%"
                            subtitle="가계 레버리지"
                            icon={AlertCircle}
                            iconColor="#ef4444"
                            iconBg="#fee2e2"
                        />
                    </div>

                    <ChartContainer
                        title="유동성 지표 추이"
                        subtitle="M2/GDP, 가계부채/GDP"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={liquidityData}>
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
                                <Line type="monotone" dataKey="m2GdpRatio" name="M2/GDP" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="householdDebtRatio" name="가계부채/GDP" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </>
            )}

            {/* Global Comparison Tab */}
            {activeTab === 'global' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="글로벌 주택가격지수 비교"
                        subtitle="2020년 = 100 기준"
                        height={350}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={globalChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                                <YAxis domain={[90, 120]} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="한국" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="미국" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="일본" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="중국" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer
                        title="글로벌 기준금리 비교"
                        subtitle="각국 중앙은행 기준금리"
                        height={350}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={globalRateData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                                <YAxis domain={[-1, 5]} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}%`]}
                                />
                                <Legend />
                                <ReferenceLine y={0} stroke="var(--color-text-tertiary)" />
                                <Line type="monotone" dataKey="한국" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="미국" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="일본" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="중국" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {/* Policy Impact Tab */}
            {activeTab === 'policy' && (
                <>
                    <ChartContainer
                        title="LTV/DTI/DSR 규제 추이"
                        subtitle="투기과열지구 기준"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={policyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} />
                                <YAxis domain={[0, 80]} tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => v ? [`${v}%`] : ['N/A']}
                                />
                                <Legend />
                                <Line type="stepAfter" dataKey="ltv" name="LTV" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line type="stepAfter" dataKey="dti" name="DTI" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line type="stepAfter" dataKey="dsr" name="DSR" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ marginTop: 24 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>정책 변화 타임라인</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {policyData.map((policy, i) => (
                                <div key={policy.year} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    padding: '12px 16px',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                }}>
                                    <span style={{ fontWeight: 600, color: 'var(--color-primary)', minWidth: 50 }}>
                                        {policy.year}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        {policy.description}
                                    </span>
                                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                        LTV {policy.ltv}% / DTI {policy.dti}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LeadingIndicators;
