/**
 * 대출 상품 비교 데이터
 * 주담대, 전세대출, 신용대출 등 금융 상품 비교
 */

// 주담대 상품 리스트
export const generateMortgageProducts = () => {
    const products = [
        { bank: 'KB국민은행', name: 'KB주택담보대출', type: 'fixed', rate: 4.35, maxLTV: 70, maxDTI: 50, features: ['금리 우대', '중도상환수수료 면제'] },
        { bank: 'KB국민은행', name: 'KB변동금리대출', type: 'variable', rate: 3.95, maxLTV: 70, maxDTI: 50, features: ['금리 변동 가능성'] },
        { bank: '신한은행', name: '신한주담대', type: 'fixed', rate: 4.40, maxLTV: 70, maxDTI: 50, features: ['온라인 신청 가능'] },
        { bank: '우리은행', name: '우리WON주담대', type: 'fixed', rate: 4.30, maxLTV: 70, maxDTI: 50, features: ['앱 전용 우대금리'] },
        { bank: '하나은행', name: '하나주택담보대출', type: 'variable', rate: 3.90, maxLTV: 70, maxDTI: 50, features: ['자동이체 할인'] },
        { bank: 'NH농협은행', name: 'NH주담대', type: 'fixed', rate: 4.25, maxLTV: 70, maxDTI: 50, features: ['농협카드 우대'] },
        { bank: '카카오뱅크', name: '카카오뱅크주담대', type: 'variable', rate: 3.75, maxLTV: 80, maxDTI: 40, features: ['비대면 100%', '빠른 심사'] },
        { bank: '토스뱅크', name: '토스주담대', type: 'variable', rate: 3.70, maxLTV: 80, maxDTI: 40, features: ['비대면', '금리 할인'] },
    ];

    return products.map(p => ({
        ...p,
        rate: parseFloat((p.rate + (Math.random() - 0.5) * 0.2).toFixed(2)),
        monthlyPayment: Math.round((100000000 * (p.rate / 100 / 12)) / (1 - Math.pow(1 + (p.rate / 100 / 12), -360))),
    }));
};

// 전세대출 상품 리스트
export const generateJeonseLoanProducts = () => {
    const products = [
        { bank: 'HUG', name: '버팀목전세자금대출', rate: 2.10, maxAmount: 30000, eligibility: '무주택 세대주' },
        { bank: '주택도시기금', name: '신혼부부전세자금', rate: 1.80, maxAmount: 40000, eligibility: '신혼부부' },
        { bank: '주택도시기금', name: '청년전세자금', rate: 1.50, maxAmount: 20000, eligibility: '만 34세 이하' },
        { bank: 'KB국민은행', name: 'KB전세대출', rate: 3.80, maxAmount: 50000, eligibility: '일반' },
        { bank: '신한은행', name: '신한전세론', rate: 3.75, maxAmount: 50000, eligibility: '일반' },
        { bank: '카카오뱅크', name: '카카오전세대출', rate: 3.50, maxAmount: 40000, eligibility: '일반' },
    ];

    return products.map(p => ({
        ...p,
        rate: parseFloat((p.rate + (Math.random() - 0.5) * 0.1).toFixed(2)),
    }));
};

// DSR 계산 시뮬레이션
export const calculateDSR = (annualIncome, existingDebt, newLoanAmount, loanRate, loanTerm) => {
    const monthlyPayment = (newLoanAmount * (loanRate / 100 / 12)) / (1 - Math.pow(1 + (loanRate / 100 / 12), -loanTerm * 12));
    const existingMonthlyDebt = existingDebt * 0.05 / 12; // 기존 부채 월 상환액 추정
    const totalAnnualDebt = (monthlyPayment + existingMonthlyDebt) * 12;
    const dsr = (totalAnnualDebt / annualIncome) * 100;

    return {
        monthlyPayment: Math.round(monthlyPayment),
        totalAnnualDebt: Math.round(totalAnnualDebt),
        dsr: parseFloat(dsr.toFixed(1)),
        isApproved: dsr <= 40,
    };
};

// LTV 계산
export const calculateLTV = (loanAmount, propertyValue) => {
    return parseFloat(((loanAmount / propertyValue) * 100).toFixed(1));
};

// 대출 상환 스케줄 생성
export const generateAmortizationSchedule = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    const monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

    const schedule = [];
    let balance = principal;

    for (let month = 1; month <= Math.min(totalMonths, 120); month++) { // 최대 10년치만
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        if (month <= 12 || month % 12 === 0) { // 1년차 혹은 연말만
            schedule.push({
                month,
                year: Math.ceil(month / 12),
                payment: Math.round(monthlyPayment),
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                balance: Math.max(0, Math.round(balance)),
            });
        }
    }

    return {
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(monthlyPayment * totalMonths),
        totalInterest: Math.round(monthlyPayment * totalMonths - principal),
        schedule,
    };
};

// 대출 한도 계산
export const calculateLoanLimit = (propertyValue, annualIncome, existingDebt) => {
    const ltvLimit = propertyValue * 0.7; // 70% LTV
    const dsrLimit = (annualIncome * 0.4 - existingDebt * 0.05) * 25; // DSR 40% 기준 25년 상환

    return {
        ltvLimit: Math.round(ltvLimit),
        dsrLimit: Math.max(0, Math.round(dsrLimit)),
        maxLoan: Math.min(ltvLimit, Math.max(0, dsrLimit)),
    };
};

// 대출 비용 계산 (취급수수료, 인지세 등)
export const calculateLoanCosts = (loanAmount) => {
    const stampDuty = loanAmount <= 50000000 ? 0 : loanAmount <= 100000000 ? 70000 : loanAmount <= 1000000000 ? 150000 : 350000;
    const mortgageFee = Math.round(loanAmount * 0.002); // 근저당 설정비 0.2%
    const appraisalFee = 300000; // 감정평가비
    const handlingFee = Math.round(loanAmount * 0.001); // 취급수수료 0.1%

    return {
        stampDuty,
        mortgageFee,
        appraisalFee,
        handlingFee,
        total: stampDuty + mortgageFee + appraisalFee + handlingFee,
    };
};

// 대출 상품 요약
export const getLoanSummary = () => {
    return {
        avgFixedRate: 4.32, // %
        avgVariableRate: 3.82, // %
        avgJeonseRate: 2.85, // %
        maxLTV: 70, // %
        maxDSR: 40, // %
        avgProcessingDays: 7, // 평균 심사일
        lastUpdated: '2025-12-01',
    };
};

export default {
    generateMortgageProducts,
    generateJeonseLoanProducts,
    calculateDSR,
    calculateLTV,
    generateAmortizationSchedule,
    calculateLoanLimit,
    calculateLoanCosts,
    getLoanSummary,
};
