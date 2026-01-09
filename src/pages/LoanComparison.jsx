import { useState, useMemo } from 'react';
import {
    BarChart, Bar, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
    CreditCard, Calculator, Home, Percent,
    CheckCircle, XCircle, TrendingUp, Building2
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import {
    generateMortgageProducts,
    generateJeonseLoanProducts,
    generateAmortizationSchedule,
    calculateLoanLimit,
    calculateLoanCosts,
    getLoanSummary,
} from '../data/loanData';

/**
 * 대출 상품 비교 페이지
 */
const LoanComparison = () => {
    const [activeTab, setActiveTab] = useState('mortgage');
    const [loanAmount, setLoanAmount] = useState(300000000); // 3억
    const [loanTerm, setLoanTerm] = useState(30); // 30년
    const [propertyValue, setPropertyValue] = useState(500000000); // 5억
    const [annualIncome, setAnnualIncome] = useState(80000000); // 8천만원
    const [existingDebt, setExistingDebt] = useState(0);

    // 데이터 생성
    const mortgageProducts = useMemo(() => generateMortgageProducts(), []);
    const jeonseProducts = useMemo(() => generateJeonseLoanProducts(), []);
    const summary = useMemo(() => getLoanSummary(), []);

    // 상환 스케줄 계산
    const amortization = useMemo(() => {
        return generateAmortizationSchedule(loanAmount, summary.avgFixedRate, loanTerm);
    }, [loanAmount, loanTerm, summary.avgFixedRate]);

    // 대출 한도 계산
    const loanLimit = useMemo(() => {
        return calculateLoanLimit(propertyValue, annualIncome, existingDebt);
    }, [propertyValue, annualIncome, existingDebt]);

    // 대출 비용 계산
    const loanCosts = useMemo(() => {
        return calculateLoanCosts(loanAmount);
    }, [loanAmount]);

    const tabs = [
        { id: 'mortgage', label: '주담대 비교', icon: Home },
        { id: 'jeonse', label: '전세대출', icon: Building2 },
        { id: 'calculator', label: '대출 계산기', icon: Calculator },
        { id: 'limit', label: '한도 계산', icon: Percent },
    ];

    const formatCurrency = (value) => {
        if (value >= 100000000) {
            return `${(value / 100000000).toFixed(1)}억`;
        } else if (value >= 10000) {
            return `${(value / 10000).toFixed(0)}만`;
        }
        return value.toLocaleString();
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
                    대출 상품 비교
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    주담대, 전세대출 상품을 비교하고 최적의 대출 조건을 찾아보세요
                </p>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: 24 }}>
                <StatCard
                    title="평균 고정금리"
                    value={summary.avgFixedRate}
                    suffix="%"
                    icon={CreditCard}
                    iconColor="#ef4444"
                    iconBg="#fee2e2"
                />
                <StatCard
                    title="평균 변동금리"
                    value={summary.avgVariableRate}
                    suffix="%"
                    icon={TrendingUp}
                    iconColor="#10b981"
                    iconBg="#d1fae5"
                />
                <StatCard
                    title="최대 LTV"
                    value={summary.maxLTV}
                    suffix="%"
                    icon={Percent}
                    iconColor="#6366f1"
                    iconBg="#eef2ff"
                />
                <StatCard
                    title="최대 DSR"
                    value={summary.maxDSR}
                    suffix="%"
                    icon={Calculator}
                    iconColor="#f59e0b"
                    iconBg="#fef3c7"
                />
            </div>

            {/* 주담대 비교 */}
            {activeTab === 'mortgage' && (
                <div>
                    <ChartContainer
                        title="은행별 주담대 금리 비교"
                        subtitle="고정금리 기준 (%)"
                        height={350}
                        style={{ marginBottom: 24 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mortgageProducts.filter(p => p.type === 'fixed')}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis
                                    type="number"
                                    domain={[3.5, 5]}
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="bank"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v}%`, '금리']}
                                />
                                <Bar dataKey="rate" fill="#6366f1" radius={[0, 4, 4, 0]}>
                                    {mortgageProducts.filter(p => p.type === 'fixed').map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.rate < 4.3 ? '#10b981' : entry.rate < 4.5 ? '#6366f1' : '#ef4444'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    {/* 상품별 상세 */}
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>은행</th>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>상품명</th>
                                    <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>금리유형</th>
                                    <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>금리</th>
                                    <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>LTV</th>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid var(--color-border)' }}>특징</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mortgageProducts.map((product, index) => (
                                    <tr key={index} style={{ background: index % 2 === 0 ? 'var(--color-bg-tertiary)' : 'transparent' }}>
                                        <td style={{ padding: '12px 8px', fontWeight: 500 }}>{product.bank}</td>
                                        <td style={{ padding: '12px 8px' }}>{product.name}</td>
                                        <td style={{ textAlign: 'center', padding: '12px 8px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.8rem',
                                                background: product.type === 'fixed' ? '#dbeafe' : '#d1fae5',
                                                color: product.type === 'fixed' ? '#3b82f6' : '#10b981',
                                            }}>
                                                {product.type === 'fixed' ? '고정' : '변동'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600, color: 'var(--color-primary)' }}>
                                            {product.rate}%
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '12px 8px' }}>{product.maxLTV}%</td>
                                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            {product.features.join(', ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 전세대출 */}
            {activeTab === 'jeonse' && (
                <div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 20,
                    }}>
                        {jeonseProducts.map((product, index) => (
                            <div
                                key={index}
                                className="card"
                                style={{
                                    padding: 24,
                                    borderLeft: `4px solid ${product.rate < 2.5 ? 'var(--color-success)' : product.rate < 3.5 ? 'var(--color-primary)' : 'var(--color-warning)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{product.bank}</div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{product.name}</div>
                                    </div>
                                    <div style={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: product.rate < 2.5 ? 'var(--color-success)' : 'var(--color-primary)',
                                    }}>
                                        {product.rate}%
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>최대 한도</span>
                                        <span style={{ fontWeight: 500 }}>{formatCurrency(product.maxAmount * 10000)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>대상</span>
                                        <span style={{ fontWeight: 500 }}>{product.eligibility}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 대출 계산기 */}
            {activeTab === 'calculator' && (
                <div className="grid-charts">
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                            💰 월 상환액 계산기
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                    대출 금액
                                </label>
                                <input
                                    type="range"
                                    min={50000000}
                                    max={1000000000}
                                    step={10000000}
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(loanAmount)}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                    대출 기간
                                </label>
                                <input
                                    type="range"
                                    min={5}
                                    max={40}
                                    step={5}
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{loanTerm}년</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, padding: 20, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span>월 상환액</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                    {formatCurrency(amortization.monthlyPayment)}원
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>총 상환액</span>
                                <span>{formatCurrency(amortization.totalPayment)}원</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>총 이자</span>
                                <span style={{ color: 'var(--color-danger)' }}>{formatCurrency(amortization.totalInterest)}원</span>
                            </div>
                        </div>

                        <div style={{ marginTop: 20 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>부대비용</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-tertiary)' }}>인지세</span>
                                    <span>{loanCosts.stampDuty.toLocaleString()}원</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-tertiary)' }}>근저당 설정비</span>
                                    <span>{loanCosts.mortgageFee.toLocaleString()}원</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-tertiary)' }}>감정평가비</span>
                                    <span>{loanCosts.appraisalFee.toLocaleString()}원</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--color-border)', fontWeight: 600 }}>
                                    <span>총 부대비용</span>
                                    <span>{loanCosts.total.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ChartContainer
                        title="연도별 상환 스케줄"
                        subtitle="원금 / 이자 비율"
                        height={400}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={amortization.schedule.filter(s => s.month % 12 === 0 || s.month === 1)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="year"
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => `${v}년`}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                    tickFormatter={(v) => formatCurrency(v)}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--color-bg-secondary)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                    formatter={(v) => [`${v.toLocaleString()}원`]}
                                />
                                <Legend />
                                <Bar dataKey="principal" name="원금" stackId="a" fill="#6366f1" />
                                <Bar dataKey="interest" name="이자" stackId="a" fill="#f59e0b" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            )}

            {/* 한도 계산 */}
            {activeTab === 'limit' && (
                <div className="grid-charts">
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                            📊 대출 한도 계산
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                    주택 가격
                                </label>
                                <input
                                    type="range"
                                    min={100000000}
                                    max={2000000000}
                                    step={50000000}
                                    value={propertyValue}
                                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(propertyValue)}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                    연소득
                                </label>
                                <input
                                    type="range"
                                    min={30000000}
                                    max={300000000}
                                    step={5000000}
                                    value={annualIncome}
                                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(annualIncome)}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                    기존 부채
                                </label>
                                <input
                                    type="range"
                                    min={0}
                                    max={500000000}
                                    step={10000000}
                                    value={existingDebt}
                                    onChange={(e) => setExistingDebt(Number(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>{formatCurrency(existingDebt)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20 }}>
                            💳 예상 대출 한도
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>LTV 기준 한도</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>주택 가격의 70%</div>
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(loanLimit.ltvLimit)}</div>
                                </div>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>DSR 기준 한도</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>연소득의 40% 상환</div>
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(loanLimit.dsrLimit)}</div>
                                </div>
                            </div>
                            <div style={{
                                padding: 20,
                                background: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: 8 }}>최대 대출 가능 금액</div>
                                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(loanLimit.maxLoan)}</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                                {loanLimit.maxLoan > 0 ? (
                                    <>
                                        <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                                        <span style={{ color: 'var(--color-success)' }}>대출 가능</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={18} style={{ color: 'var(--color-danger)' }} />
                                        <span style={{ color: 'var(--color-danger)' }}>DSR 초과로 대출 불가</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanComparison;
