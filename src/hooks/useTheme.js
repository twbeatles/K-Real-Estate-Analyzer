import { useState, useEffect, useCallback } from 'react';

/**
 * 다크/라이트 테마 관리 훅
 */
export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        // 로컬 스토리지에서 저장된 테마 확인
        const saved = localStorage.getItem('theme');
        if (saved) return saved;

        // 시스템 설정 확인
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        // DOM에 테마 적용
        document.documentElement.setAttribute('data-theme', theme);
        // 로컬 스토리지에 저장
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }, []);

    const setLightTheme = useCallback(() => setTheme('light'), []);
    const setDarkTheme = useCallback(() => setTheme('dark'), []);

    return {
        theme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
        toggleTheme,
        setLightTheme,
        setDarkTheme,
    };
};

export default useTheme;
