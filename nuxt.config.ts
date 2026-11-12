// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],

  ssr: true, // 确保 SEO 最优化

  app: {
    head: {
      title: 'LeanNav | 精选开发者导航',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'description', content: '汇集全球优质编程资源、设计素材和实用工具，为开发者提供最高效的上网导航。' },
        { name: 'theme-color', content: '#F7F8FA', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0B0C0F', media: '(prefers-color-scheme: dark)' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'LeanNav' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'LeanNav' },
        { property: 'og:image', content: 'https://nav.leanku.com/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        // 品牌图标统一由 public/navigator.png 派生（npm run brand 重新生成）
        { rel: 'icon', type: 'image/png', href: '/navigator.png' },
        { rel: 'icon', type: 'image/png', href: '/navigator-dark.png', media: '(prefers-color-scheme: dark)' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        // DESIGN.md 质量地板：零外部字体请求，Inter 走本地字体栈 + 中文回退
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      script: [
        // 首屏渲染前确定主题，避免 hydration 后整页由亮变暗
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`,
          type: 'text/javascript',
        },
        // 统计脚本延后到浏览器空闲，不占首屏关键路径
        {
          innerHTML: [
            '(function(){',
            'function load(){',
            "var s=document.createElement('script');s.async=true;",
            "s.src='https://www.googletagmanager.com/gtag/js?id=G-CJF858TEN5';",
            'document.head.appendChild(s);',
            'window.dataLayer=window.dataLayer||[];',
            'window.gtag=function(){window.dataLayer.push(arguments)};',
            "window.gtag('js',new Date());",
            "window.gtag('config','G-CJF858TEN5');",
            '}',
            "if('requestIdleCallback' in window){requestIdleCallback(load,{timeout:5000})}",
            "else{window.addEventListener('load',function(){setTimeout(load,1200)})}",
            '})()',
          ].join(''),
          type: 'text/javascript',
        },
      ],
    }
  },
})
