import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 정적 배포 (GitHub Pages 등) 호환을 위한 상대 경로 설정
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // API 프록시 설정 (CORS 우회)
    proxy: {
      // RSS 피드 프록시
      '/api/rss': {
        target: 'https://api.allorigins.win',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const rssUrl = url.searchParams.get('url');
          return `/raw?url=${encodeURIComponent(rssUrl)}`;
        },
      },
      // Google News RSS
      '/api/news': {
        target: 'https://news.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/news/, ''),
      },
      // KOSIS API
      '/api/kosis': {
        target: 'https://kosis.kr/openapi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kosis/, ''),
      },
      // 한국은행 ECOS API
      '/api/bok': {
        target: 'https://ecos.bok.or.kr/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bok/, ''),
      },
      // 한국부동산원 API
      '/api/reb': {
        target: 'https://www.reb.or.kr/r-one/openApi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/reb/, ''),
      },
      // 국토교통부 API
      '/api/molit': {
        target: 'http://openapi.molit.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/molit/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
