/**
 * 경제 캘린더 서비스 - 실제 경제 지표 발표 일정
 */

// 한국 경제 지표 발표 일정 (정기 발표)
const RECURRING_EVENTS = [
    // 통계청
    {
        name: '소비자물가지수',
        agency: '통계청',
        day: 3, // 매월 3일경
        importance: 'high',
        category: 'indicator',
        description: '전월 대비 물가 변동률',
    },
    {
        name: '고용동향',
        agency: '통계청',
        day: 12,
        importance: 'high',
        category: 'indicator',
        description: '실업률, 취업자 수 등',
    },
    {
        name: '산업활동동향',
        agency: '통계청',
        day: 28,
        importance: 'medium',
        category: 'indicator',
        description: '생산, 소비, 투자 동향',
    },

    // 한국은행
    {
        name: '금융통화위원회',
        agency: '한국은행',
        weekOfMonth: 2, // 매월 둘째주
        dayOfWeek: 4, // 목요일
        importance: 'critical',
        category: 'policy',
        description: '기준금리 결정',
    },
    {
        name: '통화신용정책보고서',
        agency: '한국은행',
        months: [2, 5, 8, 11], // 분기별
        day: 15,
        importance: 'high',
        category: 'indicator',
        description: '통화정책 방향 및 경제전망',
    },

    // 국토교통부
    {
        name: '주택가격동향조사',
        agency: '한국부동산원',
        dayOfWeek: 4, // 매주 목요일
        importance: 'high',
        category: 'real-estate',
        description: '전국 주택가격 주간 동향',
    },
    {
        name: '월간 주택통계',
        agency: '국토교통부',
        day: 25,
        importance: 'medium',
        category: 'real-estate',
        description: '주택 인허가, 착공, 준공 현황',
    },

    // 기타
    {
        name: '무역수지',
        agency: '관세청',
        day: 1,
        importance: 'medium',
        category: 'indicator',
        description: '수출입 동향',
    },
    {
        name: 'GDP 속보치',
        agency: '한국은행',
        months: [1, 4, 7, 10], // 분기별
        day: 25,
        importance: 'critical',
        category: 'indicator',
        description: '분기별 경제성장률',
    },
];

/**
 * 특정 월의 경제 이벤트 생성
 */
export const generateMonthlyEvents = (year, month) => {
    const events = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    RECURRING_EVENTS.forEach((event, index) => {
        let eventDate = null;

        if (event.day) {
            // 고정 날짜
            if (event.months) {
                // 특정 월에만 발생
                if (event.months.includes(month + 1)) {
                    eventDate = new Date(year, month, Math.min(event.day, daysInMonth));
                }
            } else {
                eventDate = new Date(year, month, Math.min(event.day, daysInMonth));
            }
        } else if (event.weekOfMonth && event.dayOfWeek !== undefined) {
            // N번째 주 특정 요일
            eventDate = getNthDayOfMonth(year, month, event.weekOfMonth, event.dayOfWeek);
        } else if (event.dayOfWeek !== undefined) {
            // 매주 특정 요일 (첫번째 것만)
            const firstDay = new Date(year, month, 1);
            const diff = (event.dayOfWeek - firstDay.getDay() + 7) % 7;
            eventDate = new Date(year, month, 1 + diff);

            // 주간 이벤트는 여러 개 생성
            if (event.name.includes('주택가격동향')) {
                let currentDate = eventDate;
                while (currentDate.getMonth() === month) {
                    events.push({
                        id: `${event.name}-${currentDate.toISOString()}`,
                        title: event.name,
                        date: currentDate.toISOString().split('T')[0],
                        time: '10:00',
                        category: event.category,
                        importance: event.importance,
                        agency: event.agency,
                        description: event.description,
                    });
                    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                }
                return;
            }
        }

        if (eventDate && eventDate.getMonth() === month) {
            events.push({
                id: `${event.name}-${year}-${month}-${index}`,
                title: event.name,
                date: eventDate.toISOString().split('T')[0],
                time: '10:00',
                category: event.category,
                importance: event.importance,
                agency: event.agency,
                description: event.description,
            });
        }
    });

    // 날짜순 정렬
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return events;
};

/**
 * N번째 주 특정 요일 계산
 */
function getNthDayOfMonth(year, month, weekNumber, dayOfWeek) {
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();

    let diff = dayOfWeek - firstDayOfWeek;
    if (diff < 0) diff += 7;

    const firstOccurrence = 1 + diff;
    const nthOccurrence = firstOccurrence + (weekNumber - 1) * 7;

    return new Date(year, month, nthOccurrence);
}

/**
 * 다가오는 이벤트 가져오기
 */
export const getUpcomingEvents = (days = 14) => {
    const now = new Date();
    const events = [];

    // 현재 월과 다음 월의 이벤트 생성
    const currentMonth = generateMonthlyEvents(now.getFullYear(), now.getMonth());
    const nextMonth = generateMonthlyEvents(
        now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
        (now.getMonth() + 1) % 12
    );

    const allEvents = [...currentMonth, ...nextMonth];

    // 오늘부터 N일 이내 이벤트 필터링
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= endDate;
    });
};

/**
 * 외부 경제 캘린더 API 연동 (Investing.com, TradingEconomics 등)
 */
export const fetchExternalCalendar = async () => {
    try {
        // TradingEconomics는 유료 API
        // 무료 대안: API 없이 정기 일정 사용

        // 한국은행 공개 일정 확인 시도
        const response = await fetch('/api/calendar/bok');
        if (response.ok) {
            const data = await response.json();
            return data.events || [];
        }
    } catch (error) {
        console.error('외부 캘린더 로드 실패:', error);
    }

    return [];
};

/**
 * 이벤트 알림 확인
 */
export const checkEventNotifications = (events, notifyBefore = 1) => {
    const now = new Date();
    const notifications = [];

    events.forEach(event => {
        const eventDate = new Date(event.date);
        const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= notifyBefore) {
            notifications.push({
                ...event,
                daysUntil: diffDays,
                message: diffDays === 0
                    ? `오늘 ${event.title} 발표 예정`
                    : `${diffDays}일 후 ${event.title} 발표 예정`,
            });
        }
    });

    return notifications;
};
