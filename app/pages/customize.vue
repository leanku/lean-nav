<template>
  <div class="app-shell min-h-screen flex flex-col bg-canvas text-ink-muted font-sans antialiased">
    <header class="app-header sticky top-0 z-40 h-16 shrink-0 flex items-center gap-3 px-4 sm:px-5">
      <AppLogo />
      <span class="hidden sm:inline text-body text-ink-subtle">自定义导航</span>

      <div class="ml-auto flex items-center gap-0.5 sm:gap-1">
        <NuxtLink to="/"
          class="hidden sm:flex min-h-[44px] px-2.5 items-center rounded-control text-body text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors">
          返回导航
        </NuxtLink>
        <span class="hidden lg:block h-5 w-px bg-hairline mx-1.5" aria-hidden="true"></span>
        <a href="https://github.com/leanku/lean-nav" target="_blank" rel="noopener noreferrer"
          aria-label="在 GitHub 查看源码" title="在 GitHub 查看源码"
          class="w-11 h-11 shrink-0 flex items-center justify-center rounded-control text-ink-muted hover:text-ink hover:bg-surface-1 transition-colors">
          <Github class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
        </a>
        <button @click="previewOpen = !previewOpen" type="button" :aria-expanded="previewOpen"
          :aria-label="previewOpen ? '收起实时预览' : '展开实时预览'"
          class="lg:hidden min-h-[44px] px-3 flex items-center gap-1.5 rounded-control text-body text-ink-muted hover:bg-surface-1 transition-colors">
          <Eye class="nav-icon w-4 h-4" /> 预览
        </button>
        <button @click="toggle" type="button" :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
          :title="isDark ? '切换到浅色主题' : '切换到深色主题'"
          class="w-11 h-11 flex items-center justify-center rounded-control text-ink-muted hover:bg-surface-1 transition-colors">
          <Sun v-if="isDark" class="nav-icon w-[18px] h-[18px]" />
          <Moon v-else class="nav-icon w-[18px] h-[18px]" />
        </button>
      </div>
    </header>

    <div class="flex-1 flex min-h-0 flex-col lg:flex-row">
      <!-- 左：完整编辑器（与抽屉共用同一个组件） -->
      <div class="w-full lg:w-[54%] xl:w-[52%] shrink-0 lg:border-r border-hairline min-h-[560px] lg:min-h-0">
        <NavEditor v-if="ready" :key="editorKey" variant="page" :open="true" :config="config"
          :source="source" @save="onSave" @reset="onReset" @done="done" />
      </div>

      <!-- 右：实时预览（移动端可折叠） -->
      <div class="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-5 sm:p-7 lg:p-8"
        :class="previewOpen ? 'block' : 'hidden lg:block'">
        <p class="text-caption text-ink-subtle mb-6">实时预览 · 只显示前 3 个栏目，完整效果在首页</p>

        <div v-for="category in previewCategories" :key="category.id" class="mb-8">
          <div class="flex items-center gap-3 mb-3">
            <span class="w-[2px] h-[15px] rounded-full bg-ink" aria-hidden="true"></span>
            <h3 class="text-section text-ink whitespace-nowrap">{{ category.name }}</h3>
            <span class="tnum text-caption text-ink-tertiary">{{ category.sites.length }}</span>
            <span class="h-px flex-1 hr-soft" aria-hidden="true"></span>
          </div>
          <div class="grid grid-cols-2 xl:grid-cols-3 gap-2">
            <div v-for="(site, index) in category.sites.slice(0, 6)" :key="index"
              class="flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-card bg-surface-1 border border-hairline">
              <span class="w-5 h-5 shrink-0 rounded-control bg-canvas border border-hairline flex items-center justify-center text-caption text-ink-subtle"
                aria-hidden="true">{{ (site.title || '?').charAt(0) }}</span>
              <span class="text-caption text-ink truncate">{{ site.title }}</span>
            </div>
          </div>
        </div>

        <p class="text-caption text-ink-subtle mt-10">
          改动会自动保存在这台设备。点左上方「完成」回到首页查看全部站点。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Sun, Moon, Eye, Github } from 'lucide-vue-next'
import { useNavConfig, listCategories } from '@/composables/useNavConfig'
import { useTheme } from '@/composables/useTheme'
import NavEditor from '@/components/NavEditor.vue'

useSeoMeta({
  title: '自定义导航 - LeanNav',
  robots: 'noindex, nofollow',
})

const router = useRouter()
const { config, source, ready, init, save, reset } = useNavConfig()
const { isDark, init: initTheme, toggle } = useTheme()

const previewOpen = ref(false)
const editorKey = ref(0)
const previewCategories = computed(() => listCategories(config.value).filter((cat) => cat.sites.length).slice(0, 3))

function onSave(next) { save(next) }
function onReset() { reset(); editorKey.value += 1 }
function done() { router.push('/') }

onMounted(async () => {
  initTheme()
  await init()
})
</script>
