<template>
  <!-- 三区网格：左右等宽 1fr，搜索区固定最大 560px，因此搜索在内容区里真正居中 -->
  <header :class="[
    'app-header sticky top-0 z-40 h-16 grid items-center gap-2 px-2 sm:px-5',
    showSearch
      ? 'grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)_minmax(0,1fr)]'
      : 'grid-cols-[auto_minmax(0,1fr)_auto]'
  ]">

    <!-- 左：菜单 + （仅移动端抽屉关闭时）紧凑 logo -->
    <div class="flex items-center gap-0.5 min-w-0">
      <button @click="$emit('toggle-menu')" type="button" aria-label="展开或收起菜单" title="展开或收起菜单"
        class="w-11 h-11 shrink-0 flex items-center justify-center rounded-control text-ink-muted hover:bg-surface-1 hover:text-ink transition-colors duration-200">
        <Menu class="nav-icon w-[18px] h-[18px]" />
      </button>
      <AppLogo v-if="showLogo" compact class="ml-0.5" />
    </div>

    <!-- 中：搜索（唯一首要动作）或页面标题 -->
    <div :class="['min-w-0 flex items-center', showSearch ? 'justify-center' : 'justify-start']">
      <form v-if="showSearch" role="search" @submit.prevent="$emit('submit')"
        class="search-halo w-full max-w-[560px] relative group">
        <label for="nav-search" class="sr-only">搜索导航资源</label>
        <Search class="nav-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
        <input id="nav-search" ref="inputEl" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
          @keydown.esc="clear" type="search" autocomplete="off"
          :placeholder="isCompact ? '搜索站点' : '搜索资源、工具、栏目...'"
          class="w-full min-h-[44px] bg-surface-1 border border-hairline rounded-control py-2.5 pl-10 pr-10 sm:pr-16 text-body text-ink outline-none transition-colors duration-200 placeholder:text-ink-tertiary" />
        <button v-if="modelValue" type="button" aria-label="清除搜索" title="清除搜索" @click="clear"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-control text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors">
          <X class="nav-icon w-4 h-4" />
        </button>
        <kbd v-else
          class="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded border border-hairline text-caption leading-4 text-ink-subtle font-mono pointer-events-none">⌘K</kbd>
      </form>
      <span v-else class="text-body font-medium text-ink truncate">{{ title }}</span>
    </div>

    <!-- 右：动作组 -->
    <div class="flex items-center justify-end gap-0.5 shrink-0">
      <span class="hidden lg:block h-5 w-px bg-hairline mx-1.5" aria-hidden="true"></span>

      <a href="https://github.com/leanku/lean-nav" target="_blank" rel="noopener noreferrer"
        aria-label="在 GitHub 查看源码" title="在 GitHub 查看源码"
        class="w-11 h-11 shrink-0 flex items-center justify-center rounded-control text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors duration-200">
        <Github class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
      </a>

      <button @click="$emit('open-editor')" type="button" aria-label="自定义导航" title="自定义分类和网站"
        class="relative shrink-0 min-h-[44px] px-2 sm:px-2.5 flex items-center justify-center gap-1.5 rounded-control border border-transparent sm:border-hairline text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors duration-200">
        <Settings2 class="nav-icon w-4 h-4" />
        <span class="hidden md:inline text-body">自定义</span>
        <span v-if="source !== 'default'" class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ink" aria-hidden="true"></span>
      </button>

      <slot name="extra" />

      <button @click="toggle" type="button" :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
        :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
        class="w-11 h-11 shrink-0 flex items-center justify-center rounded-control hover:bg-surface-1 transition-colors duration-200 text-ink-muted overflow-hidden">
        <Transition name="slide-up" mode="out-in">
          <Sun v-if="isDark" :key="'sun'" class="nav-icon w-[18px] h-[18px]" />
          <Moon v-else :key="'moon'" class="nav-icon w-[18px] h-[18px]" />
        </Transition>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, Search, X, Settings2, Sun, Moon, Github } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

defineProps({
  modelValue: { type: String, default: '' },
  source: { type: String, default: 'default' },
  showLogo: { type: Boolean, default: false },
  showSearch: { type: Boolean, default: true },
  title: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'toggle-menu', 'open-editor', 'submit', 'clear'])

const { isDark, toggle } = useTheme()
const inputEl = ref(null)
// 窄屏搜索框只有 ~156px，长占位符会被截断；改成短提示更像是刻意设计
const isCompact = ref(false)
let mediaQuery = null
const syncCompact = (event) => { isCompact.value = event.matches }
onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 639px)')
  isCompact.value = mediaQuery.matches
  mediaQuery.addEventListener('change', syncCompact)
})
onUnmounted(() => mediaQuery?.removeEventListener('change', syncCompact))

function clear() {
  emit('update:modelValue', '')
  emit('clear')
  inputEl.value?.focus()
}
function focusSearch() {
  inputEl.value?.focus()
  inputEl.value?.select()
}

defineExpose({ focusSearch })
</script>
