import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
    Landmark, TrendingUp, TrendingDown, Percent,
    CreditCard, Building2, BarChart3, DollarSign
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateYieldCurveData,
    generateMortgageRateData,
    generateBankMortgageRates,
    generateREITsData,
    generateREITsList,
    generateStockVsRealEstateData,
    getFinancialMarketSummary,
} from '../data/financialData';

/**
 * 금융 시장 연계 분석 페이지
 */
const FinancialMarket = () => {
    const [activeTab, setActiveTab] = useState('mortgage');

    // 데이터 생성
    const yieldCurveData = useMemo(() => generateYieldCurveData(), []);
    const mortgageRateData = useMemo(() => generateMortgageRateData(), []);
    const bankRates = useMemo(() => generateBankMortgageRates(), []);
    const reitsData = useMemo(() => generateREITsData(), []);
    const reitsList = useMemo(() => generateREITsList(), []);
    const stockVsRealEstate = useMemo(() => generateStockVsRealEstateData(), []);
    const summary = useMemo(() => getFinancialMarketSummary(), []);

    const tabs = [
        { id: 'mortgage', label: '주담대 금리', icon: CreditCard },
        { id: 'yield', label: '채권 수익률', icon: Landmark },
        { id: 'reits', label: 'REITs', icon: Building2 },
        { id: 'compare', label: '주식 vs 부동산', icon: BarChart3 },
    ];

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    금융 시장 연계 분석
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    채권 수익률, 주담대 금리, REITs 등 금융 시장과 부동산의 연관성을 분석합니다
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="기준금리"
                    value={summary.baseRate}
                    suffix="%"
                    icon={Percent}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="평균 주담대 금리"
                    value={summary.avgMortgageRate}
                    suffix="%"
                    icon={CreditCard}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
                <StatCard
                    title="10년 국채"
                    value={summary.bond10Y}
                    suffix="%"
                    icon={Landmark}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="REITs 평균 배당"
                    value={summary.reitsAvgYield}
                    suffix="%"
                    icon={Building2}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
            </div>

            {/* Charts */}
            {activeTab === 'mortgage' && (
                <div>
                    <ChartContainer
                        title="주담대 금리 추이"
                        subtitle="고정/변동 금리 비교 (%)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mortgageRateData.filter((_, i) => i % 2 === 0)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    minTickGap={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[0, 8]}
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
                                <Line type="monotone" dataKey="fixedRate" name="고정금리" stroke="#ef4444" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="variableRate" name="변동금리" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                <Line type="stepAfter" dataKey="baseRate" name="기준금리" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 은행별 금리 비교 */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            🏦 은행별 주담대 금리 비교
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>은행</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>고정금리</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>변동금리</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>최저금리</th>
                                        <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>최대 LTV</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bankRates.map((bank, index) => (
                                        <tr key={index} style={{ background: index % 2 === 0 ? 'var(--color-bg-tertiary)' : 'transparent' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{bank.name}</td>
                                            <td style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--color-danger)' }}>{bank.fixedRate}%</td>
                                            <td style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--color-primary)' }}>{bank.variableRate}%</td>
                                            <td style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--color-success)', fontWeight: 600 }}>{bank.minRate}%</td>
                                            <td style={{ textAlign: 'center', padding: '12px 8px' }}>{bank.maxLTV}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'yield' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="국채 수익률 곡선"
                        subtitle="만기별 수익률 (%)"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yieldCurveData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="maturity"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[2.5, 4]}
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
                                <Line type="monotone" dataKey="current" name="현재" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
                                <Line type="monotone" dataKey="oneMonthAgo" name="1개월 전" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="oneYearAgo" name="1년 전" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            📈 수익률 곡선 해석
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    📊 정상 수익률 곡선
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    장기 금리 &gt; 단기 금리: 경기 확장 기대. 부동산 투자에 우호적
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    ⚠️ 역전 수익률 곡선
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    장기 금리 &lt; 단기 금리: 경기 침체 신호. 부동산 조정 가능성
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ color: 'var(--color-text-primary)', display: 'block', marginBottom: 8 }}>
                                    💡 주담대 금리 연동
                                </strong>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                    주담대 금리 = 기준금리 + 가산금리 (현재 스프레드: {summary.mortgageSpread}%p)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reits' && (
                <div>
                    <ChartContainer
                        title="REITs 수익률 추이"
                        subtitle="가격 수익률 + 배당 수익률 (%)"
                        height={400}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={reitsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[-20, 35]}
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
                                <ReferenceLine y={0} stroke="var(--color-text-tertiary)" />
                                <Bar dataKey="priceReturn" name="가격 수익률" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="dividendYield" name="배당 수익률" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="totalReturn" name="총수익률" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* REITs 종목 리스트 */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            🏢 주요 REITs 종목
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: 16,
                        }}>
                            {reitsList.map((reit, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: 16,
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reit.name}</span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 6px',
                                            background: 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-sm)',
                                        }}>
                                            {reit.sector}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>시가총액</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{reit.marketCap.toLocaleString()}억</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>배당수익률</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-success)' }}>{reit.dividendYield}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>수익률</span>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            color: reit.priceChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                        }}>
                                            {reit.priceChange >= 0 ? '+' : ''}{reit.priceChange}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'compare' && (
                <div className="grid-charts">
                    <ChartContainer
                        title="KOSPI vs 부동산 지수"
                        subtitle="2015년 = 100 기준"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stockVsRealEstate}>
                                <defs>
                                    <linearGradient id="gradientKospi" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientRealEstate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    domain={[90, 170]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                <Legend />
                                <ReferenceLine y={100} stroke="var(--color-text-tertiary)" strokeDasharray="3 3" />
                                <Area type="monotone" dataKey="kospi" name="KOSPI" stroke="#3b82f6" fill="url(#gradientKospi)" strokeWidth={2} />
                                <Area type="monotone" dataKey="realEstate" name="부동산지수" stroke="#ef4444" fill="url(#gradientRealEstate)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>
                            📊 자산별 수익률 비교
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BarChart3 size={20} style={{ color: '#3b82f6' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>KOSPI</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>연초 대비</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: summary.kospiYTD >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                    {summary.kospiYTD >= 0 ? '+' : ''}{summary.kospiYTD}%
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, background: '#fee2e2', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Building2 size={20} style={{ color: '#ef4444' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>부동산 지수</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>연초 대비</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: summary.realEstateYTD >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                    {summary.realEstateYTD >= 0 ? '+' : ''}{summary.realEstateYTD}%
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, background: '#d1fae5', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DollarSign size={20} style={{ color: '#10b981' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>REITs 평균</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>배당수익률</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                                    {summary.reitsAvgYield}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialMarket;
