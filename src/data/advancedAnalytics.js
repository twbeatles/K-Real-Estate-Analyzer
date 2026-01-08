/**
 * 고급 분석 데이터 생성기
 * 부동산-거시경제 연관성 분석을 위한 확장 데이터
 */

// 피어슨 상관계수 계산
export const calculateCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
};

// 시차(Lag) 상관관계 계산
export const calculateLaggedCorrelation = (x, y, maxLag = 12) => {
    const results = [];

    for (let lag = -maxLag; lag <= maxLag; lag++) {
        let xData, yData;

        if (lag >= 0) {
            xData = x.slice(0, x.length - lag);
            yData = y.slice(lag);
        } else {
            xData = x.slice(-lag);
            yData = y.slice(0, y.length + lag);
        }

        results.push({
            lag,
            correlation: calculateCorrelation(xData, yData),
        });
    }

    return results;
};

// PIR (Price to Income Ratio) 데이터 생성
export const generatePIRData = () => {
    const data = [];
    const baseIncomes = {
        2000: 2500, 2005: 3000, 2010: 3500, 2015: 4200,
        2020: 5100, 2021: 5300, 2022: 5500, 2023: 5700,
        2024: 5900, 2025: 6100,
    };

    const basePrices = {
        seoul: { 2000: 18000, 2021: 120000, 2022: 110000, 2023: 105000, 2024: 110000, 2025: 115000 },
        nation: { 2000: 10000, 2021: 50000, 2022: 48000, 2023: 46000, 2024: 48000, 2025: 50000 },
    };

    for (let year = 2000; year <= 2025; year++) {
        const income = baseIncomes[year] || baseIncomes[2000] + (year - 2000) * 150;
        const seoulPrice = basePrices.seoul[year] || 18000 + (year - 2000) * 4000;
        const nationPrice = basePrices.nation[year] || 10000 + (year - 2000) * 1600;

        data.push({
            year,
            income,
            seoulPrice,
            nationPrice,
            seoulPIR: parseFloat((seoulPrice / income).toFixed(1)),
            nationPIR: parseFloat((nationPrice / income).toFixed(1)),
        });
    }

    return data;
};

// 전세가율 데이터 생성
export const generateJeonseRatioData = () => {
    const data = [];

    // 역사적 전세가율 패턴
    const baseRatios = {
        2000: { seoul: 65, nation: 70 },
        2010: { seoul: 55, nation: 62 },
        2015: { seoul: 75, nation: 72 },
        2019: { seoul: 52, nation: 58 },
        2021: { seoul: 48, nation: 55 },
        2022: { seoul: 55, nation: 60 },
        2023: { seoul: 58, nation: 62 },
        2024: { seoul: 60, nation: 64 },
        2025: { seoul: 62, nation: 66 },
    };

    for (let year = 2015; year <= 2025; year++) {
        for (let month = 1; month <= 12; month++) {
            if (year === 2025 && month > 12) break;

            const baseYear = Object.keys(baseRatios)
                .map(Number)
                .filter(y => y <= year)
                .sort((a, b) => b - a)[0];

            const base = baseRatios[baseYear];
            const noise = (Math.random() - 0.5) * 3;

            data.push({
                date: `${year}.${String(month).padStart(2, '0')}`,
                year,
                month,
                seoul: parseFloat((base.seoul + noise).toFixed(1)),
                nation: parseFloat((base.nation + noise).toFixed(1)),
                gyeonggi: parseFloat((base.seoul * 1.05 + noise).toFixed(1)),
            });
        }
    }

    return data;
};

// 수급 데이터 (입주물량, 인허가, 미분양) - 2026년 1월 기준
export const generateSupplyDemandData = () => {
    const data = [];

    const baseSupply = {
        2015: { newConstruction: 380, permits: 420, unsold: 45 },
        2016: { newConstruction: 400, permits: 450, unsold: 40 },
        2017: { newConstruction: 420, permits: 480, unsold: 35 },
        2018: { newConstruction: 450, permits: 520, unsold: 30 },
        2019: { newConstruction: 380, permits: 400, unsold: 40 },
        2020: { newConstruction: 350, permits: 380, unsold: 35 },
        2021: { newConstruction: 320, permits: 350, unsold: 25 },
        2022: { newConstruction: 380, permits: 320, unsold: 55 },
        2023: { newConstruction: 420, permits: 280, unsold: 70 },
        2024: { newConstruction: 380, permits: 260, unsold: 65 },
        2025: { newConstruction: 470, permits: 200, unsold: 55 }, // 서울 47,000호 입주
        2026: { newConstruction: 240, permits: 220, unsold: 50 }, // 서울 24,000호 입주 (공급 절벽)
    };

    for (let year = 2015; year <= 2026; year++) {
        const base = baseSupply[year] || baseSupply[2015];
        data.push({
            year,
            newConstruction: base.newConstruction + Math.round((Math.random() - 0.5) * 20),
            permits: base.permits + Math.round((Math.random() - 0.5) * 30),
            unsold: base.unsold + Math.round((Math.random() - 0.5) * 5),
            // 천 단위
            newConstructionLabel: `${base.newConstruction}천호`,
            permitsLabel: `${base.permits}천호`,
            unsoldLabel: `${base.unsold}천호`,
        });
    }

    return data;
};

// 실질금리 데이터 (명목금리 - 인플레이션) - 2026년 1월 기준
export const generateRealInterestRateData = () => {
    const data = [];

    const nominalRates = {
        2015: 1.50, 2016: 1.25, 2017: 1.25, 2018: 1.75,
        2019: 1.25, 2020: 0.50, 2021: 1.00, 2022: 3.25,
        2023: 3.50, 2024: 3.00, 2025: 2.50, 2026: 2.50 // 2025년 5월~2026년 2.5%
    };

    const inflationRates = {
        2015: 0.7, 2016: 1.0, 2017: 1.9, 2018: 1.5,
        2019: 0.4, 2020: 0.5, 2021: 2.5, 2022: 5.1,
        2023: 3.6, 2024: 2.5, 2025: 2.1, 2026: 2.0 // 2025년 2.1%, 2026년 2.0% 전망
    };

    for (let year = 2015; year <= 2026; year++) {
        const nominal = nominalRates[year];
        const inflation = inflationRates[year];

        data.push({
            year,
            nominal,
            inflation,
            real: parseFloat((nominal - inflation).toFixed(2)),
        });
    }

    return data;
};

// 유동성 지표 (M2/GDP, 가계부채/GDP)
export const generateLiquidityIndicators = () => {
    const data = [];

    for (let year = 2010; year <= 2025; year++) {
        // M2/GDP 비율 (실제 추세 반영)
        let m2GdpRatio = 120 + (year - 2010) * 5;
        if (year >= 2020) m2GdpRatio += 15; // 코로나 유동성 공급
        if (year >= 2022) m2GdpRatio -= 5; // 긴축

        // 가계부채/GDP 비율
        let householdDebtRatio = 75 + (year - 2010) * 3;
        if (year >= 2021) householdDebtRatio += 5;

        data.push({
            year,
            m2GdpRatio: parseFloat((m2GdpRatio + (Math.random() - 0.5) * 3).toFixed(1)),
            householdDebtRatio: parseFloat((householdDebtRatio + (Math.random() - 0.5) * 2).toFixed(1)),
        });
    }

    return data;
};

// 글로벌 비교 데이터 - 2026년 기준
export const generateGlobalComparisonData = () => {
    const data = [];

    const baseData = {
        korea: { rate2020: 0.5, rate2026: 2.5, hpi2020: 100, hpi2026: 125 }, // 서울 2025년 8.7% 상승 반영
        usa: { rate2020: 0.25, rate2026: 4.25, hpi2020: 100, hpi2026: 120 },
        japan: { rate2020: -0.1, rate2026: 0.25, hpi2020: 100, hpi2026: 115 },
        china: { rate2020: 3.85, rate2026: 3.0, hpi2020: 100, hpi2026: 90 }, // 중국 하락
    };

    for (let year = 2020; year <= 2026; year++) {
        const progress = (year - 2020) / 6;

        data.push({
            year,
            korea: {
                rate: parseFloat((baseData.korea.rate2020 + (baseData.korea.rate2026 - baseData.korea.rate2020) * progress).toFixed(2)),
                hpi: parseFloat((baseData.korea.hpi2020 + (baseData.korea.hpi2026 - baseData.korea.hpi2020) * progress).toFixed(1)),
            },
            usa: {
                rate: parseFloat((baseData.usa.rate2020 + (baseData.usa.rate2026 - baseData.usa.rate2020) * progress).toFixed(2)),
                hpi: parseFloat((baseData.usa.hpi2020 + (baseData.usa.hpi2026 - baseData.usa.hpi2020) * progress).toFixed(1)),
            },
            japan: {
                rate: parseFloat((baseData.japan.rate2020 + (baseData.japan.rate2026 - baseData.japan.rate2020) * progress).toFixed(2)),
                hpi: parseFloat((baseData.japan.hpi2020 + (baseData.japan.hpi2026 - baseData.japan.hpi2020) * progress).toFixed(1)),
            },
            china: {
                rate: parseFloat((baseData.china.rate2020 + (baseData.china.rate2026 - baseData.china.rate2020) * progress).toFixed(2)),
                hpi: parseFloat((baseData.china.hpi2020 + (baseData.china.hpi2026 - baseData.china.hpi2020) * progress).toFixed(1)),
            },
        });
    }

    return data;
};

// 정책 규제 데이터 (LTV, DTI, DSR)
export const generatePolicyData = () => {
    return [
        { year: 2014, ltv: 70, dti: 60, dsr: null, description: '규제 완화' },
        { year: 2016, ltv: 70, dti: 60, dsr: null, description: 'LTV/DTI 유지' },
        { year: 2017, ltv: 60, dti: 50, dsr: null, description: '8.2 대책 (투기과열지구)' },
        { year: 2018, ltv: 40, dti: 40, dsr: 40, description: '9.13 대책' },
        { year: 2019, ltv: 40, dti: 40, dsr: 40, description: '12.16 대책' },
        { year: 2020, ltv: 40, dti: 40, dsr: 40, description: '6.17/7.10 대책' },
        { year: 2021, ltv: 40, dti: 40, dsr: 40, description: '규제 유지' },
        { year: 2022, ltv: 50, dti: 50, dsr: 40, description: '규제 완화 시작' },
        { year: 2023, ltv: 50, dti: 50, dsr: 40, description: '규제 완화' },
        { year: 2024, ltv: 70, dti: 60, dsr: 40, description: '대폭 완화' },
        { year: 2025, ltv: 70, dti: 60, dsr: 40, description: '완화 기조 유지' },
        { year: 2026, ltv: 70, dti: 60, dsr: 40, description: '2026년 현행' },
    ];
};

// 사이클 분석 데이터
export const analyzeCycle = (hpiData) => {
    const recent = hpiData.slice(-24); // 최근 2년
    const older = hpiData.slice(-48, -24); // 그 이전 2년

    const recentAvg = recent.reduce((sum, d) => sum + d.hpiSeoul, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.hpiSeoul, 0) / older.length;

    const momentum = ((recentAvg - olderAvg) / olderAvg) * 100;
    const volatility = calculateVolatility(recent.map(d => d.hpiSeoul));

    let phase, description, outlook;

    if (momentum > 5) {
        phase = '상승기';
        description = '가격 상승세가 지속되고 있습니다.';
        outlook = '과열 전환 가능성 모니터링 필요';
    } else if (momentum > 0) {
        phase = '회복기';
        description = '시장이 바닥을 찍고 회복 중입니다.';
        outlook = '상승 전환 조짐';
    } else if (momentum > -5) {
        phase = '조정기';
        description = '소폭 하락 또는 보합세입니다.';
        outlook = '저가 매수 기회 탐색';
    } else {
        phase = '하락기';
        description = '가격 하락이 진행 중입니다.';
        outlook = '바닥 확인 후 진입 검토';
    }

    return {
        phase,
        description,
        outlook,
        momentum: parseFloat(momentum.toFixed(2)),
        volatility: parseFloat(volatility.toFixed(2)),
        recentTrend: recent[recent.length - 1].hpiSeoul > recent[0].hpiSeoul ? 'up' : 'down',
    };
};

// 변동성 계산
const calculateVolatility = (values) => {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
};

// 선행지표 종합 데이터
export const generateLeadingIndicators = () => {
    const data = [];

    for (let year = 2020; year <= 2026; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
            if (year === 2026 && quarter > 1) break;

            // 건설 허가 (선행 6-12개월)
            let permits = 80 + (Math.random() - 0.5) * 20;
            if (year >= 2022) permits -= 15;
            if (year >= 2024) permits += 10;

            // 거래량 (선행 3-6개월)
            let transactions = 70 + (Math.random() - 0.5) * 15;
            if (year === 2022) transactions -= 30;
            if (year >= 2024) transactions += 15;

            // 미분양 (역행 지표)
            let unsold = 30 + (Math.random() - 0.5) * 10;
            if (year >= 2022) unsold += 25;
            if (year >= 2024) unsold -= 10;

            data.push({
                period: `${year} Q${quarter}`,
                year,
                quarter,
                permits: Math.max(0, permits),
                transactions: Math.max(0, transactions),
                unsold: Math.max(0, unsold),
                sentiment: parseFloat((50 + (Math.random() - 0.5) * 30).toFixed(1)), // 심리지수
            });
        }
    }

    return data;
};

// 버블 지수 계산
export const calculateBubbleIndex = (pirData, jeonseRatioData, transactionData) => {
    const latestPIR = pirData[pirData.length - 1];
    const avgPIR = pirData.reduce((sum, d) => sum + d.seoulPIR, 0) / pirData.length;

    const latestJeonse = jeonseRatioData[jeonseRatioData.length - 1];
    const avgJeonse = jeonseRatioData.reduce((sum, d) => sum + d.seoul, 0) / jeonseRatioData.length;

    // PIR 과열도 (0-100)
    const pirScore = Math.min(100, Math.max(0, ((latestPIR.seoulPIR / avgPIR) - 0.8) * 250));

    // 전세가율 과열도 (낮을수록 과열)
    const jeonseScore = Math.min(100, Math.max(0, (1 - latestJeonse.seoul / avgJeonse) * 200 + 50));

    // 종합 버블 지수
    const bubbleIndex = (pirScore * 0.6 + jeonseScore * 0.4);

    let riskLevel, description;

    if (bubbleIndex < 30) {
        riskLevel = '저위험';
        description = '시장이 저평가 또는 정상 범위입니다.';
    } else if (bubbleIndex < 50) {
        riskLevel = '보통';
        description = '시장이 적정 수준입니다.';
    } else if (bubbleIndex < 70) {
        riskLevel = '주의';
        description = '과열 조짐이 있습니다.';
    } else {
        riskLevel = '위험';
        description = '버블 가능성이 높습니다.';
    }

    return {
        bubbleIndex: parseFloat(bubbleIndex.toFixed(1)),
        pirScore: parseFloat(pirScore.toFixed(1)),
        jeonseScore: parseFloat(jeonseScore.toFixed(1)),
        riskLevel,
        description,
    };
};

// 시나리오 시뮬레이션
export const simulateScenario = (baseHPI, rateChange, m2Change, gdpChange, years = 5) => {
    const results = [];
    let hpi = baseHPI;

    // 회귀계수 (역사적 데이터 기반 추정)
    const rateCoeff = -3.5;  // 금리 1%p 상승 → HPI 3.5% 하락
    const m2Coeff = 0.8;     // M2 1% 증가 → HPI 0.8% 상승
    const gdpCoeff = 1.2;    // GDP 1% 성장 → HPI 1.2% 상승

    for (let year = 1; year <= years; year++) {
        const rateEffect = rateChange * rateCoeff;
        const m2Effect = m2Change * m2Coeff;
        const gdpEffect = gdpChange * gdpCoeff;

        const totalEffect = rateEffect + m2Effect + gdpEffect;
        const yearlyChange = totalEffect / years;

        hpi = hpi * (1 + yearlyChange / 100);

        results.push({
            year,
            hpi: parseFloat(hpi.toFixed(1)),
            change: parseFloat(yearlyChange.toFixed(2)),
            cumulative: parseFloat(((hpi / baseHPI - 1) * 100).toFixed(2)),
        });
    }

    return results;
};

// 회귀분석 (단순 선형 회귀)
export const linearRegression = (x, y) => {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R² 계산
    const yMean = sumY / n;
    let ssRes = 0, ssTot = 0;

    for (let i = 0; i < n; i++) {
        const predicted = slope * x[i] + intercept;
        ssRes += Math.pow(y[i] - predicted, 2);
        ssTot += Math.pow(y[i] - yMean, 2);
    }

    const rSquared = 1 - ssRes / ssTot;

    return {
        slope: parseFloat(slope.toFixed(4)),
        intercept: parseFloat(intercept.toFixed(4)),
        rSquared: parseFloat(rSquared.toFixed(4)),
    };
};

export default {
    calculateCorrelation,
    calculateLaggedCorrelation,
    generatePIRData,
    generateJeonseRatioData,
    generateSupplyDemandData,
    generateRealInterestRateData,
    generateLiquidityIndicators,
    generateGlobalComparisonData,
    generatePolicyData,
    analyzeCycle,
    generateLeadingIndicators,
    calculateBubbleIndex,
    simulateScenario,
    linearRegression,
};
