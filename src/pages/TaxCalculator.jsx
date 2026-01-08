import { useState, useMemo } from 'react';
import { Receipt, Calculator, Percent, Home, Building2, AlertTriangle, Info } from 'lucide-react';
import Tabs from '../components/ui/Tabs';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

/**
 * 세금 및 규제 계산기 페이지
 */
const TaxCalculator = () => {
    const [activeTab, setActiveTab] = useState('acquisition');

    // 취득세 계산기 상태
    const [acquisition, setAcquisition] = useState({
        price: 90000, // 만원 (9억)
        isAdjustedArea: true, // 조정대상지역 여부
        houseCount: 1, // 주택 수
        isFirstTime: false, // 생애최초
        propertyType: 'apartment', // apartment, house, land
    });

    // 양도세 계산기 상태
    const [transfer, setTransfer] = useState({
        purchasePrice: 60000, // 만원
        salePrice: 90000, // 만원
        holdingYears: 5, // 보유 년수
        livingYears: 3, // 거주 년수
        isAdjustedArea: true,
        houseCount: 1,
        acquisitionCost: 500, // 취득 부대비용 (만원)
        transferCost: 300, // 양도 부대비용 (만원)
    });

    // DSR 계산기 상태
    const [dsr, setDsr] = useState({
        annualIncome: 6000, // 만원
        newLoanAmount: 50000, // 신규 대출 금액 (만원)
        newLoanRate: 4.5, // %
        newLoanTerm: 30, // 년
        existingLoans: 0, // 기존 대출 연간 원리금 (만원)
        targetDSR: 40, // 목표 DSR %
    });

    const tabs = [
        { id: 'acquisition', label: '취득세', icon: Receipt },
        { id: 'transfer', label: '양도세', icon: Calculator },
        { id: 'dsr', label: 'DSR/DTI', icon: Percent },
    ];

    // 취득세 계산
    const acquisitionResult = useMemo(() => {
        const price = acquisition.price * 10000; // 원 단위
        let rate = 0;
        let specialRate = 0; // 중과세율
        let localEducationTax = 0; // 지방교육세
        let agriculturalTax = 0; // 농어촌특별세

        // 기본 취득세율 (주택)
        if (acquisition.propertyType === 'apartment' || acquisition.propertyType === 'house') {
            if (acquisition.houseCount === 1) {
                // 1주택자
                if (acquisition.price <= 60000) {
                    rate = 0.01; // 6억 이하 1%
                } else if (acquisition.price <= 90000) {
                    rate = 0.01 + ((acquisition.price - 60000) / 30000) * 0.02; // 6~9억 1~3%
                } else {
                    rate = 0.03; // 9억 초과 3%
                }

                // 생애최초 감면
                if (acquisition.isFirstTime && acquisition.price <= 120000) {
                    rate = Math.max(0, rate - 0.015); // 최대 1.5%p 감면
                }
            } else if (acquisition.houseCount === 2) {
                // 2주택자
                if (acquisition.isAdjustedArea) {
                    rate = 0.08; // 조정지역 8%
                } else {
                    rate = 0.01 + ((acquisition.price - 60000) / 30000) * 0.02;
                }
            } else {
                // 3주택 이상
                if (acquisition.isAdjustedArea) {
                    rate = 0.12; // 조정지역 12%
                } else {
                    rate = 0.08; // 비조정지역 8%
                }
            }
        } else {
            // 토지
            rate = 0.04;
        }

        // 지방교육세 (취득세의 10%)
        localEducationTax = price * rate * 0.1;

        // 농어촌특별세 (전용면적 85㎡ 초과 시)
        if (acquisition.price > 60000) {
            agriculturalTax = price * 0.002;
        }

        const acquisitionTax = price * rate;
        const totalTax = acquisitionTax + localEducationTax + agriculturalTax;

        return {
            rate: rate * 100,
            acquisitionTax,
            localEducationTax,
            agriculturalTax,
            totalTax,
            effectiveRate: (totalTax / price) * 100,
        };
    }, [acquisition]);

    // 양도세 계산
    const transferResult = useMemo(() => {
        const purchasePrice = transfer.purchasePrice * 10000;
        const salePrice = transfer.salePrice * 10000;
        const acquisitionCost = transfer.acquisitionCost * 10000;
        const transferCost = transfer.transferCost * 10000;

        // 양도차익
        const gain = salePrice - purchasePrice - acquisitionCost - transferCost;
        if (gain <= 0) {
            return {
                gain: 0,
                taxableGain: 0,
                taxRate: 0,
                tax: 0,
                localTax: 0,
                totalTax: 0,
                deductionRate: 0,
            };
        }

        // 장기보유특별공제 (1세대 1주택)
        let deductionRate = 0;
        if (transfer.houseCount === 1) {
            // 보유기간 공제 (연 4%, 최대 40%)
            const holdingDeduction = Math.min(transfer.holdingYears * 0.04, 0.4);
            // 거주기간 공제 (연 4%, 최대 40%)
            const livingDeduction = Math.min(transfer.livingYears * 0.04, 0.4);
            deductionRate = holdingDeduction + livingDeduction;

            // 최대 80%
            deductionRate = Math.min(deductionRate, 0.8);
        } else if (transfer.holdingYears >= 3) {
            // 다주택자 장특공 (연 2%, 최대 30%)
            deductionRate = Math.min((transfer.holdingYears - 2) * 0.02, 0.3);
        }

        const taxableGain = gain * (1 - deductionRate);

        // 양도세율 (누진세율)
        let taxRate = 0;
        let progressiveTax = 0;

        // 기본세율 적용
        if (taxableGain <= 14000000) {
            taxRate = 0.06;
            progressiveTax = taxableGain * 0.06;
        } else if (taxableGain <= 50000000) {
            taxRate = 0.15;
            progressiveTax = 14000000 * 0.06 + (taxableGain - 14000000) * 0.15;
        } else if (taxableGain <= 88000000) {
            taxRate = 0.24;
            progressiveTax = 14000000 * 0.06 + 36000000 * 0.15 + (taxableGain - 50000000) * 0.24;
        } else if (taxableGain <= 150000000) {
            taxRate = 0.35;
            progressiveTax = 14000000 * 0.06 + 36000000 * 0.15 + 38000000 * 0.24 + (taxableGain - 88000000) * 0.35;
        } else if (taxableGain <= 300000000) {
            taxRate = 0.38;
            progressiveTax = 14000000 * 0.06 + 36000000 * 0.15 + 38000000 * 0.24 + 62000000 * 0.35 + (taxableGain - 150000000) * 0.38;
        } else if (taxableGain <= 500000000) {
            taxRate = 0.40;
            progressiveTax = 14000000 * 0.06 + 36000000 * 0.15 + 38000000 * 0.24 + 62000000 * 0.35 + 150000000 * 0.38 + (taxableGain - 300000000) * 0.40;
        } else if (taxableGain <= 1000000000) {
            taxRate = 0.42;
            progressiveTax = 14000000 * 0.06 + 36000000 * 0.15 + 38000000 * 0.24 + 62000000 * 0.35 + 150000000 * 0.38 + 200000000 * 0.40 + (taxableGain - 500000000) * 0.42;
        } else {
            taxRate = 0.45;
            progressiveTax = 14000000 * 0.06 + 36000000 * 0.15 + 38000000 * 0.24 + 62000000 * 0.35 + 150000000 * 0.38 + 200000000 * 0.40 + 500000000 * 0.42 + (taxableGain - 1000000000) * 0.45;
        }

        // 중과세 (다주택자 + 조정지역)
        let surcharge = 0;
        if (transfer.isAdjustedArea && transfer.houseCount >= 2) {
            if (transfer.houseCount === 2) {
                surcharge = taxableGain * 0.20; // 2주택 +20%p
            } else {
                surcharge = taxableGain * 0.30; // 3주택 +30%p
            }
        }

        const tax = progressiveTax + surcharge;
        const localTax = tax * 0.1; // 지방소득세
        const totalTax = tax + localTax;

        return {
            gain: gain / 10000,
            taxableGain: taxableGain / 10000,
            taxRate: taxRate * 100,
            tax: tax / 10000,
            localTax: localTax / 10000,
            totalTax: totalTax / 10000,
            deductionRate: deductionRate * 100,
            netProfit: (gain - totalTax) / 10000,
        };
    }, [transfer]);

    // DSR 계산
    const dsrResult = useMemo(() => {
        const annualIncome = dsr.annualIncome * 10000;
        const monthlyIncome = annualIncome / 12;

        // 신규 대출 월 상환액 (원리금균등)
        const principal = dsr.newLoanAmount * 10000;
        const monthlyRate = dsr.newLoanRate / 100 / 12;
        const totalMonths = dsr.newLoanTerm * 12;

        const newMonthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1);
        const newAnnualPayment = newMonthlyPayment * 12;

        // 기존 대출 연간 상환액
        const existingAnnualPayment = dsr.existingLoans * 10000;

        // 총 연간 원리금
        const totalAnnualPayment = newAnnualPayment + existingAnnualPayment;

        // DSR 계산
        const currentDSR = (totalAnnualPayment / annualIncome) * 100;

        // 대출 가능 금액 역산 (목표 DSR 기준)
        const targetAnnualPayment = annualIncome * (dsr.targetDSR / 100) - existingAnnualPayment;
        const maxMonthlyPayment = targetAnnualPayment / 12;

        // 대출 가능 금액 (원리금균등 역산)
        const maxLoan = maxMonthlyPayment * (Math.pow(1 + monthlyRate, totalMonths) - 1) /
            (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));

        // DTI (원금 기준)
        const dti = ((principal / totalMonths * 12 + existingAnnualPayment) / annualIncome) * 100;

        return {
            newMonthlyPayment: newMonthlyPayment / 10000,
            newAnnualPayment: newAnnualPayment / 10000,
            totalAnnualPayment: totalAnnualPayment / 10000,
            currentDSR,
            dti,
            maxLoanAmount: Math.max(0, maxLoan / 10000),
            isOverLimit: currentDSR > dsr.targetDSR,
            remainingCapacity: Math.max(0, (annualIncome * (dsr.targetDSR / 100) - totalAnnualPayment) / 10000),
        };
    }, [dsr]);

    const InputField = ({ label, value, onChange, suffix, min, max, step = 1, info }) => (
        <div style={{ marginBottom: 16 }}>
            <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: 8,
                color: 'var(--color-text-secondary)',
            }}>
                {label}
                {info && (
                    <span
                        className="tooltip"
                        data-tooltip={info}
                        style={{ cursor: 'help' }}
                    >
                        <Info size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    </span>
                )}
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
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', minWidth: 40 }}>
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );

    const SelectField = ({ label, value, onChange, options }) => (
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
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input select"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    const ToggleField = ({ label, value, onChange }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid var(--color-border)',
        }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{label}</span>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 48,
                    height: 26,
                    borderRadius: 13,
                    border: 'none',
                    background: value ? 'var(--color-primary)' : 'var(--color-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                }}
            >
                <span style={{
                    position: 'absolute',
                    top: 3,
                    left: value ? 25 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left var(--transition-fast)',
                    boxShadow: 'var(--shadow-sm)',
                }} />
            </button>
        </div>
    );

    const ResultCard = ({ label, value, highlight = false, warning = false }) => (
        <div style={{
            padding: 16,
            background: highlight
                ? 'linear-gradient(135deg, var(--color-primary), #7c3aed)'
                : warning
                    ? 'var(--color-danger-light)'
                    : 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            color: highlight ? 'white' : warning ? 'var(--color-danger)' : 'inherit',
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

            {/* 취득세 계산기 */}
            {activeTab === 'acquisition' && (
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 20 }}>
                            <Receipt size={18} style={{ marginRight: 8 }} />
                            취득세 계산
                        </h3>

                        <InputField
                            label="취득가격"
                            value={acquisition.price}
                            onChange={(v) => setAcquisition(prev => ({ ...prev, price: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <SelectField
                            label="주택 수 (취득 후)"
                            value={acquisition.houseCount}
                            onChange={(v) => setAcquisition(prev => ({ ...prev, houseCount: Number(v) }))}
                            options={[
                                { value: 1, label: '1주택' },
                                { value: 2, label: '2주택' },
                                { value: 3, label: '3주택 이상' },
                            ]}
                        />

                        <SelectField
                            label="부동산 유형"
                            value={acquisition.propertyType}
                            onChange={(v) => setAcquisition(prev => ({ ...prev, propertyType: v }))}
                            options={[
                                { value: 'apartment', label: '아파트' },
                                { value: 'house', label: '단독주택' },
                                { value: 'land', label: '토지' },
                            ]}
                        />

                        <ToggleField
                            label="조정대상지역"
                            value={acquisition.isAdjustedArea}
                            onChange={(v) => setAcquisition(prev => ({ ...prev, isAdjustedArea: v }))}
                        />

                        <ToggleField
                            label="생애최초 주택 구입"
                            value={acquisition.isFirstTime}
                            onChange={(v) => setAcquisition(prev => ({ ...prev, isFirstTime: v }))}
                        />

                        <div style={{
                            marginTop: 16,
                            padding: 12,
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            color: 'var(--color-text-tertiary)',
                        }}>
                            💡 2024년 기준 세율이 적용됩니다. 실제 세금은 지자체 및 상황에 따라 다를 수 있습니다.
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                            <ResultCard label="취득세율" value={`${acquisitionResult.rate.toFixed(1)}%`} />
                            <ResultCard label="취득세" value={formatCurrency(acquisitionResult.acquisitionTax / 10000)} />
                            <ResultCard label="지방교육세" value={formatCurrency(acquisitionResult.localEducationTax / 10000)} />
                            <ResultCard
                                label="총 납부세액"
                                value={formatCurrency(acquisitionResult.totalTax / 10000)}
                                highlight
                            />
                        </div>

                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: 16 }}>세금 상세 내역</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>취득가격</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(acquisition.price)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>취득세 ({acquisitionResult.rate.toFixed(1)}%)</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(acquisitionResult.acquisitionTax / 10000)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <span style={{ color: 'var(--color-text-secondary)' }}>지방교육세 (10%)</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(acquisitionResult.localEducationTax / 10000)}</span>
                                </div>
                                {acquisitionResult.agriculturalTax > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <span style={{ color: 'var(--color-text-secondary)' }}>농어촌특별세</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(acquisitionResult.agriculturalTax / 10000)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                    <span style={{ fontWeight: 600 }}>총 납부세액</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary)' }}>
                                        {formatCurrency(acquisitionResult.totalTax / 10000)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: 8 }}>
                                    <span style={{ color: 'var(--color-text-secondary)', paddingLeft: 12 }}>실효세율</span>
                                    <span style={{ fontWeight: 600, paddingRight: 12 }}>{acquisitionResult.effectiveRate.toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 양도세 계산기 */}
            {activeTab === 'transfer' && (
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 20 }}>
                            <Calculator size={18} style={{ marginRight: 8 }} />
                            양도소득세 계산
                        </h3>

                        <InputField
                            label="취득가격"
                            value={transfer.purchasePrice}
                            onChange={(v) => setTransfer(prev => ({ ...prev, purchasePrice: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="양도가격"
                            value={transfer.salePrice}
                            onChange={(v) => setTransfer(prev => ({ ...prev, salePrice: v }))}
                            suffix="만원"
                            min={1000}
                            step={1000}
                        />

                        <InputField
                            label="보유 기간"
                            value={transfer.holdingYears}
                            onChange={(v) => setTransfer(prev => ({ ...prev, holdingYears: v }))}
                            suffix="년"
                            min={0}
                            max={50}
                        />

                        <InputField
                            label="거주 기간"
                            value={transfer.livingYears}
                            onChange={(v) => setTransfer(prev => ({ ...prev, livingYears: v }))}
                            suffix="년"
                            min={0}
                            max={transfer.holdingYears}
                        />

                        <SelectField
                            label="주택 수"
                            value={transfer.houseCount}
                            onChange={(v) => setTransfer(prev => ({ ...prev, houseCount: Number(v) }))}
                            options={[
                                { value: 1, label: '1주택 (비과세 가능)' },
                                { value: 2, label: '2주택' },
                                { value: 3, label: '3주택 이상' },
                            ]}
                        />

                        <ToggleField
                            label="조정대상지역"
                            value={transfer.isAdjustedArea}
                            onChange={(v) => setTransfer(prev => ({ ...prev, isAdjustedArea: v }))}
                        />

                        <InputField
                            label="취득 부대비용"
                            value={transfer.acquisitionCost}
                            onChange={(v) => setTransfer(prev => ({ ...prev, acquisitionCost: v }))}
                            suffix="만원"
                            min={0}
                            info="취득세, 중개수수료, 법무비용 등"
                        />

                        <InputField
                            label="양도 부대비용"
                            value={transfer.transferCost}
                            onChange={(v) => setTransfer(prev => ({ ...prev, transferCost: v }))}
                            suffix="만원"
                            min={0}
                            info="중개수수료, 인테리어 비용 등"
                        />
                    </div>

                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                            <ResultCard label="양도차익" value={formatCurrency(transferResult.gain)} />
                            <ResultCard label="장특공제율" value={`${transferResult.deductionRate.toFixed(0)}%`} />
                            <ResultCard label="과세표준" value={formatCurrency(transferResult.taxableGain)} />
                            <ResultCard
                                label="총 양도세"
                                value={formatCurrency(transferResult.totalTax)}
                                highlight
                            />
                        </div>

                        {transfer.houseCount >= 2 && transfer.isAdjustedArea && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'var(--color-danger-light)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 20,
                                color: 'var(--color-danger)',
                            }}>
                                <AlertTriangle size={18} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    조정대상지역 {transfer.houseCount}주택자는 중과세율이 적용됩니다 (+{transfer.houseCount === 2 ? 20 : 30}%p)
                                </span>
                            </div>
                        )}

                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: 16 }}>세금 상세 내역</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>양도차익</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(transferResult.gain)}</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>장기보유특별공제</p>
                                        <p style={{ fontWeight: 600, color: 'var(--color-success)' }}>-{transferResult.deductionRate.toFixed(0)}%</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>과세표준</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(transferResult.taxableGain)}</p>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>양도소득세</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(transferResult.tax)}</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>지방소득세 (10%)</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(transferResult.localTax)}</p>
                                    </div>
                                    <div style={{ padding: '12px 0' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>실수령액</p>
                                        <p style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-success)' }}>
                                            {formatCurrency(transferResult.netProfit)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DSR 계산기 */}
            {activeTab === 'dsr' && (
                <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 20 }}>
                            <Percent size={18} style={{ marginRight: 8 }} />
                            DSR / DTI 계산
                        </h3>

                        <InputField
                            label="연간 소득"
                            value={dsr.annualIncome}
                            onChange={(v) => setDsr(prev => ({ ...prev, annualIncome: v }))}
                            suffix="만원"
                            min={0}
                            step={100}
                        />

                        <div className="divider" />

                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--color-text-primary)' }}>
                            신규 대출
                        </h4>

                        <InputField
                            label="대출 금액"
                            value={dsr.newLoanAmount}
                            onChange={(v) => setDsr(prev => ({ ...prev, newLoanAmount: v }))}
                            suffix="만원"
                            min={0}
                            step={1000}
                        />

                        <InputField
                            label="대출 금리"
                            value={dsr.newLoanRate}
                            onChange={(v) => setDsr(prev => ({ ...prev, newLoanRate: v }))}
                            suffix="%"
                            min={0.1}
                            max={20}
                            step={0.1}
                        />

                        <InputField
                            label="대출 기간"
                            value={dsr.newLoanTerm}
                            onChange={(v) => setDsr(prev => ({ ...prev, newLoanTerm: v }))}
                            suffix="년"
                            min={1}
                            max={50}
                        />

                        <div className="divider" />

                        <InputField
                            label="기존 대출 연간 원리금"
                            value={dsr.existingLoans}
                            onChange={(v) => setDsr(prev => ({ ...prev, existingLoans: v }))}
                            suffix="만원"
                            min={0}
                            info="기존 주담대, 신용대출 등의 연간 상환액 합계"
                        />

                        <InputField
                            label="목표 DSR"
                            value={dsr.targetDSR}
                            onChange={(v) => setDsr(prev => ({ ...prev, targetDSR: v }))}
                            suffix="%"
                            min={10}
                            max={100}
                            info="일반 주담대 40%, 서민 50%, 고가주택 30%"
                        />
                    </div>

                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                            <ResultCard
                                label="현재 DSR"
                                value={`${dsrResult.currentDSR.toFixed(1)}%`}
                                warning={dsrResult.isOverLimit}
                                highlight={!dsrResult.isOverLimit}
                            />
                            <ResultCard label="DTI" value={`${dsrResult.dti.toFixed(1)}%`} />
                            <ResultCard label="월 상환액" value={`${formatNumber(dsrResult.newMonthlyPayment)}만원`} />
                            <ResultCard
                                label="대출 가능 금액"
                                value={formatCurrency(dsrResult.maxLoanAmount)}
                                highlight
                            />
                        </div>

                        {dsrResult.isOverLimit && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: 16,
                                background: 'var(--color-danger-light)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 20,
                                color: 'var(--color-danger)',
                            }}>
                                <AlertTriangle size={18} />
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    DSR {dsr.targetDSR}% 한도를 초과합니다. 대출 금액 또는 기간 조정이 필요합니다.
                                </span>
                            </div>
                        )}

                        <div className="card">
                            <h3 className="card-title" style={{ marginBottom: 16 }}>분석 결과</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>연간 소득</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(dsr.annualIncome)}</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>신규 대출 연간 원리금</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(dsrResult.newAnnualPayment)}</p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>총 연간 원리금</p>
                                        <p style={{ fontWeight: 600 }}>{formatCurrency(dsrResult.totalAnnualPayment)}</p>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                                            DSR (총부채원리금상환비율)
                                        </p>
                                        <p style={{ fontWeight: 600, color: dsrResult.isOverLimit ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {dsrResult.currentDSR.toFixed(1)}%
                                        </p>
                                    </div>
                                    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                                            DTI (총부채상환비율)
                                        </p>
                                        <p style={{ fontWeight: 600 }}>{dsrResult.dti.toFixed(1)}%</p>
                                    </div>
                                    <div style={{ padding: '12px 0' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                                            남은 상환 여력 (연간)
                                        </p>
                                        <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                            {formatCurrency(dsrResult.remainingCapacity)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: 20,
                            padding: 16,
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>📋 DSR 규제 안내</h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                <p>• <strong>일반 주담대</strong>: 총 대출 1억 초과 시 DSR 40% 적용</p>
                                <p>• <strong>서민/실수요자</strong>: DSR 50%까지 가능</p>
                                <p>• <strong>고가주택 (9억 초과)</strong>: DSR 30% 적용</p>
                                <p>• <strong>신용대출</strong>: 만기 5년, 원금 분할상환 방식 적용</p>
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

export default TaxCalculator;
