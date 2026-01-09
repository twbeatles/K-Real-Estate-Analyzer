# 🏠 부동산 통계 플랫폼 Pro

> **Real Estate Analytics Pro** - 대한민국 부동산 시장과 거시경제 연관성 분석 플랫폼

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ 주요 기능

### 📊 기본 분석
| 기능 | 설명 |
|------|------|
| 대시보드 | 핵심 부동산 지표 요약 |
| 시장 분석 | 주택가격지수 추이 |
| 거시경제 | 금리, GDP, M2 분석 |
| 지역별 분석 | 시도별 히트맵 |

### 🔬 고급 분석 (NEW!)
| 기능 | 설명 |
|------|------|
| **상관관계 분석** | 변수 간 상관계수, 시차분석, 회귀분석 |
| **시나리오 시뮬레이터** | 금리/M2/GDP 변화 시 주택가격 예측 |
| **사이클/리스크** | 시장 사이클 진단, 버블 위험도 |
| **선행지표** | 건설허가, 수급, 실질금리, 유동성, 글로벌 비교, 정책 영향 |

### 🛠️ 투자 도구
| 기능 | 설명 |
|------|------|
| 투자 시뮬레이터 | 월세/갭투자/전세 수익률 |
| 세금 계산기 | 취득세, 양도세, DSR |
| 실거래가 검색 | 아파트 시세 조회 |
| 교통호재 분석 | GTX, 지하철 연장 |

### 📰 정보
- 경제 캘린더 | 부동산 뉴스 | 관심 지역 | AI 인사이트

### 🎨 UI/UX
- 글래스모피즘 디자인
- 다크/라이트 테마
- 그라디언트 프리미엄 스타일
- 반응형 모바일 지원

---

## 🚀 빠른 시작

```bash
# 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build
```

→ http://localhost:3000

### 📦 GitHub Pages 배포

```bash
# 1. 빌드 실행
npm run build

# 2. dist 폴더를 gh-pages 브랜치로 배포
npx gh-pages -d dist
```

> 💡 `vite.config.js`에 `base: './'`가 설정되어 있어 별도 설정 없이 배포 가능

---

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 컴포넌트
│   ├── Header.jsx       # 글래스모피즘 헤더 (Memoized)
│   ├── Sidebar.jsx      # 네비게이션 (Memoized)
│   ├── AIChatbot.jsx    # AI 챗봇 (Memoized)
│   └── ui/              # StatCard, ChartContainer 등
├── pages/               # 페이지 (24개)
│   ├── Dashboard.jsx
│   ├── InvestmentSimulator.jsx
│   ├── TaxCalculator.jsx
│   └── ...
├── data/
│   ├── index.js         # 시뮬레이션 데이터 (캐싱 적용)
│   └── advancedAnalytics.js
├── services/            # API 서비스
├── hooks/               # 커스텀 훅
└── utils/               # 유틸리티
    ├── logger.js        # 환경별 로깅 (NEW)
    └── formatters.js    # 포매터 (캐싱 적용)
```

---

## ⚡ 성능 및 디버깅 최적화 (v1.2)

### 1. 렌더링 최적화
- **React.memo 적용**: `Sidebar`, `Header`, `AIChatbot` 등 전역 컴포넌트 불필요한 리렌더링 방지
- **상수 객체 분리**: 컴포넌트 외부로 정적 데이터 이동 (챗봇 응답, 질문 목록 등)
- **페이지 컴포넌트 매핑 최적화**: 렌더링 시 객체 재생성 방지

### 2. 데이터 처리 효율화
- **데이터 캐싱**: `Map` 기반 메모이제이션으로 중복 데이터 생성 방지
- **Intl 인스턴스 캐싱**: `NumberFormat`, `DateTimeFormat` 재사용으로 포매팅 성능 향상

### 3. 통합 로깅 시스템 (v1.2 NEW)
- **중앙화된 로깅**: 모든 `console.error`/`warn`을 `logger` 유틸리티로 통합
- **환경별 로그 분리**: 개발 환경에서만 디버그 로그 출력, 프로덕션에서는 에러만 출력
- **서비스/페이지 레이어 일관성**: `newsService`, `aiService`, `calendarService` 등 전체 통합

---

## 🔌 API 연동

| API | 용도 |
|-----|------|
| KOSIS | 국가통계포털 |
| 한국은행 ECOS | 금리, GDP |
| 국토교통부 | 실거래가 |
| OpenAI | AI 인사이트 |

> 💡 API 키 없이 시뮬레이션 모드로 사용 가능

---

## 📝 라이선스

MIT License

---

**Made with ❤️ for Real Estate Analytics**
