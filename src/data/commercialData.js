/**
 * 상업용 부동산 분석 데이터
 * 오피스, 상가, 물류센터 등 상업용 부동산 지표
 */

// 오피스 공실률 데이터 (주요 업무지구)
export const generateOfficeVacancyData = () => {
    const districts = [
        { id: 'cbd', name: 'CBD (광화문)', baseVacancy: 8 },
        { id: 'gbd', name: 'GBD (강남)', baseVacancy: 5 },
        { id: 'ybd', name: 'YBD (여의도)', baseVacancy: 10 },
        { id: 'pangyo', name: '판교', baseVacancy: 4 },
        { id: 'magok', name: '마곡', baseVacancy: 12 },
    ];

    return districts.map(district => ({
        ...district,
        vacancy: parseFloat((district.baseVacancy + (Math.random() - 0.5) * 3).toFixed(1)),
        avgRent: Math.round(80000 + Math.random() * 40000), // 원/㎡/월
        change: parseFloat(((Math.random() - 0.5) * 2).toFixed(1)),
        primeRent: Math.round(120000 + Math.random() * 30000),
    }));
};

// 오피스 공실률 추이
export const generateOfficeVacancyTrend = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
            if (year === 2025 && quarter > 4) break;

            let cbd, gbd, ybd;

            if (year <= 2019) {
                cbd = 9 + Math.random() * 2;
                gbd = 4 + Math.random();
                ybd = 11 + Math.random() * 2;
            } else if (year === 2020) {
                cbd = 12 + Math.random() * 2; // 코로나
                gbd = 6 + Math.random() * 2;
                ybd = 14 + Math.random() * 2;
            } else if (year <= 2022) {
                cbd = 10 + Math.random() * 2;
                gbd = 5 + Math.random();
                ybd = 12 + Math.random() * 2;
            } else {
                cbd = 8 + Math.random() * 2;
                gbd = 4 + Math.random();
                ybd = 10 + Math.random() * 2;
            }

            data.push({
                period: `${year} Q${quarter}`,
                year,
                quarter,
                cbd: parseFloat(cbd.toFixed(1)),
                gbd: parseFloat(gbd.toFixed(1)),
                ybd: parseFloat(ybd.toFixed(1)),
            });
        }
    }

    return data;
};

// 상가 권리금 데이터 (서울 주요 상권)
export const generateRetailPremiumData = () => {
    const districts = [
        { name: '강남역', premium: 85000, rent: 450000 },
        { name: '홍대입구', premium: 72000, rent: 380000 },
        { name: '이태원', premium: 35000, rent: 280000 },
        { name: '명동', premium: 95000, rent: 520000 },
        { name: '신촌', premium: 45000, rent: 320000 },
        { name: '잠실', premium: 55000, rent: 350000 },
        { name: '가로수길', premium: 68000, rent: 420000 },
        { name: '성수동', premium: 62000, rent: 380000 },
    ];

    return districts.map(item => ({
        ...item,
        premium: item.premium + Math.round((Math.random() - 0.5) * 10000),
        rent: item.rent + Math.round((Math.random() - 0.5) * 50000),
        vacancyRate: parseFloat((3 + Math.random() * 5).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' : 'down',
    }));
};

// 물류센터 데이터
export const generateLogisticsData = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        let supply = 200 + (year - 2018) * 50;
        let demand = 180 + (year - 2018) * 60;

        if (year >= 2020) {
            supply += 100; // 이커머스 성장
            demand += 150;
        }

        if (year >= 2023) {
            supply += 50;
            demand -= 20; // 둔화
        }

        data.push({
            year,
            supply: Math.round(supply + (Math.random() - 0.5) * 30), // 만평
            demand: Math.round(demand + (Math.random() - 0.5) * 30),
            vacancy: parseFloat((5 + (supply - demand) / 50).toFixed(1)),
            avgRent: Math.round(30000 + (year - 2018) * 2000 + Math.random() * 3000), // 원/평/월
        });
    }

    return data;
};

// 데이터센터 시장 데이터
export const generateDataCenterData = () => {
    const data = [];

    for (let year = 2020; year <= 2028; year++) {
        const isProjection = year > 2025;
        let capacity = 500 + (year - 2020) * 100;

        if (year >= 2023) capacity += 200; // 클라우드 수요 증가

        data.push({
            year,
            capacity: Math.round(capacity + (Math.random() - 0.5) * 50), // MW
            growth: parseFloat((15 + Math.random() * 10).toFixed(1)), // %
            utilization: parseFloat((85 + Math.random() * 10).toFixed(1)), // %
            isProjection,
        });
    }

    return data;
};

// 호텔/숙박업 지표
export const generateHotelData = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        let occupancy, adr; // Average Daily Rate

        if (year <= 2019) {
            occupancy = 75 + Math.random() * 5;
            adr = 150000 + Math.random() * 20000;
        } else if (year === 2020) {
            occupancy = 30 + Math.random() * 10; // 코로나
            adr = 100000 + Math.random() * 20000;
        } else if (year === 2021) {
            occupancy = 45 + Math.random() * 10;
            adr = 120000 + Math.random() * 20000;
        } else if (year === 2022) {
            occupancy = 60 + Math.random() * 10;
            adr = 140000 + Math.random() * 20000;
        } else {
            occupancy = 75 + Math.random() * 8;
            adr = 170000 + Math.random() * 30000;
        }

        data.push({
            year,
            occupancy: parseFloat(occupancy.toFixed(1)), // %
            adr: Math.round(adr), // 원
            revpar: Math.round(adr * (occupancy / 100)), // Revenue Per Available Room
        });
    }

    return data;
};

// 상업용 부동산 요약
export const getCommercialSummary = () => {
    return {
        seoulOfficeVacancy: 7.2, // %
        gangnamOfficeRent: 95000, // 원/㎡/월
        avgRetailPremium: 65000, // 만원
        logisticsVacancy: 5.5, // %
        hotelOccupancy: 78.5, // %
        dataCenterGrowth: 18.5, // %
        lastUpdated: '2025-12-01',
    };
};

export default {
    generateOfficeVacancyData,
    generateOfficeVacancyTrend,
    generateRetailPremiumData,
    generateLogisticsData,
    generateDataCenterData,
    generateHotelData,
    getCommercialSummary,
};
