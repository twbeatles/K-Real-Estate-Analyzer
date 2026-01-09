import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 네트워크 상태 감지 훅
 * 온라인/오프라인 상태를 추적하고 연결 복구 시 콜백 실행
 */
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(() => {
        // 초기 상태는 navigator.onLine 사용
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    });

    const [wasOffline, setWasOffline] = useState(false);

    // useRef로 이전 온라인 상태 추적 (stale closure 방지)
    const wasOnlineRef = useRef(isOnline);

    // isOnline 상태가 변경될 때마다 ref 업데이트
    useEffect(() => {
        wasOnlineRef.current = isOnline;
    }, [isOnline]);

    useEffect(() => {
        const handleOnline = () => {
            // ref를 통해 이전 상태 확인 (stale closure 방지)
            const wasOfflineBefore = !wasOnlineRef.current;
            setIsOnline(true);

            // 오프라인 상태였다면 복구 플래그 설정
            if (wasOfflineBefore) {
                setWasOffline(true);
                // 3초 후 플래그 리셋
                setTimeout(() => setWasOffline(false), 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // 의존성 배열 비움 - ref 사용으로 stale closure 해결

    // 연결 상태 강제 확인 (fetch로 ping)
    const checkConnection = useCallback(async () => {
        try {
            const response = await fetch('/favicon.svg', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            const online = response.ok;
            setIsOnline(online);
            return online;
        } catch {
            setIsOnline(false);
            return false;
        }
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
        wasOffline,
        checkConnection,
    };
};

export default useNetworkStatus;
