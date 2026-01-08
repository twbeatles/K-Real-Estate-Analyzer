import { useState, useMemo } from 'react';
import { FileDown, FileSpreadsheet, FileText, Image, Download, Check, AlertCircle } from 'lucide-react';
import { generateHistoricalData, generateRegionalData, generateTransactionData } from '../data';
import { formatNumber } from '../utils/formatters';

/**
 * 데이터 내보내기 페이지
 */
const DataExport = () => {
    const [selectedDatasets, setSelectedDatasets] = useState(['historical']);
    const [format, setFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const historicalData = useMemo(() => generateHistoricalData(), []);
    const regionalData = useMemo(() => generateRegionalData(), []);
    const transactionData = useMemo(() => generateTransactionData(), []);

    const datasets = [
        {
            id: 'historical',
            name: '주택가격지수 (월별)',
            description: '2000~2024년 월별 HPI, CPI 데이터',
            rows: historicalData.length,
            columns: 8,
        },
        {
            id: 'regional',
            name: '지역별 현황',
            description: '17개 시도별 현재 지수, 변화율, 거래량',
            rows: regionalData.length,
            columns: 6,
        },
        {
            id: 'transaction',
            name: '거래량 추이',
            description: '2015~2024년 월별 거래량 데이터',
            rows: transactionData.length,
            columns: 4,
        },
    ];

    const formats = [
        { id: 'csv', name: 'CSV', icon: FileSpreadsheet, description: '엑셀 호환' },
        { id: 'json', name: 'JSON', icon: FileText, description: '개발자용' },
        { id: 'xlsx', name: 'Excel', icon: FileSpreadsheet, description: '엑셀 파일' },
    ];

    const toggleDataset = (id) => {
        setSelectedDatasets(prev =>
            prev.includes(id)
                ? prev.filter(d => d !== id)
                : [...prev, id]
        );
    };

    const convertToCSV = (data, headers) => {
        const headerRow = headers.join(',');
        const dataRows = data.map(row =>
            headers.map(h => {
                const val = row[h];
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            }).join(',')
        );
        return [headerRow, ...dataRows].join('\n');
    };

    const handleExport = () => {
        setIsExporting(true);

        setTimeout(() => {
            selectedDatasets.forEach(datasetId => {
                let data, filename, content;

                switch (datasetId) {
                    case 'historical':
                        data = historicalData;
                        filename = 'housing_price_index';
                        break;
                    case 'regional':
                        data = regionalData;
                        filename = 'regional_data';
                        break;
                    case 'transaction':
                        data = transactionData;
                        filename = 'transaction_volume';
                        break;
                    default:
                        return;
                }

                if (format === 'csv') {
                    const headers = Object.keys(data[0]);
                    content = convertToCSV(data, headers);
                    downloadFile(content, `${filename}.csv`, 'text/csv');
                } else if (format === 'json') {
                    content = JSON.stringify(data, null, 2);
                    downloadFile(content, `${filename}.json`, 'application/json');
                }
            });

            setIsExporting(false);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        }, 1000);
    };

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalRows = selectedDatasets.reduce((acc, id) => {
        const dataset = datasets.find(d => d.id === id);
        return acc + (dataset ? dataset.rows : 0);
    }, 0);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileDown size={20} style={{ color: 'var(--color-primary)' }} />
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>데이터 내보내기</h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                            분석 데이터를 다양한 형식으로 다운로드하세요
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Dataset Selection */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>데이터셋 선택</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {datasets.map(dataset => {
                            const isSelected = selectedDatasets.includes(dataset.id);

                            return (
                                <div
                                    key={dataset.id}
                                    onClick={() => toggleDataset(dataset.id)}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
                                        background: isSelected ? 'var(--color-primary-light)' : undefined,
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 'var(--radius-sm)',
                                            border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            background: isSelected ? 'var(--color-primary)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            flexShrink: 0,
                                        }}>
                                            {isSelected && <Check size={14} />}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>
                                                {dataset.name}
                                            </h4>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                                {dataset.description}
                                            </p>
                                        </div>

                                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            <div>{formatNumber(dataset.rows)} 행</div>
                                            <div>{dataset.columns} 열</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Export Options */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>파일 형식</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {formats.map(f => {
                                const Icon = f.icon;
                                const isSelected = format === f.id;

                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => setFormat(f.id)}
                                        className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                                        style={{
                                            justifyContent: 'flex-start',
                                            padding: '12px 16px',
                                            opacity: f.id === 'xlsx' ? 0.5 : 1,
                                        }}
                                        disabled={f.id === 'xlsx'}
                                    >
                                        <Icon size={18} />
                                        <div style={{ textAlign: 'left', marginLeft: 8 }}>
                                            <div style={{ fontWeight: 600 }}>{f.name}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                {f.description}
                                                {f.id === 'xlsx' && ' (준비 중)'}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>내보내기 요약</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>선택된 데이터셋</span>
                                <span style={{ fontWeight: 600 }}>{selectedDatasets.length}개</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>총 데이터 행</span>
                                <span style={{ fontWeight: 600 }}>{formatNumber(totalRows)}행</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>파일 형식</span>
                                <span style={{ fontWeight: 600 }}>{format.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                        onClick={handleExport}
                        disabled={selectedDatasets.length === 0 || isExporting}
                    >
                        {isExporting ? (
                            <>처리 중...</>
                        ) : exportSuccess ? (
                            <><Check size={18} /> 다운로드 완료!</>
                        ) : (
                            <><Download size={18} /> 다운로드</>
                        )}
                    </button>

                    {selectedDatasets.length === 0 && (
                        <div style={{
                            marginTop: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: 12,
                            background: 'var(--color-warning-light)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8rem',
                            color: 'var(--color-warning)',
                        }}>
                            <AlertCircle size={16} />
                            하나 이상의 데이터셋을 선택하세요
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div style={{
                marginTop: 24,
                padding: 16,
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--color-text-tertiary)',
            }}>
                💡 다운로드된 데이터는 분석, 리포트 작성, 시각화 등에 활용하실 수 있습니다.
                현재 시뮬레이션 데이터가 제공되며, API 연동 시 실제 데이터로 대체됩니다.
            </div>
        </div>
    );
};

export default DataExport;
