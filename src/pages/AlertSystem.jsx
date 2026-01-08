import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Bell, Plus, Trash2, Edit2, Save, X, AlertTriangle,
    TrendingUp, TrendingDown, Percent, Clock, Settings,
    BellRing, BellOff, Volume2
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

function AlertSystem() {
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [activeTab, setActiveTab] = useState('settings');
    const [formData, setFormData] = useState({
        name: '', type: 'price', region: '서울',
        condition: 'increase', threshold: 5, enabled: true
    });

    useEffect(() => {
        if ('Notification' in window) setNotificationPermission(Notification.permission);
    }, []);

    useEffect(() => {
        const savedAlerts = localStorage.getItem('alert_settings');
        const savedNotifications = localStorage.getItem('alert_notifications');
        if (savedAlerts) try { setAlerts(JSON.parse(savedAlerts)); } catch (e) { }
        if (savedNotifications) try { setNotifications(JSON.parse(savedNotifications)); } catch (e) { }
    }, []);

    useEffect(() => { localStorage.setItem('alert_settings', JSON.stringify(alerts)); }, [alerts]);
    useEffect(() => { localStorage.setItem('alert_notifications', JSON.stringify(notifications)); }, [notifications]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                new Notification('알림 설정 완료', { body: '이제 부동산 관련 알림을 받을 수 있습니다.' });
            }
        }
    };

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({ name: '', type: 'price', region: '서울', condition: 'increase', threshold: 5, enabled: true });
        setIsAdding(false);
        setEditingId(null);
    }, []);

    const handleSave = useCallback(() => {
        if (!formData.name) { alert('알림명을 입력해주세요.'); return; }
        const newAlert = { id: editingId || Date.now(), ...formData, threshold: Number(formData.threshold) || 0 };
        if (editingId) setAlerts(prev => prev.map(a => a.id === editingId ? { ...a, ...newAlert } : a));
        else setAlerts(prev => [...prev, newAlert]);
        resetForm();
    }, [formData, editingId, resetForm]);

    const handleEdit = useCallback((alert) => {
        setFormData({ name: alert.name, type: alert.type, region: alert.region, condition: alert.condition, threshold: alert.threshold, enabled: alert.enabled });
        setEditingId(alert.id);
        setIsAdding(true);
    }, []);

    const handleDelete = useCallback((id) => { if (confirm('정말 삭제하시겠습니까?')) setAlerts(prev => prev.filter(a => a.id !== id)); }, []);
    const toggleAlert = useCallback((id) => { setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)); }, []);
    const clearNotifications = useCallback(() => { setNotifications([]); localStorage.removeItem('alert_notifications'); }, []);

    const generateDemoNotification = useCallback(() => {
        const demos = [
            { type: 'price', title: '서울 아파트 가격 상승', message: '서울 아파트 평균 가격이 전월 대비 2.5% 상승했습니다.', severity: 'warning' },
            { type: 'rate', title: '기준금리 동결', message: '한국은행 기준금리가 3.50%로 동결되었습니다.', severity: 'info' },
            { type: 'policy', title: 'LTV 규제 완화', message: '정부가 LTV 규제를 70%에서 80%로 완화할 예정입니다.', severity: 'success' }
        ];
        const demo = demos[Math.floor(Math.random() * demos.length)];
        const newNotif = { id: Date.now(), ...demo, timestamp: new Date().toISOString(), read: false };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
        if (notificationPermission === 'granted') new Notification(demo.title, { body: demo.message });
    }, [notificationPermission]);

    const alertTypes = [{ value: 'price', label: '가격 변동', icon: TrendingUp }, { value: 'rate', label: '금리 변동', icon: Percent }, { value: 'policy', label: '정책 변경', icon: AlertTriangle }, { value: 'transaction', label: '거래량 변동', icon: TrendingDown }];
    const regions = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
    const conditions = [{ value: 'increase', label: '상승 시' }, { value: 'decrease', label: '하락 시' }, { value: 'change', label: '변동 시' }];
    const activeAlerts = useMemo(() => alerts.filter(a => a.enabled), [alerts]);
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><Bell size={28} /> 알림 시스템</h1>
                    <p className="page-subtitle">부동산 시장 변동 알림을 설정하고 관리하세요</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={generateDemoNotification}><BellRing size={18} /> 테스트 알림</button>
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}><Plus size={18} /> 알림 추가</button>
                </div>
            </div>

            {notificationPermission !== 'granted' && (
                <div className="glass-card" style={{ padding: 16, marginBottom: 24, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <BellOff size={24} style={{ color: 'var(--color-warning)' }} />
                            <div><strong>브라우저 알림이 비활성화되어 있습니다</strong><p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>실시간 알림을 받으려면 브라우저 알림을 허용해주세요.</p></div>
                        </div>
                        <button className="btn btn-primary" onClick={requestNotificationPermission}><Volume2 size={16} /> 알림 허용</button>
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header"><h2>{editingId ? '알림 수정' : '새 알림 추가'}</h2><button className="btn-icon" onClick={resetForm}><X size={20} /></button></div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group"><label>알림명 *</label><input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="예: 강남 아파트 가격 상승 알림" /></div>
                            <div className="form-group"><label>알림 유형</label><select value={formData.type} onChange={e => handleInputChange('type', e.target.value)}>{alertTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                            <div className="form-group"><label>지역</label><select value={formData.region} onChange={e => handleInputChange('region', e.target.value)}>{regions.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group"><label>조건</label><select value={formData.condition} onChange={e => handleInputChange('condition', e.target.value)}>{conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                                <div className="form-group"><label>임계값 (%)</label><input type="number" value={formData.threshold} onChange={e => handleInputChange('threshold', e.target.value)} min="0" step="0.1" /></div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={resetForm}>취소</button><button className="btn btn-primary" onClick={handleSave}><Save size={16} /> 저장</button></div>
                    </div>
                </div>
            )}

            <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTab === 'settings' ? 'var(--color-primary)' : 'var(--color-bg-secondary)', color: activeTab === 'settings' ? 'white' : 'var(--color-text-primary)', cursor: 'pointer' }}><Settings size={16} style={{ marginRight: 8 }} />알림 설정 ({alerts.length})</button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-bg-secondary)', color: activeTab === 'history' ? 'white' : 'var(--color-text-primary)', cursor: 'pointer', position: 'relative' }}><Bell size={16} style={{ marginRight: 8 }} />알림 히스토리{unreadCount > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{unreadCount}</span>}</button>
            </div>

            {activeTab === 'settings' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={20} /> 활성 알림: {activeAlerts.length}개</h3>
                    {alerts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {alerts.map(alert => {
                                const TypeIcon = alertTypes.find(t => t.value === alert.type)?.icon || Bell;
                                return (
                                    <div key={alert.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12, opacity: alert.enabled ? 1 : 0.5 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TypeIcon size={20} color="white" /></div>
                                            <div><div style={{ fontWeight: 600 }}>{alert.name}</div><div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{alert.region} | {alertTypes.find(t => t.value === alert.type)?.label} | {conditions.find(c => c.value === alert.condition)?.label} {alert.threshold}%</div></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button className="btn-icon" onClick={() => toggleAlert(alert.id)} style={{ color: alert.enabled ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>{alert.enabled ? <BellRing size={18} /> : <BellOff size={18} />}</button>
                                            <button className="btn-icon" onClick={() => handleEdit(alert)}><Edit2 size={16} /></button>
                                            <button className="btn-icon" onClick={() => handleDelete(alert.id)} style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}><Bell size={48} style={{ marginBottom: 16, opacity: 0.5 }} /><p>설정된 알림이 없습니다.</p><button className="btn btn-primary" onClick={() => setIsAdding(true)} style={{ marginTop: 16 }}><Plus size={16} /> 첫 알림 추가하기</button></div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={20} /> 최근 알림</h3>{notifications.length > 0 && <button className="btn btn-secondary" onClick={clearNotifications} style={{ fontSize: 13 }}><Trash2 size={14} /> 모두 삭제</button>}</div>
                    {notifications.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {notifications.map(notif => (
                                <div key={notif.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: notif.read ? 'var(--color-bg-secondary)' : 'rgba(99, 102, 241, 0.1)', borderRadius: 12, borderLeft: `3px solid ${notif.severity === 'warning' ? 'var(--color-warning)' : notif.severity === 'success' ? 'var(--color-success)' : 'var(--color-primary)'}` }} onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: notif.severity === 'warning' ? 'var(--color-warning)' : notif.severity === 'success' ? 'var(--color-success)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{notif.type === 'price' ? <TrendingUp size={18} color="white" /> : notif.type === 'rate' ? <Percent size={18} color="white" /> : <AlertTriangle size={18} color="white" />}</div>
                                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, marginBottom: 4 }}>{notif.title}</div><div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{notif.message}</div><div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{formatDate(notif.timestamp, 'full')}</div></div>
                                    {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}><BellOff size={48} style={{ marginBottom: 16, opacity: 0.5 }} /><p>알림 히스토리가 없습니다.</p></div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AlertSystem;
