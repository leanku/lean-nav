<template>
  <AppShell ref="shellRef" v-model="searchQuery" :source="source" :nav-data="navData"
    :active-category="activeCategory" :collapsed-groups="collapsedGroups"
    @toggle-group="toggleGroup" @navigate="onNavigate" @open-editor="editorOpen = true"
    @submit="openFirstResult" @clear="onClearSearch">

    <article class="px-5 sm:px-7 lg:px-10 pt-5 sm:pt-7 lg:pt-10 pb-14 sm:pb-16 lg:pb-20 flex-1">

      <!-- 收藏与最近访问：静态站用本机存储实现「自己的起始页」。
           容器常驻 DOM：高度由 html[data-personal] 在首帧预留（见 app.vue 的 head 脚本 + main.css），
           hydration 只填内容、不改高度，避免分类列表被往下推。搜索时用 hidden 整块收起。 -->
      <div data-personal class="personal-slot space-y-5" :hidden="!!searchQuery.trim()">
        <section v-if="favorites.length">
          <h2 class="flex items-center gap-2 mb-3 text-body font-medium text-ink">
            <Star class="nav-icon w-4 h-4 text-ink" fill="currentColor" aria-hidden="true" />
            我的收藏 <span class="tnum text-caption text-ink-subtle">{{ favorites.length }}</span>
          </h2>
          <div class="personal-row flex gap-2">
            <div v-for="site in favorites" :key="site.url"
              class="inline-flex items-center shrink-0 rounded-control bg-surface-1 border border-hairline hover:bg-surface-2 transition-colors">
              <a :href="site.url" target="_blank" rel="noopener noreferrer nofollow" @click="recordVisit(site)"
                class="min-h-[44px] flex items-center pl-3 pr-1 text-body text-ink whitespace-nowrap">
                {{ site.title }}<span class="ml-1 text-caption text-ink-tertiary">↗</span>
              </a>
              <span role="button" tabindex="0" :aria-label="`取消收藏 ${site.title}`" title="取消收藏"
                @click="removeFavorite(site.url)" @keydown.enter.prevent="removeFavorite(site.url)"
                @keydown.space.prevent="removeFavorite(site.url)"
                class="w-8 h-8 mr-1 flex items-center justify-center rounded-control text-ink-tertiary hover:text-danger hover:bg-surface-2 cursor-pointer transition-colors">×</span>
            </div>
          </div>
        </section>

        <section v-if="recent.length">
          <h2 class="flex items-center gap-2 mb-3 text-body font-medium text-ink">
            <Clock3 class="nav-icon w-4 h-4 text-ink" aria-hidden="true" /> 最近访问
          </h2>
          <div class="personal-row flex gap-2">
            <a v-for="site in recent" :key="site.url" :href="site.url" target="_blank"
              rel="noopener noreferrer nofollow" @click="recordVisit(site)"
              class="min-h-[44px] inline-flex items-center px-3 shrink-0 whitespace-nowrap rounded-control bg-surface-1 border border-hairline text-body text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors">
              {{ site.title }}
            </a>
          </div>
        </section>
      </div>

      <div v-if="searchQuery.trim()"
        class="mb-6 flex items-center justify-between gap-3 text-body text-ink-subtle">
        <span role="status" aria-live="polite">
          找到 <b class="tnum text-ink font-medium">{{ resultCount }}</b> 个结果 · <span class="tnum">{{ Object.keys(displayData).length }}</span> 个栏目
          <span class="ml-2 hidden sm:inline text-caption text-ink-tertiary">回车打开第一个结果</span>
        </span>
        <button @click="onClearSearch" type="button" class="shrink-0 text-body hover:text-ink transition-colors">清空搜索</button>
      </div>

      <div v-for="item in navData" :key="item.id || item.name">
        <template v-for="group in (item.children ? item.children : [item])" :key="group?.id">
          <section v-if="group?.id && displayData[group.id]" :id="group.id"
            class="mb-[72px] scroll-mt-24 category-section">
            <!-- 编辑式标头：墨色竖条 + 22px 栏目主标题 + 计数 + 延伸细线，结构感不靠色块 -->
            <div class="flex items-center gap-3 mb-6">
              <span class="w-[2px] h-[18px] rounded-full shrink-0" :style="{ backgroundColor: accentOf(group.id) }" aria-hidden="true"></span>
              <h2 class="section-title text-ink whitespace-nowrap">{{ group.name }}</h2>
              <span class="tnum text-caption text-ink-tertiary">{{ displayData[group.id].length }}</span>
            </div>

            <div class="grid gap-3 site-grid">
              <a v-for="(site, si) in displayData[group.id]" :key="group.id + '-' + si" :href="site.url"
                target="_blank" rel="noopener noreferrer nofollow" @click="recordVisit(site)"
                @mouseenter="showTip(site, $event)" @mouseleave="hideTip" @focusin="showTip(site, $event)" @focusout="hideTip"
                class="site-card group relative flex items-center gap-3 px-4 py-3 h-[84px] bg-surface-1 border border-hairline">

                <!-- favicon 直接置于卡片，去掉底片背景与边框；40px 图标更醒目，透明图标不糊（卡片底色已统一） -->
                <div class="relative w-11 h-11 shrink-0 flex items-center justify-center overflow-hidden">
                  <span class="absolute inset-0 flex items-center justify-center text-[20px] font-medium text-ink-subtle"
                    aria-hidden="true">{{ (site.title || '?').charAt(0) }}</span>
                  <img v-if="iconSrc(site.url)" :src="iconSrc(site.url)" alt="" aria-hidden="true" loading="lazy"
                    decoding="async" class="relative w-10 h-10 object-contain" @error="onIconError" />
                </div>

                <div class="flex-1 min-w-0 pr-4">
                  <div class="flex items-center gap-1.5">
                    <h3 class="text-card-title text-ink truncate">{{ site.title }}</h3>
                    <ArrowUpRight class="nav-icon w-3 h-3 text-ink-tertiary group-hover:text-ink shrink-0 transition-[color,transform] duration-[160ms] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" aria-hidden="true" />
                  </div>
                  <p v-if="site.desc" class="text-body text-ink-muted mt-1 truncate">{{ site.desc }}</p>
                </div>

                <span role="button" tabindex="0"
                  :aria-label="isFavorite(site.url) ? `取消收藏 ${site.title}` : `收藏 ${site.title}`"
                  :title="isFavorite(site.url) ? '取消收藏' : '收藏到我的导航'"
                  @click.prevent.stop="toggleFav(site)" @keydown.enter.prevent.stop="toggleFav(site)"
                  @keydown.space.prevent.stop="toggleFav(site)"
                  :class="[
                    'fav-toggle absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-control cursor-pointer',
                    isFavorite(site.url) ? 'is-favorite text-ink' : 'text-ink-tertiary hover:text-ink hover:bg-surface-3'
                  ]">
                  <Star class="nav-icon w-3.5 h-3.5" :fill="isFavorite(site.url) ? 'currentColor' : 'none'" aria-hidden="true" />
                </span>
              </a>
            </div>
          </section>
        </template>
      </div>

      <div v-if="searchQuery.trim() && !resultCount" class="py-20">
        <SearchX class="nav-icon w-9 h-9 mb-4 text-ink-tertiary" aria-hidden="true" />
        <p class="text-section text-ink">没有找到与「{{ searchQuery }}」相关的资源</p>
        <p class="text-body text-ink-subtle mt-2">换个更短的关键词，或试试这些常用词：</p>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button v-for="word in suggestions" :key="word" @click="searchQuery = word" type="button"
            class="min-h-[44px] px-3 rounded-control border border-hairline text-body text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors">
            {{ word }}
          </button>
        </div>
        <button @click="onClearSearch" type="button"
          class="mt-6 min-h-[44px] px-5 text-body rounded-control bg-primary hover:bg-primary-hover text-on-primary transition press">清空搜索</button>
      </div>
    </article>

    <AppFooter />
  </AppShell>

  <NavEditor :key="editorKey" v-model:open="editorOpen" :config="config" :source="source"
    @save="onSaveConfig" @reset="onResetConfig" />

  <Transition name="fade">
    <button v-show="showBackToTop" @click="scrollToTop" type="button" aria-label="回到顶部" title="回到顶部"
      class="fixed bottom-8 right-8 z-50 w-11 h-11 bg-primary text-on-primary rounded-control flex items-center justify-center hover:bg-primary-hover transition duration-[160ms] press">
      <ChevronDown class="nav-icon w-5 h-5 rotate-180" aria-hidden="true" />
    </button>
  </Transition>

  <!-- 网址气泡：独立挂在 body 上的固定定位元素，由 showTip 按卡片位置实时定位，
       永不被父级 overflow 裁切、也不被下一分类卡片遮挡（参考 webstack 的固定气泡）。 -->
  <Teleport to="body">
    <div v-if="tip.show" ref="tipEl" class="url-tip" :class="{ 'tip-above': tip.above }"
      :style="{ left: tip.left + 'px', top: tip.top + 'px' }" role="tooltip">
      {{ tip.text }}
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { ChevronDown, Star, Clock3, SearchX, ArrowUpRight } from 'lucide-vue-next'
import { useNavConfig, listCategories } from '@/composables/useNavConfig'
import { useFavorites } from '@/composables/useFavorites'
import { useGroupExpansion } from '@/composables/useGroupExpansion'
import localIcons from '@/data/local-icons.json'
import NavEditor from '@/components/NavEditor.vue'
import AppShell from '@/components/AppShell.vue'

const route = useRoute()
const { config, source, init, save, reset } = useNavConfig()
const {
  favorites, recent, init: initFavorites, isFavorite,
  toggle: toggleFavorite, remove: removeFavorite, recordVisit,
} = useFavorites()

const navData = computed(() => config.value.groups)
const shellRef = ref(null)

const getDomain = (url) => {
  try { return new URL(url).hostname.toLowerCase() } catch { return '' }
}
const iconFiles = localIcons.files || {}
// 250 张卡片会反复调用 iconSrc；按 url 缓存，避免每次渲染都做 URL 解析
const iconSrcCache = new Map()
/** 内置站点全部走本地图标（零外部请求）；只有自定义/分享/站点配置里的新域名才尝试在线 favicon，失败仍有首字母色块兜底 */
const iconSrc = (url) => {
  if (iconSrcCache.has(url)) return iconSrcCache.get(url)
  const host = getDomain(url)
  const src = !host ? ''
    : iconFiles[host] ? `/icons/${iconFiles[host]}`
    : source.value === 'default' ? '' : `https://icon.horse/icon/${host}`
  iconSrcCache.set(url, src)
  return src
}
const onIconError = (event) => { event.target.style.display = 'none' }

// 网址 tooltip：参考 webstack 的独立固定定位气泡，挂在 body 上由 JS 实时定位，
// 不依附于卡片内部，故永远不被父级 overflow 裁切、也不被下一分类卡片遮挡；
// 下方空间不足时自动翻到卡片上方。纯中性深灰样式，守无彩色外壳约束。
const tip = reactive({ show: false, text: '', above: false, left: 0, top: 0 })
const tipEl = ref(null)

function positionTip(card) {
  const r = card.getBoundingClientRect()
  const el = tipEl.value
  const tipW = el ? el.offsetWidth : 220
  const tipH = el ? el.offsetHeight : 32
  const gap = 8
  // 水平：贴近卡片左缘，并夹在视口内
  let left = r.left + 12
  left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8))
  // 垂直：默认浮于卡片下方；下方放不下且上方有空间才翻到上方
  const belowFits = (window.innerHeight - r.bottom) >= tipH + gap
  let top
  if (!belowFits && r.top - gap - tipH > 0) {
    top = r.top - gap - tipH
    tip.above = true
  } else {
    top = r.bottom + gap
    tip.above = false
  }
  tip.left = left
  tip.top = top
}
function showTip(site, e) {
  tip.text = site.url
  tip.show = true
  // 等元素渲染后再量尺寸定位（v-if 挂载后 nextTick 才可读取真实宽高）
  nextTick(() => positionTip(e.currentTarget))
}
function hideTip() {
  tip.show = false
}
// 滚动时位置会失真，直接收起气泡
onMounted(() => window.addEventListener('scroll', hideTip, true))
onUnmounted(() => window.removeEventListener('scroll', hideTip, true))

// 墨色 4 级明度只写在 main.css 的 --accent-1..4；颜色不承担导航功能
const hashOf = (text) => {
  let hash = 0
  for (const ch of (text || '?')) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return hash
}
const accentOf = (id) => `var(--accent-${hashOf(id) % 4 + 1})`

const { public: { siteUrl } } = useRuntimeConfig()
const ogImage = `${siteUrl}/og-image.png`

useSeoMeta({
  title: 'LeanNav | 极简导航',
  ogTitle: 'LeanNav - 极简高效的网址导航',
  description: '汇集全球优质编程、设计与实用工具，提供极简高效的上网导航。',
  ogDescription: '汇集全球优质编程、设计与实用工具。',
  ogImage,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})

/* 结构化数据只列出真实存在的栏目锚点 */
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: listCategories(config.value)
    .filter((category) => category.sites.length)
    .map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: category.name,
      url: `${siteUrl}/#${category.id}`,
    })),
})
useHead({ script: [{ type: 'application/ld+json', children: structuredData }] })

/* ---------- 状态 ---------- */
const searchQuery = ref('')
const showBackToTop = ref(false)
const activeCategory = ref('')
const { collapsedGroups, toggleGroup } = useGroupExpansion(navData)
const editorOpen = ref(false)
const editorKey = ref(0)
const suggestions = ['AI', 'GitHub', '设计', '文档', '工具']

const toggleFav = (site) => toggleFavorite(site)

/* 分组展开状态见 useGroupExpansion：默认全收起 + 记忆用户选择，
   不再随滚动高亮自动展开（v1.5 改，原「只展开当前」联动已移除）。 */

/* ---------- 搜索 ---------- */
const leafCategories = computed(() => listCategories(config.value))
const queryTokens = computed(() => searchQuery.value.trim().toLowerCase().split(/\s+/).filter(Boolean))
const displayData = computed(() => {
  const tokens = queryTokens.value
  const result = {}
  leafCategories.value.forEach((category) => {
    const sites = (category.sites || []).filter((site) => site.title && site.url)
    const matched = tokens.length
      ? sites.filter((site) => {
          const text = `${site.title} ${site.desc} ${getDomain(site.url)} ${category.name} ${category.groupName}`.toLowerCase()
          return tokens.every((token) => text.includes(token))
        })
      : sites
    if (matched.length) result[category.id] = matched
  })
  return result
})
const resultCount = computed(() => Object.values(displayData.value).reduce((sum, sites) => sum + sites.length, 0))
const firstResult = computed(() => Object.values(displayData.value).find((sites) => sites.length)?.[0] || null)

function onClearSearch() { searchQuery.value = '' }
function openFirstResult() {
  if (!searchQuery.value.trim()) { shellRef.value?.focusSearch(); return }
  if (firstResult.value) {
    recordVisit(firstResult.value)
    window.open(firstResult.value.url, '_blank', 'noopener,noreferrer')
  }
}
function onKeydown(event) {
  if (editorOpen.value) return
  // 用户主动滚动时立刻交还高亮联动权
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) releaseNavLock()
  const target = event.target
  const typing = target instanceof HTMLElement &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    shellRef.value?.focusSearch()
  } else if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
    event.preventDefault()
    shellRef.value?.focusSearch()
  }
}

/* ---------- 滚动联动 ----------
   不能用「相交集合里 top 最小的分区」判定当前栏目：已经滚上去的旧分区 top 更小，
   会被误当成当前项。页面底部最后几个分区受滚动上限约束，永远到不了判定线，
   旧实现因此会在点击底部栏目、锁定期结束后把高亮跳回上一项。
   现在统一按「阅读线」判定：取最后一个越过阅读线的栏目；触底时直接认最后一个栏目。
   点击 / 改 hash 先锁定点击项，平滑滚动停稳后继续保持，直到用户再次主动滚动
   才恢复联动，避免滚动途中一路点亮沿途分区。 */
const READING_LINE = 160 // scroll-mt-24 为 96px，再留一段卡片高度的容差
let observer = null
let scrollRaf = 0
let activeRaf = 0
let pendingActiveTimer = 0
let pendingActiveId = ''
let anchorLock = false
let anchorSettled = false
let anchorSettledY = 0
let anchorSettleTimer = 0

function sectionElements() {
  return [...document.querySelectorAll('.category-section')]
}
function activeIdAtScroll() {
  const sections = sectionElements()
  if (!sections.length) return ''
  // 触底后最后一个分区可能整体停在阅读线下方，此时它才是用户正在看的内容
  const doc = document.documentElement
  if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
    return sections[sections.length - 1].id
  }
  let current = sections[0].id
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= READING_LINE) current = section.id
    else break
  }
  return current
}
function commitActive(id) {
  if (id && id !== activeCategory.value) activeCategory.value = id
}
function scheduleActive(id) {
  if (!id || id === activeCategory.value || id === pendingActiveId) return
  pendingActiveId = id
  clearTimeout(pendingActiveTimer)
  // content-visibility 懒渲染会改变未渲染分区的高度，边界处短去抖避免来回切
  pendingActiveTimer = setTimeout(() => { commitActive(id); pendingActiveId = '' }, 90)
}
function requestRecompute() {
  if (activeRaf) return
  activeRaf = requestAnimationFrame(() => {
    activeRaf = 0
    if (!anchorLock) scheduleActive(activeIdAtScroll())
  })
}
function lockNavHighlight(id) {
  clearTimeout(pendingActiveTimer)
  pendingActiveId = ''
  commitActive(id)
  anchorLock = true
  anchorSettled = false
  clearTimeout(anchorSettleTimer)
  // 锚点本来就在视口内时不会产生 scroll 事件，兜底也要进入「已停稳」状态
  anchorSettleTimer = setTimeout(() => { anchorSettled = true; anchorSettledY = window.scrollY }, 700)
}
function releaseNavLock() {
  if (!anchorLock) return
  anchorLock = false
  anchorSettled = false
  clearTimeout(anchorSettleTimer)
  requestRecompute()
}
function setupObserver() {
  observer?.disconnect()
  if (typeof IntersectionObserver === 'undefined') return
  // 只作为「布局发生变化」的信号：content-visibility 懒渲染会改变文档高度
  observer = new IntersectionObserver(requestRecompute, { threshold: [0, 0.01, 0.5] })
  sectionElements().forEach((element) => observer.observe(element))
}
function onScroll() {
  if (anchorLock) {
    clearTimeout(anchorSettleTimer)
    anchorSettleTimer = setTimeout(() => { anchorSettled = true; anchorSettledY = window.scrollY }, 160)
    // 停稳之后的位移才是用户自己滚的；滚动途中的位移属于程序化平滑滚动
    if (anchorSettled && Math.abs(window.scrollY - anchorSettledY) > 2) releaseNavLock()
  }
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0
    showBackToTop.value = window.scrollY > 500
    if (!anchorLock) scheduleActive(activeIdAtScroll())
  })
}
function onResize() {
  if (anchorLock) releaseNavLock()
  else requestRecompute()
}
function onHashChange() {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (id && document.getElementById(id)?.classList.contains('category-section')) lockNavHighlight(id)
}
const onNavigate = (id) => {
  lockNavHighlight(id)
}
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  const first = Object.keys(displayData.value)[0] || ''
  if (first) lockNavHighlight(first)
}
watch(displayData, () => nextTick(() => {
  releaseNavLock()
  setupObserver()
  onScroll()
  const ids = sectionElements().map((element) => element.id)
  if (activeCategory.value && !ids.includes(activeCategory.value)) commitActive(ids[0] || '')
}))

/* ---------- 编辑器回调 ---------- */
const onSaveConfig = (nextConfig) => {
  save(nextConfig)
  nextTick(() => { setupObserver(); onScroll() })
}
const onResetConfig = () => {
  reset()
  editorKey.value += 1
  nextTick(() => { setupObserver(); onScroll() })
}

/* 首屏防跳：head 脚本已在首帧设好 data-personal，这里让 flag 与真实 state 对齐，
   覆盖 SPA 导航回首页（模块级 state 已有值、flag 还是首次加载时算的）等情况。
   不在 setup 阶段立即执行，否则会覆盖 head 脚本写入的首帧预留值。 */
function syncPersonalFlag() {
  if (!import.meta.client) return
  const hasF = favorites.value.length > 0
  const hasR = recent.value.length > 0
  document.documentElement.dataset.personal = hasF && hasR ? 'both' : hasF ? 'fav' : hasR ? 'recent' : 'none'
}
watch([favorites, recent], syncPersonalFlag)

/* ---------- 生命周期 ---------- */
onMounted(async () => {
  initFavorites()
  syncPersonalFlag()

  await init()
  iconSrcCache.clear()
  if (!activeCategory.value) activeCategory.value = Object.keys(displayData.value)[0] || ''

  const q = route.query.q
  if (typeof q === 'string' && q) searchQuery.value = q
  if (route.query.editor === '1') editorOpen.value = true

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('wheel', releaseNavLock, { passive: true })
  window.addEventListener('touchstart', releaseNavLock, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('hashchange', onHashChange)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.scrollBehavior = 'smooth'
  }
  nextTick(() => { setupObserver(); onScroll() })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('wheel', releaseNavLock)
  window.removeEventListener('touchstart', releaseNavLock)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('hashchange', onHashChange)
  observer?.disconnect()
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  if (activeRaf) cancelAnimationFrame(activeRaf)
  clearTimeout(anchorSettleTimer)
  clearTimeout(pendingActiveTimer)
  document.documentElement.style.scrollBehavior = ''
})
</script>
