<template>
  <div v-if="open" :class="isPage ? 'h-full min-h-0 flex flex-col' : 'fixed inset-0 z-[90]'">
    <div v-if="!isPage" class="absolute inset-0 bg-black/45 backdrop-blur-sm" @click="close"></div>

    <aside ref="panelEl" :class="[
      isPage
        ? 'app-editor h-full w-full bg-canvas flex flex-col'
        : 'app-editor absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-surface-1 border-l border-hairline shadow-popover flex flex-col',
      isPage ? '' : 'editor-panel'
    ]" role="dialog" :aria-modal="isPage ? undefined : 'true'" aria-label="自定义导航">
      <header class="h-16 px-5 flex items-center justify-between border-b border-hairline flex-shrink-0">
        <div>
          <h2 class="text-body font-medium text-ink">自定义导航</h2>
          <p class="text-caption text-ink-subtle mt-0.5">改动实时生效，自动保存在这台设备</p>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- 抽屉只做快速增改，批量管理去独立页 -->
          <NuxtLink v-if="!isPage" to="/customize"
            class="min-h-[44px] px-2.5 flex items-center gap-1 rounded-control text-body text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors">
            完整管理 <ArrowUpRight class="nav-icon w-3.5 h-3.5" />
          </NuxtLink>
          <button v-if="isPage" @click="close" type="button"
            class="min-h-[44px] px-4 rounded-control bg-primary hover:bg-primary-hover text-on-primary text-body font-medium transition press">完成</button>
          <button v-else @click="close" aria-label="关闭编辑器" type="button"
            class="w-11 h-11 flex items-center justify-center rounded-control text-ink-muted hover:bg-surface-2 transition-colors">
            <X class="nav-icon w-4 h-4" />
          </button>
        </div>
      </header>

      <nav class="px-5 pt-3 flex gap-1 flex-shrink-0 border-b border-hairline" aria-label="编辑区">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
          'min-h-[44px] px-3 text-body rounded-t-control -mb-px border-b-2 transition-colors',
          activeTab === tab.id
            ? 'text-primary border-primary font-medium'
            : 'text-ink-subtle border-transparent hover:text-ink'
        ]">{{ tab.name }}</button>
      </nav>

      <div class="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">

        <!-- 分类管理 -->
        <div v-if="activeTab === 'categories'" class="space-y-3">
          <p class="text-caption text-ink-subtle leading-relaxed">
            分类即左侧菜单。一个「分组」下可以放多个栏目；网址直接填域名即可，会自动补全 https://
          </p>

          <div v-for="(group, gi) in draft.groups" :key="group.id"
            class="rounded-card border border-hairline bg-surface-1 p-3">
            <div class="flex items-center gap-1.5">
              <IconPicker :model-value="group.icon"
                @update:model-value="(name) => { group.icon = name; commit() }" />
              <input v-model="group.name" @input="commit" placeholder="分类名称"
                class="flex-1 min-w-0 min-h-[40px] bg-surface-2 field rounded-control px-2.5 text-body text-ink placeholder:text-ink-tertiary" />
              <button @click="moveGroup(gi, -1)" :disabled="gi === 0" aria-label="上移" class="icon-btn" title="上移">
                <ArrowUp class="nav-icon w-4 h-4" />
              </button>
              <button @click="moveGroup(gi, 1)" :disabled="gi === draft.groups.length - 1" aria-label="下移" class="icon-btn" title="下移">
                <ArrowDown class="nav-icon w-4 h-4" />
              </button>
              <button @click="removeGroup(gi)" aria-label="删除分类" class="icon-btn icon-btn-danger" title="删除分类">
                <X class="nav-icon w-4 h-4" />
              </button>
            </div>

            <input v-if="group.url !== undefined" v-model="group.url" @input="commit" placeholder="页面链接，如 /about"
              class="mt-2 w-full min-h-[40px] bg-surface-2 field rounded-control px-2.5 text-body text-ink placeholder:text-ink-tertiary" />

            <div v-if="group.children" class="mt-2.5 pl-3 border-l border-hairline space-y-1.5">
              <div v-for="(child, ci) in group.children" :key="child.id" class="flex items-center gap-1.5">
                <IconPicker :model-value="child.icon || 'Globe'"
                  @update:model-value="(name) => { child.icon = name; commit() }" />
                <input v-model="child.name" @input="commit" placeholder="栏目名称"
                  class="flex-1 min-w-0 min-h-[40px] bg-transparent field-underline px-1.5 text-body text-ink placeholder:text-ink-tertiary" />
                <span class="text-caption text-ink-subtle w-9 text-right shrink-0">{{ (child.sites || []).length }} 站</span>
                <button @click="moveChild(group, ci, -1)" :disabled="ci === 0" aria-label="上移栏目" class="icon-btn" title="上移">
                  <ArrowUp class="nav-icon w-4 h-4" />
                </button>
                <button @click="moveChild(group, ci, 1)" :disabled="ci === group.children.length - 1"
                  aria-label="下移栏目" class="icon-btn" title="下移">
                  <ArrowDown class="nav-icon w-4 h-4" />
                </button>
                <button @click="removeChild(group, ci)" aria-label="删除栏目" class="icon-btn icon-btn-danger" title="删除栏目">
                  <X class="nav-icon w-4 h-4" />
                </button>
              </div>
              <button @click="addChild(group)" type="button"
                class="min-h-[44px] text-body text-primary hover:text-primary-hover transition-colors">+ 添加栏目</button>
            </div>

            <div v-else-if="group.url === undefined"
              class="mt-2 flex items-center justify-between text-caption text-ink-subtle">
              <span>{{ (group.sites || []).length }} 个网站</span>
              <button @click="openSites(group.id)" type="button" class="text-primary hover:text-primary-hover">管理网站</button>
            </div>
            <div v-else class="mt-2 text-caption text-ink-subtle">页面链接（不在本页展示卡片）</div>
          </div>

          <div class="flex gap-2 pt-1">
            <button @click="addGroup(false)" type="button" class="tool-btn">+ 添加分类</button>
            <button @click="addGroup(true)" type="button" class="tool-btn">+ 添加分组</button>
          </div>
        </div>

        <!-- 网站管理 -->
        <div v-else-if="activeTab === 'sites'" class="space-y-3">
            <select v-model="activeCategoryId"
            class="w-full min-h-[44px] bg-surface-2 field rounded-control px-3 text-body text-ink">
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.groupName ? cat.groupName + ' / ' : '' }}{{ cat.name }}（{{ cat.sites.length }}）
            </option>
          </select>

          <div class="flex items-center justify-between">
            <span class="text-caption text-ink-subtle">共 {{ activeSites.length }} 个网站，改动即时保存</span>
            <button @click="addSite" type="button" class="text-body text-primary hover:text-primary-hover">+ 添加网站</button>
          </div>

          <div v-for="(site, si) in activeSites" :key="si"
            class="rounded-card border border-hairline bg-surface-1 p-3 space-y-1.5">
            <div class="flex items-center gap-1.5">
              <input v-model="site.title" @input="commit" placeholder="网站名称"
                class="flex-1 min-w-0 min-h-[40px] bg-surface-2 field rounded-control px-2.5 text-body text-ink placeholder:text-ink-tertiary" />
              <button @click="moveSite(si, -1)" :disabled="si === 0" aria-label="上移网站" class="icon-btn" title="上移">
                <ArrowUp class="nav-icon w-4 h-4" />
              </button>
              <button @click="moveSite(si, 1)" :disabled="si === activeSites.length - 1" aria-label="下移网站"
                class="icon-btn" title="下移">
                <ArrowDown class="nav-icon w-4 h-4" />
              </button>
              <button @click="removeSite(si)" aria-label="删除网站" class="icon-btn icon-btn-danger" title="删除网站">
                <X class="nav-icon w-4 h-4" />
              </button>
            </div>
            <input v-model="site.url" @input="commit" placeholder="网址，如 github.com"
              class="w-full min-h-[40px] bg-surface-2 field rounded-control px-2.5 text-body text-ink placeholder:text-ink-tertiary" />
            <input v-model="site.desc" @input="commit" placeholder="一句话简介"
              class="w-full min-h-[40px] bg-surface-2 field rounded-control px-2.5 text-body text-ink placeholder:text-ink-tertiary" />
          </div>

          <div v-if="!activeSites.length" class="py-8 text-body text-ink-subtle">
            这个栏目还没有网站，点「+ 添加网站」开始
          </div>

          <div class="pt-2 border-t border-hairline">
            <p class="text-caption text-ink-subtle mb-2">批量添加：每行一个网站，用竖线分隔「名称 | 网址 | 简介」</p>
            <textarea v-model="bulkText" rows="3" placeholder="GitHub | github.com | 全球最大代码托管平台"
              class="w-full bg-surface-2 field rounded-control px-3 py-2 text-body text-ink placeholder:text-ink-tertiary resize-y"></textarea>
            <button @click="importBulk" type="button" class="tool-btn mt-2">批量添加到当前栏目</button>
          </div>
        </div>

        <!-- 数据管理 -->
        <div v-else class="space-y-4">
          <div class="rounded-card bg-surface-1 border border-hairline p-4">
            <div class="text-caption text-ink-subtle">当前配置来源</div>
            <div class="text-body font-medium text-ink mt-1">{{ sourceLabel }}</div>
            <div class="text-caption text-ink-subtle mt-2">{{ categories.length }} 个栏目 · {{ siteCount }} 个网站</div>
          </div>

          <button v-if="source === 'link'" @click="saveShared" type="button" class="tool-btn tool-btn-primary">
            把这份分享配置保存到我的导航
          </button>

          <div class="space-y-2">
            <button @click="exportBackup" type="button" class="tool-btn">下载配置备份（.json）</button>
            <button @click="fileInput?.click()" type="button" class="tool-btn">导入配置文件</button>
            <button @click="copyShareLink" type="button" class="tool-btn">复制分享链接</button>
            <button @click="downloadSiteConfig" type="button" class="tool-btn tool-btn-primary">下载全站配置 nav-config.json</button>
            <button @click="resetAll" type="button" class="tool-btn tool-btn-danger">恢复站点默认配置</button>
            <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="onImportFile" />
          </div>

          <div class="rounded-card border border-hairline p-4 text-body leading-6 text-ink-subtle">
            <p class="font-medium text-ink mb-2">三种用法，都不需要懂代码</p>
            <p><span class="text-primary">1. 自己用</span>：直接改分类和网站，改动自动存在这个浏览器。换设备或浏览器时，用「下载配置备份」再到新设备「导入配置文件」。</p>
            <p><span class="text-primary">2. 发给别人</span>：点「复制分享链接」，对方打开就能看到你这套导航，可以再点按钮存成自己的。</p>
            <p><span class="text-primary">3. 让全站访客都看到</span>：下载 <code class="px-1 rounded-control bg-surface-2 font-mono text-caption text-ink-muted">nav-config.json</code>，上传到网站根目录（和 index.html 同级），刷新即可生效。不需要后端，也不需要重新打包。</p>
            <p class="mt-2 text-ink-tertiary">优先级：分享链接 &gt; 本机自定义 &gt; 站点配置文件 &gt; 内置默认。</p>
          </div>
        </div>
      </div>

      <footer class="min-h-[52px] px-5 flex items-center border-t border-hairline flex-shrink-0">
        <span class="text-caption" :class="toast ? 'text-primary' : 'text-ink-subtle'">
          {{ toast || '所有改动已自动保存，可随时关闭' }}
        </span>
        <button v-if="!isPage" @click="close" type="button"
          class="ml-auto min-h-[44px] px-4 text-body rounded-control bg-primary hover:bg-primary-hover text-on-primary transition press">完成</button>
      </footer>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { X, ArrowUp, ArrowDown, ArrowUpRight } from 'lucide-vue-next'
import {
  newId, listCategories, countSites, downloadJson, readConfigFile, encodeConfig,
} from '@/composables/useNavConfig'
import IconPicker from '@/components/IconPicker.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  config: { type: Object, required: true },
  source: { type: String, default: 'default' },
  variant: { type: String, default: 'drawer' }, // drawer | page
})
const emit = defineEmits(['update:open', 'save', 'reset', 'done'])
const isPage = computed(() => props.variant === 'page')

const clone = (value) => JSON.parse(JSON.stringify(value))
const tabs = [
  { id: 'categories', name: '分类管理' },
  { id: 'sites', name: '网站管理' },
  { id: 'data', name: '备份与发布' },
]

const activeTab = ref('categories')
const draft = ref(clone(props.config))
const activeCategoryId = ref('')
const bulkText = ref('')
const toast = ref('')
const fileInput = ref(null)
const panelEl = ref(null)
const dirty = ref(false)
let commitTimer = null
let toastTimer = null
let lastFocused = null

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    draft.value = clone(props.config)
    activeTab.value = 'categories'
    ensureActiveCategory()
    if (!isPage.value) {
      lastFocused = document.activeElement
      nextTick(() => panelEl.value?.querySelector('input, button')?.focus())
    }
  } else if (!isPage.value && lastFocused instanceof HTMLElement) {
    lastFocused.focus()
    lastFocused = null
  }
})
const categories = computed(() => listCategories(draft.value))
const siteCount = computed(() => countSites(draft.value))
function targetSites() {
  for (const group of draft.value.groups) {
    if (group.id === activeCategoryId.value && !group.url && !group.children) {
      return group.sites || (group.sites = [])
    }
    const child = (group.children || []).find((item) => item.id === activeCategoryId.value)
    if (child) return child.sites || (child.sites = [])
  }
  return null
}
const activeSites = computed(() => targetSites() || [])
const sourceLabel = computed(() => ({
  default: '站点内置默认配置',
  file: '站点配置文件 nav-config.json',
  local: '这台设备上的自定义配置',
  link: '正在预览别人分享的配置',
}[props.source] || '未知来源'))

function ensureActiveCategory() {
  if (!categories.value.some((cat) => cat.id === activeCategoryId.value)) {
    activeCategoryId.value = categories.value[0]?.id || ''
  }
}
watch(categories, ensureActiveCategory)

function notify(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2800)
}

function commitNow(force = false) {
  clearTimeout(commitTimer)
  if (!dirty.value && !force) return
  dirty.value = false
  emit('save', clone(draft.value))
}
function commit() {
  dirty.value = true
  clearTimeout(commitTimer)
  commitTimer = setTimeout(() => commitNow(true), 150)
}
function close() {
  commitNow()
  if (isPage.value) emit('done')
  else emit('update:open', false)
}

/* 抽屉是模态：Esc 关闭、Tab 焦点锁在面板内、关闭后归还焦点 */
function onDocKeydown(event) {
  if (!props.open || isPage.value) return
  if (event.key === 'Escape') { event.preventDefault(); close(); return }
  if (event.key !== 'Tab') return
  const nodes = [...(panelEl.value?.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ) || [])].filter((el) => el.offsetParent !== null)
  if (!nodes.length) return
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  else if (!panelEl.value?.contains(document.activeElement)) { event.preventDefault(); first.focus() }
}
onMounted(() => document.addEventListener('keydown', onDocKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onDocKeydown)
  clearTimeout(commitTimer)
  clearTimeout(toastTimer)
})

function moveItem(list, index, delta) {
  const target = index + delta
  if (target < 0 || target >= list.length) return
  const [item] = list.splice(index, 1)
  list.splice(target, 0, item)
  commitNow(true)
}

/* 分类 */
function addGroup(withChildren) {
  const group = { id: newId(), name: withChildren ? '新分组' : '新分类', icon: withChildren ? 'Boxes' : 'Globe' }
  if (withChildren) group.children = [{ id: newId(), name: '新栏目', icon: 'Globe', sites: [] }]
  else group.sites = []
  draft.value.groups.push(group)
  commitNow(true)
  notify(withChildren ? '已添加分组' : '已添加分类')
}
function removeGroup(index) {
  const group = draft.value.groups[index]
  const count = (group.children || []).reduce((sum, child) => sum + (child.sites || []).length, 0) + (group.sites || []).length
  if (!window.confirm(`删除「${group.name}」？其中 ${count} 个网站也会一起删除。`)) return
  draft.value.groups.splice(index, 1)
  commitNow(true)
}
function moveGroup(index, delta) { moveItem(draft.value.groups, index, delta) }
function addChild(group) {
  group.children.push({ id: newId(), name: '新栏目', icon: 'Globe', sites: [] })
  commitNow(true)
}
function removeChild(group, index) {
  const child = group.children[index]
  if ((child.sites || []).length && !window.confirm(`删除「${child.name}」及其 ${child.sites.length} 个网站？`)) return
  group.children.splice(index, 1)
  if (!group.children.length) {
    delete group.children
    group.sites = []
  }
  commitNow(true)
}
function moveChild(group, index, delta) { moveItem(group.children, index, delta) }
function openSites(id) {
  activeCategoryId.value = id
  activeTab.value = 'sites'
}

/* 网站 */
function addSite() {
  const list = targetSites()
  if (!list) { notify('请先选择一个栏目'); return }
  list.push({ title: '', url: '', desc: '' })
  commitNow(true)
}
function removeSite(index) {
  const list = targetSites()
  if (!list) return
  list.splice(index, 1)
  commitNow(true)
}
function moveSite(index, delta) {
  const list = targetSites()
  if (list) moveItem(list, index, delta)
}
function importBulk() {
  const list = targetSites()
  if (!list) { notify('请先选择一个栏目'); return }
  const lines = bulkText.value.split('\n').map((line) => line.trim()).filter(Boolean)
  let added = 0
  lines.forEach((line) => {
    const [title, url, ...rest] = line.split(/\s*[|\t]\s*/).map((part) => part.trim())
    if (!title || !url) return
    list.push({ title, url, desc: rest.join(' ').trim() })
    added += 1
  })
  bulkText.value = ''
  commitNow(true)
  notify(added ? `已添加 ${added} 个网站` : '没有识别到内容，请用「名称 | 网址 | 简介」格式')
}

/* 数据 */
function exportBackup() {
  downloadJson(draft.value, 'leannav-config.json')
  notify('配置备份已下载')
}
function downloadSiteConfig() {
  downloadJson(draft.value, 'nav-config.json')
  notify('已下载，上传到网站根目录即可全站生效')
}
async function onImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    draft.value = await readConfigFile(file)
    commitNow(true)
    ensureActiveCategory()
    notify('导入成功，已覆盖当前配置')
  } catch (error) {
    notify(`导入失败：${error.message}`)
  }
  event.target.value = ''
}
async function copyShareLink() {
  try {
    const encoded = await encodeConfig(draft.value)
    const url = `${window.location.origin}${window.location.pathname}#c=${encoded}`
    try {
      await navigator.clipboard.writeText(url)
      notify(`分享链接已复制（约 ${Math.round(url.length / 1024)} KB）${url.length > 8000 ? '，较大，建议改用配置文件' : ''}`)
    } catch (error) {
      window.prompt('复制下面的分享链接：', url)
    }
  } catch (error) {
    notify('生成分享链接失败：' + error.message)
  }
}
function saveShared() {
  commitNow(true)
  notify('已保存到这台设备')
}
function resetAll() {
  if (!window.confirm('恢复站点默认配置？当前自定义内容会丢失，建议先下载配置备份。')) return
  emit('reset')
}
</script>

<style scoped>
.editor-panel { animation: slide-in var(--dur-drawer) var(--ease-out); }
@keyframes slide-in {
  from { transform: translateX(24px); opacity: 0.6; }
  to { transform: translateX(0); opacity: 1; }
}
/* 按钮样式（.icon-btn / .tool-btn 等）已抽到 app/assets/css/main.css，全局统一 */
@media (prefers-reduced-motion: reduce) {
  .editor-panel { animation: none; }
}
</style>
