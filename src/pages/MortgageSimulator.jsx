import { useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Calculator, Home, DollarSign, Percent, Calendar, TrendingDown, Building2, CreditCard, PiggyBank, RefreshCw, Info } from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';
import Tabs from '../components/ui/Tabs';

function MortgageSimulator() {
    const [activeTab, setActiveTab] = useState('dsr');
    const [loanInputs, setLoanInputs] = useState({
        propertyPrice: 100000, annualIncome: 6000, existingLoanPayment: 0,
        loanAmount: 50000, loanTerm: 30, interestRate: 4.5,
        repaymentType: 'equalPrincipalInterest', jeonseDeposit: 30000, jeonseRate: 3.5
    });

    const handleInputChange = useCallback((field, value) => {
        setLoanInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
    }, []);

    // DSR/LTV/DTI 계산
    const regulations = useMemo(() => {
        const { propertyPrice, annualIncome, existingLoanPayment, loanAmount, loanTerm, interestRate } = loanInputs;
        const monthlyRate = interestRate / 100 / 12;
        const months = loanTerm * 12;
        const monthlyPayment = loanAmount * 10000 * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const annualPayment = monthlyPayment * 12;
        const dsr = annualIncome > 0 ? ((annualPayment + existingLoanPayment * 10000 * 12) / (annualIncome * 10000)) * 100 : 0;
        const ltv = propertyPrice > 0 ? (loanAmount / propertyPrice) * 100 : 0;
        const dti = annualIncome > 0 ? ((annualPayment / 12 * 12) / (annualIncome * 10000)) * 100 : 0;
        const maxLoanByDSR = annualIncome > 0 ? Math.floor(((annualIncome * 10000 * 0.4) - existingLoanPayment * 10000 * 12) / annualPayment * loanAmount) : 0;
        const maxLoanByLTV = Math.floor(propertyPrice * 0.7);
        return { dsr, ltv, dti, monthlyPayment: monthlyPayment || 0, maxLoanByDSR, maxLoanByLTV, loanableMax: Math.min(maxLoanByDSR, maxLoanByLTV) };
    }, [loanInputs]);

    // 상환 스케줄 계산
    const repaymentSchedule = useMemo(() => {
        const { loanAmount, loanTerm, interestRate, repaymentType } = loanInputs;
        const principal = loanAmount * 10000;
        const monthlyRate = interestRate / 100 / 12;
        const months = Math.min(loanTerm * 12, 360);
        const schedule = [];
        let remainingPrincipal = principal;
        let totalInterest = 0;

        for (let month = 1; month <= months; month++) {
            let principalPayment, interestPayment, monthlyPayment;

            if (repaymentType === 'equalPrincipal') {
                principalPayment = principal / months;
                interestPayment = remainingPrincipal * monthlyRate;
                monthlyPayment = principalPayment + interestPayment;
            } else {
                monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
                interestPayment = remainingPrincipal * monthlyRate;
                principalPayment = monthlyPayment - interestPayment;
            }

            totalInterest += interestPayment;
            remainingPrincipal -= principalPayment;

            if (month % 12 === 0 || month <= 12) {
                schedule.push({ month, year: Math.ceil(month / 12), monthlyPayment, principalPayment, interestPayment, remainingPrincipal: Math.max(0, remainingPrincipal), totalInterest });
            }
        }
        return { schedule, totalInterest, totalPayment: principal + totalInterest };
    }, [loanInputs]);

    // 은행별 금리 (2026년 1월 기준, 기준금리 2.5%)
    const bankRates = [
        { bank: 'KB국민은행', fixedRate: 3.8, variableRate: 3.4, type: '주담대' },
        { bank: '신한은행', fixedRate: 3.9, variableRate: 3.5, type: '주담대' },
        { bank: '하나은행', fixedRate: 3.7, variableRate: 3.3, type: '주담대' },
        { bank: '우리은행', fixedRate: 4.0, variableRate: 3.6, type: '주담대' },
        { bank: '농협은행', fixedRate: 3.6, variableRate: 3.2, type: '주담대' },
        { bank: 'KB국민은행', fixedRate: 3.4, variableRate: 3.0, type: '전세대출' },
        { bank: '신한은행', fixedRate: 3.5, variableRate: 3.1, type: '전세대출' },
        { bank: '하나은행', fixedRate: 3.3, variableRate: 2.9, type: '전세대출' }
    ];

    // 전세대출 계산
    const jeonseCalc = useMemo(() => {
        const { jeonseDeposit, jeonseRate } = loanInputs;
        const maxLoan = Math.floor(jeonseDeposit * 0.8);
        const monthlyInterest = (maxLoan * 10000 * (jeonseRate / 100)) / 12;
        return { maxLoan, monthlyInterest };
    }, [loanInputs]);

    // 차트 데이터
    const chartData = useMemo(() => repaymentSchedule.schedule.filter((_, i) => i % 12 === 0).map(s => ({
        year: `${s.year}년차`, principal: Math.round(s.principalPayment / 10000), interest: Math.round(s.interestPayment / 10000), remaining: Math.round(s.remainingPrincipal / 10000)
    })), [repaymentSchedule]);

    const tabs = [
        { id: 'dsr', label: 'DSR/LTV/DTI 계산', icon: <Calculator size={16} /> },
        { id: 'repayment', label: '상환 스케줄', icon: <Calendar size={16} /> },
        { id: 'compare', label: '은행 금리 비교', icon: <Building2 size={16} /> },
        { id: 'jeonse', label: '전세대출', icon: <Home size={16} /> }
    ];

    const InputField = ({ label, value, onChange, suffix, min = 0, step = 1, info }) => (
        <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{label}{info && <span title={info} style={{ cursor: 'help' }}><Info size={14} /></span>}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" value={value} onChange={e => onChange(e.target.value)} min={min} step={step} style={{ flex: 1 }} />
                {suffix && <span style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{suffix}</span>}
            </div>
        </div>
    );

    const ResultCard = ({ label, value, subValue, color, icon: Icon }) => (
        <div className="stat-card glass-card">
            <div className="stat-icon" style={{ background: color }}>{Icon && <Icon size={24} />}</div>
            <div className="stat-content">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
                {subValue && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{subValue}</span>}
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><CreditCard size={28} /> 대출 시뮬레이터</h1>
                    <p className="page-subtitle">DSR/LTV/DTI 한도 계산 및 상환 시뮬레이션</p>
                </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

            <div style={{ marginTop: 24 }}>
                {activeTab === 'dsr' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: 24, alignItems: 'start' }}>
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 16 }}>기본 정보 입력</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <InputField label="주택가격" value={loanInputs.propertyPrice} onChange={v => handleInputChange('propertyPrice', v)} suffix="만원" />
                                <InputField label="연소득" value={loanInputs.annualIncome} onChange={v => handleInputChange('annualIncome', v)} suffix="만원" info="세전 연소득" />
                                <InputField label="기존 대출 월상환액" value={loanInputs.existingLoanPayment} onChange={v => handleInputChange('existingLoanPayment', v)} suffix="만원" />
                                <InputField label="대출희망금액" value={loanInputs.loanAmount} onChange={v => handleInputChange('loanAmount', v)} suffix="만원" />
                                <InputField label="대출기간" value={loanInputs.loanTerm} onChange={v => handleInputChange('loanTerm', v)} suffix="년" min={1} />
                                <InputField label="금리" value={loanInputs.interestRate} onChange={v => handleInputChange('interestRate', v)} suffix="%" step={0.1} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                                <ResultCard label="DSR" value={formatPercent(regulations.dsr, 1, false)} subValue="규제: 40% 이하" color={regulations.dsr > 40 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)'} icon={Percent} />
                                <ResultCard label="LTV" value={formatPercent(regulations.ltv, 1, false)} subValue="규제: 70% 이하" color={regulations.ltv > 70 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)'} icon={Home} />
                                <ResultCard label="DTI" value={formatPercent(regulations.dti, 1, false)} subValue="규제: 60% 이하" color={regulations.dti > 60 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)'} icon={Calculator} />
                                <ResultCard label="월상환금" value={`${formatNumber(Math.round(regulations.monthlyPayment))}원`} subValue={`연 ${formatNumber(Math.round(regulations.monthlyPayment * 12))}원`} color="linear-gradient(135deg, #6366f1, #8b5cf6)" icon={DollarSign} />
                            </div>
                            <div className="glass-card" style={{ padding: 24 }}>
                                <h3 style={{ marginBottom: 16 }}>예상 대출 한도</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                    <div style={{ textAlign: 'center', padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12 }}><div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>DSR 기준</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(regulations.maxLoanByDSR)}</div></div>
                                    <div style={{ textAlign: 'center', padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12 }}><div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>LTV 기준</div><div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(regulations.maxLoanByLTV)}</div></div>
                                    <div style={{ textAlign: 'center', padding: 16, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))', borderRadius: 12, border: '2px solid var(--color-primary)' }}><div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>최대 대출가능</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(regulations.loanableMax)}</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'repayment' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 16 }}>상환 방식 비교</h3>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                                <button className={`btn ${loanInputs.repaymentType === 'equalPrincipalInterest' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleInputChange('repaymentType', 'equalPrincipalInterest')}>원리금균등</button>
                                <button className={`btn ${loanInputs.repaymentType === 'equalPrincipal' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleInputChange('repaymentType', 'equalPrincipal')}>원금균등</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12 }}><div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>총 상환금액</div><div style={{ fontSize: 20, fontWeight: 700 }}>{formatCurrency(Math.round(repaymentSchedule.totalPayment / 10000))}</div></div>
                                <div style={{ padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12 }}><div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>총 이자</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-danger)' }}>{formatCurrency(Math.round(repaymentSchedule.totalInterest / 10000))}</div></div>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 16 }}>연도별 상환 추이</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="year" tick={{ fontSize: 12 }} /><YAxis tickFormatter={v => `${v}만`} /><Tooltip formatter={v => `${formatNumber(v)}만원`} /><Legend /><Bar dataKey="principal" stackId="a" fill="#6366f1" name="원금" /><Bar dataKey="interest" stackId="a" fill="#f59e0b" name="이자" /></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {activeTab === 'compare' && (
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>은행별 금리 비교 (2025년 1월 기준)</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%' }}>
                                <thead><tr><th>은행</th><th>상품</th><th>고정금리</th><th>변동금리</th><th>예상 월상환금</th></tr></thead>
                                <tbody>
                                    {bankRates.map((bank, i) => {
                                        const monthlyRate = bank.variableRate / 100 / 12;
                                        const months = loanInputs.loanTerm * 12;
                                        const payment = loanInputs.loanAmount * 10000 * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
                                        return (
                                            <tr key={i}><td style={{ fontWeight: 600 }}>{bank.bank}</td><td>{bank.type}</td><td>{bank.fixedRate}%</td><td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{bank.variableRate}%</td><td>{formatNumber(Math.round(payment))}원</td></tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'jeonse' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="glass-card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 16 }}>전세대출 계산</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <InputField label="전세보증금" value={loanInputs.jeonseDeposit} onChange={v => handleInputChange('jeonseDeposit', v)} suffix="만원" />
                                <InputField label="전세대출 금리" value={loanInputs.jeonseRate} onChange={v => handleInputChange('jeonseRate', v)} suffix="%" step={0.1} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <ResultCard label="최대 대출한도 (80%)" value={formatCurrency(jeonseCalc.maxLoan)} color="linear-gradient(135deg, #6366f1, #8b5cf6)" icon={PiggyBank} />
                            <ResultCard label="월 이자" value={`${formatNumber(Math.round(jeonseCalc.monthlyInterest))}원`} subValue={`연 ${formatNumber(Math.round(jeonseCalc.monthlyInterest * 12))}원`} color="linear-gradient(135deg, #f59e0b, #fbbf24)" icon={DollarSign} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MortgageSimulator;
