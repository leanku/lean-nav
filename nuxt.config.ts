// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  ssr: true, // 确保 SEO 最优化

  app: {
    head: {
      title: 'LeanNav | 精选开发者导航',
      meta: [
        { name: 'description', content: '汇集全球优质编程资源、设计素材和实用工具，为开发者提供最高效的上网导航。' }
      ],
      link: [
        // 引入 Inter 字体增加现代感
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap' }
      ]
    }
  },
})
