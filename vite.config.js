import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: false,
  },
  plugins: [],
  build: {
    // 번들 크기 경고 임계값 설정 (기본값: 500KB)
    chunkSizeWarningLimit: 2000, // 2MB로 설정
  },
})
