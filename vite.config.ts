import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/* GitHub Pages отдаёт проект-сайт по адресу /<repo>/, поэтому ассеты нужно собирать
   с этим префиксом. Имя репозитория берём из окружения Actions — не хардкодим.
   Локально (dev/preview) и для user-сайта <login>.github.io база остаётся '/'. */
const ghRepo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = ghRepo && !ghRepo.endsWith('.github.io') ? `/${ghRepo}/` : '/';

// Прототип ПМРК — десктоп-first (Яндекс Браузер / Astra Linux). Без бэкенда: данные — моки.
export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 4173,
    host: true,
    strictPort: false,
  },
});
