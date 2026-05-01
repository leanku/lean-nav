<template>
  <div
    class="min-h-screen bg-[#f8fafc] dark:bg-[#0a0c10] text-slate-600 dark:text-slate-400 font-sans antialiased transition-colors duration-300 flex flex-col justify-between">

    <header
      class="sticky top-0 z-40 backdrop-blur-xl bg-white/75 dark:bg-[#0a0c10]/75 border-b border-slate-200/50 dark:border-white/5">
      <div class="max-w-5xl mx-auto h-16 px-6 flex justify-between items-center">

        <div class="h-16 flex items-center px-5 border-b border-white/[0.03] flex-shrink-0">
          <div class="flex items-center min-w-[36px]">
            <div
              class="w-9 h-9 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                class="lucide lucide-navigation text-white rotate-[15deg] group-hover:rotate-0 transition-transform duration-300">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
            </div>
            <h1 :class="[
              'cursor-pointer ml-3 text-sm font-black tracking-tighter transition-all duration-300',
              isCollapsed ? 'opacity-0 scale-90 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'
            ]" @click="$router.push('/')">
              Lean<span class="text-blue-500">Nav</span>
            </h1>
          </div>
        </div>

        <button @click="toggleTheme" class="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <Sun v-if="isDark" class="w-5 h-5 text-amber-500" />
          <Moon v-else class="w-5 h-5 text-slate-400" />
        </button>

      </div>
    </header>

    <main class="max-w-xl mx-auto px-6 py-20 text-center">

      <h1 class="text-3xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
        关于 LeanNav
      </h1>

      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-12">
        LeanNav 是一个致力于收集全球优质开发资源、设计灵感和效率工具的极简导航站。
        人工录入，去除冗余信息，只为给开发者提供最高效的上网导航体验。
      </p>

      <div
        class="p-6 mb-12 rounded-2xl bg-slate-100/50 dark:bg-[#12141c] border border-slate-200/40 dark:border-white/5 flex flex-col items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
        <p class="font-medium text-slate-700 dark:text-slate-300">发现好站或有合作需求？欢迎联系我们：</p>
        <div class="flex flex-wrap items-center justify-center gap-6 mt-1">
          <a href="mailto:contact@leannav.com" class="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <Mail class="w-4 h-4 text-slate-400" />
            <span>leanku@hotmail.com</span>
          </a>
          <span class="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <!-- <a href="https://github.com/your-repo" target="_blank"
            class="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <Github class="w-4 h-4 text-slate-400" />
            <span>提交资源 / Issue</span>
          </a> -->
        </div>
      </div>

      <NuxtLink to="/"
        class="inline-flex items-center px-6 py-3 text-xs font-bold tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all duration-300">
        <Undo2 class="w-4 h-4 mr-2" />
        返回导航首页
      </NuxtLink>

    </main>

    <footer
      class="mt-auto py-8 text-center border-t border-gray-200/40 dark:border-white/[0.03] bg-white/30 dark:bg-black/10 transition-colors duration-300">
      <p class="text-[10px] font-medium text-slate-400">Copyright © 2026 <a href="https://nav.leanku.com">LeanNav</a>
        · 开发者导航 · design by <a href="https://blog.leanku.com/" target="__black" class="dark:bg-black/50">Leanku</a>
      </p>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Zap, Sun, Moon, Mail, Github, Compass, Undo2 } from 'lucide-vue-next'

// SEO 页面优化配置
useSeoMeta({
  title: '关于项目 - LeanNav',
  description: 'LeanNav 是为开发者提供优质资源导航的极简开源项目。'
})

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  const html = document.documentElement
  isDark.value ? html.classList.add('dark') : html.classList.remove('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  isDark.value = saved ? saved === 'dark' : true

  const html = document.documentElement
  isDark.value ? html.classList.add('dark') : html.classList.remove('dark')
})
</script>

<style scoped>
.transition-all {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>