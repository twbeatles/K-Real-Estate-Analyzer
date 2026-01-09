/**
 * 부동산 관련 세율 데이터
 * 2025-2026년 기준
 */

// 취득세율 (지방교육세, 농어촌특별세 포함 여부에 따라 달라질 수 있음 - 여기서는 단순화된 세율 적용)
export const ACQUISITION_TAX_RATES = {
    // 1주택자
    single: {
        low: 0.011, // 6억 이하: 1.1%
        mid: 0.022, // 6억~9억: 2.2% (변동 가능)
        high: 0.033 // 9억 초과: 3.3%
    },
    // 다주택자 (조정대상지역 기준)
    multi_2: 0.084, // 2주택: 8.4%
    multi_3: 0.124, // 3주택 이상: 12.4%
    corporate: 0.124 // 법인: 12.4%
};

// 재산세 과세표준 구간 및 세율
export const PROPERTY_TAX_RATES = [
    { limit: 60000000, rate: 0.001, deduction: 0 },         // 6천만원 이하: 0.1%
    { limit: 150000000, rate: 0.0015, deduction: 30000 },   // 1.5억원 이하: 0.15% - 3만원
    { limit: 300000000, rate: 0.0025, deduction: 180000 },  // 3억원 이하: 0.25% - 18만원
    { limit: Infinity, rate: 0.004, deduction: 630000 }     // 3억원 초과: 0.4% - 63만원
];

// 종합부동산세율 (일반)
export const COMPREHENSIVE_TAX_RATES_GENERAL = [
    { limit: 300000000, rate: 0.005, deduction: 0 },
    { limit: 600000000, rate: 0.007, deduction: 600000 },
    { limit: 1200000000, rate: 0.01, deduction: 2400000 },
    { limit: 2500000000, rate: 0.013, deduction: 6000000 },
    { limit: 5000000000, rate: 0.015, deduction: 11000000 },
    { limit: 9400000000, rate: 0.02, deduction: 36000000 },
    { limit: Infinity, rate: 0.027, deduction: 101800000 }
];

// 양도소득세율 (보유기간별)
export const CAPITAL_GAINS_TAX_RATES_BY_PERIOD = {
    under_1_year: 0.77, // 1년 미만: 77% (지방소득세 포함)
    under_2_years: 0.66, // 2년 미만: 66%
    standard: 'progressive' // 2년 이상: 기본세율 (6~45%)
};

// 양도소득세 기본세율 (과세표준 구간)
export const BASIC_INCOME_TAX_RATES = [
    { limit: 14000000, rate: 0.06, deduction: 0 },
    { limit: 50000000, rate: 0.15, deduction: 1260000 },
    { limit: 88000000, rate: 0.24, deduction: 5760000 },
    { limit: 150000000, rate: 0.35, deduction: 15440000 },
    { limit: 300000000, rate: 0.38, deduction: 19940000 },
    { limit: 500000000, rate: 0.40, deduction: 25940000 },
    { limit: 1000000000, rate: 0.42, deduction: 35940000 },
    { limit: Infinity, rate: 0.45, deduction: 65940000 }
];
