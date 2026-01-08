import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as simulationData from '../data';
import * as apiService from '../services/api';
import logger from '../utils/logger';

/**
 * 데이터 소스 컨텍스트
 * 오프라인(시뮬레이션) / 온라인(API) 모드 관리
 */

const DataContext = createContext(null);

// 기본 설정
const DEFAULT_SETTINGS = {
    dataMode: 'offline', // 'offline' | 'online'
    apiKeys: {
        kosis: '',      // KOSIS API 키
        bok: '',        // 한국은행 ECOS API 키
        molit: '',      // 국토교통부 API 키
        reb: '',        // 한국부동산원 API 키
    },
    autoRefresh: false,
    refreshInterval: 30, // 분
};

export const DataProvider = ({ children }) => {
    // 설정 상태 (로컬스토리지에서 불러오기)
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    // 데이터 상태
    const [data, setData] = useState({
        historical: null,
        interestRates: null,
        gdp: null,
        m2: null,
        regional: null,
        transactions: null,
        economicEvents: null,
    });

    // 로딩 & 에러 상태
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // 설정 저장
    useEffect(() => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }, [settings]);

    // 데이터 모드에 따른 데이터 로드
    const loadData = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        try {
            if (settings.dataMode === 'offline') {
                // 오프라인 모드: 시뮬레이션 데이터 사용
                setData({
                    historical: simulationData.generateHistoricalData(),
                    interestRates: simulationData.generateInterestRateData(),
                    gdp: simulationData.generateGDPData(),
                    m2: simulationData.generateM2Data(),
                    regional: simulationData.generateRegionalData(),
                    transactions: simulationData.generateTransactionData(),
                    economicEvents: simulationData.generateEconomicEvents(),
                });
                setLastUpdated(new Date());
            } else {
                // 온라인 모드: API 호출
                const { apiKeys } = settings;

                // 병렬로 API 호출
                const [historical, interestRates, gdp, regional] = await Promise.allSettled([
                    apiKeys.kosis ? apiService.fetchKOSISData(apiKeys.kosis, 'hpi') : Promise.resolve(null),
                    apiKeys.bok ? apiService.fetchBOKData(apiKeys.bok, 'interest') : Promise.resolve(null),
                    apiKeys.bok ? apiService.fetchBOKData(apiKeys.bok, 'gdp') : Promise.resolve(null),
                    apiKeys.reb ? apiService.fetchREBData(apiKeys.reb, 'regional') : Promise.resolve(null),
                ]);

                // 결과 처리 (실패 시 시뮬레이션 데이터 폴백)
                setData({
                    historical: historical.status === 'fulfilled' && historical.value
                        ? historical.value
                        : simulationData.generateHistoricalData(),
                    interestRates: interestRates.status === 'fulfilled' && interestRates.value
                        ? interestRates.value
                        : simulationData.generateInterestRateData(),
                    gdp: gdp.status === 'fulfilled' && gdp.value
                        ? gdp.value
                        : simulationData.generateGDPData(),
                    m2: simulationData.generateM2Data(), // M2는 시뮬레이션 유지
                    regional: regional.status === 'fulfilled' && regional.value
                        ? regional.value
                        : simulationData.generateRegionalData(),
                    transactions: simulationData.generateTransactionData(),
                    economicEvents: simulationData.generateEconomicEvents(),
                });

                setLastUpdated(new Date());

                // 일부 API 실패 시 경고
                const failures = [historical, interestRates, gdp, regional].filter(
                    r => r.status === 'rejected'
                );
                if (failures.length > 0) {
                    setError(`일부 API 호출 실패 (${failures.length}개). 시뮬레이션 데이터로 대체됨.`);
                }
            }
        } catch (err) {
            logger.error('Data loading error:', err);
            setError(err.message || '데이터 로드 중 오류가 발생했습니다.');

            // 폴백: 시뮬레이션 데이터
            setData({
                historical: simulationData.generateHistoricalData(),
                interestRates: simulationData.generateInterestRateData(),
                gdp: simulationData.generateGDPData(),
                m2: simulationData.generateM2Data(),
                regional: simulationData.generateRegionalData(),
                transactions: simulationData.generateTransactionData(),
                economicEvents: simulationData.generateEconomicEvents(),
            });
        } finally {
            setIsLoading(false);
        }
    }, [settings]);

    // 초기 데이터 로드
    useEffect(() => {
        loadData();
    }, [settings.dataMode]);

    // 자동 새로고침
    useEffect(() => {
        if (settings.autoRefresh && settings.dataMode === 'online') {
            const interval = setInterval(() => {
                loadData(true);
            }, settings.refreshInterval * 60 * 1000);

            return () => clearInterval(interval);
        }
    }, [settings.autoRefresh, settings.refreshInterval, settings.dataMode, loadData]);

    // 설정 업데이트 함수들
    const updateSettings = useCallback((updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    }, []);

    const setDataMode = useCallback((mode) => {
        setSettings(prev => ({ ...prev, dataMode: mode }));
    }, []);

    const setApiKey = useCallback((service, key) => {
        setSettings(prev => ({
            ...prev,
            apiKeys: { ...prev.apiKeys, [service]: key },
        }));
    }, []);

    const toggleAutoRefresh = useCallback(() => {
        setSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
    }, []);

    // API 연결 테스트
    const testApiConnection = useCallback(async (service) => {
        const key = settings.apiKeys[service];
        if (!key) return { success: false, message: 'API 키가 없습니다.' };

        try {
            const result = await apiService.testConnection(service, key);
            return result;
        } catch (err) {
            return { success: false, message: err.message };
        }
    }, [settings.apiKeys]);

    // 컨텍스트 값
    const value = useMemo(() => ({
        // 데이터
        data,
        isLoading,
        error,
        lastUpdated,

        // 설정
        settings,
        isOffline: settings.dataMode === 'offline',
        isOnline: settings.dataMode === 'online',

        // 액션
        loadData,
        updateSettings,
        setDataMode,
        setApiKey,
        toggleAutoRefresh,
        testApiConnection,
    }), [data, isLoading, error, lastUpdated, settings, loadData, updateSettings, setDataMode, setApiKey, toggleAutoRefresh, testApiConnection]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

// 커스텀 훅
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

// 개별 데이터 훅들
export const useHistoricalData = () => {
    const { data, isLoading } = useData();
    return { data: data.historical, isLoading };
};

export const useInterestRates = () => {
    const { data, isLoading } = useData();
    return { data: data.interestRates, isLoading };
};

export const useRegionalData = () => {
    const { data, isLoading } = useData();
    return { data: data.regional, isLoading };
};

export const useTransactionData = () => {
    const { data, isLoading } = useData();
    return { data: data.transactions, isLoading };
};

export default DataContext;
