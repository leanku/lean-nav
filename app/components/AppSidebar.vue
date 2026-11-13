<template>
  <aside :class="[
    overlay
      ? (collapsed ? 'w-[240px] -translate-x-full' : 'w-[240px] translate-x-0')
      : (collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 w-[240px]'),
    'app-sidebar fixed inset-y-0 left-0 z-[70] bg-canvas border-r border-hairline text-ink-muted flex flex-col',
    isNarrow ? 'is-narrow' : '',
    mounted ? '' : 'not-mounted'
  ]" aria-label="分类导航">
    <!-- logo 左内边距用 CSS 过渡（展开 24px → 折叠 20px），使图标中心始终与菜单图标重合：
         展开 24+16=40px、折叠 20+16=36px。不用 justify-center 硬切，避免折叠瞬间跳位。 -->
    <div class="sidebar-brand h-16 flex items-center border-b border-hairline flex-shrink-0 pr-3">
      <AppLogo :compact="isNarrow" boxed />
    </div>

    <nav class="flex-1 overflow-y-auto custom-scrollbar py-3 overflow-x-hidden">
      <div v-for="item in navData" :key="item.id" class="px-3 mb-0.5" @mouseenter="onWrapperEnter(item, $event)"
        @mouseleave="scheduleClose" @focusin="onWrapperEnter(item, $event)" @focusout="scheduleClose">

        <!-- 顶层：单栏目或页面链接 -->
        <template v-if="item.id && !item.children">
          <NuxtLink v-if="item.url && item.url.startsWith('/')" :to="item.url" :aria-label="item.name" :title="item.name"
            :aria-current="activeCategory === item.id ? 'page' : undefined" @click="onNavigate(item.id)"
            :class="topLinkClass(item.id)">
            <span :class="iconBoxClass()">
              <component :is="iconOf(item.icon)" class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
            </span>
            <span class="sidebar-label ml-3 whitespace-nowrap truncate">{{ item.name }}</span>
          </NuxtLink>
          <a v-else :href="`${basePath}#${item.id}`" :aria-label="item.name" :title="item.name"
            :aria-current="activeCategory === item.id ? 'location' : undefined" @click="onNavigate(item.id)"
            :class="topLinkClass(item.id)">
            <span :class="iconBoxClass()">
              <component :is="iconOf(item.icon)" class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
            </span>
            <span class="sidebar-label ml-3 whitespace-nowrap truncate">{{ item.name }}</span>
          </a>
        </template>

        <!-- 分组 -->
        <div v-else-if="item.children">
          <button type="button" @click="onGroupClick(item, $event)" :title="item.name" :aria-label="`${item.name}，展开子分类`"
            :aria-expanded="isExpanded(item)" :class="groupClass(item)">
            <span :class="iconBoxClass()">
              <component :is="iconOf(item.icon)" class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
            </span>
            <span class="sidebar-label ml-3 text-body flex-1 text-left whitespace-nowrap truncate">{{ item.name }}</span>
            <ChevronDown class="sidebar-chevron nav-icon w-3.5 h-3.5 ml-1 text-ink-subtle"
              :class="{ '-rotate-90': !isExpanded(item) }" aria-hidden="true" />
          </button>

          <!-- 二级：引导线 + 真实缩进表达层级；常驻 DOM，用 grid-rows 0fr→1fr 做展开/收起过渡。
               折叠态由 CSS 强制收起（而非 v-if 移除），避免侧栏折叠时二级菜单瞬间闪断；
               折叠态改由 flyout 浮层呈现。收起/折叠时 inert 保证链接不进入 Tab 顺序。 -->
          <div class="sidebar-sub" :class="{ 'is-open': isExpanded(item) }"
            :inert="!isExpanded(item) || isNarrow || undefined" :aria-hidden="!isExpanded(item) || isNarrow">
            <div class="sidebar-sub-inner">
              <div class="relative ml-[22px] mt-0.5 mb-1 pl-2 border-l border-hairline space-y-0.5">
                <a v-for="child in item.children" :key="child.id" :href="`${basePath}#${child.id}`"
                  :aria-current="activeCategory === child.id ? 'location' : undefined" @click="onNavigate(child.id)"
                  :class="childClass(child.id)">
                  <component :is="iconOf(child.icon || item.icon)" class="nav-icon w-[14px] h-[14px] shrink-0" aria-hidden="true" />
                  <span class="truncate">{{ child.name }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="overlay" class="p-3 border-t border-hairline">
      <button type="button" @click="$emit('toggle-menu')"
        class="w-full min-h-[44px] rounded-control text-body text-ink-muted hover:bg-surface-2 transition-colors">关闭菜单</button>
    </div>
  </aside>

  <!-- 折叠态的二级分类浮层：fixed 定位，避开侧栏的裁剪；表面与文字都走 token -->
  <Transition name="fade">
    <div v-if="flyout" data-nav-flyout
      class="fixed z-[80] w-[208px] py-2 rounded-popover bg-surface-4 border border-hairline shadow-popover"
      :style="{ top: flyout.top + 'px', left: flyout.left + 'px' }" @mouseenter="cancelClose" @mouseleave="scheduleClose">
      <p class="px-4 pb-2 text-caption text-ink-subtle border-b border-hairline">
        {{ flyout.item.name }}
      </p>
      <a v-for="child in flyout.item.children" :key="child.id" :href="`${basePath}#${child.id}`"
        :aria-current="activeCategory === child.id ? 'location' : undefined" @click="onNavigate(child.id)"
        :class="[
          'flex items-center gap-2.5 min-h-[44px] px-4 text-body transition-colors',
          activeCategory === child.id ? 'bg-surface-3 text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-2'
        ]">
        <component :is="iconOf(child.icon || flyout.item.icon)" class="nav-icon w-[14px] h-[14px] shrink-0" aria-hidden="true" />
        <span class="truncate">{{ child.name }}</span>
      </a>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { iconOf } from '@/utils/icons'

const props = defineProps({
  navData: { type: Array, default: () => [] },
  activeCategory: { type: String, default: '' },
  collapsed: { type: Boolean, default: false },
  collapsedGroups: { type: Array, default: () => [] },
  overlay: { type: Boolean, default: false },
  basePath: { type: String, default: '' },
  mounted: { type: Boolean, default: true },
})
const emit = defineEmits(['toggle-menu', 'toggle-group', 'navigate'])

const isNarrow = computed(() => props.collapsed && !props.overlay)

const flyout = ref(null)
let closeTimer = null

function isExpanded(item) {
  if (isNarrow.value) return !!flyout.value && flyout.value.item.id === item.id
  return !props.collapsedGroups.includes(item.id)
}
function isGroupActive(item) {
  return item.children?.some((child) => child.id === props.activeCategory)
}
function onWrapperEnter(item, event) {
  if (!isNarrow.value || !item.children) return
  const rect = event.currentTarget.getBoundingClientRect()
  const estimated = 52 + item.children.length * 44
  flyout.value = {
    item,
    top: Math.max(8, Math.min(rect.top, window.innerHeight - estimated - 12)),
    left: rect.right + 8,
  }
  cancelClose()
}
function scheduleClose() {
  cancelClose()
  closeTimer = setTimeout(() => { flyout.value = null }, 160)
}
function cancelClose() { clearTimeout(closeTimer) }
function closeFlyout() { cancelClose(); flyout.value = null }

function onGroupClick(item, event) {
  // 折叠态点击分组图标必须给出可见反馈，而不是悄悄改一个看不见的展开状态
  if (isNarrow.value) { onWrapperEnter(item, event); return }
  emit('toggle-group', item.id)
}
function onNavigate(id) {
  emit('navigate', id)
  closeFlyout()
}

// 侧栏图标不再包底片：默认裸图标落在画布上（颜色由父行 text 继承），
// 背景高亮只在 hover/激活时以「整行」形式出现（见 topLinkClass/groupClass/childClass）。
// 这样图标视觉重量骤降，侧栏从「一排小方块」变成「一排干净图标 + 文字」。
function iconBoxClass() {
  return [
    'w-8 h-8 shrink-0 flex items-center justify-center transition-colors',
  ]
}
function topLinkClass(id) {
  const active = props.activeCategory === id
  return [
    'sidebar-row relative flex items-center min-h-[44px] rounded-control text-body',
    active ? 'bg-surface-3 text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-2',
  ]
}
function groupClass(item) {
  return [
    'sidebar-row w-full relative flex items-center min-h-[44px] rounded-control cursor-pointer hover:bg-surface-2 text-left',
    isGroupActive(item) ? 'text-ink' : 'text-ink-muted',
  ]
}
function childClass(id) {
  const active = props.activeCategory === id
  return [
    'relative flex items-center gap-2 min-h-[40px] pl-2 pr-2 rounded-control text-body transition-colors duration-200',
    active ? 'bg-surface-3 text-ink' : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
  ]
}

onUnmounted(() => { cancelClose() })
defineExpose({ closeFlyout })
</script>
