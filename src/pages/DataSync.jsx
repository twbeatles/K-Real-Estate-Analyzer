import { useState, useMemo, useCallback } from 'react';
import { Download, Upload, FileJson, FileText, Share2, Trash2, RefreshCw, Copy, Check, Link, Database } from 'lucide-react';
import { formatNumber, formatDate } from '../utils/formatters';

function DataSync() {
    const [activeTab, setActiveTab] = useState('export');
    const [exportFormat, setExportFormat] = useState('json');
    const [copied, setCopied] = useState(false);
    const [importStatus, setImportStatus] = useState(null);

    const storageItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            items.push({ key, size: new Blob([value]).size, preview: value.substring(0, 100) });
        }
        return items.sort((a, b) => b.size - a.size);
    }, []);

    const totalSize = useMemo(() => storageItems.reduce((sum, item) => sum + item.size, 0), [storageItems]);

    const getAllData = useCallback(() => {
        const data = {};
        const keys = ['portfolio_properties', 'alert_settings', 'alert_notifications', 'chatbot_messages', 'watchlist_regions', 'saved_simulations', 'user_settings'];
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) try { data[key] = JSON.parse(value); } catch (e) { data[key] = value; }
        });
        return { exportedAt: new Date().toISOString(), version: '1.0', data };
    }, []);

    const handleExport = useCallback(() => {
        const exportData = getAllData();
        let content, filename, mimeType;

        if (exportFormat === 'json') {
            content = JSON.stringify(exportData, null, 2);
            filename = `realestate_backup_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else {
            // CSV 형식 (포트폴리오 데이터만)
            const portfolio = exportData.data.portfolio_properties || [];
            const headers = ['이름', '주소', '유형', '매입가', '현재가', '대출', '취득일'];
            const rows = portfolio.map(p => [p.name, p.address, p.type, p.purchasePrice, p.currentPrice, p.loanAmount, p.purchaseDate]);
            content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            filename = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, [exportFormat, getAllData]);

    const handleImport = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!imported.data) throw new Error('Invalid format');

                Object.entries(imported.data).forEach(([key, value]) => {
                    localStorage.setItem(key, JSON.stringify(value));
                });

                setImportStatus({ success: true, message: `${Object.keys(imported.data).length}개 항목 가져오기 완료!` });
                setTimeout(() => setImportStatus(null), 3000);
            } catch (error) {
                setImportStatus({ success: false, message: '파일 형식이 올바르지 않습니다.' });
                setTimeout(() => setImportStatus(null), 3000);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }, []);

    const generateShareLink = useCallback(() => {
        const data = getAllData();
        const compressed = btoa(JSON.stringify(data.data));
        const url = `${window.location.origin}${window.location.pathname}?import=${compressed.substring(0, 100)}...`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [getAllData]);

    const handleDeleteItem = useCallback((key) => {
        if (confirm(`"${key}" 데이터를 삭제하시겠습니까?`)) {
            localStorage.removeItem(key);
            window.location.reload();
        }
    }, []);

    const handleClearAll = useCallback(() => {
        if (confirm('모든 저장된 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.clear();
            window.location.reload();
        }
    }, []);

    const formatBytes = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    const tabs = [
        { id: 'export', label: '내보내기', icon: <Download size={16} /> },
        { id: 'import', label: '가져오기', icon: <Upload size={16} /> },
        { id: 'share', label: '공유', icon: <Share2 size={16} /> },
        { id: 'storage', label: '저장소 관리', icon: <Database size={16} /> }
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title"><RefreshCw size={28} /> 데이터 동기화</h1>
                    <p className="page-subtitle">데이터 백업, 복원 및 공유</p>
                </div>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-bg-secondary)', color: activeTab === tab.id ? 'white' : 'var(--color-text-primary)', cursor: 'pointer' }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* 내보내기 */}
            {activeTab === 'export' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Download size={20} /> 데이터 내보내기</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>저장된 모든 데이터를 파일로 내보내어 백업하세요.</p>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>형식 선택</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: exportFormat === 'json' ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-secondary)', border: exportFormat === 'json' ? '2px solid var(--color-primary)' : '2px solid transparent', borderRadius: 8, cursor: 'pointer' }}>
                                <input type="radio" name="format" value="json" checked={exportFormat === 'json'} onChange={() => setExportFormat('json')} style={{ display: 'none' }} />
                                <FileJson size={20} /> JSON (전체 데이터)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: exportFormat === 'csv' ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-secondary)', border: exportFormat === 'csv' ? '2px solid var(--color-primary)' : '2px solid transparent', borderRadius: 8, cursor: 'pointer' }}>
                                <input type="radio" name="format" value="csv" checked={exportFormat === 'csv'} onChange={() => setExportFormat('csv')} style={{ display: 'none' }} />
                                <FileText size={20} /> CSV (포트폴리오만)
                            </label>
                        </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Download size={18} /> 파일 다운로드
                    </button>
                </div>
            )}

            {/* 가져오기 */}
            {activeTab === 'import' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Upload size={20} /> 데이터 가져오기</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>백업 파일에서 데이터를 복원합니다. 기존 데이터는 덮어쓰기됩니다.</p>

                    {importStatus && (
                        <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: importStatus.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: importStatus.success ? 'var(--color-success)' : 'var(--color-danger)' }}>
                            {importStatus.message}
                        </div>
                    )}

                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, border: '2px dashed var(--color-border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} onDragOver={e => e.preventDefault()}>
                        <Upload size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <p style={{ marginBottom: 8 }}>클릭하거나 파일을 드래그하세요</p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>JSON 파일만 지원</p>
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                </div>
            )}

            {/* 공유 */}
            {activeTab === 'share' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Share2 size={20} /> 데이터 공유</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>설정과 데이터를 다른 기기로 쉽게 옮길 수 있는 링크를 생성합니다.</p>

                    <div style={{ marginBottom: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Link size={16} />
                            <span style={{ fontWeight: 600 }}>공유 링크 생성</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>* 대용량 데이터는 링크에 포함되지 않을 수 있습니다. 전체 백업은 내보내기를 이용해주세요.</p>
                    </div>

                    <button className="btn btn-primary" onClick={generateShareLink} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {copied ? <><Check size={18} /> 클립보드에 복사됨!</> : <><Copy size={18} /> 공유 링크 복사</>}
                    </button>
                </div>
            )}

            {/* 저장소 관리 */}
            {activeTab === 'storage' && (
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Database size={20} /> 저장소 관리</h3>
                        <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>총 {formatBytes(totalSize)} 사용중</span>
                    </div>

                    {storageItems.length > 0 ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                                {storageItems.map(item => (
                                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.key}</div>
                                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{formatBytes(item.size)}</div>
                                        </div>
                                        <button className="btn-icon" onClick={() => handleDeleteItem(item.key)} style={{ color: 'var(--color-danger)' }}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-danger" onClick={handleClearAll} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-danger)' }}>
                                <Trash2 size={18} /> 모든 데이터 삭제
                            </button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
                            <Database size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <p>저장된 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DataSync;
