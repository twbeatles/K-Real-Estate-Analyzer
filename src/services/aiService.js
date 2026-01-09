/**
 * AI 분석 서비스 - OpenAI API 연동
 */

import { logger } from '../utils/logger';

// OpenAI API 설정
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const API_TIMEOUT = 30000; // 30초 타임아웃

// Rate Limiting 설정
const RATE_LIMIT_CONFIG = {
    maxRequests: 10,
    windowMs: 60000, // 1분
    storageKey: 'aiService_rateLimitRequests',
};

/**
 * sessionStorage에서 Rate Limit 요청 기록 로드
 */
const loadRateLimitRequests = () => {
    try {
        const stored = sessionStorage.getItem(RATE_LIMIT_CONFIG.storageKey);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

/**
 * sessionStorage에 Rate Limit 요청 기록 저장
 */
const saveRateLimitRequests = (requests) => {
    try {
        sessionStorage.setItem(RATE_LIMIT_CONFIG.storageKey, JSON.stringify(requests));
    } catch (e) {
        logger.warn('Rate limit 저장 실패:', e);
    }
};

/**
 * Rate Limiting 체크 (sessionStorage로 새로고침 후에도 유지)
 */
const checkRateLimit = () => {
    const now = Date.now();

    // sessionStorage에서 요청 기록 로드
    let requests = loadRateLimitRequests();

    // 윈도우 시간 외의 요청 제거
    requests = requests.filter(time => now - time < RATE_LIMIT_CONFIG.windowMs);

    if (requests.length >= RATE_LIMIT_CONFIG.maxRequests) {
        const oldestRequest = requests[0];
        const waitTime = Math.ceil((RATE_LIMIT_CONFIG.windowMs - (now - oldestRequest)) / 1000);
        throw new Error(`요청 한도 초과. ${waitTime}초 후에 다시 시도해주세요.`);
    }

    requests.push(now);
    saveRateLimitRequests(requests);
};

/**
 * 타임아웃이 있는 fetch 래퍼
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
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * AI 시장 분석 생성
 */
export const generateMarketAnalysis = async (apiKey, marketData, topic = 'overall') => {
    if (!apiKey) {
        throw new Error('OpenAI API 키가 필요합니다.');
    }

    // Rate limit 체크
    checkRateLimit();

    const prompts = {
        overall: `당신은 한국 부동산 시장 전문 애널리스트입니다. 다음 데이터를 바탕으로 현재 시장 상황을 분석해주세요.

시장 데이터:
- 서울 주택가격지수: ${marketData.seoulHPI || 'N/A'}
- 전국 주택가격지수: ${marketData.nationHPI || 'N/A'}
- 기준금리: ${marketData.interestRate || 'N/A'}%
- 전월 대비 변동: ${marketData.monthlyChange || 'N/A'}%

다음 형식으로 응답해주세요:
1. 현재 시장 요약 (2-3문장)
2. 핵심 포인트 4개 (각각 한 줄)
3. 리스크 요인 3개
4. 기회 요인 3개
5. 향후 전망 (2-3문장)`,

        seoul: `서울 부동산 시장을 심층 분석해주세요. 강남권, 마용성, 비강남권 등 권역별 특성과 현재 동향을 설명해주세요.`,

        interest: `현재 기준금리 ${marketData.interestRate}%가 부동산 시장에 미치는 영향을 분석해주세요. 향후 금리 전망과 투자 전략도 포함해주세요.`,

        forecast: `2026년 하반기 부동산 시장 전망을 분석해주세요. 가격 전망, 거래량 예측, 주요 변수들을 포함해주세요.`,
    };

    const prompt = prompts[topic] || prompts.overall;

    try {
        const response = await fetchWithTimeout(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: '당신은 한국 부동산 시장 전문 애널리스트입니다. 객관적이고 데이터 기반의 분석을 제공하며, 투자 조언이 아닌 시장 분석만 제공합니다.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API 호출 실패');
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        return parseAIResponse(content, topic);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('API 요청 시간이 초과되었습니다. 다시 시도해주세요.');
        }
        logger.error('AI 분석 생성 실패:', error);
        throw error;
    }
};

/**
 * AI 응답 파싱
 */
function parseAIResponse(content, topic) {
    const lines = content.split('\n').filter(line => line.trim());

    // 기본 구조
    const result = {
        title: getTopicTitle(topic),
        summary: '',
        keyPoints: [],
        risks: [],
        opportunities: [],
        forecast: '',
        raw: content,
        generatedAt: new Date().toISOString(),
    };

    let currentSection = 'summary';

    lines.forEach(line => {
        const trimmed = line.trim();

        // 섹션 판별
        if (trimmed.includes('요약') || trimmed.includes('현재')) {
            currentSection = 'summary';
        } else if (trimmed.includes('핵심') || trimmed.includes('포인트')) {
            currentSection = 'keyPoints';
        } else if (trimmed.includes('리스크') || trimmed.includes('위험')) {
            currentSection = 'risks';
        } else if (trimmed.includes('기회')) {
            currentSection = 'opportunities';
        } else if (trimmed.includes('전망') || trimmed.includes('예측')) {
            currentSection = 'forecast';
        } else {
            // 내용 추가
            const cleanLine = trimmed.replace(/^[\d\-\*\•\.]+\s*/, '').trim();

            if (cleanLine) {
                switch (currentSection) {
                    case 'summary':
                        result.summary += (result.summary ? ' ' : '') + cleanLine;
                        break;
                    case 'keyPoints':
                        if (result.keyPoints.length < 5) result.keyPoints.push(cleanLine);
                        break;
                    case 'risks':
                        if (result.risks.length < 4) result.risks.push(cleanLine);
                        break;
                    case 'opportunities':
                        if (result.opportunities.length < 4) result.opportunities.push(cleanLine);
                        break;
                    case 'forecast':
                        result.forecast += (result.forecast ? ' ' : '') + cleanLine;
                        break;
                }
            }
        }
    });

    // 최소 데이터 보장
    if (result.keyPoints.length === 0) {
        result.keyPoints = ['상세 분석은 원본 텍스트를 참조하세요.'];
    }

    return result;
}

/**
 * 토픽별 제목
 */
function getTopicTitle(topic) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const titles = {
        overall: `${year}년 ${month}월 부동산 시장 종합 분석`,
        seoul: '서울 부동산 시장 심층 분석',
        interest: '금리 변동이 부동산 시장에 미치는 영향',
        forecast: `${year}년 하반기 부동산 시장 전망`,
    };
    return titles[topic] || titles.overall;
}

/**
 * 키워드 기반 간단 분석 (API 없이)
 */
export const generateSimpleAnalysis = async (marketData, recentNews = []) => {
    // 뉴스 감성 분석
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    recentNews.forEach(news => {
        sentimentCounts[news.sentiment || 'neutral']++;
    });

    const dominantSentiment = Object.entries(sentimentCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

    // 시장 데이터 기반 분석
    const monthlyChange = marketData.monthlyChange || 0;
    const interestRate = marketData.interestRate || 3.5;

    let marketTrend = 'neutral';
    if (monthlyChange > 0.5) marketTrend = 'positive';
    else if (monthlyChange < -0.5) marketTrend = 'negative';

    return {
        title: `${new Date().toLocaleDateString('ko-KR')} 시장 분석`,
        summary: generateSummary(marketTrend, dominantSentiment, interestRate),
        sentiment: dominantSentiment,
        keyPoints: generateKeyPoints(marketData, dominantSentiment),
        risks: generateRisks(interestRate, monthlyChange),
        opportunities: generateOpportunities(interestRate, monthlyChange),
        generatedAt: new Date().toISOString(),
        isAI: false,
    };
};

function generateSummary(trend, sentiment, rate) {
    const trendText = {
        positive: '상승세를 보이고 있습니다',
        negative: '하락세를 보이고 있습니다',
        neutral: '보합세를 유지하고 있습니다',
    };

    const sentimentText = {
        positive: '시장 심리는 긍정적입니다.',
        negative: '시장 심리는 다소 부정적입니다.',
        neutral: '시장 심리는 중립적입니다.',
    };

    return `현재 부동산 시장은 ${trendText[trend]}. 기준금리 ${rate}% 수준에서 ${sentimentText[sentiment]}`;
}

function generateKeyPoints(data, sentiment) {
    const points = [];

    if (data.seoulHPI) {
        points.push(`서울 주택가격지수 ${data.seoulHPI.toFixed(1)} 기록`);
    }
    if (data.monthlyChange) {
        const direction = data.monthlyChange > 0 ? '상승' : '하락';
        points.push(`전월 대비 ${Math.abs(data.monthlyChange).toFixed(2)}% ${direction}`);
    }
    if (data.interestRate) {
        points.push(`기준금리 ${data.interestRate}% 수준 유지`);
    }

    points.push(sentiment === 'positive' ? '투자 심리 개선 조짐' : '관망세 지속');

    return points;
}

function generateRisks(rate, change) {
    const risks = [];

    if (rate >= 3.5) risks.push('고금리 기조 지속에 따른 이자 부담 증가');
    if (change < 0) risks.push('가격 하락세로 인한 투자 심리 위축');
    risks.push('가계부채 규제 강화 가능성');
    risks.push('글로벌 경기 불확실성');

    return risks.slice(0, 3);
}

function generateOpportunities(rate, change) {
    const opportunities = [];

    if (rate < 4) opportunities.push('상대적으로 안정적인 금리 수준');
    if (change < 0) opportunities.push('가격 조정기 매수 기회');
    opportunities.push('공급 부족 지역 가격 지지');
    opportunities.push('정책 완화 기대감');

    return opportunities.slice(0, 3);
}

/**
 * API 키 유효성 검사
 */
export const validateOpenAIKey = async (apiKey) => {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
        });

        return response.ok;
    } catch (error) {
        return false;
    }
};
