/**
 * 분양 시장 분석 데이터
 * 청약, 분양가, 미분양 등 신규 분양 시장 데이터
 */

// 청약 경쟁률 데이터 (최근 분양 단지)
export const generateSubscriptionData = () => {
    const recentProjects = [
        { name: '래미안 원베일리', region: '서울 서초', date: '2024.11', units: 1200 },
        { name: '디에이치 클래스트', region: '서울 강동', date: '2024.10', units: 850 },
        { name: '힐스테이트 광교', region: '경기 수원', date: '2024.09', units: 2200 },
        { name: '롯데캐슬 시그니처', region: '서울 송파', date: '2024.08', units: 750 },
        { name: '자이 프레스티지', region: '서울 용산', date: '2024.07', units: 1500 },
        { name: 'e편한세상 판교', region: '경기 성남', date: '2024.06', units: 1800 },
        { name: '푸르지오 일산', region: '경기 고양', date: '2024.05', units: 2500 },
        { name: '아크로 리버포레', region: '서울 마포', date: '2024.04', units: 680 },
    ];

    return recentProjects.map(project => {
        // 지역별 경쟁률 시뮬레이션
        let avgCompetition;
        if (project.region.includes('서울')) {
            avgCompetition = 80 + Math.random() * 150;
        } else if (project.region.includes('경기')) {
            avgCompetition = 30 + Math.random() * 80;
        } else {
            avgCompetition = 5 + Math.random() * 30;
        }

        return {
            ...project,
            avgCompetition: parseFloat(avgCompetition.toFixed(1)),
            firstPriorityCompetition: parseFloat((avgCompetition * 1.5).toFixed(1)),
            specialCompetition: parseFloat((avgCompetition * 0.8).toFixed(1)),
            pricePerPyeong: Math.round(3500 + Math.random() * 2500), // 만원/평
        };
    });
};

// 월별 청약 경쟁률 추이
export const generateMonthlyCompetition = () => {
    const data = [];

    for (let year = 2020; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 12) break;

            let seoul, gyeonggi, local;

            // 시장 상황에 따른 경쟁률 변화
            if (year === 2021) {
                seoul = 150 + Math.random() * 100; // 과열기
                gyeonggi = 80 + Math.random() * 50;
            } else if (year === 2022) {
                seoul = 50 + Math.random() * 60; // 금리 인상기
                gyeonggi = 20 + Math.random() * 30;
            } else if (year === 2023) {
                seoul = 30 + Math.random() * 40;
                gyeonggi = 10 + Math.random() * 20;
            } else if (year >= 2024) {
                seoul = 80 + Math.random() * 80; // 회복기
                gyeonggi = 40 + Math.random() * 40;
            } else {
                seoul = 60 + Math.random() * 50;
                gyeonggi = 30 + Math.random() * 30;
            }

            local = 5 + Math.random() * 15;

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                seoul: parseFloat(seoul.toFixed(1)),
                gyeonggi: parseFloat(gyeonggi.toFixed(1)),
                local: parseFloat(local.toFixed(1)),
            });
        }
    }

    return data;
};

// 분양가 추이 (3.3㎡당, 만원)
export const generateSalesPriceData = () => {
    const data = [];

    for (let year = 2015; year <= 2025; year++) {
        // 서울 분양가 상승 추세
        let seoulPrice = 2200 + (year - 2015) * 250;
        if (year >= 2021) seoulPrice += 500; // 급등
        if (year >= 2023) seoulPrice += 300; // 고분양가 지속

        let gyeonggiPrice = 1200 + (year - 2015) * 150;
        if (year >= 2021) gyeonggiPrice += 300;

        let localPrice = 800 + (year - 2015) * 80;
        if (year >= 2021) localPrice += 150;

        data.push({
            year,
            seoul: Math.round(seoulPrice + Math.random() * 200),
            gyeonggi: Math.round(gyeonggiPrice + Math.random() * 100),
            local: Math.round(localPrice + Math.random() * 50),
            seoulChange: year > 2015 ? parseFloat((Math.random() * 15 + 5).toFixed(1)) : 0,
        });
    }

    return data;
};

// 미분양 현황 데이터 (지역별)
export const generateUnsoldData = () => {
    const regions = [
        { id: 'seoul', name: '서울', unsold: 1200 },
        { id: 'gyeonggi', name: '경기', unsold: 8500 },
        { id: 'incheon', name: '인천', unsold: 4200 },
        { id: 'busan', name: '부산', unsold: 3800 },
        { id: 'daegu', name: '대구', unsold: 12500 },
        { id: 'daejeon', name: '대전', unsold: 2100 },
        { id: 'gwangju', name: '광주', unsold: 1800 },
        { id: 'ulsan', name: '울산', unsold: 2500 },
        { id: 'gangwon', name: '강원', unsold: 5500 },
        { id: 'chungbuk', name: '충북', unsold: 4800 },
        { id: 'chungnam', name: '충남', unsold: 6200 },
        { id: 'jeonbuk', name: '전북', unsold: 3200 },
        { id: 'jeonnam', name: '전남', unsold: 4100 },
        { id: 'gyeongbuk', name: '경북', unsold: 8900 },
        { id: 'gyeongnam', name: '경남', unsold: 7200 },
        { id: 'jeju', name: '제주', unsold: 2800 },
    ];

    return regions.map(region => ({
        ...region,
        unsold: region.unsold + Math.round((Math.random() - 0.5) * 500),
        monthChange: parseFloat(((Math.random() - 0.3) * 10).toFixed(1)),
        ratio: parseFloat((region.unsold / 1000).toFixed(1)), // 천호당
        isHigh: region.unsold > 5000,
    }));
};

// 미분양 추이 (전국 합계)
export const generateUnsoldTrend = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 12) break;

            let unsold;

            if (year === 2018) {
                unsold = 55000 + Math.random() * 5000;
            } else if (year === 2019) {
                unsold = 45000 + Math.random() * 5000;
            } else if (year <= 2021) {
                unsold = 25000 + Math.random() * 5000; // 분양 호황
            } else if (year === 2022) {
                unsold = 40000 + month * 2000; // 급증
            } else if (year === 2023) {
                unsold = 65000 + month * 500; // 정점
            } else {
                unsold = 70000 - (year - 2023) * 5000 - month * 300; // 감소 반전
            }

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                unsold: Math.round(unsold),
                prepaidUnsold: Math.round(unsold * 0.15), // 준공 후 미분양
            });
        }
    }

    return data;
};

// 분양권 프리미엄 데이터
export const generatePremiumData = () => {
    const projects = [
        { name: '래미안 원베일리', region: '서울 서초', salesPrice: 25, currentPrice: 32 },
        { name: '디에이치 클래스트', region: '서울 강동', salesPrice: 18, currentPrice: 21 },
        { name: '힐스테이트 광교', region: '경기 수원', salesPrice: 12, currentPrice: 13 },
        { name: '아크로 리버포레', region: '서울 마포', salesPrice: 22, currentPrice: 26 },
        { name: '푸르지오 일산', region: '경기 고양', salesPrice: 8, currentPrice: 8.5 },
    ];

    return projects.map(project => ({
        ...project,
        premium: parseFloat(((project.currentPrice - project.salesPrice) / project.salesPrice * 100).toFixed(1)),
        premiumAmount: parseFloat((project.currentPrice - project.salesPrice).toFixed(1)),
        isPositive: project.currentPrice > project.salesPrice,
    }));
};

// 입주 물량 예정 데이터
export const generateSupplySchedule = () => {
    const data = [];

    for (let year = 2024; year <= 2028; year++) {
        let seoul, gyeonggi, local;

        if (year === 2024) {
            seoul = 28000; gyeonggi = 85000; local = 180000;
        } else if (year === 2025) {
            seoul = 47000; gyeonggi = 95000; local = 170000; // 서울 공급 증가
        } else if (year === 2026) {
            seoul = 24000; gyeonggi = 70000; local = 150000; // 공급 절벽
        } else if (year === 2027) {
            seoul = 18000; gyeonggi = 55000; local = 130000;
        } else {
            seoul = 15000; gyeonggi = 50000; local = 120000;
        }

        data.push({
            year,
            seoul: seoul + Math.round((Math.random() - 0.5) * 3000),
            gyeonggi: gyeonggi + Math.round((Math.random() - 0.5) * 8000),
            local: local + Math.round((Math.random() - 0.5) * 15000),
            total: seoul + gyeonggi + local,
        });
    }

    return data;
};

// 분양 시장 요약 지표
export const getSalesMarketSummary = () => {
    return {
        totalUnsold: 68500, // 호
        seoulAvgCompetition: 125.3, // 1순위 평균 경쟁률
        gyeonggiAvgCompetition: 48.7,
        seoulAvgPrice: 4850, // 만원/3.3㎡
        gyeonggiAvgPrice: 2450,
        thisYearSupply: 312000, // 호 (2025년)
        nextYearSupply: 244000, // 호 (2026년)
        supplyChangeRate: -21.8, // %
        lastUpdated: '2025-12-01',
    };
};

export default {
    generateSubscriptionData,
    generateMonthlyCompetition,
    generateSalesPriceData,
    generateUnsoldData,
    generateUnsoldTrend,
    generatePremiumData,
    generateSupplySchedule,
    getSalesMarketSummary,
};
