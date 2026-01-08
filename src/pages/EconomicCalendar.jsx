import { useState, useEffect, useMemo } from 'react';
import {
    Calendar, ChevronLeft, ChevronRight, Filter, Clock,
    AlertTriangle, Bell, Wifi, WifiOff, Building2, Landmark, BarChart2
} from 'lucide-react';
import { generateMonthlyEvents, getUpcomingEvents, checkEventNotifications } from '../services/calendarService';
import { getImportanceBadgeClass, getImportanceLabel, getCategoryLabel } from '../utils/formatters';

/**
 * 경제 캘린더 페이지 - 실제 경제지표 발표 일정
 */
const EconomicCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [importanceFilter, setImportanceFilter] = useState('all');

    // 현재 월의 이벤트 생성
    const monthEvents = useMemo(() =>
        generateMonthlyEvents(currentDate.getFullYear(), currentDate.getMonth()),
        [currentDate]
    );

    // 다가오는 이벤트
    const upcomingEvents = useMemo(() => getUpcomingEvents(14), []);

    // 알림 확인
    const notifications = useMemo(() => checkEventNotifications(upcomingEvents, 3), [upcomingEvents]);

    // 필터링된 이벤트
    const filteredEvents = useMemo(() => {
        return monthEvents.filter(event => {
            if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
            if (importanceFilter !== 'all' && event.importance !== importanceFilter) return false;
            return true;
        });
    }, [monthEvents, categoryFilter, importanceFilter]);

    // 캘린더 데이터 생성
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];

        // 이전 달 빈 칸
        for (let i = 0; i < startDay; i++) {
            days.push({ day: null, events: [] });
        }

        // 현재 달 날짜들
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = filteredEvents.filter(e => e.date === dateStr);
            days.push({ day, date: dateStr, events: dayEvents });
        }

        return days;
    }, [currentDate, filteredEvents]);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'indicator': return <BarChart2 size={14} />;
            case 'policy': return <Landmark size={14} />;
            case 'real-estate': return <Building2 size={14} />;
            default: return <Calendar size={14} />;
        }
    };

    const getImportanceColor = (importance) => {
        switch (importance) {
            case 'critical': return 'var(--color-danger)';
            case 'high': return 'var(--color-warning)';
            case 'medium': return 'var(--color-primary)';
            default: return 'var(--color-text-tertiary)';
        }
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>경제 캘린더</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                주요 경제지표 발표 일정
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="input select"
                            style={{ width: 120 }}
                        >
                            <option value="all">전체 카테고리</option>
                            <option value="indicator">경제지표</option>
                            <option value="policy">정책</option>
                            <option value="real-estate">부동산</option>
                        </select>

                        <select
                            value={importanceFilter}
                            onChange={(e) => setImportanceFilter(e.target.value)}
                            className="input select"
                            style={{ width: 120 }}
                        >
                            <option value="all">전체 중요도</option>
                            <option value="critical">매우 중요</option>
                            <option value="high">중요</option>
                            <option value="medium">보통</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications Banner */}
            {notifications.length > 0 && (
                <div style={{
                    marginBottom: 24,
                    padding: 16,
                    background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-bg-tertiary))',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-primary)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Bell size={16} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>예정된 이벤트</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {notifications.slice(0, 3).map(notif => (
                            <div
                                key={notif.id}
                                style={{
                                    padding: '8px 12px',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.8rem',
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{notif.title}</span>
                                <span style={{ color: 'var(--color-text-tertiary)' }}> - {notif.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Calendar */}
                <div className="card">
                    {/* Month Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <button onClick={prevMonth} className="btn btn-ghost btn-icon">
                            <ChevronLeft size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                            </h3>
                            <button onClick={goToToday} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                오늘
                            </button>
                        </div>
                        <button onClick={nextMonth} className="btn btn-ghost btn-icon">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                        {weekDays.map((day, i) => (
                            <div
                                key={day}
                                style={{
                                    textAlign: 'center',
                                    padding: 8,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    color: i === 0 ? 'var(--color-danger)' : i === 6 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                                }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {calendarDays.map((dayInfo, index) => {
                            const isToday = dayInfo.date === today;
                            const isSelected = dayInfo.date === selectedDate;
                            const hasEvents = dayInfo.events.length > 0;
                            const dayOfWeek = index % 7;

                            return (
                                <div
                                    key={index}
                                    onClick={() => dayInfo.day && setSelectedDate(dayInfo.date)}
                                    style={{
                                        minHeight: 80,
                                        padding: 8,
                                        borderRadius: 'var(--radius-sm)',
                                        background: isSelected ? 'var(--color-primary-light)' : isToday ? 'var(--color-bg-tertiary)' : 'transparent',
                                        border: isToday ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        cursor: dayInfo.day ? 'pointer' : 'default',
                                        opacity: dayInfo.day ? 1 : 0.3,
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    {dayInfo.day && (
                                        <>
                                            <div style={{
                                                fontSize: '0.875rem',
                                                fontWeight: isToday ? 700 : 500,
                                                color: dayOfWeek === 0 ? 'var(--color-danger)' : dayOfWeek === 6 ? 'var(--color-primary)' : 'inherit',
                                                marginBottom: 4,
                                            }}>
                                                {dayInfo.day}
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                {dayInfo.events.slice(0, 2).map(event => (
                                                    <div
                                                        key={event.id}
                                                        style={{
                                                            padding: '2px 4px',
                                                            fontSize: '0.65rem',
                                                            borderRadius: 2,
                                                            background: getImportanceColor(event.importance),
                                                            color: 'white',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                                {dayInfo.events.length > 2 && (
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>
                                                        +{dayInfo.events.length - 2}개
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar: Selected Day Events or Upcoming */}
                <div>
                    {/* Selected Date Events */}
                    {selectedDate && (
                        <div className="card" style={{ marginBottom: 20 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
                                {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 일정
                            </h4>

                            {filteredEvents.filter(e => e.date === selectedDate).length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {filteredEvents.filter(e => e.date === selectedDate).map(event => (
                                        <div
                                            key={event.id}
                                            style={{
                                                padding: 12,
                                                background: 'var(--color-bg-tertiary)',
                                                borderRadius: 'var(--radius-md)',
                                                borderLeft: `3px solid ${getImportanceColor(event.importance)}`,
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                {getCategoryIcon(event.category)}
                                                <span className={`badge ${getImportanceBadgeClass(event.importance)}`}>
                                                    {getImportanceLabel(event.importance)}
                                                </span>
                                            </div>
                                            <h5 style={{ fontWeight: 600, marginBottom: 4 }}>{event.title}</h5>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                {event.agency} | {event.time}
                                            </p>
                                            {event.description && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                                    이 날에는 예정된 이벤트가 없습니다.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Upcoming Events */}
                    <div className="card">
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Clock size={16} />
                            다가오는 일정 (2주)
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {upcomingEvents.slice(0, 8).map(event => (
                                <div
                                    key={event.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                >
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: getImportanceColor(event.importance),
                                        flexShrink: 0,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {event.title}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                            {new Date(event.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} | {event.agency}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {upcomingEvents.length === 0 && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                                2주 내 예정된 이벤트가 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .page-container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default EconomicCalendar;
