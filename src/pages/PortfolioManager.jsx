import { useState, useMemo, useEffect, useCallback } from 'react';
import {
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    Briefcase, Plus, Trash2, Edit2, Save, X, Home, Building2,
    TrendingUp, TrendingDown, DollarSign, MapPin, Calendar,
    PiggyBank, Target, RefreshCw, Download, Upload
} from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';
import { logger } from '../utils/logger';

// 포트폴리오 관리 페이지
function PortfolioManager() {
    const [properties, setProperties] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
    const [isInitialized, setIsInitialized] = useState(false); // 초기 로드 완료 플래그
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        type: 'apartment',
        purchasePrice: '',
        currentPrice: '',
        loanAmount: '',
        purchaseDate: '',
        area: '',
        notes: ''
    });

    // LocalStorage에서 불러오기
    useEffect(() => {
        const saved = localStorage.getItem('portfolio_properties');
        if (saved) {
            try {
                setProperties(JSON.parse(saved));
            } catch (e) {
                logger.error('포트폴리오 데이터 로드 실패:', e);
            }
        }
        setIsInitialized(true); // 초기 로드 완료 표시
    }, []);

    // LocalStorage에 저장 (초기화 완료 후에만 저장 - race condition 방지)
    useEffect(() => {
        if (!isInitialized) return; // 초기 로드 전에는 저장하지 않음

        if (properties.length > 0) {
            localStorage.setItem('portfolio_properties', JSON.stringify(properties));
        } else {
            // 빈 배열일 경우 localStorage에서 제거
            localStorage.removeItem('portfolio_properties');
        }
    }, [properties, isInitialized]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            name: '', address: '', type: 'apartment',
            purchasePrice: '', currentPrice: '', loanAmount: '',
            purchaseDate: '', area: '', notes: ''
        });
        setIsAdding(false);
        setEditingId(null);
    }, []);

    const handleSave = useCallback(() => {
        if (!formData.name || !formData.purchasePrice) {
            alert('물건명과 매입가는 필수입니다.');
            return;
        }

        // 입력값 검증 강화
        const purchasePrice = Number(formData.purchasePrice);
        const currentPrice = Number(formData.currentPrice);
        const loanAmount = Number(formData.loanAmount);
        const area = Number(formData.area);

        if (purchasePrice < 0 || currentPrice < 0 || loanAmount < 0 || area < 0) {
            alert('금액과 면적은 음수일 수 없습니다.');
            return;
        }

        if (purchasePrice > 10000000000) { // 100억 이상
            alert('매입가가 너무 큽니다. 단위를 확인해주세요 (만원)');
            return;
        }

        const newProperty = {
            id: editingId || Date.now(),
            ...formData,
            purchasePrice: Number(formData.purchasePrice) || 0,
            currentPrice: Number(formData.currentPrice) || Number(formData.purchasePrice) || 0,
            loanAmount: Number(formData.loanAmount) || 0,
            area: Number(formData.area) || 0,
            createdAt: editingId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (editingId) {
            setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...newProperty } : p));
        } else {
            setProperties(prev => [...prev, newProperty]);
        }
        resetForm();
    }, [formData, editingId, resetForm]);

    const handleEdit = useCallback((property) => {
        setFormData({
            name: property.name,
            address: property.address,
            type: property.type,
            purchasePrice: property.purchasePrice,
            currentPrice: property.currentPrice,
            loanAmount: property.loanAmount,
            purchaseDate: property.purchaseDate,
            area: property.area,
            notes: property.notes || ''
        });
        setEditingId(property.id);
        setIsAdding(true);
    }, []);

    const handleDeleteClick = useCallback((property) => {
        setDeleteConfirm({ isOpen: true, id: property.id, name: property.name });
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        setProperties(prev => {
            const updated = prev.filter(p => p.id !== deleteConfirm.id);
            return updated;
        });
        setDeleteConfirm({ isOpen: false, id: null, name: '' });
    }, [deleteConfirm.id]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirm({ isOpen: false, id: null, name: '' });
    }, []);

    // 포트폴리오 데이터 내보내기
    const handleExport = useCallback(() => {
        if (properties.length === 0) {
            alert('내보낼 자산이 없습니다.');
            return;
        }
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            properties,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [properties]);

    // 포트폴리오 데이터 가져오기
    const handleImport = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.properties && Array.isArray(data.properties)) {
                    const confirmImport = confirm(
                        `${data.properties.length}개의 자산을 가져오시겠습니까?\n기존 데이터는 유지됩니다.`
                    );
                    if (confirmImport) {
                        setProperties(prev => {
                            // 중복 ID 방지를 위해 새 ID 부여
                            const newProperties = data.properties.map(p => ({
                                ...p,
                                id: Date.now() + Math.random(),
                                importedAt: new Date().toISOString(),
                            }));
                            return [...prev, ...newProperties];
                        });
                    }
                } else {
                    alert('올바른 포트폴리오 파일 형식이 아닙니다.');
                }
            } catch (err) {
                logger.error('포트폴리오 가져오기 실패:', err);
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // 같은 파일 다시 선택 가능하도록
    }, []);

    // 통계 계산
    const stats = useMemo(() => {
        const totalPurchase = properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
        const totalCurrent = properties.reduce((sum, p) => sum + (p.currentPrice || 0), 0);
        const totalLoan = properties.reduce((sum, p) => sum + (p.loanAmount || 0), 0);
        const totalEquity = totalCurrent - totalLoan;
        const totalGain = totalCurrent - totalPurchase;
        const returnRate = totalPurchase > 0 ? (totalGain / totalPurchase) * 100 : 0;

        return { totalPurchase, totalCurrent, totalLoan, totalEquity, totalGain, returnRate };
    }, [properties]);

    // 유형별 분포
    const typeDistribution = useMemo(() => {
        const types = { apartment: '아파트', officetel: '오피스텔', villa: '빌라', land: '토지', commercial: '상가' };
        const dist = properties.reduce((acc, p) => {
            acc[p.type] = (acc[p.type] || 0) + (p.currentPrice || 0);
            return acc;
        }, {});
        return Object.entries(dist).map(([key, value]) => ({
            name: types[key] || key,
            value,
            color: { apartment: '#6366f1', officetel: '#8b5cf6', villa: '#ec4899', land: '#10b981', commercial: '#f59e0b' }[key]
        }));
    }, [properties]);

    // 지역별 분포
    const regionDistribution = useMemo(() => {
        const dist = properties.reduce((acc, p) => {
            const region = p.address?.split(' ')[0] || '기타';
            acc[region] = (acc[region] || 0) + (p.currentPrice || 0);
            return acc;
        }, {});
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
        return Object.entries(dist).map(([name, value], i) => ({
            name, value, color: colors[i % colors.length]
        }));
    }, [properties]);

    // 가치 변화 히스토리 (시뮬레이션 - 안정적 패턴 사용)
    const valueHistory = useMemo(() => {
        if (properties.length === 0) return [];
        const months = [];
        const now = new Date();

        // 시드 기반 패턴으로 일관성 있는 데이터 생성
        const seed = properties.reduce((acc, p) => acc + (p.purchasePrice || 0), 0);
        const patterns = [0.98, 1.01, 0.99, 1.02, 1.00, 1.01, 0.99, 1.03, 1.01, 1.02, 1.00, 1.01];

        let cumulativeFactor = 1;
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const patternIdx = (11 - i + Math.floor(seed / 10000)) % patterns.length;
            cumulativeFactor *= patterns[patternIdx];
            months.push({
                month,
                value: Math.round(stats.totalCurrent * cumulativeFactor),
                equity: Math.round(stats.totalEquity * cumulativeFactor)
            });
        }
        return months;
    }, [properties, stats]);

    const propertyTypes = [
        { value: 'apartment', label: '아파트' },
        { value: 'officetel', label: '오피스텔' },
        { value: 'villa', label: '빌라/다세대' },
        { value: 'land', label: '토지' },
        { value: 'commercial', label: '상가/오피스' }
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <Briefcase size={28} />
                        포트폴리오 관리
                    </h1>
                    <p className="page-subtitle">보유 부동산 자산을 관리하고 수익률을 추적하세요</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={handleExport}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        disabled={properties.length === 0}
                        title="포트폴리오 내보내기"
                    >
                        <Download size={16} />
                        내보내기
                    </button>
                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} title="포트폴리오 가져오기">
                        <Upload size={16} />
                        가져오기
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                    <button
                        className="btn btn-primary"
                        onClick={() => setIsAdding(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <Plus size={18} />
                        자산 추가
                    </button>
                </div>
            </div>

            {/* 자산 추가/수정 모달 */}
            {isAdding && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <div className="modal-header">
                            <h2>{editingId ? '자산 수정' : '새 자산 추가'}</h2>
                            <button className="btn-icon" onClick={resetForm}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>물건명 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                    placeholder="예: 강남구 래미안"
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>주소</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => handleInputChange('address', e.target.value)}
                                    placeholder="예: 서울시 강남구 삼성동"
                                />
                            </div>
                            <div className="form-group">
                                <label>유형</label>
                                <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)}>
                                    {propertyTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>면적 (㎡)</label>
                                <input
                                    type="number"
                                    value={formData.area}
                                    onChange={e => handleInputChange('area', e.target.value)}
                                    placeholder="84"
                                />
                            </div>
                            <div className="form-group">
                                <label>매입가 (만원) *</label>
                                <input
                                    type="number"
                                    value={formData.purchasePrice}
                                    onChange={e => handleInputChange('purchasePrice', e.target.value)}
                                    placeholder="100000"
                                />
                            </div>
                            <div className="form-group">
                                <label>현재 시세 (만원)</label>
                                <input
                                    type="number"
                                    value={formData.currentPrice}
                                    onChange={e => handleInputChange('currentPrice', e.target.value)}
                                    placeholder="120000"
                                />
                            </div>
                            <div className="form-group">
                                <label>대출 잔액 (만원)</label>
                                <input
                                    type="number"
                                    value={formData.loanAmount}
                                    onChange={e => handleInputChange('loanAmount', e.target.value)}
                                    placeholder="50000"
                                />
                            </div>
                            <div className="form-group">
                                <label>취득일</label>
                                <input
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={e => handleInputChange('purchaseDate', e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>메모</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => handleInputChange('notes', e.target.value)}
                                    placeholder="추가 정보를 입력하세요"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={resetForm}>취소</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                <Save size={16} /> 저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 요약 카드 */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 24,
                marginBottom: 32
            }}>
                <div className="stat-card glass-card" style={{ padding: 24 }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', marginBottom: 16 }}>
                        <Home size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label" style={{ marginBottom: 8, display: 'block' }}>보유 자산</span>
                        <span className="stat-value" style={{ fontSize: '1.75rem' }}>{properties.length}건</span>
                    </div>
                </div>
                <div className="stat-card glass-card" style={{ padding: 24 }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', marginBottom: 16 }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label" style={{ marginBottom: 8, display: 'block' }}>총 자산가치</span>
                        <span className="stat-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(stats.totalCurrent)}</span>
                    </div>
                </div>
                <div className="stat-card glass-card" style={{ padding: 24 }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)', marginBottom: 16 }}>
                        <PiggyBank size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label" style={{ marginBottom: 8, display: 'block' }}>순자산 (자산-대출)</span>
                        <span className="stat-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(stats.totalEquity)}</span>
                    </div>
                </div>
                <div className="stat-card glass-card" style={{ padding: 24 }}>
                    <div className="stat-icon" style={{ background: stats.totalGain >= 0 ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)', marginBottom: 16 }}>
                        {stats.totalGain >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                    <div className="stat-content">
                        <span className="stat-label" style={{ marginBottom: 8, display: 'block' }}>총 수익</span>
                        <span className="stat-value" style={{
                            color: stats.totalGain >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                            fontSize: '1.25rem',
                        }}>
                            {formatCurrency(stats.totalGain)}
                            <span style={{
                                marginLeft: 8,
                                fontSize: '0.9rem',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: stats.totalGain >= 0 ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                            }}>
                                {formatPercent(stats.returnRate)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 28, marginBottom: 32 }}>
                {/* 자산 가치 추이 */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                        <TrendingUp size={22} /> 자산 가치 추이
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 12,
                            background: 'var(--color-warning-light)',
                            color: 'var(--color-warning)',
                            fontWeight: 500,
                            marginLeft: 'auto',
                        }}>
                            예상 추이 (시뮬레이션)
                        </span>
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={valueHistory}>
                            <defs>
                                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" />
                            <YAxis tickFormatter={v => formatCompactValue(v)} tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" />
                            <Tooltip formatter={(v) => formatCurrency(v)} />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#valueGradient)" name="총 자산" />
                            <Area type="monotone" dataKey="equity" stroke="#10b981" fill="none" name="순자산" />
                            <Legend />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 유형별 분포 */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                        <Building2 size={22} /> 유형별 분포
                    </h3>
                    {typeDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={typeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {typeDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={v => formatCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                            자산을 추가해주세요
                        </div>
                    )}
                </div>

                {/* 지역별 분포 */}
                <div className="glass-card" style={{ padding: 28 }}>
                    <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                        <MapPin size={22} /> 지역별 분포
                    </h3>
                    {regionDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={regionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {regionDistribution.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={v => formatCurrency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                            자산을 추가해주세요
                        </div>
                    )}
                </div>
            </div>

            {/* 자산 목록 */}
            <div className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                    <Briefcase size={22} /> 보유 자산 목록
                </h3>
                {properties.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>물건명</th>
                                    <th>유형</th>
                                    <th>주소</th>
                                    <th>매입가</th>
                                    <th>현재 시세</th>
                                    <th>대출</th>
                                    <th>수익률</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.map(prop => {
                                    const gain = (prop.currentPrice || 0) - (prop.purchasePrice || 0);
                                    const rate = prop.purchasePrice > 0 ? (gain / prop.purchasePrice) * 100 : 0;
                                    return (
                                        <tr key={prop.id}>
                                            <td style={{ fontWeight: 600 }}>{prop.name}</td>
                                            <td>{propertyTypes.find(t => t.value === prop.type)?.label || prop.type}</td>
                                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.address || '-'}</td>
                                            <td>{formatCurrency(prop.purchasePrice)}</td>
                                            <td>{formatCurrency(prop.currentPrice)}</td>
                                            <td>{formatCurrency(prop.loanAmount)}</td>
                                            <td style={{ color: gain >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                                                {formatPercent(rate)}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="btn-icon" onClick={() => handleEdit(prop)} title="수정">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => handleDeleteClick(prop)} title="삭제" style={{ color: 'var(--color-danger)' }} aria-label={`${prop.name} 삭제`}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state-enhanced">
                        <div className="empty-icon">
                            <Briefcase size={36} />
                        </div>
                        <h3>아직 등록된 자산이 없습니다</h3>
                        <p>
                            부동산 자산을 추가하여 포트폴리오를 관리하고
                            수익률을 실시간으로 추적해보세요.
                        </p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus size={20} />
                            첫 번째 자산 추가하기
                        </button>
                    </div>
                )}
            </div>

            {/* 삭제 확인 모달 */}
            {deleteConfirm.isOpen && (
                <div className="modal-overlay" onClick={handleDeleteCancel}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ padding: '24px 24px 0' }}>
                            <div style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: 'var(--color-danger-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px',
                            }}>
                                <Trash2 size={28} style={{ color: 'var(--color-danger)' }} />
                            </div>
                            <h3 style={{ marginBottom: 8 }}>자산 삭제</h3>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                                <strong>"{deleteConfirm.name}"</strong>을(를) 정말 삭제하시겠습니까?<br />
                                이 작업은 취소할 수 없습니다.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, padding: '0 24px 24px', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={handleDeleteCancel}>
                                취소
                            </button>
                            <button className="btn" onClick={handleDeleteConfirm} style={{ background: 'var(--color-danger)', color: 'white' }}>
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatCompactValue(value) {
    if (value >= 100000) return `${(value / 10000).toFixed(0)}억`;
    if (value >= 10000) return `${(value / 10000).toFixed(1)}억`;
    return `${formatNumber(value)}만`;
}

export default PortfolioManager;
