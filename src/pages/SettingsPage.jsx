import { useState } from 'react';
import {
    Settings, Wifi, WifiOff, Key, TestTube, Check, X,
    RefreshCw, Clock, Database, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatDate } from '../utils/formatters';

/**
 * 설정 페이지 - API 연동 및 데이터 모드 설정
 */
const SettingsPage = () => {
    const {
        settings,
        isOffline,
        lastUpdated,
        setDataMode,
        setApiKey,
        toggleAutoRefresh,
        loadData,
        testApiConnection,
        isLoading,
        error,
    } = useData();

    const [testResults, setTestResults] = useState({});
    const [isTesting, setIsTesting] = useState({});
    const [showApiKey, setShowApiKey] = useState({});

    const apiServices = [
        {
            id: 'kosis',
            name: 'KOSIS (통계청)',
            description: '주택가격지수, 물가지수, 인구 통계',
            url: 'https://kosis.kr/openapi/',
        },
        {
            id: 'bok',
            name: '한국은행 ECOS',
            description: '기준금리, GDP, M2 통화량, 환율',
            url: 'https://ecos.bok.or.kr/api/',
        },
        {
            id: 'reb',
            name: '한국부동산원',
            description: '주택가격동향, 전세가격, 거래현황',
            url: 'https://www.reb.or.kr/',
        },
        {
            id: 'molit',
            name: '국토교통부',
            description: '아파트 실거래가 데이터',
            url: 'https://www.data.go.kr/',
        },
    ];

    const handleTestConnection = async (serviceId) => {
        setIsTesting(prev => ({ ...prev, [serviceId]: true }));
        setTestResults(prev => ({ ...prev, [serviceId]: null }));

        try {
            const result = await testApiConnection(serviceId);
            setTestResults(prev => ({ ...prev, [serviceId]: result }));
        } catch (err) {
            setTestResults(prev => ({
                ...prev,
                [serviceId]: { success: false, message: err.message }
            }));
        } finally {
            setIsTesting(prev => ({ ...prev, [serviceId]: false }));
        }
    };

    const hasAnyApiKey = Object.values(settings.apiKeys).some(key => key);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Settings size={20} style={{ color: 'var(--color-primary)' }} />
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>설정</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                            데이터 소스 및 API 연동 설정
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Main Settings */}
                <div>
                    {/* Data Mode Toggle */}
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 className="card-title" style={{ marginBottom: 16 }}>데이터 모드</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {/* Offline Mode */}
                            <div
                                onClick={() => setDataMode('offline')}
                                style={{
                                    padding: 20,
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${isOffline ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: isOffline ? 'var(--color-primary-light)' : 'var(--color-bg-tertiary)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-md)',
                                        background: isOffline ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isOffline ? 'white' : 'var(--color-text-tertiary)',
                                    }}>
                                        <WifiOff size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600 }}>오프라인 모드</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                            시뮬레이션 데이터
                                        </p>
                                    </div>
                                </div>
                                <ul style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--color-text-secondary)',
                                    paddingLeft: 16,
                                    margin: 0,
                                }}>
                                    <li>API 키 불필요</li>
                                    <li>즉시 사용 가능</li>
                                    <li>2000~2024년 시뮬레이션 데이터</li>
                                </ul>
                            </div>

                            {/* Online Mode */}
                            <div
                                onClick={() => hasAnyApiKey && setDataMode('online')}
                                style={{
                                    padding: 20,
                                    borderRadius: 'var(--radius-md)',
                                    border: `2px solid ${!isOffline ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background: !isOffline ? 'var(--color-primary-light)' : 'var(--color-bg-tertiary)',
                                    cursor: hasAnyApiKey ? 'pointer' : 'not-allowed',
                                    opacity: hasAnyApiKey ? 1 : 0.6,
                                    transition: 'all var(--transition-fast)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-md)',
                                        background: !isOffline ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: !isOffline ? 'white' : 'var(--color-text-tertiary)',
                                    }}>
                                        <Wifi size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontWeight: 600 }}>온라인 모드</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                            실시간 API 데이터
                                        </p>
                                    </div>
                                </div>
                                <ul style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--color-text-secondary)',
                                    paddingLeft: 16,
                                    margin: 0,
                                }}>
                                    <li>API 키 필요</li>
                                    <li>실시간 데이터</li>
                                    <li>자동 갱신 지원</li>
                                </ul>
                            </div>
                        </div>

                        {!hasAnyApiKey && (
                            <div style={{
                                marginTop: 16,
                                padding: 12,
                                background: 'var(--color-warning-light)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: '0.8rem',
                                color: 'var(--color-warning)',
                            }}>
                                <AlertTriangle size={16} />
                                온라인 모드를 사용하려면 하나 이상의 API 키를 등록하세요.
                            </div>
                        )}
                    </div>

                    {/* API Keys */}
                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 4 }}>API 키 설정</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 20 }}>
                            각 서비스에서 발급받은 API 키를 입력하세요
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {apiServices.map(service => {
                                const currentKey = settings.apiKeys[service.id] || '';
                                const testResult = testResults[service.id];
                                const testing = isTesting[service.id];
                                const showing = showApiKey[service.id];

                                return (
                                    <div key={service.id} style={{
                                        padding: 16,
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>
                                                    {service.name}
                                                </h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                                    {service.description}
                                                </p>
                                            </div>
                                            <a
                                                href={service.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-ghost"
                                                style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                                            >
                                                <ExternalLink size={12} />
                                                키 발급
                                            </a>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <input
                                                    type={showing ? 'text' : 'password'}
                                                    value={currentKey}
                                                    onChange={(e) => setApiKey(service.id, e.target.value)}
                                                    placeholder="API 키를 입력하세요"
                                                    className="input"
                                                />
                                                <button
                                                    onClick={() => setShowApiKey(prev => ({ ...prev, [service.id]: !prev[service.id] }))}
                                                    style={{
                                                        position: 'absolute',
                                                        right: 8,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--color-text-tertiary)',
                                                    }}
                                                >
                                                    {showing ? '숨기기' : '보기'}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleTestConnection(service.id)}
                                                className="btn btn-secondary"
                                                disabled={!currentKey || testing}
                                            >
                                                {testing ? (
                                                    <RefreshCw size={14} className="spin" />
                                                ) : (
                                                    <TestTube size={14} />
                                                )}
                                                테스트
                                            </button>
                                        </div>

                                        {testResult && (
                                            <div style={{
                                                marginTop: 8,
                                                padding: '8px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: testResult.success ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                                                color: testResult.success ? 'var(--color-success)' : 'var(--color-danger)',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}>
                                                {testResult.success ? <Check size={14} /> : <X size={14} />}
                                                {testResult.message}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Status Card */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 className="card-title" style={{ marginBottom: 16 }}>현재 상태</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>모드</span>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    background: isOffline ? 'var(--color-bg-tertiary)' : 'var(--color-success-light)',
                                    color: isOffline ? 'var(--color-text-secondary)' : 'var(--color-success)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}>
                                    {isOffline ? <WifiOff size={12} /> : <Wifi size={12} />}
                                    {isOffline ? '오프라인' : '온라인'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>마지막 업데이트</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    {lastUpdated ? formatDate(lastUpdated) : '-'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>등록된 API</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    {Object.values(settings.apiKeys).filter(k => k).length}/4
                                </span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: 16 }}
                            onClick={() => loadData(true)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <><RefreshCw size={16} className="spin" /> 로딩 중...</>
                            ) : (
                                <><RefreshCw size={16} /> 데이터 새로고침</>
                            )}
                        </button>

                        {error && (
                            <div style={{
                                marginTop: 12,
                                padding: 12,
                                background: 'var(--color-danger-light)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                color: 'var(--color-danger)',
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Auto Refresh */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>자동 새로고침</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                    {settings.refreshInterval}분마다 데이터 갱신
                                </p>
                            </div>
                            <button
                                onClick={toggleAutoRefresh}
                                style={{
                                    width: 48,
                                    height: 26,
                                    borderRadius: 13,
                                    border: 'none',
                                    background: settings.autoRefresh ? 'var(--color-primary)' : 'var(--color-border)',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'background var(--transition-fast)',
                                }}
                            >
                                <span style={{
                                    position: 'absolute',
                                    top: 3,
                                    left: settings.autoRefresh ? 25 : 3,
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left var(--transition-fast)',
                                    boxShadow: 'var(--shadow-sm)',
                                }} />
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{
                        padding: 16,
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-tertiary)',
                        lineHeight: 1.6,
                    }}>
                        <strong style={{ color: 'var(--color-text-secondary)' }}>💡 안내</strong>
                        <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                            <li>API 키는 각 기관 홈페이지에서 무료로 발급받을 수 있습니다.</li>
                            <li>온라인 모드에서 API 호출 실패 시 자동으로 시뮬레이션 데이터로 대체됩니다.</li>
                            <li>일부 API는 호출 횟수 제한이 있을 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
        </div>
    );
};

export default SettingsPage;
