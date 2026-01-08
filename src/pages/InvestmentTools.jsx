import { useState, useMemo, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Calculator, Home, Percent, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import ChartContainer from '../components/ui/ChartContainer';
import Tabs from '../components/ui/Tabs';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

/**
 * 투자 도구 페이지
 */
const InvestmentTools = () => {
    const [activeTab, setActiveTab] = useState('mortgage');

    // 주택담보대출 계산기 상태
    const [mortgage, setMortgage] = useState({
        price: 100000, // 만원 (10억)
        downPayment: 30, // %
        rate: 4.5, // 연이율 %
        term: 30, // 년
        type: 'equal', // equal(원리금균등) or principal(원금균등)
    });

    // 수익률 시뮬레이터 상태
    const [investment, setInvestment] = useState({
        purchasePrice: 100000,
        currentPrice: 120000,
        holdingYears: 5,
        monthlyRent: 150, // 만원
        expenses: 10, // 연간 비용 (만원)
    });

    // 갭투자 분석 상태
    const [gap, setGap] = useState({
        salePrice: 120000,
        jeonsePrice: 90000,
        expectedGrowth: 3, // 연 %
        holdingYears: 3,
    });

    const tabs = [
        { id: 'mortgage', label: '대출 계산기', icon: Calculator },
        { id: 'roi', label: '수익률 분석', icon: TrendingUp },
        { id: 'gap', label: '갭투자 분석', icon: DollarSign },
    ];

    // 대출 계산
    const mortgageResult = useMemo(() => {
        const principal = mortgage.price * (1 - mortgage.downPayment / 100) * 10000; // 원
        const monthlyRate = mortgage.rate / 100 / 12;
        const totalMonths = mortgage.term * 12;

        if (mortgage.type === 'equal') {
            // 원리금균등
            const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);
            const totalPayment = monthlyPayment * totalMonths;
            const totalInterest = totalPayment - principal;

            // 상환 스케줄
            const schedule = [];
            let balance = principal;
            for (let month = 1; month <= Math.min(totalMonths, 360); month++) {
                const interest = balance * monthlyRate;
                const principalPay = monthlyPayment - interest;
                balance -= principalPay;
                if (month % 12 === 0 || month === 1) {
                    schedule.push({
                        year: Math.ceil(month / 12),
                        month,
                        payment: monthlyPayment,
                        principal: principalPay,
                        interest,
                        balance: Math.max(0, balance),
                    });
                }
            }

            return {
                loanAmount: principal,
                monthlyPayment,
                totalPayment,
                totalInterest,
                schedule,
            };
        } else {
            // 원금균등
            const monthlyPrincipal = principal / totalMonths;
            const schedule = [];
            let balance = principal;
            let totalPayment = 0;
            let totalInterest = 0;

            for (let month = 1; month <= totalMonths; month++) {
                const interest = balance * monthlyRate;
                const payment = monthlyPrincipal + interest;
                balance -= monthlyPrincipal;
                totalPayment += payment;
                totalInterest += interest;

                if (month % 12 === 0 || month === 1) {
                    schedule.push({
                        year: Math.ceil(month / 12),
                        month,
                        payment,
                        principal: monthlyPrincipal,
                        interest,
                        balance: Math.max(0, balance),
                    });
                }
            }

            return {
                loanAmount: principal,
                monthlyPayment: schedule[0].payment, // 첫 달
                totalPayment,
                totalInterest,
                schedule,
            };
        }
    }, [mortgage]);

    // 수익률 계산
    const roiResult = useMemo(() => {
        const gain = (investment.currentPrice - investment.purchasePrice) * 10000;
        const totalRent = investment.monthlyRent * 12 * investment.holdingYears * 10000;
        const totalExpenses = investment.expenses * investment.holdingYears * 10000;
        const netIncome = gain + totalRent - totalExpenses;
        const totalROI = (netIncome / (investment.purchasePrice * 10000)) * 100;
        const annualROI = totalROI / investment.holdingYears;
        const rentalYield = (investment.monthlyRent * 12 / investment.purchasePrice) * 100;

        return {
            capitalGain: gain,
            totalRent,
            netIncome,
            totalROI,
            annualROI,
            rentalYield,
        };
    }, [investment]);

    // 갭투자 분석
    const gapResult = useMemo(() => {
        const gapAmount = gap.salePrice - gap.jeonsePrice;
        const investmentAmount = gapAmount * 10000; // 원
        const futurePrice = gap.salePrice * Math.pow(1 + gap.expectedGrowth / 100, gap.holdingYears);
        const expectedGain = (futurePrice - gap.salePrice) * 10000;
        const roi = (expectedGain / investmentAmount) * 100;
        const annualROI = roi / gap.holdingYears;
        const leverage = gap.salePrice / gapAmount;

        return {
            gapAmount,
            investmentAmount,
            futurePrice,
            expectedGain,
            roi,
            annualROI,
            leverage,
        };
    }, [gap]);

    const InputField = ({ label, value, onChange, suffix, min, max, step = 1 }) => (
        <div style={{ marginBottom: 16 }}>
            <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: 8,
                color: 'var(--color-text-secondary)',
            }}>
                {label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                    className="input"
                    style={{ flex: 1 }}
                />
                {suffix && (
                    <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-tertiary)',
                        minWidth: 40,
                    }}>
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );

    const ResultCard = ({ label, value, highlight = false }) => (
        <div style={{
            padding: 16,
            background: highlight ? 'linear-gradient(135deg, var(--color-primary), #7c3aed)' : 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            color: highlight ? 'white' : 'inherit',
        }}>
            <p style={{ fontSize: '0.75rem', opacity: highlight ? 0.9 : 0.7, marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, fontFeatureSettings: "'tnum' 1" }}>{value}</p>
        </div>
    );

    return (
        <div className="page-container">
            {/* Tabs */}
            <div style={{ marginBottom: 24 }}>
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Mortgage Calculator */}
            {activeTab === 'mortgage' && (
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
                    {/* Inputs */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 20 }}>
                            <Calculator size={18} style={{ marginRight: 8 }} />
                            주택담보대출 계산
                        </h3>

                        <InputField
                            label="매매가격"
                            value={mortgage.price}
                            onChange={(v) => setMortgage(prev => ({ ...prev, price: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="자기자본 비율 (LTV)"
                            value={mortgage.downPayment}
                            onChange={(v) => setMortgage(prev => ({ ...prev, downPayment: v }))}
                            suffix="%"
                            min={0}
                            max={100}
                        />

                        <InputField
                            label="연이율"
                            value={mortgage.rate}
                            onChange={(v) => setMortgage(prev => ({ ...prev, rate: v }))}
                            suffix="%"
                            min={0.1}
                            max={20}
                            step={0.1}
                        />

                        <InputField
                            label="대출 기간"
                            value={mortgage.term}
                            onChange={(v) => setMortgage(prev => ({ ...prev, term: v }))}
                            suffix="년"
                            min={1}
                            max={40}
                        />

                        <div style={{ marginBottom: 16 }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                marginBottom: 8,
                                color: 'var(--color-text-secondary)',
                            }}>
                                상환 방식
                            </label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => setMortgage(prev => ({ ...prev, type: 'equal' }))}
                                    className={`btn ${mortgage.type === 'equal' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ flex: 1 }}
                                >
                                    원리금균등
                                </button>
                                <button
                                    onClick={() => setMortgage(prev => ({ ...prev, type: 'principal' }))}
                                    className={`btn ${mortgage.type === 'principal' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ flex: 1 }}
                                >
                                    원금균등
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                            <ResultCard
                                label="대출금액"
                                value={formatCurrency(mortgageResult.loanAmount / 10000)}
                            />
                            <ResultCard
                                label={mortgage.type === 'equal' ? '월 상환액' : '첫 달 상환액'}
                                value={`${formatNumber(Math.round(mortgageResult.monthlyPayment / 10000))}만원`}
                                highlight
                            />
                            <ResultCard
                                label="총 상환액"
                                value={formatCurrency(Math.round(mortgageResult.totalPayment / 10000))}
                            />
                            <ResultCard
                                label="총 이자"
                                value={formatCurrency(Math.round(mortgageResult.totalInterest / 10000))}
                            />
                        </div>

                        <ChartContainer title="상환 스케줄" subtitle="연도별 잔액 추이" height={350}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mortgageResult.schedule}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                        tickFormatter={(v) => `${v}년`}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                                        tickFormatter={(v) => `${(v / 100000000).toFixed(1)}억`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--color-bg-secondary)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                        formatter={(v) => [formatCurrency(Math.round(v / 10000)), '']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        name="잔액"
                                        stroke="var(--color-primary)"
                                        strokeWidth={2.5}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </div>
            )}

            {/* ROI Calculator */}
            {activeTab === 'roi' && (
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 20 }}>
                            <TrendingUp size={18} style={{ marginRight: 8 }} />
                            투자 수익률 분석
                        </h3>

                        <InputField
                            label="매입가격"
                            value={investment.purchasePrice}
                            onChange={(v) => setInvestment(prev => ({ ...prev, purchasePrice: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="현재가격"
                            value={investment.currentPrice}
                            onChange={(v) => setInvestment(prev => ({ ...prev, currentPrice: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="보유 기간"
                            value={investment.holdingYears}
                            onChange={(v) => setInvestment(prev => ({ ...prev, holdingYears: v }))}
                            suffix="년"
                            min={1}
                            max={30}
                        />

                        <InputField
                            label="월 임대료"
                            value={investment.monthlyRent}
                            onChange={(v) => setInvestment(prev => ({ ...prev, monthlyRent: v }))}
                            suffix="만원"
                            min={0}
                        />

                        <InputField
                            label="연간 비용"
                            value={investment.expenses}
                            onChange={(v) => setInvestment(prev => ({ ...prev, expenses: v }))}
                            suffix="만원"
                            min={0}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                            <ResultCard
                                label="총 수익률"
                                value={formatPercent(roiResult.totalROI)}
                                highlight
                            />
                            <ResultCard
                                label="연평균 수익률"
                                value={formatPercent(roiResult.annualROI)}
                            />
                            <ResultCard
                                label="임대 수익률"
                                value={formatPercent(roiResult.rentalYield)}
                            />
                        </div>

                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: 16 }}>수익 분석</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>시세 차익</span>
                                    <span style={{ fontWeight: 600, color: roiResult.capitalGain >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {formatCurrency(roiResult.capitalGain / 10000)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>누적 임대 수입</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(roiResult.totalRent / 10000)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                                    <span style={{ fontWeight: 600 }}>순 수익</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.125rem', color: roiResult.netIncome >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                        {formatCurrency(roiResult.netIncome / 10000)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gap Investment */}
            {activeTab === 'gap' && (
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 20 }}>
                            <DollarSign size={18} style={{ marginRight: 8 }} />
                            갭투자 분석
                        </h3>

                        <InputField
                            label="매매가격"
                            value={gap.salePrice}
                            onChange={(v) => setGap(prev => ({ ...prev, salePrice: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="전세가격"
                            value={gap.jeonsePrice}
                            onChange={(v) => setGap(prev => ({ ...prev, jeonsePrice: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="예상 연간 상승률"
                            value={gap.expectedGrowth}
                            onChange={(v) => setGap(prev => ({ ...prev, expectedGrowth: v }))}
                            suffix="%"
                            min={-10}
                            max={30}
                            step={0.5}
                        />

                        <InputField
                            label="보유 기간"
                            value={gap.holdingYears}
                            onChange={(v) => setGap(prev => ({ ...prev, holdingYears: v }))}
                            suffix="년"
                            min={1}
                            max={30}
                        />

                        <div style={{
                            padding: 16,
                            background: 'var(--color-warning-light)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            color: 'var(--color-warning)',
                        }}>
                            ⚠️ 갭투자는 전세가 하락 시 큰 손실 위험이 있습니다.
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                            <ResultCard
                                label="투자금 (갭)"
                                value={formatCurrency(gapResult.gapAmount)}
                            />
                            <ResultCard
                                label="레버리지"
                                value={`${gapResult.leverage.toFixed(1)}배`}
                                highlight
                            />
                            <ResultCard
                                label="예상 수익률"
                                value={formatPercent(gapResult.roi)}
                            />
                            <ResultCard
                                label="연평균 수익률"
                                value={formatPercent(gapResult.annualROI)}
                            />
                        </div>

                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: 16 }}>투자 분석</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>전세가율</p>
                                        <p style={{ fontWeight: 600 }}>{((gap.jeonsePrice / gap.salePrice) * 100).toFixed(1)}%</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>현재 매매가</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(gap.salePrice)}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{gap.holdingYears}년 후 예상가격</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(Math.round(gapResult.futurePrice))}</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>예상 시세차익</p>
                                        <p style={{ fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(Math.round(gapResult.expectedGain / 10000))}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Responsive */}
            <style>{`
        @media (max-width: 1024px) {
          .page-container > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default InvestmentTools;
