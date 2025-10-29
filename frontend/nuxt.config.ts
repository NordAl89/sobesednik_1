// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Определяем пути для алиасов, если нужно
const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  // Дата совместимости Nuxt (важно для стабильности)
  compatibilityDate: '2025-07-15',

  // Включаем devtools для Vue
  devtools: { enabled: true },

  // Автоматическая генерация маршрутов из папки pages
  srcDir: './',

  // Плагины
  plugins: [
    '~/plugins/pinia.js' // наш плагин Pinia
  ],

   modules: [
    '@nuxt/image'
  ],  
  
  image: {
    inject: true,
    quality: 80,
    format: ['webp', 'jpg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },   
    
  },


  // Стили по умолчанию
  css: [
    '~/assets/main.css'
  ],

  // Алиасы
  alias: {
    '@': resolve(__dirname, './')
  },

  // Настройка сборщика (Vite)
  vite: {
    define: {
      'process.env.DEBUG': false
    }
  }
})
