/**
 * 인구/세대 구조 분석 데이터
 * 부동산 수요의 핵심 동인인 인구 및 세대 구조 변화 데이터
 */

// 연령별 인구 분포 데이터 (2025년 기준)
export const generatePopulationPyramid = () => {
    const ageGroups = [
        '0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'
    ];

    return ageGroups.map((age, index) => {
        // 2025년 한국 인구 구조 반영 (저출산, 고령화)
        let maleRatio, femaleRatio;

        switch (age) {
            case '0-9':
                maleRatio = 3.8; femaleRatio = 3.5;
                break;
            case '10-19':
                maleRatio = 4.5; femaleRatio = 4.2;
                break;
            case '20-29':
                maleRatio = 6.8; femaleRatio = 6.2;
                break;
            case '30-39':
                maleRatio = 6.5; femaleRatio = 6.0;
                break;
            case '40-49':
                maleRatio = 8.2; femaleRatio = 7.8;
                break;
            case '50-59':
                maleRatio = 8.8; femaleRatio = 8.5;
                break;
            case '60-69':
                maleRatio = 7.5; femaleRatio = 7.8;
                break;
            case '70-79':
                maleRatio = 4.2; femaleRatio = 5.0;
                break;
            case '80+':
                maleRatio = 1.8; femaleRatio = 3.2;
                break;
            default:
                maleRatio = 5; femaleRatio = 5;
        }

        return {
            ageGroup: age,
            male: -maleRatio, // 음수로 표시 (피라미드 왼쪽)
            female: femaleRatio,
            malePercent: maleRatio,
            femalePercent: femaleRatio,
        };
    });
};

// 세대 구성 추이 데이터 (1인가구, 다인가구)
export const generateHouseholdData = () => {
    const data = [];

    for (let year = 2010; year <= 2026; year++) {
        // 1인 가구 비율 증가 추세
        let singleRatio = 23.9 + (year - 2010) * 1.2;
        if (year >= 2020) singleRatio += 2; // 코로나 이후 급증
        if (year >= 2025) singleRatio = Math.min(singleRatio, 35); // 2025년 35% 근접

        // 2인 가구 비율
        const coupleRatio = 26 + (year - 2010) * 0.3;

        // 3인 가구 비율
        const threePersonRatio = 21 - (year - 2010) * 0.5;

        // 4인 이상 가구 비율
        const fourPlusRatio = 100 - singleRatio - coupleRatio - threePersonRatio;

        data.push({
            year,
            single: parseFloat(singleRatio.toFixed(1)),
            couple: parseFloat(coupleRatio.toFixed(1)),
            threePerson: parseFloat(Math.max(threePersonRatio, 12).toFixed(1)),
            fourPlus: parseFloat(Math.max(fourPlusRatio, 15).toFixed(1)),
            totalHouseholds: Math.round(19000 + (year - 2010) * 300 + Math.random() * 100), // 천 세대
        });
    }

    return data;
};

// 지역별 인구 순이동 데이터
export const generateMigrationData = () => {
    const regions = [
        { id: 'seoul', name: '서울', lat: 37.5665, lng: 126.9780 },
        { id: 'gyeonggi', name: '경기', lat: 37.4138, lng: 127.5183 },
        { id: 'incheon', name: '인천', lat: 37.4563, lng: 126.7052 },
        { id: 'busan', name: '부산', lat: 35.1796, lng: 129.0756 },
        { id: 'daegu', name: '대구', lat: 35.8714, lng: 128.6014 },
        { id: 'daejeon', name: '대전', lat: 36.3504, lng: 127.3845 },
        { id: 'gwangju', name: '광주', lat: 35.1595, lng: 126.8526 },
        { id: 'ulsan', name: '울산', lat: 35.5384, lng: 129.3114 },
        { id: 'sejong', name: '세종', lat: 36.4800, lng: 127.2890 },
        { id: 'gangwon', name: '강원', lat: 37.8228, lng: 128.1555 },
        { id: 'chungbuk', name: '충북', lat: 36.6357, lng: 127.4917 },
        { id: 'chungnam', name: '충남', lat: 36.6588, lng: 126.6728 },
        { id: 'jeonbuk', name: '전북', lat: 35.8203, lng: 127.1089 },
        { id: 'jeonnam', name: '전남', lat: 34.8161, lng: 126.4629 },
        { id: 'gyeongbuk', name: '경북', lat: 36.5760, lng: 128.5056 },
        { id: 'gyeongnam', name: '경남', lat: 35.4606, lng: 128.2132 },
        { id: 'jeju', name: '제주', lat: 33.4996, lng: 126.5312 },
    ];

    return regions.map(region => {
        let netMigration;

        // 2025년 기준 인구 순이동 (천 명)
        switch (region.id) {
            case 'seoul':
                netMigration = -85; // 서울 순유출
                break;
            case 'gyeonggi':
                netMigration = 120; // 경기 순유입
                break;
            case 'incheon':
                netMigration = 15;
                break;
            case 'sejong':
                netMigration = 25; // 세종 지속 유입
                break;
            case 'busan':
            case 'daegu':
                netMigration = -15 + Math.random() * 10;
                break;
            default:
                netMigration = -10 + Math.random() * 20 - 10;
        }

        return {
            ...region,
            netMigration: Math.round(netMigration),
            inflow: Math.round(Math.abs(netMigration) + 50 + Math.random() * 30),
            outflow: Math.round(Math.abs(netMigration) + 50 - netMigration + Math.random() * 30),
            migrationRate: parseFloat((netMigration / 100).toFixed(2)), // 인구 대비 %
        };
    });
};

// 연도별 지역 인구 순이동 추이
export const generateMigrationTrend = () => {
    const data = [];

    for (let year = 2015; year <= 2025; year++) {
        // 서울 유출, 경기 유입 기조
        let seoulNet = -50 - (year - 2015) * 5;
        let gyeonggiNet = 80 + (year - 2015) * 8;

        if (year >= 2020) {
            seoulNet -= 20; // 코로나 이후 탈서울 가속
            gyeonggiNet += 15;
        }

        data.push({
            year,
            seoul: seoulNet,
            gyeonggi: gyeonggiNet,
            incheon: 10 + Math.round(Math.random() * 10),
            busan: -10 - Math.round(Math.random() * 5),
            other: -gyeonggiNet - seoulNet - 10,
        });
    }

    return data;
};

// 주택 수요 예측 데이터
export const generateHousingDemandForecast = () => {
    const data = [];

    for (let year = 2024; year <= 2035; year++) {
        // 세대 수 증가 기반 수요 추정
        const baseHouseholds = 22000; // 2024년 세대 수 (천)
        const householdGrowth = year <= 2028 ? 1.5 : year <= 2032 ? 0.8 : 0.3; // 증가율 체감

        const households = baseHouseholds * Math.pow(1 + householdGrowth / 100, year - 2024);
        const newDemand = households * (householdGrowth / 100) * 0.8; // 신규 수요 (80%)
        const replacementDemand = households * 0.01; // 멸실 대체 수요 (1%)

        data.push({
            year,
            households: Math.round(households),
            newDemand: Math.round(newDemand),
            replacementDemand: Math.round(replacementDemand),
            totalDemand: Math.round(newDemand + replacementDemand),
            supplyForecast: Math.round(350 + Math.random() * 50), // 예상 공급 (천 호)
        });
    }

    return data;
};

// 생산가능인구 추이 (15-64세)
export const generateWorkingAgePopulation = () => {
    const data = [];

    for (let year = 2010; year <= 2040; year++) {
        let workingAgePop; // 천 명

        if (year <= 2017) {
            workingAgePop = 37000 + (year - 2010) * 100; // 정점
        } else {
            workingAgePop = 37700 - (year - 2017) * 200; // 감소
        }

        const totalPop = year <= 2028 ? 51700 + (year - 2020) * 50 : 52000 - (year - 2028) * 100;

        data.push({
            year,
            workingAgePop: Math.round(workingAgePop),
            totalPop: Math.round(totalPop),
            ratio: parseFloat(((workingAgePop / totalPop) * 100).toFixed(1)),
            isProjection: year > 2025,
        });
    }

    return data;
};

// 주요 지표 요약
export const getPopulationSummary = () => {
    return {
        totalPopulation: 51700, // 천 명 (2025년)
        totalHouseholds: 23500, // 천 세대
        singleHouseholdRatio: 34.5, // %
        averageHouseholdSize: 2.2, // 명
        workingAgeRatio: 70.2, // %
        elderlyRatio: 19.1, // % (65세 이상)
        seoulPopChange: -0.8, // % (전년 대비)
        gyeonggiPopChange: 1.2, // %
        lastUpdated: '2025-12-01',
    };
};

export default {
    generatePopulationPyramid,
    generateHouseholdData,
    generateMigrationData,
    generateMigrationTrend,
    generateHousingDemandForecast,
    generateWorkingAgePopulation,
    getPopulationSummary,
};
