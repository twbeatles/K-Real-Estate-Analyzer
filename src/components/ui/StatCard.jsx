import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber, formatPercent, getTrendClass } from '../../utils/formatters';

/**
 * 애니메이션 숫자 카운터 훅
 */
const useCountUp = (end, duration = 1000, enabled = true) => {
    const [count, setCount] = useState(0);
    const startRef = useRef(0);
    const endRef = useRef(end);

    useEffect(() => {
        if (!enabled) {
            setCount(end);
            return;
        }

        endRef.current = end;
        const startTime = Date.now();
        const startValue = startRef.current;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out-cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const currentValue = startValue + (end - startValue) * easeOut;
            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                startRef.current = end;
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, enabled]);

    return count;
};

/**
 * 통계 카드 컴포넌트 (Enhanced with animations)
 */
const StatCard = memo(({
    title,
    value,
    subtitle,
    change,
    changeLabel,
    icon: Icon,
    iconColor = 'var(--color-primary)',
    iconBg = 'var(--color-primary-light)',
    prefix = '',
    suffix = '',
    loading = false,
    animate = true,
    variant = 'default', // 'default' | 'gradient' | 'outlined'
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // 숫자 값일 경우 애니메이션 적용
    const animatedValue = useCountUp(
        typeof value === 'number' ? value : 0,
        800,
        animate && typeof value === 'number'
    );

    // 트렌드 아이콘 메모이제이션
    const trendIcon = useMemo(() => {
        if (change > 0) return <TrendingUp size={14} />;
        if (change < 0) return <TrendingDown size={14} />;
        return <Minus size={14} />;
    }, [change]);

    // 포맷된 값 메모이제이션
    const formattedValue = useMemo(() => {
        if (typeof value === 'number') {
            return formatNumber(animate ? animatedValue : value, 1);
        }
        return value;
    }, [value, animatedValue, animate]);

    // 변형 스타일
    const variantStyles = {
        default: {},
        gradient: {
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
        },
        outlined: {
            background: 'transparent',
            border: '2px solid var(--color-border)',
        },
    };

    if (loading) {
        return (
            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="skeleton" style={{ width: 100, height: 16 }} />
                    <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)' }} />
                </div>
                <div className="skeleton" style={{ width: 120, height: 32, marginTop: 8 }} />
                <div className="skeleton" style={{ width: 80, height: 14, marginTop: 8 }} />
            </div>
        );
    }

    return (
        <div
            className={`stat-card stat-card-enhanced card-shine animate-slide-up`}
            style={variantStyles[variant]}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="stat-card-header">
                <span
                    className="stat-card-label"
                    style={variant === 'gradient' ? { color: 'rgba(255,255,255,0.9)' } : undefined}
                >
                    {title}
                </span>
                {Icon && (
                    <div
                        className="stat-card-icon"
                        style={{
                            backgroundColor: variant === 'gradient' ? 'rgba(255,255,255,0.2)' : iconBg,
                            color: variant === 'gradient' ? 'white' : iconColor,
                            transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                            transition: 'transform var(--transition-normal)',
                        }}
                    >
                        <Icon size={20} />
                    </div>
                )}
            </div>

            <div
                className="stat-card-value number-display stat-value-animate"
                style={variant === 'gradient' ? { color: 'white' } : undefined}
            >
                {prefix}{formattedValue}{suffix}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {change !== undefined && (
                    <span
                        className={`stat-card-change ${variant === 'gradient' ? '' : getTrendClass(change)}`}
                        style={variant === 'gradient' ? {
                            color: 'white',
                            background: change > 0 ? 'rgba(16, 185, 129, 0.3)' : change < 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.2)',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                        } : undefined}
                    >
                        {trendIcon}
                        {formatPercent(Math.abs(change))}
                    </span>
                )}
                {(subtitle || changeLabel) && (
                    <span
                        className="stat-card-label"
                        style={variant === 'gradient' ? { color: 'rgba(255,255,255,0.8)' } : undefined}
                    >
                        {changeLabel || subtitle}
                    </span>
                )}
            </div>
        </div>
    );
});

StatCard.displayName = 'StatCard';

export default StatCard;
