// https://nuxt.com/docs/api/configuration/nuxt-config

// 站点地址用于生成 Open Graph 的绝对 URL。部署到自己的域名时设置
// NUXT_PUBLIC_SITE_URL 覆盖，见 README「部署配置」。
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://nav.leanku.com').replace(/\/+$/, '')

// 可选统计：默认不加载任何第三方脚本。只接受 GA4 形式的 ID，避免把任意
// 字符串拼进 <script>。需要统计时设置 NUXT_PUBLIC_ANALYTICS_ID。
const rawAnalyticsId = process.env.NUXT_PUBLIC_ANALYTICS_ID || ''
const analyticsId = /^G-[A-Z0-9]+$/.test(rawAnalyticsId) ? rawAnalyticsId : ''

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: { siteUrl },
  },

  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],

  ssr: true,

  app: {
    head: {
      title: 'LeanNav | 极简导航',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'description', content: '汇集全球优质编程、设计与实用工具，提供极简高效的上网导航。' },
        { name: 'theme-color', content: '#F7F8FA', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0B0C0F', media: '(prefers-color-scheme: dark)' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'LeanNav' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'LeanNav' },
        { property: 'og:image', content: `${siteUrl}/og-image.png` },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        // 品牌图标统一由 public/navigator.png 派生（npm run brand 重新生成）
        { rel: 'icon', type: 'image/png', href: '/navigator.png' },
        { rel: 'icon', type: 'image/png', href: '/navigator-dark.png', media: '(prefers-color-scheme: dark)' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      script: [
        // 首屏渲染前确定主题，避免 hydration 后整页由亮变暗
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`,
          type: 'text/javascript',
        },
        // 仅在配置了统计 ID 时注入，且延后到浏览器空闲，不占首屏关键路径
        ...(analyticsId
          ? [{
              innerHTML: [
                '(function(){',
                'function load(){',
                "var s=document.createElement('script');s.async=true;",
                `s.src='https://www.googletagmanager.com/gtag/js?id=${analyticsId}';`,
                'document.head.appendChild(s);',
                'window.dataLayer=window.dataLayer||[];',
                'window.gtag=function(){window.dataLayer.push(arguments)};',
                "window.gtag('js',new Date());",
                `window.gtag('config','${analyticsId}');`,
                '}',
                "if('requestIdleCallback' in window){requestIdleCallback(load,{timeout:5000})}",
                "else{window.addEventListener('load',function(){setTimeout(load,1200)})}",
                '})()',
              ].join(''),
              type: 'text/javascript',
            }]
          : []),
      ],
    }
  },
})
