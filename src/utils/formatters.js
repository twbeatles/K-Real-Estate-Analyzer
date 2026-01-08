/**
 * 포맷팅 유틸리티 (성능 최적화 버전)
 * - Intl.NumberFormat 인스턴스 캐싱
 * - Map 기반 변환 테이블
 */

// NumberFormat 인스턴스 캐싱 (매번 새로 생성하지 않음)
const numberFormatters = new Map();

const getNumberFormatter = (decimals) => {
    const key = `number-${decimals}`;
    if (!numberFormatters.has(key)) {
        numberFormatters.set(key, new Intl.NumberFormat('ko-KR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }));
    }
    return numberFormatters.get(key);
};

// DateTimeFormat 인스턴스 캐싱
const dateFormatters = {
    short: new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }),
    long: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
    full: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
};

// 숫자 포맷 (천 단위 콤마)
export const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return '-';
    return getNumberFormatter(decimals).format(num);
};

// 퍼센트 포맷
export const formatPercent = (num, decimals = 1, showSign = true) => {
    if (num === null || num === undefined) return '-';
    const sign = showSign && num > 0 ? '+' : '';
    return `${sign}${num.toFixed(decimals)}%`;
};

// 금액 포맷 (억/만 단위)
export const formatCurrency = (amount, unit = '만원') => {
    if (amount === null || amount === undefined) return '-';

    if (amount >= 10000) {
        const eok = Math.floor(amount / 10000);
        const remainder = amount % 10000;
        if (remainder > 0) {
            return `${formatNumber(eok)}억 ${formatNumber(remainder)}${unit}`;
        }
        return `${formatNumber(eok)}억`;
    }
    return `${formatNumber(amount)}${unit}`;
};

// 간단 금액 포맷
export const formatCompactCurrency = (amount) => {
    if (amount >= 100000000) {
        return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000) {
        return `${(amount / 10000).toFixed(0)}만`;
    }
    return formatNumber(amount);
};

// 날짜 포맷 (캐싱된 포매터 사용)
export const formatDate = (dateStr, format = 'short') => {
    if (!dateStr) return '-';

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;

        const formatter = dateFormatters[format];
        return formatter ? formatter.format(date) : dateStr;
    } catch {
        return dateStr;
    }
};

// 변화율에 따른 트렌드 클래스 (Map 기반)
const trendClassMap = {
    up: 'trend-up',
    down: 'trend-down',
    neutral: 'trend-neutral',
};

export const getTrendClass = (value) => {
    if (value > 0) return trendClassMap.up;
    if (value < 0) return trendClassMap.down;
    return trendClassMap.neutral;
};

// 변화율에 따른 색상
const trendColorMap = {
    up: 'var(--color-success)',
    down: 'var(--color-danger)',
    neutral: 'var(--color-text-tertiary)',
};

export const getTrendColor = (value) => {
    if (value > 0) return trendColorMap.up;
    if (value < 0) return trendColorMap.down;
    return trendColorMap.neutral;
};

// 중요도 맵 (객체 조회로 switch 대체)
const importanceBadgeMap = {
    critical: 'badge-danger',
    high: 'badge-warning',
    medium: 'badge-primary',
    low: 'badge-secondary',
};

export const getImportanceBadgeClass = (importance) => {
    return importanceBadgeMap[importance] || importanceBadgeMap.low;
};

const importanceLabelMap = {
    critical: '매우 중요',
    high: '중요',
    medium: '보통',
    low: '낮음',
};

export const getImportanceLabel = (importance) => {
    return importanceLabelMap[importance] || importanceLabelMap.low;
};

// 카테고리 맵
const categoryLabelMap = {
    indicator: '경제지표',
    policy: '정책',
    'real-estate': '부동산',
};

export const getCategoryLabel = (category) => {
    return categoryLabelMap[category] || category;
};

// 면적 변환 (평 <-> 제곱미터)
export const pyeongToSqm = (pyeong) => pyeong * 3.305785;
export const sqmToPyeong = (sqm) => sqm / 3.305785;

// 금액 단위 변환
export const manwonToWon = (manwon) => manwon * 10000;
export const wonToManwon = (won) => won / 10000;

// 숫자 약어 (K, M, B)
export const abbreviateNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

// 비율 계산
export const calculateChangeRate = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};
