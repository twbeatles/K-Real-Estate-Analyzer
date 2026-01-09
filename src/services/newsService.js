/**
 * 뉴스 서비스 - RSS 피드 및 뉴스 API 연동
 * 정적 배포 (GitHub Pages 등) 환경 지원
 */

import { isStaticDeployment, DEMO_NEWS } from '../data/staticData';
import { logger } from '../utils/logger';

// CORS 프록시 목록 (병렬로 시도)
const CORS_PROXIES = [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// 뉴스 소스 정의
const NEWS_SOURCES = {
    naver: {
        name: '네이버 부동산',
        rssUrl: 'https://news.google.com/rss/search?q=부동산+site:naver.com&hl=ko&gl=KR&ceid=KR:ko',
    },
    hankyung: {
        name: '한국경제',
        rssUrl: 'https://news.google.com/rss/search?q=부동산+site:hankyung.com&hl=ko&gl=KR&ceid=KR:ko',
    },
    mk: {
        name: '매일경제',
        rssUrl: 'https://news.google.com/rss/search?q=부동산+site:mk.co.kr&hl=ko&gl=KR&ceid=KR:ko',
    },
    chosun: {
        name: '조선일보',
        rssUrl: 'https://news.google.com/rss/search?q=부동산+site:chosun.com&hl=ko&gl=KR&ceid=KR:ko',
    },
};

/**
 * CORS 프록시를 통해 URL fetch (병렬 시도로 개선)
 * Promise.race로 가장 빠른 성공 응답 사용, 나머지는 취소
 */
async function fetchWithCorsProxy(url, timeout = 5000) {
    // 모든 프록시에 대한 AbortController 생성
    const controllers = CORS_PROXIES.map(() => new AbortController());

    // 병렬 요청 생성
    const fetchPromises = CORS_PROXIES.map((getProxyUrl, index) => {
        const proxyUrl = getProxyUrl(url);
        const controller = controllers[index];

        return (async () => {
            try {
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(proxyUrl, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' }
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    // 성공 시 다른 요청들 취소
                    controllers.forEach((ctrl, i) => {
                        if (i !== index) ctrl.abort();
                    });
                    return await response.text();
                }
                throw new Error(`Proxy ${index} returned ${response.status}`);
            } catch (error) {
                // AbortError는 정상적인 취소이므로 무시
                if (error.name === 'AbortError') {
                    throw error; // 취소된 요청은 다시 throw
                }
                logger.warn(`프록시 ${index} 실패:`, error.message);
                throw error;
            }
        })();
    });

    // 첫 번째 성공 응답 반환, 모두 실패 시 에러
    try {
        // Promise.any: 첫 번째 성공한 Promise 반환
        const result = await Promise.any(fetchPromises);
        return result;
    } catch (aggregateError) {
        // 모든 프록시 실패
        logger.error('모든 CORS 프록시 실패');
        throw new Error('모든 CORS 프록시 실패');
    }
}

/**
 * Google News RSS를 통해 부동산 뉴스 가져오기
 */
export const fetchRealEstateNews = async (category = 'all') => {
    const queries = {
        all: '부동산',
        market: '아파트+시세',
        policy: '부동산+정책',
        analysis: '부동산+전망',
        development: '재건축+재개발',
    };

    const query = queries[category] || queries.all;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;

    try {
        // 정적 배포 환경 또는 개발 서버가 아닌 경우 직접 CORS 프록시 사용
        if (isStaticDeployment()) {
            const xmlText = await fetchWithCorsProxy(rssUrl);
            return parseRSSFeed(xmlText);
        }

        // 개발 서버: Vite 프록시 사용
        const response = await fetch(`/api/rss?url=${encodeURIComponent(rssUrl)}`);

        if (!response.ok) {
            throw new Error('RSS 피드 로드 실패');
        }

        const xmlText = await response.text();
        return parseRSSFeed(xmlText);
    } catch (error) {
        logger.error('뉴스 로드 실패:', error);
        // 최종 폴백: 데모 데이터 반환
        return getDemoNewsWithCategory(category);
    }
};

/**
 * 카테고리 필터링된 데모 뉴스 반환
 */
function getDemoNewsWithCategory(category) {
    if (category === 'all') {
        return DEMO_NEWS;
    }
    return DEMO_NEWS.filter(news => news.category === category);
}

/**
 * RSS XML 파싱
 */
function parseRSSFeed(xmlText) {
    try {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');

        // 파싱 오류 체크
        const parseError = xml.querySelector('parsererror');
        if (parseError) {
            logger.error('RSS 파싱 오류:', parseError.textContent);
            return DEMO_NEWS;
        }

        const items = xml.querySelectorAll('item');

        if (items.length === 0) {
            logger.warn('RSS 피드에 항목이 없음, 데모 데이터 사용');
            return DEMO_NEWS;
        }

        const news = [];
        items.forEach((item, index) => {
            if (index >= 20) return; // 최대 20개

            const title = item.querySelector('title')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            const source = item.querySelector('source')?.textContent || '뉴스';
            const description = item.querySelector('description')?.textContent || '';

            // HTML 태그 제거
            const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 200);

            // 날짜 파싱 안전 처리
            let formattedDate;
            try {
                formattedDate = new Date(pubDate).toISOString().split('T')[0];
            } catch {
                formattedDate = new Date().toISOString().split('T')[0];
            }

            news.push({
                id: index + 1,
                title: title.replace(' - ' + source, ''),
                summary: cleanDescription,
                source,
                date: formattedDate,
                link,
                category: categorizeNews(title),
                sentiment: analyzeSentiment(title),
            });
        });

        return news.length > 0 ? news : DEMO_NEWS;
    } catch (error) {
        logger.error('RSS 파싱 실패:', error);
        return DEMO_NEWS;
    }
}

/**
 * 뉴스 카테고리 자동 분류
 */
function categorizeNews(title) {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('정책') || lowerTitle.includes('규제') || lowerTitle.includes('법')) {
        return 'policy';
    }
    if (lowerTitle.includes('전망') || lowerTitle.includes('분석') || lowerTitle.includes('예측')) {
        return 'analysis';
    }
    if (lowerTitle.includes('재건축') || lowerTitle.includes('재개발') || lowerTitle.includes('gtx')) {
        return 'development';
    }
    return 'market';
}

/**
 * 간단한 감성 분석
 */
function analyzeSentiment(title) {
    const positiveKeywords = ['상승', '호조', '활기', '급등', '회복', '호재', '증가', '최고'];
    const negativeKeywords = ['하락', '급락', '침체', '위기', '폭락', '감소', '최저', '규제'];

    const lowerTitle = title.toLowerCase();

    for (const keyword of positiveKeywords) {
        if (lowerTitle.includes(keyword)) return 'positive';
    }
    for (const keyword of negativeKeywords) {
        if (lowerTitle.includes(keyword)) return 'negative';
    }
    return 'neutral';
}

/**
 * 네이버 부동산 뉴스 (Web Scraping 대안)
 */
export const fetchNaverRealEstateNews = async () => {
    // 네이버 뉴스 API는 별도 인증 필요
    // 대신 Google News RSS 사용
    return fetchRealEstateNews('all');
};
