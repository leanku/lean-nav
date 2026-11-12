<template>
  <div class="app-shell min-h-screen bg-canvas text-ink-muted font-sans antialiased">
    <Transition name="fade">
      <div v-if="!isCollapsed && isMobile" @click="toggleMenu"
        class="fixed inset-0 z-[60] bg-black/40 lg:hidden" aria-hidden="true"></div>
    </Transition>

    <AppSidebar :nav-data="navData" :active-category="activeCategory" :collapsed="isCollapsed"
      :collapsed-groups="collapsedGroups" :overlay="isMobile" :base-path="basePath" :mounted="isMounted"
      @toggle-menu="toggleMenu" @toggle-group="emit('toggle-group', $event)" @navigate="onNavigate" />

    <div :class="[
      isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]',
      'min-h-screen flex flex-col',
      isMounted ? 'transition-[margin] duration-[240ms] cubic-bezier' : 'not-mounted'
    ]">
      <!-- 品牌只在侧栏；仅当侧栏完全离屏（移动端抽屉关闭）时顶栏才补一个紧凑 logo，避免重复 -->
      <AppHeader ref="headerRef" :model-value="modelValue" :source="source"
        :show-logo="isMobile && isCollapsed" :show-search="showSearch" :title="title"
        @update:model-value="emit('update:modelValue', $event)" @toggle-menu="toggleMenu"
        @open-editor="emit('open-editor')" @submit="emit('submit')" @clear="emit('clear')">
        <template #extra><slot name="header-extra" /></template>
      </AppHeader>

      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

defineProps({
  modelValue: { type: String, default: '' },
  source: { type: String, default: 'default' },
  navData: { type: Array, default: () => [] },
  activeCategory: { type: String, default: '' },
  collapsedGroups: { type: Array, default: () => [] },
  basePath: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
  title: { type: String, default: '' },
})
const emit = defineEmits([
  'update:modelValue', 'toggle-group', 'navigate', 'open-editor', 'submit', 'clear',
])

const { init: initTheme } = useTheme()
const headerRef = ref(null)
const isCollapsed = ref(false)
const isMobile = ref(false)
const isMounted = ref(false)
let autoCollapsed = false

/* 桌面 / 移动端分别记忆折叠状态，窗口变宽时恢复自动收起的状态 */
const menuKey = () => isMobile.value ? 'menu_collapsed:mobile' : 'menu_collapsed:desktop'
function readMenuState() {
  try {
    const saved = localStorage.getItem(menuKey())
    if (saved !== null) { isCollapsed.value = saved === 'true'; autoCollapsed = false }
    else { isCollapsed.value = isMobile.value; autoCollapsed = isMobile.value }
  } catch { isCollapsed.value = isMobile.value }
}
function toggleMenu() { isCollapsed.value = !isCollapsed.value; autoCollapsed = false }
function checkScreen() {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 1024
  if (wasMobile === isMobile.value) return
  if (wasMobile && autoCollapsed) { isCollapsed.value = false; autoCollapsed = false; return }
  readMenuState()
}
watch(isCollapsed, (value) => {
  try { localStorage.setItem(menuKey(), String(value)) } catch (error) {}
})

function onNavigate(id) {
  emit('navigate', id)
  if (isMobile.value) isCollapsed.value = true
}
function focusSearch() { headerRef.value?.focusSearch() }

onMounted(() => {
  initTheme()
  isMobile.value = window.innerWidth < 1024
  readMenuState()
  window.addEventListener('resize', checkScreen)
  isMounted.value = true
})
onUnmounted(() => window.removeEventListener('resize', checkScreen))

defineExpose({ focusSearch, isCollapsed, isMobile })
</script>
