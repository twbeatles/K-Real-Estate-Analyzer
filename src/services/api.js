/**
 * API 서비스 모듈
 * 한국 공공데이터 API 연동
 * 정적 배포 (GitHub Pages 등) 환경 지원
 */

import { isStaticDeployment, getDemoData } from '../data/staticData';
import logger from '../utils/logger';

// API 기본 URL (프록시 경유)
const API_BASE = '/api';
const API_TIMEOUT = 15000; // 15초 타임아웃

// ===== 커스텀 에러 클래스들 =====

/**
 * API 타임아웃 에러
 */
export class TimeoutError extends Error {
    constructor(message = 'API 요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.') {
        super(message);
        this.name = 'TimeoutError';
    }
}

/**
 * 네트워크 에러 (연결 실패)
 */
export class NetworkError extends Error {
    constructor(message = '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.') {
        super(message);
        this.name = 'NetworkError';
    }
}

/**
 * API 응답 에러 (서버 오류)
 */
export class APIError extends Error {
    constructor(status, message) {
        super(message || `서버 오류가 발생했습니다. (상태 코드: ${status})`);
        this.name = 'APIError';
        this.status = status;
    }

    /**
     * 상태 코드에 따른 사용자 친화적 메시지 생성
     */
    static fromStatus(status, serviceName = 'API') {
        let message;
        if (status === 400) {
            message = `${serviceName} 요청이 잘못되었습니다. 입력값을 확인해주세요.`;
        } else if (status === 401 || status === 403) {
            message = `${serviceName} 인증에 실패했습니다. API 키를 확인해주세요.`;
        } else if (status === 404) {
            message = `${serviceName} 리소스를 찾을 수 없습니다.`;
        } else if (status === 429) {
            message = `${serviceName} 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.`;
        } else if (status >= 500) {
            message = `${serviceName} 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.`;
        } else {
            message = `${serviceName} 오류가 발생했습니다. (상태 코드: ${status})`;
        }
        return new APIError(status, message);
    }
}

/**
 * 현재 날짜 기반 동적 날짜 계산
 */
const getDateRanges = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    return {
        startDate: '200001',
        endDate: `${currentYear}${currentMonth}`,
    };
};

/**
 * 타임아웃이 있는 fetch 래퍼 (에러 타입 구분)
 */
const fetchWithTimeout = async (url, options, timeout = API_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } catch (error) {
        // 에러 타입에 따라 적절한 커스텀 에러로 변환
        if (error.name === 'AbortError') {
            throw new TimeoutError();
        }
        // TypeError는 일반적으로 네트워크 연결 실패를 나타냄
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            throw new NetworkError();
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * KOSIS (국가통계포털) API
 * https://kosis.kr/openapi/
 */
export const fetchKOSISData = async (apiKey, dataType) => {
    // 정적 배포 환경에서는 데모 데이터 반환
    if (isStaticDeployment()) {
        logger.info('[정적 배포] KOSIS API 대신 데모 데이터 사용');
        const demoData = getDemoData();
        return dataType === 'hpi' ? demoData.hpi : demoData.macro;
    }

    const endpoints = {
        hpi: 'DT_1YL20841', // 주택매매가격지수
        cpi: 'DT_1J20503', // 소비자물가지수
        population: 'DT_1B04005N', // 인구
    };

    const orgId = 'KOSIS';
    const tblId = endpoints[dataType] || endpoints.hpi;

    const dateRange = getDateRanges();
    try {
        const response = await fetchWithTimeout(`${API_BASE}/kosis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                orgId,
                tblId,
                startPrdDe: dateRange.startDate,
                endPrdDe: dateRange.endDate,
                format: 'json',
            }),
        });

        if (!response.ok) {
            throw new Error(`KOSIS API 오류: ${response.status}`);
        }

        const data = await response.json();
        return transformKOSISData(data, dataType);
    } catch (error) {
        if (error.name === 'AbortError') {
            logger.error('KOSIS API 타임아웃');
        } else {
            logger.error('KOSIS API Error:', error);
        }
        // 폴백: 데모 데이터 반환
        const demoData = getDemoData();
        return dataType === 'hpi' ? demoData.hpi : demoData.macro;
    }
};

/**
 * 한국은행 ECOS API
 * https://ecos.bok.or.kr/api/
 */
export const fetchBOKData = async (apiKey, dataType) => {
    // 정적 배포 환경에서는 데모 데이터 반환
    if (isStaticDeployment()) {
        logger.info('[정적 배포] 한국은행 API 대신 데모 데이터 사용');
        return getDemoData().macro;
    }

    const statCodes = {
        interest: '722Y001', // 기준금리
        gdp: '200Y001',      // GDP
        m2: '101Y003',       // M2 통화량
        exchange: '731Y001', // 환율
    };

    const statCode = statCodes[dataType] || statCodes.interest;

    const dateRange = getDateRanges();
    try {
        const response = await fetchWithTimeout(`${API_BASE}/bok`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                statCode,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                cycle: 'M', // Monthly
            }),
        });

        if (!response.ok) {
            throw new Error(`한국은행 API 오류: ${response.status}`);
        }

        const data = await response.json();
        return transformBOKData(data, dataType);
    } catch (error) {
        if (error.name === 'AbortError') {
            logger.error('BOK API 타임아웃');
        } else {
            logger.error('BOK ECOS API Error:', error);
        }
        // 폴백: 데모 데이터 반환
        return getDemoData().macro;
    }
};

/**
 * 한국부동산원 API
 * https://www.reb.or.kr/
 */
export const fetchREBData = async (apiKey, dataType) => {
    // 정적 배포 환경에서는 데모 데이터 반환
    if (isStaticDeployment()) {
        logger.info('[정적 배포] 한국부동산원 API 대신 데모 데이터 사용');
        return getDemoData().regional;
    }

    const endpoints = {
        regional: 'getRealtradeRegion', // 지역별 거래현황
        price: 'getHousePriceIndex',    // 주택가격지수
        jeonse: 'getJeonsePriceIndex',  // 전세가격지수
    };

    try {
        const response = await fetchWithTimeout(`${API_BASE}/reb`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                endpoint: endpoints[dataType] || endpoints.regional,
            }),
        });

        if (!response.ok) {
            throw new Error(`한국부동산원 API 오류: ${response.status}`);
        }

        const data = await response.json();
        return transformREBData(data, dataType);
    } catch (error) {
        if (error.name === 'AbortError') {
            logger.error('REB API 타임아웃');
        } else {
            logger.error('REB API Error:', error);
        }
        // 폴백: 데모 데이터 반환
        return getDemoData().regional;
    }
};

/**
 * 국토교통부 실거래가 API
 * https://www.data.go.kr/
 */
export const fetchMOLITData = async (apiKey, params) => {
    // 정적 배포 환경에서는 샘플 거래 데이터 반환
    if (isStaticDeployment()) {
        logger.info('[정적 배포] 국토교통부 API 대신 샘플 데이터 사용');
        return generateSampleTransactions();
    }

    const { regionCode, dealYmd } = params;

    try {
        const response = await fetchWithTimeout(`${API_BASE}/molit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                LAWD_CD: regionCode,
                DEAL_YMD: dealYmd,
            }),
        });

        if (!response.ok) {
            throw new Error(`국토교통부 API 오류: ${response.status}`);
        }

        const data = await response.json();
        return transformMOLITData(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            logger.error('MOLIT API 타임아웃');
        } else {
            logger.error('MOLIT API Error:', error);
        }
        // 폴백: 샘플 데이터 반환
        return generateSampleTransactions();
    }
};

/**
 * API 연결 테스트
 */
export const testConnection = async (service, apiKey) => {
    // 정적 배포 환경에서는 항상 성공 반환 (데모 모드)
    if (isStaticDeployment()) {
        return {
            success: true,
            message: '정적 배포 환경 - 데모 모드로 작동 중',
        };
    }

    try {
        const response = await fetch(`${API_BASE}/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service, apiKey }),
        });

        const result = await response.json();
        return {
            success: response.ok,
            message: result.message || (response.ok ? '연결 성공' : '연결 실패'),
        };
    } catch (error) {
        return {
            success: false,
            message: `연결 테스트 실패: ${error.message}`,
        };
    }
};

// ===== 데이터 변환 함수들 =====

function transformKOSISData(rawData, dataType) {
    if (!rawData || !Array.isArray(rawData)) return null;

    // KOSIS 응답 데이터를 앱 형식으로 변환
    const data = [];

    rawData.forEach(item => {
        const year = parseInt(item.PRD_DE?.substring(0, 4) || '0');
        const month = parseInt(item.PRD_DE?.substring(4, 6) || '0');
        const value = parseFloat(item.DT) || 0;

        data.push({
            date: `${year}.${String(month).padStart(2, '0')}`,
            year,
            month,
            value,
        });
    });

    return data;
}

function transformBOKData(rawData, dataType) {
    if (!rawData?.StatisticSearch?.row) return null;

    const rows = rawData.StatisticSearch.row;
    const data = [];

    rows.forEach(item => {
        data.push({
            date: item.TIME || '',
            year: parseInt(item.TIME?.substring(0, 4) || '0'),
            value: parseFloat(item.DATA_VALUE) || 0,
        });
    });

    return data;
}

function transformREBData(rawData, dataType) {
    if (!rawData || !rawData.items) return null;

    return rawData.items.map(item => ({
        id: item.regionCode,
        name: item.regionName,
        currentIndex: parseFloat(item.priceIndex) || 100,
        changeRate: parseFloat(item.changeRate) || 0,
        transactionVolume: parseInt(item.transactionCount) || 0,
        avgPrice: parseInt(item.avgPrice) || 0,
    }));
}

function transformMOLITData(rawData) {
    if (!rawData?.response?.body?.items?.item) return [];

    const items = rawData.response.body.items.item;

    return (Array.isArray(items) ? items : [items]).map(item => ({
        apartmentName: item['아파트'] || '',
        dong: item['법정동'] || '',
        area: parseFloat(item['전용면적']) || 0,
        floor: parseInt(item['층']) || 0,
        price: parseInt(item['거래금액']?.replace(/,/g, '')) || 0,
        dealYear: item['년'] || '',
        dealMonth: item['월'] || '',
        dealDay: item['일'] || '',
        buildYear: item['건축년도'] || '',
    }));
}

/**
 * 샘플 실거래 데이터 생성 (정적 배포용)
 */
function generateSampleTransactions() {
    const apartments = [
        { name: '래미안 퍼스티지', dong: '반포동', basePrice: 350000 },
        { name: '아크로리버파크', dong: '반포동', basePrice: 450000 },
        { name: '반포자이', dong: '반포동', basePrice: 320000 },
        { name: '잠실엘스', dong: '잠실동', basePrice: 280000 },
        { name: '잠실리센츠', dong: '잠실동', basePrice: 260000 },
        { name: '헬리오시티', dong: '송파동', basePrice: 220000 },
        { name: '래미안 레이크팰리스', dong: '잠실동', basePrice: 240000 },
        { name: '도곡렉슬', dong: '도곡동', basePrice: 290000 },
        { name: '타워팰리스', dong: '도곡동', basePrice: 380000 },
        { name: '래미안 대치 팰리스', dong: '대치동', basePrice: 310000 },
    ];

    const areas = [59.95, 84.97, 114.82, 135.55, 164.81];

    return apartments.flatMap((apt, aptIdx) => {
        const count = 2 + Math.floor(Math.random() * 3);
        const transactions = [];

        for (let i = 0; i < count; i++) {
            const area = areas[Math.floor(Math.random() * areas.length)];
            const priceVariation = 0.9 + Math.random() * 0.2;
            const areaMultiplier = area / 84.97;

            transactions.push({
                apartmentName: apt.name,
                dong: apt.dong,
                area: area,
                floor: 5 + Math.floor(Math.random() * 30),
                price: Math.round(apt.basePrice * priceVariation * areaMultiplier),
                dealYear: '2025',
                dealMonth: '01',
                dealDay: String(1 + Math.floor(Math.random() * 7)).padStart(2, '0'),
                buildYear: String(2005 + Math.floor(Math.random() * 15)),
            });
        }

        return transactions;
    });
}
