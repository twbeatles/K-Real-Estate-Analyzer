import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { MessageCircle, X, Send, Bot, User, Trash2, Minimize2, Maximize2 } from 'lucide-react';

// 응답 템플릿 (컴포넌트 외부 정의 - 렌더링 최적화)
const CHATBOT_RESPONSES = {
    default: '부동산 관련 질문에 답변해 드립니다. 투자, 세금, 시장 동향, 대출 등에 대해 물어보세요!',
    greeting: '안녕하세요! 부동산 분석 AI 어시스턴트입니다. 투자, 세금, 시장 분석 등에 대해 질문해 주세요.',
    price: '현재 서울 아파트 가격은 전년 대비 약 2-3% 상승세를 보이고 있습니다. 지역별로 차이가 있으니, 관심 지역을 구체적으로 말씀해 주시면 더 상세한 정보를 드릴 수 있습니다.',
    invest: '부동산 투자 시 고려해야 할 핵심 요소:\n1. 입지: 교통, 학군, 개발호재\n2. 가격: PIR, 전세가율 분석\n3. 규제: DSR, LTV, 취득세\n4. 수익률: 월세수익률 vs 시세차익\n\n현재 금리 환경을 고려하면 갭투자보다는 실거주 목적 매수가 안정적입니다.',
    tax: '부동산 세금 안내:\n- 취득세: 1-3% (다주택자 최대 12%)\n- 재산세: 0.1-0.4%\n- 종부세: 과세표준 초과 시\n- 양도세: 1년 미만 70%, 2년 이상 기본세율\n\n세금 계산기에서 정확한 금액을 확인하세요!',
    rate: '현재 기준금리는 3.50%이며, 주담대 금리는 4-5% 수준입니다. 금리 인하 기대감이 있으나, 당분간 현 수준이 유지될 전망입니다.',
    loan: '대출 관련 핵심 정보:\n- DSR 규제: 총 상환액이 연소득의 40% 이하\n- LTV: 최대 70% (규제지역)\n- 전세대출: 보증금의 80%까지 가능\n\n대출 시뮬레이터에서 자세한 계산이 가능합니다.',
    jeonse: '전세 시장 분석:\n- 전세가율: 서울 평균 약 55%\n- 전세 vs 월세: 금리 4% 기준, 월세가 더 유리한 경우 있음\n- 전세보증보험: 가입 필수 권장',
    region: '지역별 분석을 원하시면 구체적인 지역명을 말씀해 주세요. 서울, 경기, 인천 등 수도권과 지방 광역시 정보를 제공해 드립니다.',
    outlook: '2025년 부동산 시장 전망:\n- 금리: 하반기 인하 가능성\n- 가격: 수도권 보합~소폭 상승\n- 거래량: 점진적 회복 예상\n- 주의: 급격한 투자보다 관망 권장'
};

// 빠른 질문 목록 (컴포넌트 외부 정의)
const QUICK_QUESTIONS = ['서울 아파트 가격 전망', '부동산 투자 추천', '세금 계산 방법', '대출 한도 확인'];

const AIChatbot = memo(function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('chatbot_messages');
        if (saved) try { setMessages(JSON.parse(saved)); } catch (e) { }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatbot_messages', JSON.stringify(messages));
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateResponse = useCallback(async (userMessage) => {
        // 부동산 관련 키워드 기반 응답
        const msg = userMessage.toLowerCase();

        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

        if (msg.includes('안녕') || msg.includes('hello')) return CHATBOT_RESPONSES.greeting;
        if (msg.includes('가격') || msg.includes('시세') || msg.includes('얼마')) return CHATBOT_RESPONSES.price;
        if (msg.includes('투자') || msg.includes('매수') || msg.includes('사야')) return CHATBOT_RESPONSES.invest;
        if (msg.includes('세금') || msg.includes('취득세') || msg.includes('양도세')) return CHATBOT_RESPONSES.tax;
        if (msg.includes('금리') || msg.includes('이자')) return CHATBOT_RESPONSES.rate;
        if (msg.includes('대출') || msg.includes('dsr') || msg.includes('ltv')) return CHATBOT_RESPONSES.loan;
        if (msg.includes('전세') || msg.includes('월세')) return CHATBOT_RESPONSES.jeonse;
        if (msg.includes('지역') || msg.includes('서울') || msg.includes('경기')) return CHATBOT_RESPONSES.region;
        if (msg.includes('전망') || msg.includes('예측') || msg.includes('2025')) return CHATBOT_RESPONSES.outlook;
        return CHATBOT_RESPONSES.default;
    }, []);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = { id: Date.now(), role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await generateResponse(input.trim());
            const botMessage = { id: Date.now() + 1, role: 'assistant', content: response, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, botMessage]);
        } catch (e) {
            const errorMessage = { id: Date.now() + 1, role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.', timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, generateResponse]);

    const handleKeyPress = useCallback((e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }, [handleSend]);
    const clearMessages = useCallback(() => { setMessages([]); localStorage.removeItem('chatbot_messages'); }, []);

    return (
        <>
            {/* 플로팅 버튼 */}
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} style={{ position: 'fixed', bottom: 24, right: 24, width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)', zIndex: 1000, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                    <MessageCircle size={28} color="white" />
                </button>
            )}

            {/* 챗봇 창 */}
            {isOpen && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, width: isMinimized ? 300 : 380, height: isMinimized ? 60 : 520, background: 'var(--color-bg-primary)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', border: '1px solid var(--color-border)', transition: 'all 0.3s ease' }}>
                    {/* 헤더 */}
                    <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
                            <Bot size={20} />
                            <span style={{ fontWeight: 600 }}>부동산 AI 어시스턴트</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>{isMinimized ? <Maximize2 size={18} color="white" /> : <Minimize2 size={18} color="white" />}</button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="white" /></button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* 메시지 영역 */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 20 }}>
                                        <Bot size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>부동산 관련 질문을 해보세요!</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                                            {QUICK_QUESTIONS.map((q, i) => (
                                                <button key={i} onClick={() => { setInput(q); }} style={{ padding: '6px 12px', borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', cursor: 'pointer', fontSize: 12 }}>{q}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map(msg => (
                                    <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--color-bg-secondary)', color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5 }}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                        <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'var(--color-bg-secondary)' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                {[0, 1, 2].map(i => (<span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-text-secondary)', animation: `bounce 1s infinite ${i * 0.2}s` }} />))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* 입력 영역 */}
                            <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
                                {messages.length > 0 && (<button onClick={clearMessages} style={{ padding: 8, borderRadius: 8, border: 'none', background: 'var(--color-bg-secondary)', cursor: 'pointer' }}><Trash2 size={18} /></button>)}
                                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="질문을 입력하세요..." style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', outline: 'none' }} />
                                <button onClick={handleSend} disabled={!input.trim() || isLoading} style={{ padding: '10px 14px', borderRadius: 20, border: 'none', background: input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--color-bg-tertiary)', cursor: input.trim() ? 'pointer' : 'not-allowed' }}><Send size={18} color="white" /></button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }`}</style>
        </>
    );
});

AIChatbot.displayName = 'AIChatbot';

export default AIChatbot;
