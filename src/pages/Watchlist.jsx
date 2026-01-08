import { useState, useEffect } from 'react';
import {
    Bell, Plus, Trash2, MapPin, TrendingUp, TrendingDown,
    Settings, Check, X, AlertTriangle, Edit2
} from 'lucide-react';
import { generateRegionalData } from '../data';
import { formatPercent, formatCurrency } from '../utils/formatters';

/**
 * 관심 지역 알림 페이지
 */
const Watchlist = () => {
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem('watchlist');
        return saved ? JSON.parse(saved) : [
            { id: 1, region: 'seoul', name: '서울', targetPrice: 210, alertOnChange: 5 },
            { id: 2, region: 'gyeonggi', name: '경기', targetPrice: 180, alertOnChange: 5 },
        ];
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newItem, setNewItem] = useState({ region: '', targetPrice: 0, alertOnChange: 5 });

    const regions = generateRegionalData();

    useEffect(() => {
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = () => {
        if (!newItem.region) return;

        const region = regions.find(r => r.id === newItem.region);
        if (!region) return;

        const item = {
            id: Date.now(),
            region: newItem.region,
            name: region.name,
            targetPrice: newItem.targetPrice || region.currentIndex,
            alertOnChange: newItem.alertOnChange || 5,
        };

        setWatchlist([...watchlist, item]);
        setNewItem({ region: '', targetPrice: 0, alertOnChange: 5 });
        setShowAddModal(false);
    };

    const removeFromWatchlist = (id) => {
        setWatchlist(watchlist.filter(item => item.id !== id));
    };

    const updateItem = (id, updates) => {
        setWatchlist(watchlist.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
        setEditingId(null);
    };

    const getRegionData = (regionId) => {
        return regions.find(r => r.id === regionId) || null;
    };

    const availableRegions = regions.filter(r =>
        !watchlist.some(w => w.region === r.id)
    );

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Bell size={20} style={{ color: 'var(--color-primary)' }} />
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>관심 지역</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                관심 지역의 가격 변동을 모니터링하세요
                            </p>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                        disabled={availableRegions.length === 0}
                    >
                        <Plus size={16} />
                        지역 추가
                    </button>
                </div>
            </div>

            {/* Watchlist Items */}
            {watchlist.length === 0 ? (
                <div className="empty-state">
                    <Bell className="empty-state-icon" />
                    <h3 className="empty-state-title">관심 지역이 없습니다</h3>
                    <p className="empty-state-desc">관심 있는 지역을 추가하여 가격 변동을 추적하세요</p>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} />
                        지역 추가
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                    {watchlist.map(item => {
                        const regionData = getRegionData(item.region);
                        if (!regionData) return null;

                        const isEditing = editingId === item.id;
                        const priceDiff = regionData.currentIndex - item.targetPrice;
                        const targetReached = priceDiff >= 0;
                        const largeChange = Math.abs(regionData.changeRate) >= item.alertOnChange;

                        return (
                            <div
                                key={item.id}
                                className="card"
                                style={{
                                    borderTop: `3px solid ${regionData.color}`,
                                    position: 'relative',
                                }}
                            >
                                {/* Alerts */}
                                {(targetReached || largeChange) && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        display: 'flex',
                                        gap: 4,
                                    }}>
                                        {targetReached && (
                                            <span className="badge badge-success" title="목표가 도달">
                                                <Check size={12} /> 목표 도달
                                            </span>
                                        )}
                                        {largeChange && (
                                            <span className="badge badge-warning" title="큰 변동">
                                                <AlertTriangle size={12} /> 급변동
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 'var(--radius-md)',
                                        background: `${regionData.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <MapPin size={20} style={{ color: regionData.color }} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{item.name}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                            주택가격지수
                                        </p>
                                    </div>
                                </div>

                                {/* Current Data */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>현재 지수</p>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{regionData.currentIndex.toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>전월 대비</p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            color: regionData.changeRate >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                        }}>
                                            {regionData.changeRate >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                            <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                                {formatPercent(regionData.changeRate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings */}
                                <div style={{
                                    padding: 12,
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 12,
                                }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                                    목표 지수
                                                </label>
                                                <input
                                                    type="number"
                                                    defaultValue={item.targetPrice}
                                                    className="input"
                                                    style={{ marginTop: 4 }}
                                                    id={`target-${item.id}`}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                                    알림 변동폭 (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    defaultValue={item.alertOnChange}
                                                    className="input"
                                                    style={{ marginTop: 4 }}
                                                    id={`alert-${item.id}`}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ flex: 1 }}
                                                    onClick={() => {
                                                        updateItem(item.id, {
                                                            targetPrice: Number(document.getElementById(`target-${item.id}`).value),
                                                            alertOnChange: Number(document.getElementById(`alert-${item.id}`).value),
                                                        });
                                                    }}
                                                >
                                                    <Check size={14} /> 저장
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>목표 지수</p>
                                                <p style={{ fontWeight: 600 }}>{item.targetPrice}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>알림 변동폭</p>
                                                <p style={{ fontWeight: 600 }}>±{item.alertOnChange}%</p>
                                            </div>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => setEditingId(item.id)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        className="btn btn-danger btn-ghost"
                                        style={{ flex: 1 }}
                                        onClick={() => removeFromWatchlist(item.id)}
                                    >
                                        <Trash2 size={14} />
                                        삭제
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                }}>
                    <div className="card" style={{ width: 400, maxWidth: '90%' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 20 }}>
                            관심 지역 추가
                        </h3>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 8 }}>
                                지역 선택
                            </label>
                            <select
                                value={newItem.region}
                                onChange={(e) => {
                                    const region = regions.find(r => r.id === e.target.value);
                                    setNewItem({
                                        ...newItem,
                                        region: e.target.value,
                                        targetPrice: region ? region.currentIndex : 0,
                                    });
                                }}
                                className="input select"
                            >
                                <option value="">선택하세요</option>
                                {availableRegions.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 8 }}>
                                목표 지수
                            </label>
                            <input
                                type="number"
                                value={newItem.targetPrice}
                                onChange={(e) => setNewItem({ ...newItem, targetPrice: Number(e.target.value) })}
                                className="input"
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 8 }}>
                                알림 변동폭 (%)
                            </label>
                            <input
                                type="number"
                                value={newItem.alertOnChange}
                                onChange={(e) => setNewItem({ ...newItem, alertOnChange: Number(e.target.value) })}
                                className="input"
                                min={1}
                                max={50}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={addToWatchlist}
                                disabled={!newItem.region}
                            >
                                추가
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowAddModal(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Watchlist;
