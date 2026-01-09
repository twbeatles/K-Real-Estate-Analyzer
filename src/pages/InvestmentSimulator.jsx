import { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Calculator, TrendingUp, TrendingDown, Home, Building2,
    DollarSign, Percent, Calendar, PiggyBank, Target,
    RefreshCw, Save, Trash2, Download
} from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

/**
 * 투자 시뮬레이터 페이지
 * 부동산 투자 수익률 예측 및 시뮬레이션
 */
const InvestmentSimulator = memo(() => {
    // 저장된 시뮬레이션 불러오기
    const [savedSimulations, setSavedSimulations] = useState(() => {
        const saved = localStorage.getItem('investmentSimulations');
        return saved ? JSON.parse(saved) : [];
    });

    // 입력값
    const [inputs, setInputs] = useState({
        propertyType: 'apartment', // apartment, officetel, commercial
        purchasePrice: 100000, // 만원
        depositPercent: 30, // 자기자본 비율
        loanRate: 4.5, // 대출금리
        loanTerm: 30, // 대출기간 (년)
        monthlyRent: 150, // 월세 (만원)
        deposit: 10000, // 전세보증금 (만원, 월세시)
        maintenanceCost: 20, // 월 관리비 (만원)
        propertyTax: 0.3, // 재산세율 (%)
        expectedAppreciation: 3, // 연평균 시세상승률 (%)
        holdingPeriod: 10, // 보유기간 (년)
        vacancyRate: 5, // 공실률 (%)
        investmentName: '',
    });

    // 투자 유형
    const [investmentType, setInvestmentType] = useState('rent'); // rent, gap, jeonse

    // 입력 검증 오류 상태
    const [validationErrors, setValidationErrors] = useState({});

    // 입력 검증 함수
    const validateInput = useCallback((field, value) => {
        const errors = {};

        // 음수 불가 필드
        const nonNegativeFields = ['purchasePrice', 'depositPercent', 'monthlyRent', 'deposit',
            'maintenanceCost', 'propertyTax', 'holdingPeriod', 'vacancyRate', 'loanTerm'];

        if (nonNegativeFields.includes(field) && value < 0) {
            errors[field] = '음수를 입력할 수 없습니다.';
        }

        // 특정 필드 범위 검증
        if (field === 'purchasePrice' && value > 10000000) {
            errors[field] = '매매가가 너무 큽니다. (1000억원 이하)';
        }
        if (field === 'depositPercent' && (value < 0 || value > 100)) {
            errors[field] = '자기자본 비율은 0~100% 사이여야 합니다.';
        }
        if (field === 'loanRate' && (value < 0 || value > 30)) {
            errors[field] = '대출금리는 0~30% 사이여야 합니다.';
        }
        if (field === 'holdingPeriod' && (value < 1 || value > 50)) {
            errors[field] = '보유기간은 1~50년 사이여야 합니다.';
        }
        if (field === 'vacancyRate' && (value < 0 || value > 100)) {
            errors[field] = '공실률은 0~100% 사이여야 합니다.';
        }
        if (field === 'loanTerm' && (value < 1 || value > 50)) {
            errors[field] = '대출기간은 1~50년 사이여야 합니다.';
        }

        return errors;
    }, []);

    // 입력 핸들러 (검증 포함)
    const handleInputChange = useCallback((field, value) => {
        const errors = validateInput(field, value);

        setValidationErrors(prev => {
            const updated = { ...prev };
            if (Object.keys(errors).length > 0) {
                updated[field] = errors[field];
            } else {
                delete updated[field];
            }
            return updated;
        });

        setInputs(prev => ({ ...prev, [field]: value }));
    }, [validateInput]);

    // 시뮬레이션 계산
    const simulation = useMemo(() => {
        const {
            purchasePrice, depositPercent, loanRate, loanTerm,
            monthlyRent, deposit, maintenanceCost, propertyTax,
            expectedAppreciation, holdingPeriod, vacancyRate
        } = inputs;

        // 초기 투자금
        const equityAmount = purchasePrice * (depositPercent / 100);
        const loanAmount = purchasePrice - equityAmount;

        // 월 대출 상환금 (원리금균등)
        const monthlyRate = loanRate / 100 / 12;
        const totalMonths = loanTerm * 12;
        const monthlyPayment = loanAmount > 0
            ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
            : 0;

        // 연간 수익/비용 계산
        const annualRent = monthlyRent * 12 * (1 - vacancyRate / 100);
        const depositInterest = deposit * 0.03; // 보증금 운용수익 (3%)
        const annualMaintenance = maintenanceCost * 12;
        const annualPropertyTax = purchasePrice * (propertyTax / 100);
        const annualLoanPayment = monthlyPayment * 12;
        const annualInterest = loanAmount * (loanRate / 100); // 첫해 이자

        // 연간 순수익
        const annualNetIncome = investmentType === 'jeonse'
            ? depositInterest - annualMaintenance - annualPropertyTax - annualLoanPayment
            : annualRent + depositInterest - annualMaintenance - annualPropertyTax - annualLoanPayment;

        // 월 순수익
        const monthlyNetIncome = annualNetIncome / 12;

        // 연간 현금 수익률
        const cashYield = equityAmount > 0 ? (annualNetIncome / equityAmount) * 100 : 0;

        // 보유기간 동안의 예상 시세
        const yearlyData = [];
        let currentValue = purchasePrice;
        let totalCashflow = -equityAmount; // 초기 투자금
        let remainingLoan = loanAmount;

        for (let year = 0; year <= holdingPeriod; year++) {
            const appreciation = year > 0 ? currentValue * (expectedAppreciation / 100) : 0;
            currentValue = currentValue + appreciation;

            // 대출 원금 상환액 (간소화)
            const principalPayment = year > 0 ? loanAmount / loanTerm : 0;
            remainingLoan = Math.max(0, remainingLoan - principalPayment);

            // 연간 순현금흐름
            const yearCashflow = year > 0 ? annualNetIncome : 0;
            totalCashflow += yearCashflow;

            yearlyData.push({
                year,
                propertyValue: Math.round(currentValue),
                equity: Math.round(currentValue - remainingLoan),
                totalCashflow: Math.round(totalCashflow),
                remainingLoan: Math.round(remainingLoan),
            });
        }

        // 최종 수익 계산
        const finalValue = yearlyData[holdingPeriod].propertyValue;
        const totalAppreciation = finalValue - purchasePrice;

        // 양도세 (간소화: 기본세율 적용)
        let capitalGainsTax = 0;
        if (totalAppreciation > 0) {
            const taxableGain = totalAppreciation * 0.85; // 필요경비 15% 가정
            if (holdingPeriod >= 2) {
                capitalGainsTax = taxableGain * 0.24; // 2년 이상 보유
            } else if (holdingPeriod >= 1) {
                capitalGainsTax = taxableGain * 0.40; // 1년 이상
            } else {
                capitalGainsTax = taxableGain * 0.50; // 1년 미만
            }
        }

        // 총 수익
        const finalEquity = finalValue - yearlyData[holdingPeriod].remainingLoan;
        const totalProfit = finalEquity - equityAmount + (annualNetIncome * holdingPeriod) - capitalGainsTax;
        const totalROI = equityAmount > 0 ? (totalProfit / equityAmount) * 100 : 0;
        const annualizedROI = holdingPeriod > 0
            ? (Math.pow(1 + totalROI / 100, 1 / holdingPeriod) - 1) * 100
            : 0;

        return {
            equityAmount,
            loanAmount,
            monthlyPayment,
            monthlyNetIncome,
            annualNetIncome,
            cashYield,
            yearlyData,
            finalValue,
            totalAppreciation,
            capitalGainsTax,
            totalProfit,
            totalROI,
            annualizedROI,
        };
    }, [inputs, investmentType]);

    // 시뮬레이션 저장
    const saveSimulation = () => {
        const name = inputs.investmentName || `시뮬레이션 ${savedSimulations.length + 1}`;
        const newSim = {
            id: Date.now(),
            name,
            inputs: { ...inputs, investmentName: name },
            investmentType,
            result: simulation,
            createdAt: new Date().toISOString(),
        };

        const updated = [...savedSimulations, newSim];
        setSavedSimulations(updated);
        localStorage.setItem('investmentSimulations', JSON.stringify(updated));
        handleInputChange('investmentName', '');
    };

    // 시뮬레이션 불러오기
    const loadSimulation = (sim) => {
        setInputs(sim.inputs);
        setInvestmentType(sim.investmentType);
    };

    // 시뮬레이션 삭제
    const deleteSimulation = (id) => {
        const updated = savedSimulations.filter(s => s.id !== id);
        setSavedSimulations(updated);
        localStorage.setItem('investmentSimulations', JSON.stringify(updated));
    };

    const propertyTypes = [
        { id: 'apartment', label: '아파트' },
        { id: 'officetel', label: '오피스텔' },
        { id: 'commercial', label: '상가' },
    ];

    const investmentTypes = [
        { id: 'rent', label: '월세 투자' },
        { id: 'gap', label: '갭투자' },
        { id: 'jeonse', label: '전세 투자' },
    ];

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
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}>
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>투자 시뮬레이터</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                부동산 투자 수익률 예측
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={inputs.investmentName}
                            onChange={(e) => handleInputChange('investmentName', e.target.value)}
                            placeholder="시뮬레이션 이름"
                            className="input"
                            style={{ width: 150 }}
                        />
                        <button className="btn btn-primary" onClick={saveSimulation}>
                            <Save size={16} /> 저장
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
                {/* Input Panel */}
                <div>
                    {/* Investment Type */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>투자 유형</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {investmentTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setInvestmentType(type.id)}
                                    className={`btn ${investmentType === type.id ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ flex: 1, fontSize: '0.8rem' }}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Property Info */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>매물 정보</h3>

                        <div className="form-group">
                            <label htmlFor="purchasePrice">
                                매매가 <span className="unit">(만원)</span>
                            </label>
                            <input
                                id="purchasePrice"
                                type="number"
                                value={inputs.purchasePrice}
                                onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                                placeholder="예: 100000"
                                style={validationErrors.purchasePrice ? { borderColor: 'var(--color-danger)' } : {}}
                            />
                            {validationErrors.purchasePrice && (
                                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                    {validationErrors.purchasePrice}
                                </span>
                            )}
                        </div>

                        {investmentType === 'rent' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="monthlyRent">
                                        월세 <span className="unit">(만원)</span>
                                    </label>
                                    <input
                                        id="monthlyRent"
                                        type="number"
                                        value={inputs.monthlyRent}
                                        onChange={(e) => handleInputChange('monthlyRent', Number(e.target.value))}
                                        placeholder="예: 150"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="deposit">
                                        보증금 <span className="unit">(만원)</span>
                                    </label>
                                    <input
                                        id="deposit"
                                        type="number"
                                        value={inputs.deposit}
                                        onChange={(e) => handleInputChange('deposit', Number(e.target.value))}
                                        placeholder="예: 10000"
                                    />
                                </div>
                            </>
                        )}

                        {investmentType === 'gap' && (
                            <div className="form-group">
                                <label htmlFor="jeonsePrice">
                                    전세가 <span className="unit">(만원)</span>
                                </label>
                                <input
                                    id="jeonsePrice"
                                    type="number"
                                    value={inputs.deposit}
                                    onChange={(e) => handleInputChange('deposit', Number(e.target.value))}
                                    placeholder="예: 80000"
                                />
                            </div>
                        )}
                    </div>

                    {/* Financing */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>자금 계획</h3>

                        <div className="form-group">
                            <label htmlFor="depositPercent">
                                자기자본 비율 <span className="unit">({inputs.depositPercent}%)</span>
                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                    {formatCurrency(simulation.equityAmount)}
                                </span>
                            </label>
                            <input
                                id="depositPercent"
                                type="range"
                                min="10"
                                max="100"
                                value={inputs.depositPercent}
                                onChange={(e) => handleInputChange('depositPercent', Number(e.target.value))}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                                <span>10%</span>
                                <span>100%</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="loanRate">
                                대출금리 <span className="unit">(%)</span>
                            </label>
                            <input
                                id="loanRate"
                                type="number"
                                step="0.1"
                                value={inputs.loanRate}
                                onChange={(e) => handleInputChange('loanRate', Number(e.target.value))}
                                placeholder="예: 4.5"
                                style={validationErrors.loanRate ? { borderColor: 'var(--color-danger)' } : {}}
                            />
                            {validationErrors.loanRate && (
                                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                    {validationErrors.loanRate}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="loanTerm">
                                대출기간 <span className="unit">(년)</span>
                            </label>
                            <input
                                id="loanTerm"
                                type="number"
                                value={inputs.loanTerm}
                                onChange={(e) => handleInputChange('loanTerm', Number(e.target.value))}
                                placeholder="예: 30"
                                style={validationErrors.loanTerm ? { borderColor: 'var(--color-danger)' } : {}}
                            />
                            {validationErrors.loanTerm && (
                                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                    {validationErrors.loanTerm}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Assumptions */}
                    <div className="card">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>시세 전망</h3>

                        <div className="form-group">
                            <label htmlFor="expectedAppreciation">
                                연평균 시세상승률 <span className="unit">(%)</span>
                                <span
                                    className="tooltip-help"
                                    data-tooltip="과거 10년 수도권 평균: 약 3~5%"
                                    style={{ marginLeft: 6 }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </span>
                            </label>
                            <input
                                id="expectedAppreciation"
                                type="number"
                                step="0.5"
                                value={inputs.expectedAppreciation}
                                onChange={(e) => handleInputChange('expectedAppreciation', Number(e.target.value))}
                                placeholder="예: 3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="holdingPeriod">
                                보유기간 <span className="unit">(년)</span>
                            </label>
                            <input
                                id="holdingPeriod"
                                type="number"
                                value={inputs.holdingPeriod}
                                onChange={(e) => handleInputChange('holdingPeriod', Number(e.target.value))}
                                placeholder="예: 10"
                                style={validationErrors.holdingPeriod ? { borderColor: 'var(--color-danger)' } : {}}
                            />
                            {validationErrors.holdingPeriod && (
                                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                    {validationErrors.holdingPeriod}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="vacancyRate">
                                예상 공실률 <span className="unit">(%)</span>
                                <span
                                    className="tooltip-help"
                                    data-tooltip="일반적으로 5~10% 정도를 예상합니다"
                                    style={{ marginLeft: 6 }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </span>
                            </label>
                            <input
                                id="vacancyRate"
                                type="number"
                                value={inputs.vacancyRate}
                                onChange={(e) => handleInputChange('vacancyRate', Number(e.target.value))}
                                placeholder="예: 5"
                                style={validationErrors.vacancyRate ? { borderColor: 'var(--color-danger)' } : {}}
                            />
                            {validationErrors.vacancyRate && (
                                <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                    {validationErrors.vacancyRate}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div>
                    {/* Summary Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 20,
                        marginBottom: 24
                    }}>
                        <div className="stat-card" style={{ minHeight: 120 }}>
                            <div className="stat-card-header" style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>총 투자수익률</span>
                                <Target size={20} style={{ color: 'var(--color-success)' }} />
                            </div>
                            <div className="stat-card-value" style={{
                                color: simulation.totalROI >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                fontSize: '1.75rem',
                                whiteSpace: 'nowrap',
                            }}>
                                {formatPercent(simulation.totalROI)}
                            </div>
                            <div className="stat-card-label" style={{ marginTop: 8 }}>{inputs.holdingPeriod}년 보유 기준</div>
                        </div>

                        <div className="stat-card" style={{ minHeight: 120 }}>
                            <div className="stat-card-header" style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>연평균 수익률</span>
                                <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div className="stat-card-value" style={{
                                fontSize: '1.75rem',
                                whiteSpace: 'nowrap',
                            }}>
                                {formatPercent(simulation.annualizedROI)}
                            </div>
                            <div className="stat-card-label" style={{ marginTop: 8 }}>CAGR</div>
                        </div>

                        <div className="stat-card" style={{ minHeight: 120 }}>
                            <div className="stat-card-header" style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>월 순수익</span>
                                <PiggyBank size={20} style={{ color: 'var(--color-warning)' }} />
                            </div>
                            <div className="stat-card-value" style={{
                                color: simulation.monthlyNetIncome >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                fontSize: '1.75rem',
                                whiteSpace: 'nowrap',
                            }}>
                                {formatNumber(Math.round(simulation.monthlyNetIncome))}
                                <span style={{ fontSize: '1rem', fontWeight: 500, marginLeft: 4 }}>만원</span>
                            </div>
                            <div className="stat-card-label" style={{ marginTop: 8 }}>월간 현금흐름</div>
                        </div>

                        <div className="stat-card" style={{ minHeight: 120 }}>
                            <div className="stat-card-header" style={{ marginBottom: 12 }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>현금수익률</span>
                                <Percent size={20} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div className="stat-card-value" style={{
                                fontSize: '1.75rem',
                                whiteSpace: 'nowrap',
                            }}>
                                {formatPercent(simulation.cashYield)}
                            </div>
                            <div className="stat-card-label" style={{ marginTop: 8 }}>연간 Cash-on-Cash</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>자산 가치 추이</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={simulation.yearlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}년`} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}억`} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        labelFormatter={(label) => `${label}년차`}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="propertyValue"
                                        name="부동산 가치"
                                        stroke="#3b82f6"
                                        fill="#3b82f620"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="equity"
                                        name="순자산"
                                        stroke="#10b981"
                                        fill="#10b98120"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Results */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>상세 결과</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>초기 투자금</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(simulation.equityAmount)}</p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>대출금</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(simulation.loanAmount)}</p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>월 상환금</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatNumber(Math.round(simulation.monthlyPayment))}만원</p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>예상 매도가</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatCurrency(simulation.finalValue)}</p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>시세차익</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-success)' }}>
                                    +{formatCurrency(simulation.totalAppreciation)}
                                </p>
                            </div>
                            <div style={{ padding: 16, background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>예상 양도세</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                                    -{formatCurrency(simulation.capitalGainsTax)}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            marginTop: 16,
                            padding: 20,
                            background: simulation.totalProfit >= 0 ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 4 }}>총 예상 수익</p>
                            <p style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: simulation.totalProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
                            }}>
                                {simulation.totalProfit >= 0 ? '+' : ''}{formatCurrency(simulation.totalProfit)}
                            </p>
                        </div>
                    </div>

                    {/* Saved Simulations */}
                    {savedSimulations.length > 0 && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>저장된 시뮬레이션</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {savedSimulations.map(sim => (
                                    <div
                                        key={sim.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{sim.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                                {formatCurrency(sim.inputs.purchasePrice)} | ROI {formatPercent(sim.result.totalROI)}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => loadSimulation(sim)}
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => deleteSimulation(sim.id)}
                                                style={{ color: 'var(--color-danger)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{
                marginTop: 24,
                padding: 16,
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--color-text-tertiary)',
            }}>
                ⚠️ 본 시뮬레이션은 참고용이며, 실제 투자 결과와 다를 수 있습니다. 세금 계산은 간소화되었으며, 정확한 세금은 세무사와 상담하세요.
            </div>
        </div>
    );
});

InvestmentSimulator.displayName = 'InvestmentSimulator';

export default InvestmentSimulator;
