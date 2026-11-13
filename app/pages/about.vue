<template>
  <AppShell v-model="searchQuery" :source="source" :nav-data="navData" :active-category="activeCategory"
    :collapsed-groups="collapsedGroups" base-path="/" :show-search="false" title="关于本站"
    @toggle-group="toggleGroup" @navigate="onNavigate" @open-editor="goCustomize">
    <template #header-extra>
      <NuxtLink to="/"
        class="hidden sm:flex shrink-0 min-h-[44px] items-center px-2.5 rounded-control text-body text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors">
        返回导航
      </NuxtLink>
    </template>

    <!-- 与首页同一壳：左对齐。宽屏用双栏——左正文（限宽可读）+ 右信息卡（填掉右侧空白） -->
    <main class="w-full px-5 sm:px-7 lg:px-10 py-12 sm:py-16 flex-1">
      <div class="flex flex-col lg:flex-row lg:gap-12 xl:gap-16">
        <!-- 左：正文，限宽到 ~72ch 保证长文可读 -->
        <div class="flex-1 min-w-0 max-w-[72ch]">
          <img src="/navigator.png" alt="" width="36" height="36" class="brand-mark w-9 h-9 mb-6" aria-hidden="true" />
          <h1 class="page-title text-ink">关于 LeanNav</h1>
          <p class="mt-3 text-body text-ink-muted leading-7">
            LeanNav 是一个极简的网址导航。人工收录常用资源，去掉冗余信息，只为在几秒内找到并打开一个站点。
            站点完全静态、没有后端，也可以完全改成你自己的分类和网站。
          </p>

          <section class="mt-12 pt-8 border-t border-hairline">
            <h2 class="text-section text-ink mb-5">三步配成自己的导航</h2>
            <ol class="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              <li v-for="(step, index) in steps" :key="step.title" class="flex gap-4">
                <span
                  class="tnum w-6 h-6 mt-0.5 shrink-0 rounded-control bg-surface-2 flex items-center justify-center text-caption text-ink-muted"
                  aria-hidden="true">{{ index + 1 }}</span>
                <div>
                  <h3 class="text-body font-medium text-ink">{{ step.title }}</h3>
                  <p class="mt-1 text-body text-ink-subtle leading-6">{{ step.desc }}</p>
                </div>
              </li>
            </ol>
            <NuxtLink to="/customize"
              class="inline-flex items-center min-h-[44px] mt-6 px-4 rounded-control bg-primary hover:bg-primary-hover text-on-primary text-body font-medium transition-colors">
              开始自定义
            </NuxtLink>
          </section>

          <section class="mt-12 pt-8 border-t border-hairline">
            <h2 class="text-section text-ink mb-4">数据只保存在这台设备</h2>
            <p class="text-body text-ink-subtle leading-7">
              你的分类、网站、收藏和最近访问都只存在当前浏览器里，不会上传，也不需要注册。
              换设备时用「下载配置备份」和「导入配置文件」迁移；想让别人看到同一套导航，可以复制分享链接；
              想让全站访客都看到，把 <code class="px-1.5 py-0.5 rounded-control bg-surface-2 font-mono text-caption text-ink-muted">nav-config.json</code>
              上传到网站根目录即可，不需要重新打包。
            </p>
          </section>
        </div>

        <!-- 右：信息卡，宽屏时填充正文右侧空白；窄屏隐藏 -->
        <aside class="w-full lg:w-[360px] xl:w-[420px] shrink-0 space-y-6 lg:pt-24">
          <div class="rounded-card border border-hairline bg-surface-1 p-6">
            <h2 class="text-section text-ink mb-4">当前收录</h2>
            <dl class="grid grid-cols-3 gap-4">
              <div v-for="item in stats" :key="item.label">
                <dt class="text-caption text-ink-subtle">{{ item.label }}</dt>
                <dd class="tnum mt-1 text-title text-ink">{{ item.value }}</dd>
              </div>
            </dl>
            <p class="mt-4 text-body text-ink-subtle">内置站点的图标随项目一起发布，默认无需外部请求。</p>
          </div>

          <div class="rounded-card border border-hairline bg-surface-1 p-6">
            <h2 class="text-section text-ink mb-4">反馈与贡献</h2>
            <p class="text-body text-ink-subtle mb-3">发现好站、内容失效或有改进建议，欢迎提交 Issue 或 PR。</p>
            <div class="space-y-2.5">
              <a href="https://github.com/leanku/lean-nav/issues" target="_blank" rel="noopener noreferrer"
                class="link inline-flex items-center min-h-[40px] gap-2 text-body text-ink-muted hover:text-ink">
                <MessageCircle class="nav-icon w-4 h-4" aria-hidden="true" /> GitHub Issues
              </a>
              <a href="https://github.com/leanku/lean-nav" target="_blank" rel="noopener noreferrer"
                class="link inline-flex items-center min-h-[40px] gap-2 text-body text-ink-muted hover:text-ink">
                <Github class="nav-icon w-4 h-4" aria-hidden="true" /> GitHub 源码
              </a>
            </div>
          </div>

          <div class="rounded-card border border-hairline bg-surface-1 p-6">
            <h2 class="text-section text-ink mb-4">快捷入口</h2>
            <div class="space-y-2.5">
              <NuxtLink to="/" class="link block min-h-[40px] text-body text-ink-muted hover:text-ink">返回导航</NuxtLink>
              <NuxtLink to="/customize" class="link block min-h-[40px] text-body text-ink-muted hover:text-ink">自定义导航</NuxtLink>
              <NuxtLink to="/about" class="link block min-h-[40px] text-body text-ink-muted hover:text-ink">关于本站</NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <AppFooter />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessageCircle, Github } from 'lucide-vue-next'
import { useNavConfig, listCategories, countSites } from '@/composables/useNavConfig'
import { useGroupExpansion } from '@/composables/useGroupExpansion'
import AppShell from '@/components/AppShell.vue'

useSeoMeta({
  title: '关于项目 - LeanNav',
  description: 'LeanNav 是提供优质网站与工具导航的极简项目，支持完全可视化自定义、无需后端。',
})

const router = useRouter()
const { config, source, init } = useNavConfig()
const navData = computed(() => config.value.groups)

const searchQuery = ref('')
// 当前就在「关于本站」页，侧栏应当保持该项选中，否则点底部菜单后高亮会整块消失
const activeCategory = ref('about')

// 与首页共用分组展开状态：默认全收起 + 记忆用户选择（见 useGroupExpansion）
const { collapsedGroups, toggleGroup } = useGroupExpansion(navData)
const stats = computed(() => [
  { label: '分类', value: navData.value.length },
  { label: '栏目', value: listCategories(config.value).length },
  { label: '站点', value: countSites(config.value) },
])
const steps = [
  { title: '改分类和网站', desc: '点右上角「自定义」，或在独立页里增删改名、调整顺序、批量粘贴网址。改动实时生效并自动保存。' },
  { title: '带走或分享', desc: '下载配置备份可在另一台设备导入；复制分享链接，对方打开就能看到你这套导航。' },
  { title: '发布给所有人', desc: '下载 nav-config.json 上传到网站根目录，全站访客立即看到新配置，不需要后端或重新构建。' },
]

function onNavigate(id) { activeCategory.value = id }
function goCustomize() { router.push('/customize') }

onMounted(async () => {
  await init()
})
</script>
