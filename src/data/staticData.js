/**
 * 정적 배포용 데모 데이터
 * GitHub Pages 등 정적 호스팅 환경에서 API 대신 사용
 */

// 환경 감지: 정적 배포 여부 확인
export const isStaticDeployment = () => {
    // Vite 개발 서버가 아니거나, file:// 프로토콜인 경우
    const isDevServer = import.meta.env.DEV;
    const isFileProtocol = window.location.protocol === 'file:';
    const hasNoProxy = !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1');

    return isFileProtocol || (!isDevServer && hasNoProxy);
};

// 샘플 뉴스 데이터 (2026년 1월 기준)
export const DEMO_NEWS = [
    {
        id: 1,
        title: '서울 아파트값 47주 연속 상승, 2025년 연간 8.7% 상승',
        summary: '서울 아파트 매매가격이 2025년 연간 8.71% 상승하며 19년 만에 최고치를 기록했다. 2026년에도 5% 이상 상승이 예상된다.',
        source: '한국경제',
        date: '2026-01-07',
        link: 'https://www.hankyung.com',
        category: 'market',
        sentiment: 'positive',
    },
    {
        id: 2,
        title: '한은 금통위 1월 15일 개최, 기준금리 2.5% 동결 전망',
        summary: '한국은행 금융통화위원회가 2026년 첫 회의를 1월 15일 개최한다. 시장에서는 기준금리가 현 2.50%로 동결될 것으로 전망한다.',
        source: '매일경제',
        date: '2026-01-07',
        link: 'https://www.mk.co.kr',
        category: 'policy',
        sentiment: 'neutral',
    },
    {
        id: 3,
        title: '2026년 서울 아파트 입주물량 2.4만호로 급감, 공급 절벽 우려',
        summary: '2026년 서울 아파트 입주물량이 2.4만호로 2025년 4.7만호 대비 절반 수준으로 급감할 전망이다. 공급 부족이 가격 상승을 부추길 수 있다는 분석이다.',
        source: '조선일보',
        date: '2026-01-06',
        link: 'https://www.chosun.com',
        category: 'supply',
        sentiment: 'negative',
    },
    {
        id: 4,
        title: '서울 월세가격 역대 최고치 기록, 전세의 월세화 심화',
        summary: '2025년 12월 서울 아파트 월세지수가 통계 작성 이래 최고치를 기록했다. 평균 월세가 147만원을 돌파했다.',
        source: '동아일보',
        date: '2026-01-05',
        link: 'https://www.donga.com',
        category: 'market',
        sentiment: 'negative',
    },
    {
        id: 5,
        title: '2026년 경제 성장률 1.8% 전망, 내수 회복이 핵심',
        summary: 'IMF와 KDI는 2026년 한국 경제 성장률을 1.8%로 전망했다. 2025년 0.9% 대비 회복세를 보일 것으로 예상된다.',
        source: '경향신문',
        date: '2026-01-04',
        link: 'https://www.khan.co.kr',
        category: 'economy',
        sentiment: 'positive',
    },
    {
        id: 6,
        title: '2025년 12월 소비자물가 2.3% 상승, 물가 안정세 지속',
        summary: '2025년 12월 소비자물가 상승률이 2.3%를 기록하며 물가 안정세가 지속되고 있다. 2026년에도 2% 내외가 예상된다.',
        source: '서울경제',
        date: '2026-01-03',
        link: 'https://www.sedaily.com',
        category: 'economy',
        sentiment: 'neutral',
    },
    {
        id: 7,
        title: '강남3구 아파트 가격 상승세 두드러져, 양극화 심화',
        summary: '2026년에도 강남3구 등 핵심 지역을 중심으로 높은 상승률이 예상된다. 양극화 현상이 심화될 것이라는 전망이다.',
        source: 'MBC 뉴스',
        date: '2026-01-02',
        link: 'https://www.mbc.co.kr',
        category: 'market',
        sentiment: 'positive',
    },
    {
        id: 8,
        title: 'BNP파리바, 한은 2027년까지 기준금리 2.5% 유지 전망',
        summary: 'BNP파리바는 한국은행이 2027년까지 기준금리를 현 2.50%로 유지할 것으로 전망했다.',
        source: 'SBS 뉴스',
        date: '2026-01-01',
        link: 'https://www.sbs.co.kr',
        category: 'policy',
        sentiment: 'neutral',
    },
];

// 주택가격지수 시계열 데이터 생성
export const generateHPIData = () => {
    const data = [];
    const baseSeoul = 100;
    const baseNation = 100;

    const trends = {
        2020: { seoul: 0.5, nation: 0.3 },
        2021: { seoul: 1.2, nation: 0.8 },
        2022: { seoul: -0.3, nation: -0.2 },
        2023: { seoul: -0.2, nation: -0.1 },
        2024: { seoul: 0.2, nation: 0.1 },
        2025: { seoul: 0.3, nation: 0.2 },
    };

    let seoulHPI = baseSeoul;
    let nationHPI = baseNation;

    for (let year = 2020; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 1) break;

            const trend = trends[year] || { seoul: 0, nation: 0 };
            const noise = (Math.random() - 0.5) * 0.5;

            seoulHPI *= (1 + (trend.seoul + noise) / 100);
            nationHPI *= (1 + (trend.nation + noise * 0.5) / 100);

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                hpiSeoul: parseFloat(seoulHPI.toFixed(2)),
                hpiNation: parseFloat(nationHPI.toFixed(2)),
                changeSeoul: parseFloat((trend.seoul + noise).toFixed(2)),
                changeNation: parseFloat((trend.nation + noise * 0.5).toFixed(2)),
            });
        }
    }

    return data;
};

// 거시경제 지표 데이터 생성 (2026년 1월 기준)
export const generateMacroData = () => {
    const data = [];

    const interestRates = {
        2020: [0.75, 0.50, 0.50, 0.50],
        2021: [0.50, 0.50, 0.75, 1.00],
        2022: [1.25, 1.75, 2.50, 3.25],
        2023: [3.50, 3.50, 3.50, 3.50],
        2024: [3.50, 3.50, 3.25, 3.00],
        2025: [3.00, 2.50, 2.50, 2.50], // 5월 이후 2.5% 동결
        2026: [2.50, 2.50, 2.50, 2.50], // 2026년 동결 전망
    };

    const gdpGrowth = {
        2020: -0.7,
        2021: 4.3,
        2022: 2.6,
        2023: 1.4,
        2024: 1.0, // 2024년 실제
        2025: 0.9, // 2025년 전망
        2026: 1.8, // 2026년 전망 (IMF/KDI)
    };

    const cpi = {
        2020: 0.5,
        2021: 2.5,
        2022: 5.1,
        2023: 3.6,
        2024: 2.5,
        2025: 2.1, // 2025년 연간 2.1%
        2026: 2.0, // 2026년 전망
    };

    for (let year = 2020; year <= 2026; year++) {
        const rates = interestRates[year];
        for (let q = 0; q < 4; q++) {
            if (year === 2026 && q > 0) break;

            data.push({
                period: `${year} Q${q + 1}`,
                year,
                quarter: q + 1,
                interestRate: rates[q],
                gdpGrowth: gdpGrowth[year],
                cpi: cpi[year],
                unemployment: parseFloat((3.0 + (Math.random() - 0.5)).toFixed(1)),
            });
        }
    }

    return data;
};

// 지역별 데이터 생성
export const generateRegionalData = () => {
    const regions = [
        { id: 'seoul', name: '서울', baseIndex: 115, changeRate: 0.35 },
        { id: 'gangnam', name: '강남구', baseIndex: 125, changeRate: 0.52 },
        { id: 'seocho', name: '서초구', baseIndex: 122, changeRate: 0.48 },
        { id: 'songpa', name: '송파구', baseIndex: 118, changeRate: 0.42 },
        { id: 'yongsan', name: '용산구', baseIndex: 120, changeRate: 0.55 },
        { id: 'mapo', name: '마포구', baseIndex: 112, changeRate: 0.38 },
        { id: 'seongdong', name: '성동구', baseIndex: 110, changeRate: 0.40 },
        { id: 'gyeonggi', name: '경기', baseIndex: 105, changeRate: 0.15 },
        { id: 'incheon', name: '인천', baseIndex: 102, changeRate: 0.10 },
        { id: 'busan', name: '부산', baseIndex: 98, changeRate: -0.05 },
        { id: 'daegu', name: '대구', baseIndex: 95, changeRate: -0.12 },
        { id: 'daejeon', name: '대전', baseIndex: 100, changeRate: 0.08 },
    ];

    return regions.map(region => ({
        ...region,
        currentIndex: parseFloat((region.baseIndex + (Math.random() - 0.5) * 2).toFixed(1)),
        monthlyChange: parseFloat((region.changeRate + (Math.random() - 0.5) * 0.2).toFixed(2)),
        yearlyChange: parseFloat((region.changeRate * 12 + (Math.random() - 0.5) * 1).toFixed(2)),
        transactionVolume: Math.floor(500 + Math.random() * 1500),
        avgPrice: Math.floor(80000 + Math.random() * 100000) * 10000,
    }));
};

// 거래량 데이터 생성
export const generateTransactionData = () => {
    const data = [];

    for (let year = 2020; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 1) break;

            let baseVolume = 60000;
            if (year === 2021) baseVolume = 90000;
            if (year === 2022) baseVolume = 40000;
            if (year === 2023) baseVolume = 45000;
            if (year === 2024) baseVolume = 55000;

            const seasonal = 1 + 0.15 * Math.sin((month - 3) * Math.PI / 6);
            const noise = 0.8 + Math.random() * 0.4;

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                volume: Math.floor(baseVolume * seasonal * noise),
                seoulVolume: Math.floor(baseVolume * 0.25 * seasonal * noise),
                gyeonggiVolume: Math.floor(baseVolume * 0.35 * seasonal * noise),
            });
        }
    }

    return data;
};

// 캐시된 데이터
let cachedData = null;

// 전체 데모 데이터 가져오기
export const getDemoData = () => {
    if (cachedData) return cachedData;

    cachedData = {
        hpi: generateHPIData(),
        macro: generateMacroData(),
        regional: generateRegionalData(),
        transactions: generateTransactionData(),
        news: DEMO_NEWS,
        lastUpdated: new Date().toISOString(),
    };

    return cachedData;
};

export default {
    isStaticDeployment,
    getDemoData,
    DEMO_NEWS,
    generateHPIData,
    generateMacroData,
    generateRegionalData,
    generateTransactionData,
};
