/**
 * 금융 시장 연계 분석 데이터
 * 채권 수익률, REITs, 주담대 금리 등
 */

// 국채 수익률 곡선 데이터
export const generateYieldCurveData = () => {
    // 현재 시점 수익률 곡선
    const maturities = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '10Y', '20Y', '30Y'];

    return maturities.map((maturity, index) => {
        // 정상 수익률 곡선 (우상향)
        let yield_;
        if (index <= 2) {
            yield_ = 2.8 + index * 0.1;
        } else if (index <= 5) {
            yield_ = 3.0 + (index - 2) * 0.15;
        } else {
            yield_ = 3.45 + (index - 5) * 0.1;
        }

        return {
            maturity,
            current: parseFloat((yield_ + (Math.random() - 0.5) * 0.1).toFixed(2)),
            oneMonthAgo: parseFloat((yield_ + 0.1 + (Math.random() - 0.5) * 0.1).toFixed(2)),
            oneYearAgo: parseFloat((yield_ + 0.5 + (Math.random() - 0.5) * 0.1).toFixed(2)),
        };
    });
};

// 주담대 금리 추이 데이터
export const generateMortgageRateData = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 12) break;

            let baseRate, spread;

            if (year <= 2019) {
                baseRate = 1.5;
                spread = 1.8;
            } else if (year === 2020) {
                baseRate = 0.5;
                spread = 2.0;
            } else if (year === 2021) {
                baseRate = 0.75 + month * 0.05;
                spread = 2.0;
            } else if (year === 2022) {
                baseRate = 1.5 + month * 0.15;
                spread = 1.5;
            } else if (year === 2023) {
                baseRate = 3.5;
                spread = 1.3;
            } else if (year === 2024) {
                baseRate = 3.25;
                spread = 1.2;
            } else {
                baseRate = 2.75;
                spread = 1.2;
            }

            const fixedRate = baseRate + spread + 0.5;
            const variableRate = baseRate + spread;

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                baseRate: parseFloat(baseRate.toFixed(2)),
                fixedRate: parseFloat((fixedRate + (Math.random() - 0.5) * 0.2).toFixed(2)),
                variableRate: parseFloat((variableRate + (Math.random() - 0.5) * 0.1).toFixed(2)),
                spread: parseFloat(spread.toFixed(2)),
            });
        }
    }

    return data;
};

// 은행별 주담대 금리 비교
export const generateBankMortgageRates = () => {
    const banks = [
        { name: 'KB국민은행', baseSpread: 0 },
        { name: '신한은행', baseSpread: 0.05 },
        { name: '우리은행', baseSpread: -0.02 },
        { name: '하나은행', baseSpread: 0.03 },
        { name: 'NH농협은행', baseSpread: -0.05 },
        { name: 'IBK기업은행', baseSpread: -0.08 },
        { name: 'SC제일은행', baseSpread: 0.1 },
        { name: '케이뱅크', baseSpread: -0.12 },
        { name: '카카오뱅크', baseSpread: -0.1 },
        { name: '토스뱅크', baseSpread: -0.15 },
    ];

    const baseFixed = 4.5;
    const baseVariable = 3.8;

    return banks.map(bank => ({
        name: bank.name,
        fixedRate: parseFloat((baseFixed + bank.baseSpread + (Math.random() - 0.5) * 0.1).toFixed(2)),
        variableRate: parseFloat((baseVariable + bank.baseSpread + (Math.random() - 0.5) * 0.1).toFixed(2)),
        minRate: parseFloat((3.5 + bank.baseSpread).toFixed(2)),
        maxLTV: bank.name.includes('은행') ? 70 : 80,
    }));
};

// REITs 수익률 데이터
export const generateREITsData = () => {
    const data = [];

    for (let year = 2018; year <= 2025; year++) {
        let priceReturn, dividendYield;

        if (year <= 2019) {
            priceReturn = 8 + Math.random() * 5;
            dividendYield = 5 + Math.random();
        } else if (year === 2020) {
            priceReturn = -15 + Math.random() * 10; // 코로나 충격
            dividendYield = 6 + Math.random();
        } else if (year === 2021) {
            priceReturn = 20 + Math.random() * 10; // 반등
            dividendYield = 4.5 + Math.random();
        } else if (year === 2022) {
            priceReturn = -10 + Math.random() * 5; // 금리 인상
            dividendYield = 5.5 + Math.random();
        } else {
            priceReturn = 5 + Math.random() * 8;
            dividendYield = 5 + Math.random();
        }

        data.push({
            year,
            priceReturn: parseFloat(priceReturn.toFixed(1)),
            dividendYield: parseFloat(dividendYield.toFixed(1)),
            totalReturn: parseFloat((priceReturn + dividendYield).toFixed(1)),
            marketCap: Math.round(80 + (year - 2018) * 10 + Math.random() * 5), // 조 원
        });
    }

    return data;
};

// 주요 REITs 종목 데이터
export const generateREITsList = () => {
    return [
        { name: '신한알파리츠', marketCap: 8500, dividendYield: 5.2, sector: '오피스' },
        { name: 'ESR켄달스퀘어리츠', marketCap: 7200, dividendYield: 6.1, sector: '물류' },
        { name: '롯데리츠', marketCap: 6800, dividendYield: 5.8, sector: '리테일' },
        { name: 'SK리츠', marketCap: 5500, dividendYield: 5.5, sector: '복합' },
        { name: '코람코에너지리츠', marketCap: 4200, dividendYield: 7.2, sector: '인프라' },
        { name: '맥쿼리인프라', marketCap: 12000, dividendYield: 6.8, sector: '인프라' },
        { name: '제이알글로벌리츠', marketCap: 3800, dividendYield: 5.9, sector: '오피스' },
        { name: '이지스밸류리츠', marketCap: 3200, dividendYield: 6.5, sector: '오피스' },
    ].map(item => ({
        ...item,
        marketCap: item.marketCap + Math.round((Math.random() - 0.5) * 500),
        dividendYield: parseFloat((item.dividendYield + (Math.random() - 0.5) * 0.5).toFixed(1)),
        priceChange: parseFloat(((Math.random() - 0.5) * 10).toFixed(1)),
    }));
};

// KOSPI vs 부동산 지수 비교
export const generateStockVsRealEstateData = () => {
    const data = [];

    for (let year = 2015; year <= 2025; year++) {
        let kospi, realEstate;

        if (year === 2015) {
            kospi = 100;
            realEstate = 100;
        } else if (year <= 2019) {
            kospi = 100 + (year - 2015) * 3 + Math.random() * 10;
            realEstate = 100 + (year - 2015) * 5;
        } else if (year === 2020) {
            kospi = 130;
            realEstate = 120;
        } else if (year === 2021) {
            kospi = 155; // 주식 강세
            realEstate = 140; // 부동산 급등
        } else if (year === 2022) {
            kospi = 125; // 조정
            realEstate = 135;
        } else {
            kospi = 130 + (year - 2022) * 5;
            realEstate = 135 + (year - 2022) * 4;
        }

        data.push({
            year,
            kospi: parseFloat((kospi + (Math.random() - 0.5) * 5).toFixed(1)),
            realEstate: parseFloat((realEstate + (Math.random() - 0.5) * 3).toFixed(1)),
            gap: parseFloat((realEstate - kospi).toFixed(1)),
        });
    }

    return data;
};

// 금융 시장 요약
export const getFinancialMarketSummary = () => {
    return {
        baseRate: 2.75, // %
        avgMortgageRate: 4.2, // %
        mortgageSpread: 1.45, // %p
        bond10Y: 3.65, // %
        reitsAvgYield: 5.8, // %
        kospiYTD: 8.5, // %
        realEstateYTD: 5.2, // %
        totalMortgageDebt: 1050, // 조 원
        lastUpdated: '2025-12-01',
    };
};

export default {
    generateYieldCurveData,
    generateMortgageRateData,
    generateBankMortgageRates,
    generateREITsData,
    generateREITsList,
    generateStockVsRealEstateData,
    getFinancialMarketSummary,
};
