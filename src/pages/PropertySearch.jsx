import { useState, useMemo } from 'react';
import {
    Search as SearchIcon, MapPin, Home, TrendingUp, TrendingDown,
    Building2, Calendar, DollarSign, Filter, ChevronDown, ChevronUp,
    ExternalLink, Heart, HeartOff
} from 'lucide-react';
import { formatNumber, formatCurrency, formatPercent } from '../utils/formatters';

/**
 * 실거래가 검색 페이지
 */
const PropertySearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('서울');
    const [selectedDistrict, setSelectedDistrict] = useState('강남구');
    const [propertyType, setPropertyType] = useState('apartment');
    const [sortBy, setSortBy] = useState('date');
    const [favorites, setFavorites] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);

    // 시뮬레이션 데이터
    const mockTransactions = useMemo(() => {
        const apartments = [
            { name: '래미안퍼스티지', dong: '삼성동', area: 84.97, floor: 25, price: 315000, prevPrice: 298000, date: '2025.12', buildYear: 2013 },
            { name: '아크로리버파크', dong: '반포동', area: 112.47, floor: 32, price: 580000, prevPrice: 560000, date: '2025.12', buildYear: 2016 },
            { name: '타워팰리스', dong: '도곡동', area: 164.89, floor: 45, price: 720000, prevPrice: 700000, date: '2025.11', buildYear: 2002 },
            { name: '힐스테이트갤러리', dong: '청담동', area: 79.52, floor: 18, price: 285000, prevPrice: 278000, date: '2025.11', buildYear: 2020 },
            { name: '반포자이', dong: '반포동', area: 114.55, floor: 28, price: 495000, prevPrice: 480000, date: '2025.10', buildYear: 2019 },
            { name: '래미안대치팰리스', dong: '대치동', area: 101.99, floor: 22, price: 420000, prevPrice: 405000, date: '2025.10', buildYear: 2015 },
            { name: '개포자이프레지던스', dong: '개포동', area: 84.94, floor: 15, price: 295000, prevPrice: 290000, date: '2025.09', buildYear: 2021 },
            { name: '삼성래미안', dong: '삼성동', area: 59.99, floor: 12, price: 198000, prevPrice: 195000, date: '2025.09', buildYear: 2008 },
        ];

        return apartments.map((apt, idx) => ({
            id: idx + 1,
            ...apt,
            change: ((apt.price - apt.prevPrice) / apt.prevPrice * 100),
            pricePerPyeong: Math.round(apt.price / (apt.area / 3.3)),
        }));
    }, []);

    const filteredTransactions = useMemo(() => {
        let results = mockTransactions;

        if (searchQuery) {
            results = results.filter(t =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.dong.includes(searchQuery)
            );
        }

        // 정렬
        if (sortBy === 'date') {
            results.sort((a, b) => b.date.localeCompare(a.date));
        } else if (sortBy === 'price') {
            results.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'change') {
            results.sort((a, b) => b.change - a.change);
        }

        return results;
    }, [mockTransactions, searchQuery, sortBy]);

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const regions = ['서울', '경기', '인천', '부산', '대구', '대전', '광주'];
    const districts = {
        '서울': ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '성동구'],
        '경기': ['성남시', '수원시', '용인시', '화성시', '고양시', '부천시'],
    };

    return (
        <div className="page-container">
            {/* Search Header */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    {/* Search Input */}
                    <div style={{ flex: 2, minWidth: 250 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                            아파트명 / 동네명 검색
                        </label>
                        <div style={{ position: 'relative' }}>
                            <SearchIcon
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-tertiary)',
                                }}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="래미안, 자이, 삼성동..."
                                className="input"
                                style={{ paddingLeft: 40 }}
                            />
                        </div>
                    </div>

                    {/* Region Select */}
                    <div style={{ minWidth: 120 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                            지역
                        </label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="input select"
                        >
                            {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* District Select */}
                    <div style={{ minWidth: 120 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                            구/군
                        </label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="input select"
                        >
                            {(districts[selectedRegion] || []).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>

                    {/* Sort */}
                    <div style={{ minWidth: 120 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                            정렬
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="input select"
                        >
                            <option value="date">최신순</option>
                            <option value="price">가격순</option>
                            <option value="change">상승률순</option>
                        </select>
                    </div>

                    <button className="btn btn-primary" style={{ height: 42 }}>
                        <SearchIcon size={16} />
                        검색
                    </button>
                </div>
            </div>

            {/* Results Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600 }}>{selectedRegion} {selectedDistrict}</span>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>|</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        {filteredTransactions.length}건의 거래
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-primary">실거래가</span>
                    <span className="badge badge-success">2025년 데이터</span>
                </div>
            </div>

            {/* Results List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredTransactions.map((item) => {
                    const isExpanded = expandedItem === item.id;
                    const isFavorite = favorites.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            className="card"
                            style={{
                                padding: 0,
                                overflow: 'hidden',
                                transition: 'all var(--transition-fast)',
                                border: isFavorite ? '2px solid var(--color-primary)' : undefined,
                            }}
                        >
                            {/* Main Row */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                            >
                                {/* Apartment Icon */}
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-primary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 16,
                                    flexShrink: 0,
                                }}>
                                    <Building2 size={24} style={{ color: 'var(--color-primary)' }} />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{item.name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                            {item.dong}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                        <span>{item.area}㎡ ({Math.round(item.area / 3.3)}평)</span>
                                        <span>{item.floor}층</span>
                                        <span>{item.buildYear}년식</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ textAlign: 'right', marginRight: 20 }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                        {formatCurrency(item.price)}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        gap: 4,
                                        fontSize: '0.8rem',
                                        color: item.change >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                    }}>
                                        {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {formatPercent(item.change)} (이전 대비)
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                        style={{ color: isFavorite ? 'var(--color-danger)' : undefined }}
                                    >
                                        {isFavorite ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
                                    </button>
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div style={{
                                    padding: '16px 20px',
                                    background: 'var(--color-bg-tertiary)',
                                    borderTop: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>평당가</p>
                                            <p style={{ fontWeight: 600 }}>{formatNumber(item.pricePerPyeong)}만원</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>거래일</p>
                                            <p style={{ fontWeight: 600 }}>{item.date}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>직전 거래가</p>
                                            <p style={{ fontWeight: 600 }}>{formatCurrency(item.prevPrice)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>준공연도</p>
                                            <p style={{ fontWeight: 600 }}>{item.buildYear}년</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                                            <Calendar size={14} />
                                            가격 히스토리
                                        </button>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                                            <ExternalLink size={14} />
                                            네이버 부동산
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredTransactions.length === 0 && (
                <div className="empty-state">
                    <SearchIcon className="empty-state-icon" />
                    <h3 className="empty-state-title">검색 결과가 없습니다</h3>
                    <p className="empty-state-desc">다른 검색어나 필터를 시도해 보세요</p>
                </div>
            )}

            {/* Info */}
            <div style={{
                marginTop: 24,
                padding: 16,
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--color-text-tertiary)',
            }}>
                💡 현재 시뮬레이션 데이터가 표시됩니다. 실제 데이터는 국토교통부 실거래가 API 연동 시 제공됩니다.
            </div>
        </div>
    );
};

export default PropertySearch;
