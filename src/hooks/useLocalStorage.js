import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * 로컬 스토리지 관리 훅
 * 사용자 데이터를 로컬스토리지에 저장하고 불러오기
 */
export const useLocalStorage = (key, initialValue) => {
    // 초기값 가져오기
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            logger.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // 값 저장
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));

            // 다른 탭과 동기화를 위해 이벤트 발생
            window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key, value: valueToStore } }));
        } catch (error) {
            logger.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // 값 삭제
    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            logger.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    // 다른 탭에서 변경 감지
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key && e.newValue) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    logger.error('Error parsing storage change:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);

    return [storedValue, setValue, removeValue];
};

/**
 * 사용자 설정 저장 훅
 */
export const useUserSettings = () => {
    const [settings, setSettings, removeSettings] = useLocalStorage('userSettings', {
        theme: 'system',
        sidebarCollapsed: false,
        defaultRegion: 'seoul',
        autoRefresh: true,
        refreshInterval: 30, // 분
        notifications: {
            priceAlert: true,
            newsAlert: true,
            calendarAlert: true,
        },
        favoriteRegions: [],
        recentSearches: [],
    });

    const updateSetting = useCallback((key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
    }, [setSettings]);

    const updateNotification = useCallback((key, value) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value,
            },
        }));
    }, [setSettings]);

    return {
        settings,
        updateSetting,
        updateNotification,
        resetSettings: removeSettings,
    };
};

/**
 * 최근 검색 기록 훅
 */
export const useRecentSearches = (maxItems = 10) => {
    const [searches, setSearches, clearSearches] = useLocalStorage('recentSearches', []);

    const addSearch = useCallback((query, type = 'general') => {
        if (!query?.trim()) return;

        setSearches(prev => {
            // 중복 제거
            const filtered = prev.filter(s => s.query !== query);
            // 새 검색어 추가
            const newSearches = [
                { query, type, timestamp: Date.now() },
                ...filtered,
            ].slice(0, maxItems);
            return newSearches;
        });
    }, [setSearches, maxItems]);

    const removeSearch = useCallback((query) => {
        setSearches(prev => prev.filter(s => s.query !== query));
    }, [setSearches]);

    return {
        searches,
        addSearch,
        removeSearch,
        clearSearches,
    };
};

/**
 * 로컬스토리지 사용량 확인
 */
export const getStorageUsage = () => {
    let total = 0;
    const items = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        total += size;
        items[key] = {
            size,
            sizeFormatted: formatBytes(size),
        };
    }

    return {
        total,
        totalFormatted: formatBytes(total),
        maxSize: 5 * 1024 * 1024, // 5MB
        maxSizeFormatted: '5 MB',
        usagePercent: (total / (5 * 1024 * 1024)) * 100,
        items,
    };
};

/**
 * 바이트 포맷팅
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * 모든 앱 데이터 내보내기
 */
export const exportAllData = () => {
    const data = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            data[key] = localStorage.getItem(key);
        }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `real-estate-app-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

/**
 * 앱 데이터 가져오기
 */
export const importAllData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                Object.entries(data).forEach(([key, value]) => {
                    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                });

                resolve({ success: true, itemCount: Object.keys(data).length });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsText(file);
    });
};

/**
 * 앱 데이터 초기화
 */
export const clearAllData = () => {
    const keysToKeep = ['theme']; // 유지할 키
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!keysToKeep.includes(key)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    return keysToRemove.length;
};

export default useLocalStorage;
