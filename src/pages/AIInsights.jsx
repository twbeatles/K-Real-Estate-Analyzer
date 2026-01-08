import { useState, useMemo, useEffect } from 'react';
import {
    Sparkles, TrendingUp, TrendingDown, AlertTriangle,
    ThumbsUp, ThumbsDown, RefreshCw, Lightbulb, Key,
    Wifi, WifiOff, Cpu
} from 'lucide-react';
import { generateMarketAnalysis, generateSimpleAnalysis, validateOpenAIKey } from '../services/aiService';
import { fetchRealEstateNews } from '../services/newsService';
import { generateHistoricalData, generateInterestRateData } from '../data';

/**
 * AI 인사이트 페이지 - 실시간 AI 분석
 */
const AIInsights = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('overall');
    const [insight, setInsight] = useState(null);
    const [error, setError] = useState(null);
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_key') || '');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [useAI, setUseAI] = useState(false);

    // 시장 데이터 준비
    const marketData = useMemo(() => {
        const historical = generateHistoricalData();
        const rates = generateInterestRateData();
        const latest = historical[historical.length - 1];
        const prevMonth = historical[historical.length - 2];

        return {
            seoulHPI: latest.hpiSeoul,
            nationHPI: latest.hpiNation,
            monthlyChange: ((latest.hpiSeoul - prevMonth.hpiSeoul) / prevMonth.hpiSeoul) * 100,
            interestRate: rates[rates.length - 1].rate,
        };
    }, []);

    const topics = [
        { id: 'overall', label: '종합 분석' },
        { id: 'seoul', label: '서울 시장' },
        { id: 'interest', label: '금리 영향' },
        { id: 'forecast', label: '향후 전망' },
    ];

    // 초기 분석 생성
    useEffect(() => {
        generateAnalysis();
    }, [selectedTopic]);

    // 분석 생성
    const generateAnalysis = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            let result;

            if (useAI && apiKey) {
                // OpenAI API 사용
                result = await generateMarketAnalysis(apiKey, marketData, selectedTopic);
                result.isAI = true;
            } else {
                // 간단 분석 (뉴스 기반)
                const recentNews = await fetchRealEstateNews('all').catch(() => []);
                result = await generateSimpleAnalysis(marketData, recentNews);
                result.isAI = false;
            }

            setInsight(result);
        } catch (err) {
            console.error('분석 생성 실패:', err);
            setError(err.message);

            // 폴백: 간단 분석
            const fallbackResult = await generateSimpleAnalysis(marketData, []);
            setInsight(fallbackResult);
        } finally {
            setIsGenerating(false);
        }
    };

    // API 키 저장
    const saveApiKey = async () => {
        if (!apiKey.trim()) return;

        const isValid = await validateOpenAIKey(apiKey);
        if (isValid) {
            localStorage.setItem('openai_key', apiKey);
            setUseAI(true);
            setShowApiKeyInput(false);
            generateAnalysis();
        } else {
            setError('유효하지 않은 API 키입니다.');
        }
    };

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case 'positive': return 'var(--color-success)';
            case 'negative': return 'var(--color-danger)';
            default: return 'var(--color-warning)';
        }
    };

    const getSentimentLabel = (sentiment) => {
        switch (sentiment) {
            case 'positive': return '긍정적';
            case 'negative': return '부정적';
            default: return '중립적';
        }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>AI 시장 인사이트</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                {useAI ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Cpu size={12} /> GPT-4o 분석
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Wifi size={12} /> 데이터 기반 분석
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                        >
                            <Key size={16} />
                            {useAI ? 'API 설정됨' : 'AI 활성화'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={generateAnalysis}
                            disabled={isGenerating}
                        >
                            <RefreshCw size={16} className={isGenerating ? 'spin' : ''} />
                            {isGenerating ? '분석 중...' : '새 분석'}
                        </button>
                    </div>
                </div>

                {/* API Key Input */}
                {showApiKeyInput && (
                    <div style={{
                        marginTop: 16,
                        padding: 16,
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                            OpenAI API 키를 입력하면 GPT-4o 기반 심층 분석이 제공됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="input"
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-primary" onClick={saveApiKey}>
                                저장
                            </button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                            API 키는 로컬에만 저장됩니다. <a href="https://platform.openai.com/api-keys" target="_blank" style={{ color: 'var(--color-primary)' }}>키 발급 →</a>
                        </p>
                    </div>
                )}
            </div>

            {/* Topic Selection */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {topics.map(topic => (
                    <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`btn ${selectedTopic === topic.id ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '8px 16px' }}
                    >
                        {topic.label}
                    </button>
                ))}
            </div>

            {/* Error Banner */}
            {error && (
                <div style={{
                    marginBottom: 20,
                    padding: 16,
                    background: 'var(--color-danger-light)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                }}>
                    <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-danger)' }}>
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {isGenerating && (
                <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                    <RefreshCw size={40} style={{ color: 'var(--color-primary)', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                    <h3 style={{ fontWeight: 600, marginBottom: 8 }}>분석 생성 중...</h3>
                    <p style={{ color: 'var(--color-text-tertiary)' }}>
                        {useAI ? 'AI가 시장 데이터를 분석하고 있습니다' : '데이터를 기반으로 분석을 생성하고 있습니다'}
                    </p>
                </div>
            )}

            {/* Main Insight Card */}
            {!isGenerating && insight && (
                <div className="card" style={{ marginBottom: 24 }}>
                    {/* Sentiment Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            background: `${getSentimentColor(insight.sentiment)}20`,
                            color: getSentimentColor(insight.sentiment),
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}>
                            {insight.sentiment === 'positive' ? <ThumbsUp size={14} /> :
                                insight.sentiment === 'negative' ? <ThumbsDown size={14} /> :
                                    <AlertTriangle size={14} />}
                            {getSentimentLabel(insight.sentiment)} 전망
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                            {insight.generatedAt ? new Date(insight.generatedAt).toLocaleString('ko-KR') : '방금 전'}
                        </span>
                        {insight.isAI && (
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                            }}>
                                AI 생성
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16, lineHeight: 1.4 }}>
                        {insight.title}
                    </h3>

                    {/* Summary */}
                    <p style={{
                        fontSize: '1rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.8,
                        marginBottom: 24,
                        padding: 20,
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${getSentimentColor(insight.sentiment)}`,
                    }}>
                        {insight.summary}
                    </p>

                    {/* Key Points */}
                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Lightbulb size={18} style={{ color: 'var(--color-warning)' }} />
                            핵심 포인트
                        </h4>
                        <ul style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: 8,
                            padding: 0,
                            margin: 0,
                            listStyle: 'none',
                        }}>
                            {(insight.keyPoints || []).map((point, idx) => (
                                <li
                                    key={idx}
                                    style={{
                                        padding: '12px 16px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 8,
                                    }}
                                >
                                    <span style={{
                                        color: 'var(--color-primary)',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                    }}>
                                        {idx + 1}
                                    </span>
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Risks & Opportunities */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Risks */}
                        <div style={{
                            padding: 20,
                            background: 'var(--color-danger-light)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <h4 style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                marginBottom: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: 'var(--color-danger)',
                            }}>
                                <TrendingDown size={16} />
                                리스크 요인
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {(insight.risks || []).map((risk, idx) => (
                                    <li key={idx} style={{ marginBottom: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                        {risk}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Opportunities */}
                        <div style={{
                            padding: 20,
                            background: 'var(--color-success-light)',
                            borderRadius: 'var(--radius-md)',
                        }}>
                            <h4 style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                marginBottom: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                color: 'var(--color-success)',
                            }}>
                                <TrendingUp size={16} />
                                기회 요인
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {(insight.opportunities || []).map((opp, idx) => (
                                    <li key={idx} style={{ marginBottom: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                        {opp}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Raw AI Response */}
                    {insight.raw && insight.isAI && (
                        <details style={{ marginTop: 20 }}>
                            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                원본 AI 응답 보기
                            </summary>
                            <pre style={{
                                marginTop: 12,
                                padding: 16,
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.75rem',
                                whiteSpace: 'pre-wrap',
                                color: 'var(--color-text-secondary)',
                            }}>
                                {insight.raw}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <div style={{
                padding: 16,
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
            }}>
                <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                    <strong>면책 조항:</strong> 이 분석은 {insight?.isAI ? 'AI' : '데이터 기반 알고리즘'}를 통해 생성되었으며, 투자 조언을 구성하지 않습니다.
                    모든 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.
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

export default AIInsights;
