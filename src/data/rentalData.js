/**
 * 전월세 시장 분석 데이터
 * 전월세 전환율, 월세 수익률, 깡통전세 위험도 등
 */

// 전월세 전환율 데이터 (지역별, 월별)
export const generateConversionRateData = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 12) break;

            // 전월세 전환율은 금리와 연동
            let baseRate;
            if (year <= 2019) baseRate = 4.5;
            else if (year === 2020) baseRate = 4.0;
            else if (year === 2021) baseRate = 4.2;
            else if (year === 2022) baseRate = 5.5; // 금리 인상
            else if (year === 2023) baseRate = 6.0;
            else if (year === 2024) baseRate = 5.8;
            else baseRate = 5.5; // 금리 인하

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                seoul: parseFloat((baseRate + Math.random() * 0.5 - 0.25).toFixed(2)),
                gyeonggi: parseFloat((baseRate + 0.3 + Math.random() * 0.5 - 0.25).toFixed(2)),
                busan: parseFloat((baseRate + 0.5 + Math.random() * 0.5 - 0.25).toFixed(2)),
                national: parseFloat((baseRate + 0.2 + Math.random() * 0.5 - 0.25).toFixed(2)),
            });
        }
    }

    return data;
};

// 전세가율 상세 데이터 (구별)
export const generateJeonseRatioDetail = () => {
    const seoulDistricts = [
        { id: 'gangnam', name: '강남구', ratio: 45 },
        { id: 'seocho', name: '서초구', ratio: 48 },
        { id: 'songpa', name: '송파구', ratio: 52 },
        { id: 'gangdong', name: '강동구', ratio: 58 },
        { id: 'mapo', name: '마포구', ratio: 55 },
        { id: 'yongsan', name: '용산구', ratio: 50 },
        { id: 'seongdong', name: '성동구', ratio: 56 },
        { id: 'gwangjin', name: '광진구', ratio: 60 },
        { id: 'dongdaemun', name: '동대문구', ratio: 65 },
        { id: 'jungnang', name: '중랑구', ratio: 68 },
        { id: 'seongbuk', name: '성북구', ratio: 63 },
        { id: 'gangbuk', name: '강북구', ratio: 70 },
        { id: 'dobong', name: '도봉구', ratio: 72 },
        { id: 'nowon', name: '노원구', ratio: 75 },
        { id: 'eunpyeong', name: '은평구', ratio: 67 },
        { id: 'seodaemun', name: '서대문구', ratio: 62 },
        { id: 'jongno', name: '종로구', ratio: 55 },
        { id: 'jung', name: '중구', ratio: 52 },
        { id: 'dongjak', name: '동작구', ratio: 58 },
        { id: 'gwanak', name: '관악구', ratio: 70 },
        { id: 'geumcheon', name: '금천구', ratio: 72 },
        { id: 'yeongdeungpo', name: '영등포구', ratio: 60 },
        { id: 'guro', name: '구로구', ratio: 68 },
        { id: 'yangcheon', name: '양천구', ratio: 62 },
        { id: 'gangseo', name: '강서구', ratio: 65 },
    ];

    return seoulDistricts.map(district => ({
        ...district,
        ratio: parseFloat((district.ratio + (Math.random() - 0.5) * 5).toFixed(1)),
        monthChange: parseFloat(((Math.random() - 0.5) * 2).toFixed(1)),
        yearChange: parseFloat(((Math.random() - 0.5) * 8).toFixed(1)),
        riskLevel: district.ratio > 70 ? 'high' : district.ratio > 60 ? 'medium' : 'low',
    }));
};

// 월세 수익률 데이터 (지역별)
export const generateRentalYieldData = () => {
    const regions = [
        { id: 'gangnam', name: '강남', avgPrice: 250000, avgRent: 450 },
        { id: 'seocho', name: '서초', avgPrice: 230000, avgRent: 420 },
        { id: 'songpa', name: '송파', avgPrice: 180000, avgRent: 350 },
        { id: 'mapo', name: '마포', avgPrice: 150000, avgRent: 280 },
        { id: 'yongsan', name: '용산', avgPrice: 170000, avgRent: 320 },
        { id: 'seongdong', name: '성동', avgPrice: 140000, avgRent: 260 },
        { id: 'bundang', name: '분당', avgPrice: 130000, avgRent: 230 },
        { id: 'ilsan', name: '일산', avgPrice: 70000, avgRent: 150 },
        { id: 'incheon', name: '인천', avgPrice: 50000, avgRent: 110 },
        { id: 'busan', name: '부산 해운대', avgPrice: 80000, avgRent: 170 },
    ];

    return regions.map(region => {
        const annualYield = (region.avgRent * 12) / region.avgPrice * 100;

        return {
            ...region,
            annualYield: parseFloat(annualYield.toFixed(2)),
            netYield: parseFloat((annualYield - 1.5).toFixed(2)), // 관리비, 세금 제외
            priceChange: parseFloat(((Math.random() - 0.3) * 10).toFixed(1)),
        };
    });
};

// 갭투자 수익률 계산 데이터
export const generateGapInvestmentData = () => {
    const examples = [
        {
            name: '강남 아파트 84㎡',
            salePrice: 25, // 억
            jeonsePrice: 12.5, // 억
            expectedAppreciation: 5, // % 연간
        },
        {
            name: '마포 아파트 59㎡',
            salePrice: 12,
            jeonsePrice: 7.5,
            expectedAppreciation: 4,
        },
        {
            name: '성동 아파트 74㎡',
            salePrice: 14,
            jeonsePrice: 8.5,
            expectedAppreciation: 4.5,
        },
        {
            name: '분당 아파트 84㎡',
            salePrice: 15,
            jeonsePrice: 9,
            expectedAppreciation: 3.5,
        },
        {
            name: '일산 아파트 84㎡',
            salePrice: 7,
            jeonsePrice: 5,
            expectedAppreciation: 2,
        },
    ];

    return examples.map(item => {
        const gap = item.salePrice - item.jeonsePrice;
        const jeonseRatio = (item.jeonsePrice / item.salePrice) * 100;
        const leverageRatio = item.salePrice / gap;
        const expectedReturn = item.expectedAppreciation * leverageRatio;

        return {
            ...item,
            gap,
            jeonseRatio: parseFloat(jeonseRatio.toFixed(1)),
            leverageRatio: parseFloat(leverageRatio.toFixed(2)),
            expectedReturn: parseFloat(expectedReturn.toFixed(1)),
            riskLevel: jeonseRatio > 70 ? 'high' : jeonseRatio > 55 ? 'medium' : 'low',
        };
    });
};

// 깡통전세 위험 지표
export const generateDeepWaterRiskData = () => {
    const data = [];

    for (let year = 2020; year <= 2025; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
            if (year === 2025 && quarter > 4) break;

            // 전세가율 80% 이상 비율 (깡통전세 위험군)
            let highRiskRatio;

            if (year <= 2021) {
                highRiskRatio = 5 + Math.random() * 3; // 낮은 위험
            } else if (year === 2022) {
                highRiskRatio = 8 + quarter * 2; // 증가
            } else if (year === 2023) {
                highRiskRatio = 15 + quarter * 1; // 정점
            } else {
                highRiskRatio = 18 - (year - 2023) * 3 - quarter * 0.5; // 감소
            }

            data.push({
                period: `${year} Q${quarter}`,
                year,
                quarter,
                highRiskRatio: parseFloat(Math.max(highRiskRatio, 3).toFixed(1)),
                totalRiskUnits: Math.round(highRiskRatio * 1500), // 위험 세대 수 추정
                seoulRiskRatio: parseFloat((highRiskRatio * 0.7).toFixed(1)),
                gyeonggiRiskRatio: parseFloat((highRiskRatio * 1.1).toFixed(1)),
            });
        }
    }

    return data;
};

// 전월세 거래량 데이터
export const generateRentalTransactionData = () => {
    const data = [];

    for (let year = 2020; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 12) break;

            let jeonse = 60000 + Math.random() * 20000;
            let monthlyRent = 40000 + Math.random() * 15000;

            // 전세 → 월세 전환 추세
            if (year >= 2022) {
                jeonse -= 10000;
                monthlyRent += 15000;
            }

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                jeonse: Math.round(jeonse),
                monthlyRent: Math.round(monthlyRent),
                total: Math.round(jeonse + monthlyRent),
                monthlyRatio: parseFloat((monthlyRent / (jeonse + monthlyRent) * 100).toFixed(1)),
            });
        }
    }

    return data;
};

// 전월세 시장 요약
export const getRentalMarketSummary = () => {
    return {
        avgConversionRate: 5.5, // %
        seoulAvgJeonseRatio: 58.5, // %
        gyeonggiAvgJeonseRatio: 65.2, // %
        avgRentalYield: 3.8, // %
        monthlyRentRatio: 45.2, // 월세 비중 %
        highRiskUnitRatio: 12.5, // 깡통전세 위험 비율 %
        jeonseDeposit: 47800, // 서울 평균 전세가 (만원)
        monthlyRentAvg: 125, // 서울 월세 평균 (만원)
        lastUpdated: '2025-12-01',
    };
};

export default {
    generateConversionRateData,
    generateJeonseRatioDetail,
    generateRentalYieldData,
    generateGapInvestmentData,
    generateDeepWaterRiskData,
    generateRentalTransactionData,
    getRentalMarketSummary,
};
