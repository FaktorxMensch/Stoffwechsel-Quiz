// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  // SSR an lassen (ssr:false triggert in dieser Nuxt/Vite-Kombi einen Build-Bug).
  // Alle localStorage/Canvas-Zugriffe sind client-guarded, daher unproblematisch.
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Stoffwechsel-Quiz',
      htmlAttrs: { lang: 'de' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
