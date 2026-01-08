/**
 * 환경별 로깅 유틸리티
 * - 개발 환경: 모든 로그 출력
 * - 프로덕션 환경: 에러만 출력
 */

const isDev = import.meta.env?.DEV ?? false;

export const logger = {
    info: (...args) => {
        if (isDev) console.info('[INFO]', ...args);
    },
    warn: (...args) => {
        if (isDev) console.warn('[WARN]', ...args);
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },
    debug: (...args) => {
        if (isDev) console.debug('[DEBUG]', ...args);
    },
};

export default logger;
