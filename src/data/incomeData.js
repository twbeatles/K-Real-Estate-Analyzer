/**
 * 소득/고용 분석 데이터
 * HAI(주택구입능력지수), 지역별 소득, 고용 지표 데이터
 */

// HAI (Housing Affordability Index) 데이터
export const generateHAIData = () => {
    const data = [];

    for (let year = 2010; year <= 2025; year++) {
        // HAI: 100 이상이면 중위소득 가구가 중위가격 주택 구입 가능
        let seoulHAI, nationHAI;

        if (year <= 2015) {
            seoulHAI = 55 + (year - 2010) * 2;
            nationHAI = 95 + (year - 2010) * 2;
        } else if (year <= 2020) {
            seoulHAI = 65 - (year - 2015) * 4; // 하락
            nationHAI = 105 - (year - 2015) * 3;
        } else if (year <= 2022) {
            seoulHAI = 45 - (year - 2020) * 5; // 급락
            nationHAI = 90 - (year - 2020) * 5;
        } else {
            seoulHAI = 35 + (year - 2022) * 3; // 소폭 회복
            nationHAI = 80 + (year - 2022) * 4;
        }

        data.push({
            year,
            seoul: parseFloat(Math.max(seoulHAI + (Math.random() - 0.5) * 5, 25).toFixed(1)),
            nation: parseFloat(Math.max(nationHAI + (Math.random() - 0.5) * 5, 70).toFixed(1)),
            gyeonggi: parseFloat(Math.max((seoulHAI + nationHAI) / 2 + (Math.random() - 0.5) * 5, 50).toFixed(1)),
        });
    }

    return data;
};

// 지역별 평균 소득 데이터
export const generateRegionalIncomeData = () => {
    const regions = [
        { id: 'seoul', name: '서울', baseIncome: 6200 },
        { id: 'gyeonggi', name: '경기', baseIncome: 5500 },
        { id: 'incheon', name: '인천', baseIncome: 4800 },
        { id: 'busan', name: '부산', baseIncome: 4500 },
        { id: 'daegu', name: '대구', baseIncome: 4300 },
        { id: 'daejeon', name: '대전', baseIncome: 4600 },
        { id: 'gwangju', name: '광주', baseIncome: 4200 },
        { id: 'ulsan', name: '울산', baseIncome: 5200 },
        { id: 'sejong', name: '세종', baseIncome: 5800 },
    ];

    return regions.map(region => ({
        ...region,
        avgIncome: region.baseIncome + Math.round((Math.random() - 0.5) * 200),
        medianIncome: Math.round(region.baseIncome * 0.85),
        growthRate: parseFloat((2 + Math.random() * 3).toFixed(1)),
        avgHomePrice: Math.round(region.baseIncome * (region.id === 'seoul' ? 20 : 12)),
        pir: parseFloat((region.id === 'seoul' ? 20 : 10 + Math.random() * 5).toFixed(1)),
    }));
};

// 고용 지표 데이터 (연도별)
export const generateEmploymentData = () => {
    const data = [];

    for (let year = 2015; year <= 2025; year++) {
        let unemploymentRate, employmentRate;

        if (year <= 2019) {
            unemploymentRate = 3.5 + Math.random() * 0.5;
            employmentRate = 60 + Math.random() * 2;
        } else if (year === 2020) {
            unemploymentRate = 4.0 + Math.random() * 0.5; // 코로나
            employmentRate = 58 + Math.random();
        } else {
            unemploymentRate = 3.0 + Math.random() * 0.5; // 회복
            employmentRate = 61 + Math.random() * 2;
        }

        data.push({
            year,
            unemploymentRate: parseFloat(unemploymentRate.toFixed(1)),
            employmentRate: parseFloat(employmentRate.toFixed(1)),
            economicActivityRate: parseFloat((63 + Math.random() * 2).toFixed(1)),
            youthUnemploymentRate: parseFloat((unemploymentRate * 2.5 + Math.random()).toFixed(1)),
        });
    }

    return data;
};

// 업종별 고용자 수 데이터 (2025년)
export const generateSectorEmployment = () => {
    return [
        { sector: '제조업', employment: 4200, change: -2.1 },
        { sector: '건설업', employment: 2050, change: 1.5 },
        { sector: '도소매업', employment: 3100, change: 0.8 },
        { sector: 'IT/통신', employment: 1150, change: 5.2 },
        { sector: '금융/보험', employment: 890, change: 1.2 },
        { sector: '부동산업', employment: 580, change: 3.8 },
        { sector: '전문서비스', employment: 1250, change: 4.1 },
        { sector: '숙박/음식', employment: 2200, change: 2.5 },
        { sector: '교육서비스', employment: 1850, change: 0.5 },
        { sector: '보건/복지', employment: 2400, change: 6.2 },
    ].map(item => ({
        ...item,
        employment: item.employment + Math.round((Math.random() - 0.5) * 100),
    }));
};

// 실업률 vs 주택가격 상관관계 데이터
export const generateUnemploymentHousePriceData = () => {
    const data = [];

    for (let year = 2010; year <= 2025; year++) {
        let unemploymentRate, housePriceIndex;

        // 역상관 관계 시뮬레이션
        if (year <= 2014) {
            unemploymentRate = 3.5 + Math.random() * 0.5;
            housePriceIndex = 85 + (year - 2010) * 2;
        } else if (year <= 2019) {
            unemploymentRate = 3.8 - (year - 2014) * 0.1;
            housePriceIndex = 95 + (year - 2014) * 3;
        } else if (year === 2020) {
            unemploymentRate = 4.0;
            housePriceIndex = 115;
        } else if (year === 2021) {
            unemploymentRate = 3.7;
            housePriceIndex = 130; // 급등
        } else if (year === 2022) {
            unemploymentRate = 2.9;
            housePriceIndex = 125; // 하락
        } else {
            unemploymentRate = 3.0 + (year - 2022) * 0.1;
            housePriceIndex = 120 + (year - 2022) * 3;
        }

        data.push({
            year,
            unemploymentRate: parseFloat((unemploymentRate + (Math.random() - 0.5) * 0.3).toFixed(1)),
            housePriceIndex: parseFloat((housePriceIndex + (Math.random() - 0.5) * 3).toFixed(1)),
        });
    }

    return data;
};

// 가계소득 및 가계부채 데이터
export const generateHouseholdDebtData = () => {
    const data = [];

    for (let year = 2015; year <= 2025; year++) {
        // 가계부채 증가 추세
        const baseDebt = 1100 + (year - 2015) * 90;
        const baseIncome = 4500 + (year - 2015) * 150;

        data.push({
            year,
            householdDebt: Math.round(baseDebt + (Math.random() - 0.5) * 50), // 조 원
            disposableIncome: Math.round(baseIncome + (Math.random() - 0.5) * 100), // 만 원
            debtToIncomeRatio: parseFloat(((baseDebt / (baseIncome * 12 / 10000)) * 100).toFixed(1)), // %
            mortgageDebt: Math.round(baseDebt * 0.55), // 주담대 비중
        });
    }

    return data;
};

// 소득/고용 분석 요약
export const getIncomeEmploymentSummary = () => {
    return {
        seoulHAI: 41.2, // HAI
        nationHAI: 88.5,
        avgIncomeSeoul: 6200, // 만 원
        avgIncomeNation: 4800,
        unemploymentRate: 3.1, // %
        employmentRate: 62.5, // %
        householdDebt: 1890, // 조 원
        mortgageDebtRatio: 55.2, // %
        lastUpdated: '2025-12-01',
    };
};

export default {
    generateHAIData,
    generateRegionalIncomeData,
    generateEmploymentData,
    generateSectorEmployment,
    generateUnemploymentHousePriceData,
    generateHouseholdDebtData,
    getIncomeEmploymentSummary,
};
