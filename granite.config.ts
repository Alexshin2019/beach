import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-savingturtle',
  brand: {
    displayName: 'my-savingturtle', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: '', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: 'basic',
  },
  web: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능하도록 설정 (에뮬레이터 접근용)
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'vite build && node scripts/build-ait.js',
    },
  },
  permissions: [],
  outdir: 'dist',
});
