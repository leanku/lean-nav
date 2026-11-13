<template>
  <footer class="app-footer mt-auto py-7 px-5 sm:px-7 lg:px-10 border-t border-hairline">
    <div class="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
      <p class="text-caption text-ink-subtle">
        © 2026
        <NuxtLink to="/" class="link">LeanNav</NuxtLink>
        · 极简网址导航
      </p>
      <nav class="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption" aria-label="页脚导航">
        <NuxtLink to="/about" class="link">关于本站</NuxtLink>
        <NuxtLink to="/customize" class="link">自定义导航</NuxtLink>
        <a href="https://github.com/leanku/lean-nav" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 link">
          <Github class="nav-icon w-3.5 h-3.5" aria-hidden="true" /> GitHub
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import { Github } from 'lucide-vue-next'
</script>
