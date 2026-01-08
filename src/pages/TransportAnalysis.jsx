import { useState, useMemo } from 'react';
import {
    Train, MapPin, TrendingUp, Calendar, Building2,
    Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
    Star, Filter, Search
} from 'lucide-react';
import { formatNumber, formatPercent } from '../utils/formatters';

/**
 * 교통호재 분석 페이지
 * GTX, 지하철 연장, 광역철도 등 교통 개발 호재 분석
 */
const TransportAnalysis = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [expandedProject, setExpandedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 교통 개발 프로젝트 데이터 (2025년 12월 기준)
    const transportProjects = useMemo(() => [
        // GTX
        {
            id: 1,
            name: 'GTX-A',
            category: 'gtx',
            status: 'operating',
            completionDate: '2024.03',
            route: '파주 운정 ↔ 서울역 ↔ 수서 ↔ 동탄',
            stations: ['운정', '킨텍스', '대곡', '연신내', '서울역', '삼성', '수서', '성남', '용인', '동탄'],
            benefitAreas: [
                { name: '운정신도시', region: '파주시', priceChange: 15.2, avgPrice: 52000 },
                { name: '킨텍스', region: '고양시', priceChange: 12.8, avgPrice: 48000 },
                { name: '동탄2신도시', region: '화성시', priceChange: 18.5, avgPrice: 62000 },
            ],
            description: '수도권 광역급행철도. 파주~동탄 구간 83.1km를 약 1시간에 연결.',
            travelTime: '운정-삼성 20분',
            importance: 'high',
        },
        {
            id: 2,
            name: 'GTX-B',
            category: 'gtx',
            status: 'construction',
            completionDate: '2030.12',
            route: '송도 ↔ 여의도 ↔ 서울역 ↔ 청량리 ↔ 마석',
            stations: ['송도', '인천시청', '부평', '신도림', '여의도', '서울역', '청량리', '망우', '별내', '마석'],
            benefitAreas: [
                { name: '송도국제도시', region: '인천시', priceChange: 8.5, avgPrice: 58000 },
                { name: '별내신도시', region: '남양주시', priceChange: 11.2, avgPrice: 45000 },
                { name: '마석', region: '남양주시', priceChange: 6.8, avgPrice: 28000 },
            ],
            description: '인천 송도~남양주 마석 구간 80.1km 연결. 2024년 착공.',
            travelTime: '송도-서울역 25분 예상',
            importance: 'high',
        },
        {
            id: 3,
            name: 'GTX-C',
            category: 'gtx',
            status: 'construction',
            completionDate: '2028.12',
            route: '양주 덕정 ↔ 의정부 ↔ 청량리 ↔ 삼성 ↔ 수원',
            stations: ['양주', '의정부', '창동', '청량리', '삼성', '양재', '과천', '금정', '수원'],
            benefitAreas: [
                { name: '양주신도시', region: '양주시', priceChange: 22.5, avgPrice: 32000 },
                { name: '의정부', region: '의정부시', priceChange: 14.3, avgPrice: 42000 },
                { name: '수원', region: '수원시', priceChange: 9.8, avgPrice: 55000 },
            ],
            description: '수도권 남북 축 연결. 양주~수원 구간 74.8km.',
            travelTime: '양주-삼성 20분 예상',
            importance: 'high',
        },

        // 지하철 연장
        {
            id: 4,
            name: '신안산선',
            category: 'subway',
            status: 'construction',
            completionDate: '2025.12',
            route: '여의도 ↔ 광명 ↔ 시흥 ↔ 안산',
            stations: ['여의도', '영등포', '광명', '시흥대야', '안산중앙', '한양대에리카'],
            benefitAreas: [
                { name: '시흥시청역', region: '시흥시', priceChange: 25.3, avgPrice: 38000 },
                { name: '광명', region: '광명시', priceChange: 18.7, avgPrice: 52000 },
                { name: '안산', region: '안산시', priceChange: 12.4, avgPrice: 35000 },
            ],
            description: '여의도~안산 44.7km. 광역급행 개념 도입.',
            travelTime: '안산-여의도 25분 예상',
            importance: 'high',
        },
        {
            id: 5,
            name: '9호선 4단계 연장',
            category: 'subway',
            status: 'construction',
            completionDate: '2027.06',
            route: '중앙보훈병원 ↔ 강일 ↔ 미사',
            stations: ['중앙보훈병원', '강일역', '미사역'],
            benefitAreas: [
                { name: '미사강변도시', region: '하남시', priceChange: 8.2, avgPrice: 68000 },
                { name: '강일동', region: '강동구', priceChange: 5.5, avgPrice: 72000 },
            ],
            description: '9호선 강동구 연장. 미사지구 접근성 개선.',
            travelTime: '미사-여의도 35분 예상',
            importance: 'medium',
        },
        {
            id: 6,
            name: '7호선 청라 연장',
            category: 'subway',
            status: 'construction',
            completionDate: '2027.12',
            route: '청라국제도시 ↔ 신영도 ↔ 부평구청',
            stations: ['청라국제도시', '영종도입구', '신영도', '부평구청'],
            benefitAreas: [
                { name: '청라국제도시', region: '인천시', priceChange: 15.8, avgPrice: 48000 },
            ],
            description: '7호선 인천 청라까지 연장. 강남 직결.',
            travelTime: '청라-강남 50분 예상',
            importance: 'medium',
        },
        {
            id: 7,
            name: '위례신사선',
            category: 'subway',
            status: 'construction',
            completionDate: '2028.06',
            route: '위례신도시 ↔ 잠실 ↔ 강남 ↔ 신사',
            stations: ['위례중앙', '송파', '삼전', '봉은사', '선릉', '신사'],
            benefitAreas: [
                { name: '위례신도시', region: '성남시', priceChange: 12.5, avgPrice: 85000 },
            ],
            description: '위례신도시~신사 14.8km 경전철.',
            travelTime: '위례-신사 25분 예상',
            importance: 'medium',
        },

        // 광역철도
        {
            id: 8,
            name: '서부권 광역급행철도',
            category: 'rail',
            status: 'planning',
            completionDate: '2032.12',
            route: '김포 ↔ 부천 ↔ 시흥 ↔ 광명',
            stations: ['김포', '부천종합운동장', '시흥시청', '광명'],
            benefitAreas: [
                { name: '김포한강신도시', region: '김포시', priceChange: 5.2, avgPrice: 45000 },
            ],
            description: '서부권 남북 연결 광역철도.',
            travelTime: '김포-광명 20분 예상',
            importance: 'low',
        },
        {
            id: 9,
            name: '수인분당선 강남 연장',
            category: 'subway',
            status: 'planning',
            completionDate: '2031.12',
            route: '청량리 ↔ 강남 ↔ 수서',
            stations: ['청량리', '왕십리', '강남', '수서'],
            benefitAreas: [
                { name: '분당', region: '성남시', priceChange: 3.5, avgPrice: 95000 },
            ],
            description: '분당선 강남 직결 계획.',
            travelTime: '분당-강남 15분 예상',
            importance: 'medium',
        },
        {
            id: 10,
            name: '동북선',
            category: 'subway',
            status: 'construction',
            completionDate: '2029.06',
            route: '왕십리 ↔ 제기동 ↔ 미아 ↔ 상계',
            stations: ['왕십리', '제기동', '미아', '월계', '상계'],
            benefitAreas: [
                { name: '상계동', region: '노원구', priceChange: 8.9, avgPrice: 52000 },
                { name: '미아동', region: '강북구', priceChange: 6.2, avgPrice: 48000 },
            ],
            description: '서울 동북부 경전철. 13.4km.',
            travelTime: '상계-왕십리 20분 예상',
            importance: 'medium',
        },
    ], []);

    const categories = [
        { id: 'all', label: '전체', icon: Train },
        { id: 'gtx', label: 'GTX', icon: Train },
        { id: 'subway', label: '지하철', icon: MapPin },
        { id: 'rail', label: '광역철도', icon: Train },
    ];

    const statuses = [
        { id: 'all', label: '전체' },
        { id: 'operating', label: '운행 중' },
        { id: 'construction', label: '공사 중' },
        { id: 'planning', label: '계획' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'operating':
                return { label: '운행 중', className: 'badge-success' };
            case 'construction':
                return { label: '공사 중', className: 'badge-warning' };
            case 'planning':
                return { label: '계획', className: 'badge-secondary' };
            default:
                return { label: status, className: 'badge-secondary' };
        }
    };

    const getImportanceStars = (importance) => {
        const count = importance === 'high' ? 3 : importance === 'medium' ? 2 : 1;
        return Array(count).fill(null).map((_, i) => (
            <Star key={i} size={12} fill="var(--color-warning)" stroke="var(--color-warning)" />
        ));
    };

    const filteredProjects = useMemo(() => {
        return transportProjects.filter(project => {
            if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
            if (selectedStatus !== 'all' && project.status !== selectedStatus) return false;
            if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !project.route.includes(searchQuery)) return false;
            return true;
        });
    }, [transportProjects, selectedCategory, selectedStatus, searchQuery]);

    // 통계
    const stats = useMemo(() => {
        const operating = transportProjects.filter(p => p.status === 'operating').length;
        const construction = transportProjects.filter(p => p.status === 'construction').length;
        const planning = transportProjects.filter(p => p.status === 'planning').length;
        const totalBenefitAreas = transportProjects.reduce((sum, p) => sum + p.benefitAreas.length, 0);

        return { operating, construction, planning, totalBenefitAreas };
    }, [transportProjects]);

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
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}>
                            <Train size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>교통호재 분석</h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                                GTX, 지하철 연장, 광역철도 개발 현황
                            </p>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="노선명, 지역 검색..."
                            className="input"
                            style={{ paddingLeft: 36, width: 200 }}
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>운행 중</span>
                        <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <div className="stat-card-value">{stats.operating}</div>
                    <div className="stat-card-label">개 노선</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>공사 중</span>
                        <Clock size={18} style={{ color: 'var(--color-warning)' }} />
                    </div>
                    <div className="stat-card-value">{stats.construction}</div>
                    <div className="stat-card-label">개 노선</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>계획</span>
                        <Calendar size={18} style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                    <div className="stat-card-value">{stats.planning}</div>
                    <div className="stat-card-label">개 노선</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span>수혜 지역</span>
                        <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="stat-card-value">{stats.totalBenefitAreas}</div>
                    <div className="stat-card-label">개 지역</div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    {statuses.map(status => (
                        <button
                            key={status.id}
                            onClick={() => setSelectedStatus(status.id)}
                            className={`btn ${selectedStatus === status.id ? 'btn-secondary' : 'btn-ghost'}`}
                            style={{ fontSize: '0.85rem' }}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredProjects.map(project => {
                    const isExpanded = expandedProject === project.id;
                    const statusBadge = getStatusBadge(project.status);

                    return (
                        <div
                            key={project.id}
                            className="card"
                            style={{ padding: 0, overflow: 'hidden' }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '20px 24px',
                                    cursor: 'pointer',
                                    borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none',
                                }}
                                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-md)',
                                    background: project.category === 'gtx' ? 'linear-gradient(135deg, #ef4444, #f97316)' :
                                        project.category === 'subway' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                            'linear-gradient(135deg, #10b981, #84cc16)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    marginRight: 16,
                                    flexShrink: 0,
                                }}>
                                    <Train size={24} />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{project.name}</h3>
                                        <span className={`badge ${statusBadge.className}`}>{statusBadge.label}</span>
                                        <div style={{ display: 'flex', gap: 2 }}>{getImportanceStars(project.importance)}</div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        {project.route}
                                    </p>
                                </div>

                                {/* Completion */}
                                <div style={{ textAlign: 'right', marginRight: 16 }}>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                                        {project.status === 'operating' ? '개통' : '예정'}
                                    </p>
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                        {project.completionDate}
                                    </p>
                                </div>

                                <div style={{ color: 'var(--color-text-tertiary)' }}>
                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div style={{ padding: 24, background: 'var(--color-bg-tertiary)' }}>
                                    {/* Description */}
                                    <p style={{ marginBottom: 20, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                        {project.description}
                                    </p>

                                    {/* Travel Time */}
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 16px',
                                        background: 'var(--color-primary-light)',
                                        borderRadius: 'var(--radius-full)',
                                        marginBottom: 20,
                                    }}>
                                        <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-primary)' }}>
                                            {project.travelTime}
                                        </span>
                                    </div>

                                    {/* Stations */}
                                    <div style={{ marginBottom: 20 }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>정차역</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {project.stations.map((station, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: 'var(--color-bg-secondary)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        fontSize: '0.8rem',
                                                        border: '1px solid var(--color-border)',
                                                    }}
                                                >
                                                    {station}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Benefit Areas */}
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>
                                            수혜 지역 ({project.benefitAreas.length}개)
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                            {project.benefitAreas.map((area, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: 16,
                                                        background: 'var(--color-bg-secondary)',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-border)',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                        <div>
                                                            <p style={{ fontWeight: 600, marginBottom: 2 }}>{area.name}</p>
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{area.region}</p>
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            color: area.priceChange >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 600,
                                                        }}>
                                                            <TrendingUp size={14} />
                                                            {formatPercent(area.priceChange)}
                                                        </div>
                                                    </div>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                        평균 {formatNumber(area.avgPrice)}만원/3.3㎡
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
                <div className="empty-state">
                    <Train className="empty-state-icon" />
                    <h3 className="empty-state-title">검색 결과가 없습니다</h3>
                    <p className="empty-state-desc">다른 필터를 선택하거나 검색어를 변경해보세요</p>
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
                💡 가격 변동률은 호재 발표 후 현재까지의 누적 변동률입니다. 실제 투자 수익률과 다를 수 있습니다.
                <br />
                📅 완공 예정일은 변경될 수 있으며, 최신 정보는 관련 기관에서 확인하세요.
            </div>
        </div>
    );
};

export default TransportAnalysis;
