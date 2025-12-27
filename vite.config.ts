
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // ẨN API_KEY: Vite sẽ tự động tìm biến API_KEY từ môi trường hệ thống (System Env)
    // khi ứng dụng được build trên các nền tảng như Vercel hoặc Netlify.
    // Lưu ý: Tuyệt đối không hardcode API Key trực tiếp vào đây.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 3000,
  }
});
