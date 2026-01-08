/**
 * 부동산 통계 시뮬레이션 데이터 생성기
 * 2000년 1월 ~ 2026년 1월까지의 역사적 추세 반영
 * 최종 업데이트: 2026년 1월
 * 
 * 성능 최적화: 데이터 캐싱 적용
 */

// 데이터 캐시 저장소
const dataCache = new Map();

// 캐시된 데이터 반환 또는 생성
const getCachedData = (key, generator) => {
    if (dataCache.has(key)) {
        return dataCache.get(key);
    }
    const data = generator();
    dataCache.set(key, data);
    return data;
};

// 캐시 무효화 (필요시 호출)
export const clearDataCache = () => {
    dataCache.clear();
};

// 월별 주택가격지수, 물가지수 데이터 생성 (캐싱 적용)
export const generateHistoricalData = () => getCachedData('historical', () => {
    const data = [];
    let cpi = 100;
    let hpiNation = 100;
    let hpiSeoul = 100;
    let hpiGyeonggi = 100;
    let hpiLocal = 100;
    let jeonseNation = 100;
    let jeonseSeoul = 100;

    for (let year = 2000; year <= 2026; year++) {
        for (let month = 1; month <= 12; month++) {
            // 2026년은 1월까지만
            if (year === 2026 && month > 1) break;

            const date = `${year}.${String(month).padStart(2, '0')}`;
            const yearMonth = year * 100 + month;

            // CPI (물가) 로직 - 2025~2026 업데이트
            let cpiRate = 0.002;
            if (year >= 2021 && year <= 2023) cpiRate = 0.0045;
            if (year === 2022 && month >= 6) cpiRate = 0.006;
            if (year === 2024) cpiRate = 0.0028; // 물가 안정화
            if (year === 2025) cpiRate = 0.0018; // 2.1% 연간 상승
            if (year === 2026) cpiRate = 0.0017; // 2.0% 목표
            cpi = cpi * (1 + cpiRate + (Math.random() * 0.001 - 0.0005));

            // HPI 로직 (역사적 흐름 반영)
            let seoulMomentum = 0;
            let nationMomentum = 0;
            let gyeonggiMomentum = 0;
            let localMomentum = 0;

            if (year <= 2002) {
                seoulMomentum = 0.008; nationMomentum = 0.005; gyeonggiMomentum = 0.007; localMomentum = 0.003;
            } else if (year <= 2007) {
                seoulMomentum = 0.006; nationMomentum = 0.003; gyeonggiMomentum = 0.005; localMomentum = 0.002;
            } else if (year <= 2013) {
                seoulMomentum = -0.002; nationMomentum = 0.002; gyeonggiMomentum = 0.001; localMomentum = 0.003;
            } else if (year <= 2016) {
                seoulMomentum = 0.004; nationMomentum = 0.003; gyeonggiMomentum = 0.004; localMomentum = 0.002;
            } else if (year <= 2019) {
                seoulMomentum = 0.008; nationMomentum = 0.002; gyeonggiMomentum = 0.006; localMomentum = 0.001;
            } else if (year <= 2021) {
                seoulMomentum = 0.015; nationMomentum = 0.012; gyeonggiMomentum = 0.014; localMomentum = 0.010;
            } else if (year === 2022) {
                seoulMomentum = -0.010; nationMomentum = -0.008; gyeonggiMomentum = -0.009; localMomentum = -0.006;
            } else if (year === 2023) {
                if (month <= 6) {
                    seoulMomentum = -0.003; nationMomentum = -0.002; gyeonggiMomentum = -0.003; localMomentum = -0.001;
                } else {
                    seoulMomentum = 0.001; nationMomentum = 0.0005; gyeonggiMomentum = 0.001; localMomentum = 0.0003;
                }
            } else if (year === 2024) {
                seoulMomentum = 0.003; nationMomentum = 0.002; gyeonggiMomentum = 0.0025; localMomentum = 0.001;
            } else if (year === 2025) {
                // 2025년 8.7% 연간 상승 (47주 연속 상승)
                seoulMomentum = 0.007; nationMomentum = 0.003; gyeonggiMomentum = 0.0045; localMomentum = 0.001;
            } else if (year === 2026) {
                // 2026년 상승세 지속 전망 (5% 예상)
                seoulMomentum = 0.004; nationMomentum = 0.002; gyeonggiMomentum = 0.003; localMomentum = 0.0005;
            }

            hpiSeoul = hpiSeoul * (1 + seoulMomentum + (Math.random() * 0.002 - 0.001));
            hpiNation = hpiNation * (1 + nationMomentum + (Math.random() * 0.002 - 0.001));
            hpiGyeonggi = hpiGyeonggi * (1 + gyeonggiMomentum + (Math.random() * 0.002 - 0.001));
            hpiLocal = hpiLocal * (1 + localMomentum + (Math.random() * 0.002 - 0.001));

            // 전세가격지수
            let jeonseSeoulRate = seoulMomentum * 0.8;
            let jeonseNationRate = nationMomentum * 0.85;
            // 2025~2026년 전세 상승세 반영 (월세화 현상)
            if (year === 2025 || year === 2026) {
                jeonseSeoulRate = seoulMomentum * 1.2;
                jeonseNationRate = nationMomentum * 1.1;
            }
            jeonseSeoul = jeonseSeoul * (1 + jeonseSeoulRate + (Math.random() * 0.001 - 0.0005));
            jeonseNation = jeonseNation * (1 + jeonseNationRate + (Math.random() * 0.001 - 0.0005));

            data.push({
                date,
                yearMonth,
                year,
                month,
                cpi: parseFloat(cpi.toFixed(1)),
                hpiNation: parseFloat(hpiNation.toFixed(1)),
                hpiSeoul: parseFloat(hpiSeoul.toFixed(1)),
                hpiGyeonggi: parseFloat(hpiGyeonggi.toFixed(1)),
                hpiLocal: parseFloat(hpiLocal.toFixed(1)),
                jeonseNation: parseFloat(jeonseNation.toFixed(1)),
                jeonseSeoul: parseFloat(jeonseSeoul.toFixed(1)),
            });
        }
    }
    return data;
});

// 기준금리 데이터 생성 (2026년 1월 기준, 캐싱 적용)
export const generateInterestRateData = () => getCachedData('interestRate', () => {
    const data = [];
    const baseRates = {
        2000: 5.25, 2001: 4.00, 2002: 4.25, 2003: 3.75, 2004: 3.25,
        2005: 3.25, 2006: 4.50, 2007: 5.00, 2008: 3.00, 2009: 2.00,
        2010: 2.50, 2011: 3.25, 2012: 2.75, 2013: 2.50, 2014: 2.00,
        2015: 1.50, 2016: 1.25, 2017: 1.50, 2018: 1.75, 2019: 1.25,
        2020: 0.50, 2021: 1.00, 2022: 3.25, 2023: 3.50, 2024: 3.00,
        2025: 2.50, // 2025년 5월 이후 2.50% 유지
        2026: 2.50  // 2026년 1월 현재 2.50%
    };

    for (let year = 2000; year <= 2026; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
            // 2026년은 Q1까지만
            if (year === 2026 && quarter > 1) break;

            let rate = baseRates[year];
            // 2024년 점진적 인하 반영
            if (year === 2024) {
                if (quarter === 1) rate = 3.50;
                else if (quarter === 2) rate = 3.50;
                else if (quarter === 3) rate = 3.25;
                else rate = 3.00; // Q4 인하
            }
            // 2025년 추가 인하 (5월 이후 2.5% 동결)
            if (year === 2025) {
                if (quarter === 1) rate = 3.00;
                else rate = 2.50; // Q2~Q4: 2.50%
            }
            data.push({
                date: `${year} Q${quarter}`,
                year,
                quarter,
                rate: parseFloat(rate.toFixed(2)),
            });
        }
    }
    return data;
});

// GDP 성장률 데이터 생성 (캐싱 적용)
export const generateGDPData = () => getCachedData('gdp', () => {
    const data = [];
    const gdpRates = {
        2000: 8.9, 2001: 4.5, 2002: 7.4, 2003: 2.9, 2004: 5.2,
        2005: 4.3, 2006: 5.3, 2007: 5.8, 2008: 2.9, 2009: 0.8,
        2010: 6.8, 2011: 3.7, 2012: 2.4, 2013: 3.2, 2014: 3.2,
        2015: 2.8, 2016: 2.9, 2017: 3.2, 2018: 2.9, 2019: 2.2,
        2020: -0.7, 2021: 4.3, 2022: 2.6, 2023: 1.4, 2024: 1.0,
        2025: 0.9, // IMF/한은 2025년 전망
        2026: 1.8  // 2026년 성장률 전망 (IMF/KDI)
    };

    for (let year = 2000; year <= 2026; year++) {
        data.push({
            year,
            rate: gdpRates[year],
        });
    }
    return data;
});

// M2 통화량 데이터 생성 (캐싱 적용)
export const generateM2Data = () => getCachedData('m2', () => {
    const data = [];
    let m2 = 600; // 2000년 기준 (조원)

    for (let year = 2000; year <= 2026; year++) {
        let growthRate = 0.08; // 기본 8% 성장
        if (year >= 2020 && year <= 2021) growthRate = 0.12; // 유동성 폭발
        if (year === 2022) growthRate = 0.05;
        if (year === 2023) growthRate = 0.04;
        if (year === 2024) growthRate = 0.045;
        if (year === 2025) growthRate = 0.087; // 2025년 10월 기준 전년비 8.7% 증가
        if (year === 2026) growthRate = 0.06; // 2026년 완만한 반등 전망

        m2 = m2 * (1 + growthRate + (Math.random() * 0.02 - 0.01));
        data.push({
            year,
            amount: parseFloat(m2.toFixed(0)),
            growthRate: parseFloat((growthRate * 100).toFixed(1)),
        });
    }
    return data;
});

// 지역별 주택가격 데이터 (2025년 12월 기준, 캐싱 적용)
export const generateRegionalData = () => getCachedData('regional', () => {
    const regions = [
        { id: 'seoul', name: '서울', baseIndex: 215.3, color: '#ef4444' },
        { id: 'gyeonggi', name: '경기', baseIndex: 182.7, color: '#f97316' },
        { id: 'incheon', name: '인천', baseIndex: 168.4, color: '#eab308' },
        { id: 'busan', name: '부산', baseIndex: 152.1, color: '#22c55e' },
        { id: 'daegu', name: '대구', baseIndex: 138.6, color: '#14b8a6' },
        { id: 'daejeon', name: '대전', baseIndex: 141.2, color: '#0ea5e9' },
        { id: 'gwangju', name: '광주', baseIndex: 128.5, color: '#6366f1' },
        { id: 'ulsan', name: '울산', baseIndex: 131.8, color: '#8b5cf6' },
        { id: 'sejong', name: '세종', baseIndex: 175.6, color: '#ec4899' },
        { id: 'gangwon', name: '강원', baseIndex: 118.3, color: '#64748b' },
        { id: 'chungbuk', name: '충북', baseIndex: 122.4, color: '#78716c' },
        { id: 'chungnam', name: '충남', baseIndex: 125.8, color: '#71717a' },
        { id: 'jeonbuk', name: '전북', baseIndex: 108.2, color: '#a1a1aa' },
        { id: 'jeonnam', name: '전남', baseIndex: 104.6, color: '#a8a29e' },
        { id: 'gyeongbuk', name: '경북', baseIndex: 112.3, color: '#9ca3af' },
        { id: 'gyeongnam', name: '경남', baseIndex: 127.5, color: '#6b7280' },
        { id: 'jeju', name: '제주', baseIndex: 148.9, color: '#f43f5e' },
    ];

    return regions.map(region => {
        // 서울, 경기는 상승세, 지방은 보합~약세
        let changeBias = 0;
        if (['seoul', 'gyeonggi', 'incheon'].includes(region.id)) {
            changeBias = 1.5; // 수도권 상승
        } else if (['sejong', 'daejeon'].includes(region.id)) {
            changeBias = 0.5;
        } else {
            changeBias = -0.5; // 지방 약세
        }

        const changeRate = (Math.random() * 3 + changeBias - 1).toFixed(2);
        const transactionVolume = Math.floor(Math.random() * 30000 + 8000);

        return {
            ...region,
            currentIndex: region.baseIndex,
            changeRate: parseFloat(changeRate),
            transactionVolume,
            avgPrice: Math.floor(region.baseIndex * 52 + Math.random() * 8000),
        };
    });
});

// 거래량 데이터 (2025년 12월까지, 캐싱 적용)
export const generateTransactionData = () => getCachedData('transaction', () => {
    const data = [];

    for (let year = 2015; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            let baseVolume = 75000;

            // 계절 효과
            if (month >= 3 && month <= 5) baseVolume *= 1.2;
            if (month >= 9 && month <= 11) baseVolume *= 1.15;
            if (month === 1 || month === 2) baseVolume *= 0.7;
            if (month === 12) baseVolume *= 0.85;

            // 연도별 효과
            if (year === 2020 || year === 2021) baseVolume *= 1.4;
            if (year === 2022 || year === 2023) baseVolume *= 0.55;
            if (year === 2024) baseVolume *= 0.7; // 회복세
            if (year === 2025) baseVolume *= 0.8; // 추가 회복

            const volume = Math.floor(baseVolume * (0.85 + Math.random() * 0.3));

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                volume,
            });
        }
    }
    return data;
});

// 경제 캘린더 이벤트 (2026년 1월 기준, 캐싱 적용)
export const generateEconomicEvents = () => getCachedData('economicEvents', () => [
    { date: '2026-01-07', title: '2025년 12월 소비자물가지수 발표', category: 'indicator', importance: 'high' },
    { date: '2026-01-15', title: '금융통화위원회 (기준금리 결정)', category: 'policy', importance: 'critical' },
    { date: '2026-01-16', title: '2025년 4분기 GDP 속보치 발표', category: 'indicator', importance: 'critical' },
    { date: '2026-01-20', title: '고용동향 발표', category: 'indicator', importance: 'high' },
    { date: '2026-01-27', title: '12월 산업활동동향', category: 'indicator', importance: 'medium' },
    { date: '2026-01-30', title: '주택가격동향조사 발표', category: 'real-estate', importance: 'high' },
    { date: '2026-02-04', title: '1월 소비자물가지수 발표', category: 'indicator', importance: 'high' },
    { date: '2026-02-27', title: '금융통화위원회', category: 'policy', importance: 'critical' },
    { date: '2026-03-06', title: '2월 무역수지 발표', category: 'indicator', importance: 'medium' },
]);

// 실거래가 데이터 (2025년 12월 기준, 캐싱 적용)
export const generatePropertyData = () => getCachedData('property', () => {
    const apartments = [
        { name: '래미안 퍼스티지', dong: '반포동', gu: '서초구', price: 480000, area: 84.92, floor: 15, buildYear: 2009 },
        { name: '아크로리버파크', dong: '반포동', gu: '서초구', price: 620000, area: 112.45, floor: 22, buildYear: 2016 },
        { name: '래미안 리더스원', dong: '대치동', gu: '강남구', price: 385000, area: 84.82, floor: 18, buildYear: 2021 },
        { name: '디에이치 아너힐즈', dong: '개포동', gu: '강남구', price: 415000, area: 84.97, floor: 25, buildYear: 2021 },
        { name: '헬리오시티', dong: '송파동', gu: '송파구', price: 258000, area: 84.82, floor: 12, buildYear: 2018 },
        { name: '잠실엘스', dong: '잠실동', gu: '송파구', price: 295000, area: 84.98, floor: 20, buildYear: 2008 },
        { name: '래미안 원베일리', dong: '신반포동', gu: '서초구', price: 520000, area: 84.95, floor: 28, buildYear: 2022 },
        { name: '마포래미안푸르지오', dong: '아현동', gu: '마포구', price: 232000, area: 84.59, floor: 10, buildYear: 2014 },
        { name: '래미안 목동 센트럴', dong: '목동', gu: '양천구', price: 178000, area: 84.95, floor: 8, buildYear: 2023 },
        { name: '힐스테이트 광교', dong: '하동', gu: '수원시', price: 142000, area: 84.88, floor: 15, buildYear: 2020 },
    ];

    return apartments.map((apt, idx) => ({
        id: idx + 1,
        ...apt,
        priceChange: (Math.random() * 10 - 2).toFixed(1),
        dealDate: '2025.12',
        prevPrice: Math.floor(apt.price * (0.95 + Math.random() * 0.05)),
        pricePerPyeong: Math.floor(apt.price / (apt.area / 3.3) * 10), // 평당가 (만원)
    }));
});

// 최신 시장 지표 (2026년 1월 기준, 캐싱 적용)
export const getLatestMarketIndicators = () => getCachedData('latestIndicators', () => {
    const historical = generateHistoricalData();
    const latest = historical[historical.length - 1];
    const prevMonth = historical[historical.length - 2];
    const prevYear = historical[historical.length - 13];
    const rates = generateInterestRateData();

    return {
        hpiSeoul: latest.hpiSeoul,
        hpiNation: latest.hpiNation,
        hpiGyeonggi: latest.hpiGyeonggi,
        jeonseSeoul: latest.jeonseSeoul,
        jeonseNation: latest.jeonseNation,
        cpi: latest.cpi,
        interestRate: rates[rates.length - 1].rate,
        monthOverMonth: {
            seoul: ((latest.hpiSeoul - prevMonth.hpiSeoul) / prevMonth.hpiSeoul * 100).toFixed(2),
            nation: ((latest.hpiNation - prevMonth.hpiNation) / prevMonth.hpiNation * 100).toFixed(2),
        },
        yearOverYear: {
            seoul: ((latest.hpiSeoul - prevYear.hpiSeoul) / prevYear.hpiSeoul * 100).toFixed(2),
            nation: ((latest.hpiNation - prevYear.hpiNation) / prevYear.hpiNation * 100).toFixed(2),
        },
        lastUpdated: '2026-01-08',
    };
});
