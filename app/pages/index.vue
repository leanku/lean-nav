<template>
    <div
        class="min-h-screen bg-[#f9f9f9] dark:bg-[#0f0f12] text-[#374151] dark:text-[#94a3b8] font-inter antialiased transition-colors duration-300">

        <Transition name="fade">
            <div v-if="!isCollapsed && isMobile" @click="isCollapsed = true"
                class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md lg:hidden"></div>
        </Transition>

        <aside :class="[
            isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 w-[240px]',
            'fixed inset-y-0 left-0 z-[70] bg-[#222327] dark:bg-[#15171e] text-white flex flex-col shadow-2xl overflow-hidden',
            isMounted ? 'transition-[width,transform] duration-200 cubic-bezier' : 'not-mounted'
        ]">

            <div class="h-16 flex items-center px-5 border-b border-white/[0.04] flex-shrink-0">
                <div class="flex items-center min-w-[36px]">
                    <div
                        class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-navigation text-white rotate-[15deg]">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                    </div>
                    <h1 :class="[
                        'ml-3 text-[14px] font-bold tracking-tight transition-opacity duration-200',
                        isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'
                    ]">
                        Lean<span class="text-blue-500">Nav</span>
                    </h1>
                </div>
            </div>

            <nav class="flex-1 overflow-y-auto custom-scrollbar py-4 overflow-x-hidden">
                <div v-for="(item, gIdx) in navData" :key="gIdx" class="px-3 mb-1">

                    <template v-if="item.id">
                        <NuxtLink v-if="item.url && item.url.startsWith('/')" :to="item.url"
                            @click="handleTopLevelNavClick"
                            class="flex items-center h-9 px-3 rounded-md transition-all duration-150 group relative text-slate-400 hover:text-white hover:bg-white/5"
                            :class="[
                                isCollapsed ? 'justify-center' : '',
                                activeCategory === item.id
                                    ? 'bg-blue-600/20 text-white font-medium border-l-2 border-blue-500 -ml-3 pl-5'
                                    : 'border-l-2 border-transparent'
                            ]">
                            <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                            <span
                                :class="['ml-3 text-[12px] whitespace-nowrap transition-all duration-200', isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto']">
                                {{ item.name }}
                            </span>
                        </NuxtLink>

                        <a v-else :href="'#' + item.id" @click="handleTopLevelNavClick"
                            class="flex items-center h-9 px-3 rounded-md transition-all duration-150 group relative text-slate-400 hover:text-white hover:bg-white/5"
                            :class="[
                                isCollapsed ? 'justify-center' : '',
                                activeCategory === item.id
                                    ? 'bg-blue-600/20 text-white font-medium  -ml-3 pl-5'
                                    : 'border-l-2 border-transparent'
                            ]">
                            <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                            <span
                                :class="['ml-3 text-[12px] whitespace-nowrap transition-all duration-200', isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto']">
                                {{ item.name }}
                            </span>
                        </a>
                    </template>

                    <div v-else-if="item.children">
                        <div @click="toggleGroup(gIdx)"
                            class="flex items-center h-9 px-3 rounded-md cursor-pointer hover:bg-white/5 transition-all duration-150 group"
                            :class="[
                                isCollapsed ? 'justify-center' : '',
                                isGroupActive(item) ? 'text-white font-medium' : 'text-slate-400'
                            ]">
                            <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                            <span
                                :class="['ml-3 text-[13px] flex-1 whitespace-nowrap transition-all duration-200', isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto']">
                                {{ item.name }}
                            </span>
                            <ChevronDown v-if="!isCollapsed"
                                class="w-3 h-3 opacity-40 transition-transform duration-200"
                                :class="{ '-rotate-90': collapsedGroups.includes(gIdx) }" />
                        </div>

                        <div v-show="!collapsedGroups.includes(gIdx) && !isCollapsed" class="mt-1 space-y-0.5">
                            <a v-for="child in item.children" :key="child.id" :href="'#' + child.id"
                                @click="handleChildNavClick"
                                class="flex items-center h-8 pl-11 pr-4 rounded-md hover:bg-white/5 text-[12px] transition-all duration-150 "
                                :class="[
                                    activeCategory === child.id
                                        ? 'border-blue-500 bg-white/5 text-white font-semibold'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                ]">
                                {{ child.name }}
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>

        <main :class="[
            isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]',
            'min-h-screen flex flex-col',
            isMounted ? 'transition-[margin] duration-200 cubic-bezier' : 'not-mounted'
        ]">

            <header
                class="sticky top-0 z-40 h-16 flex items-center px-6 gap-4 bg-white/80 dark:bg-[#0f0f12]/80 backdrop-blur-xl border-b border-gray-200/40 dark:border-white/[0.03] transition-colors duration-300">
                <button @click="toggleMenu"
                    class="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all duration-150 active:scale-95"
                    aria-label="Toggle Menu">
                    <Menu class="w-4.5 h-4.5" />
                </button>

                <div class="flex-1 max-w-2xl relative group">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <input v-model="searchQuery" type="search" placeholder="搜索资源、工具、社区、栏目..."
                        class="w-full bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-blue-500/30 focus:bg-white dark:focus:bg-[#15171e] rounded-xl py-2 pl-11 pr-4 text-xs outline-none transition-all duration-200 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                </div>

                <button @click="toggleTheme"
                    class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-150 text-slate-500 dark:text-slate-400 relative overflow-hidden group">
                    <Transition name="slide-up" mode="out-in">
                        <Sun v-if="isDark" :key="'sun'" class="w-4 h-4 text-amber-500" />
                        <Moon v-else :key="'moon'" class="w-4 h-4" />
                    </Transition>
                </button>
            </header>

            <article class="p-6 lg:p-10 w-full mx-auto">

                <div v-for="(item, gIdx) in navData" :key="gIdx">

                    <template v-for="group in (item.children ? item.children : [item])" :key="group?.id">

                        <section v-if="group?.id && displayData[group.id]" :id="group.id"
                            class="mb-12 scroll-mt-24 category-section">

                            <div class="flex items-center gap-3 mb-6">
                                <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                                <h2 class="text-base font-medium text-slate-800 dark:text-slate-100 tracking-tight">
                                    {{ group.name }}
                                </h2>
                            </div>

                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">

                                <a v-for="site in displayData[group.id]" :key="site.title" :href="site.url"
                                    target="_blank" rel="noopener noreferrer nofollow" class="group flex items-start gap-3.5 
                                    px-3 py-3 rounded-lg
                                    bg-white dark:bg-[#15171e]
                                    border border-slate-200/50 dark:border-white/[0.04]
                                    hover:border-blue-500/40
                                    hover:shadow-md hover:shadow-blue-500/5
                                    hover:-translate-y-0.5
                                    transition-all duration-150">

                                    <div
                                        class="w-8 h-8 shrink-0 rounded-md bg-slate-50 dark:bg-[#1e1e24] flex items-center justify-center border border-slate-200/30 dark:border-white/[0.02] group-hover:scale-105 transition-transform duration-150">

                                        <img :src="`https://icon.horse/icon/${getDomain(site.url)}`" :alt="site.title"
                                            class="w-4.5 h-4.5 object-contain"
                                            @error="(e) => e.target.src = 'https://api.iconify.design/lucide:globe.svg'" />
                                    </div>

                                    <div class="flex-1 min-w-0">

                                        <div class="flex items-center gap-1">
                                            <h3
                                                class="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-500 transition-colors duration-150">
                                                {{ site.title }}
                                            </h3>

                                            <span
                                                class="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150">
                                                ↗
                                            </span>
                                        </div>

                                        <p
                                            class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-4">
                                            {{ site.desc }}
                                        </p>

                                    </div>

                                </a>

                            </div>

                        </section>

                    </template>

                </div>

            </article>

            <footer
                class="mt-auto py-8 text-center border-t border-gray-200/40 dark:border-white/[0.03] bg-white/30 dark:bg-black/10 transition-colors duration-300">
                <p class="text-[10px] font-medium text-slate-400">Copyright © 2026 LeanNav · 开发者导航 · design by Leanku
                </p>
            </footer>
        </main>

        <Transition name="fade">
            <button v-show="showBackToTop" @click="scrollToTop"
                class="fixed bottom-8 right-8 z-50 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-150 shadow-blue-500/20">
                <ChevronDown class="w-5 h-5 rotate-180" />
            </button>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { navConfig } from '@/data/nav.js'
import { useSiteData } from '@/utils/index.js'
import { Zap, Sun, Moon, ChevronDown, Menu, Search, Compass, Milestone } from 'lucide-vue-next'

const siteData = useSiteData()
const navData = navConfig

const getDomain = (url) => {
    try {
        return new URL(url).hostname
    } catch {
        return ''
    }
}

useSeoMeta({
    title: 'LeanNav | 精选开发者导航',
    ogTitle: 'LeanNav - 极速、简洁的开发者导航利器',
    description: '汇集全球优质编程资源、设计素材和实用工具，为开发者提供最高效的上网导航。',
    ogDescription: '汇集全球优质编程资源、设计素材和实用工具。',
    ogImage: 'https://nva.leanku.com/og-image.png',
    twitterCard: 'summary_large_image',
})

useHead({
    script: [
        {
            type: 'application/ld+json',
            children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": navData.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "url": `https://nva.leanku.com/#${item.id}`
                }))
            })
        }
    ]
})

/* 响应式状态 */
const isDark = ref(true)
const isCollapsed = ref(false)
const isMobile = ref(false)
const searchQuery = ref('')
const isMounted = ref(false)
const showBackToTop = ref(false)
const activeCategory = ref('') // 当前激活的子菜单或栏目ID

const flatNav = computed(() => {
    const res = []

    navData.forEach(item => {
        if (item?.id) {
            res.push({
                id: item.id,
                name: item.name,
                icon: item.icon
            })
        }

        if (item?.children) {
            item.children.forEach(child => {
                if (!child?.id) return
                res.push({
                    id: child.id,
                    name: child.name,
                    icon: child.icon || item.icon
                })
            })
        }
    })

    return res
})

const collapsedGroups = ref(
    navData.map((item, index) => item.children ? index : null).filter(i => i !== null && i !== 0)
)

/* 方法 */
const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
}

const applyTheme = () => {
    const html = document.documentElement

    html.classList.add('theme-transition')

    if (isDark.value) {
        html.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else {
        html.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    }

    setTimeout(() => {
        html.classList.remove('theme-transition')
    }, 200)
}

const toggleMenu = () => isCollapsed.value = !isCollapsed.value

const handleTopLevelNavClick = () => {
    if (isMobile.value) isCollapsed.value = true
    collapsedGroups.value = navData
        .map((item, i) => (item.children ? i : null))
        .filter(itemIdx => itemIdx !== null)
}

const handleChildNavClick = () => {
    if (isMobile.value) isCollapsed.value = true
}

const toggleGroup = (idx) => {
    const isCurrentlyCollapsed = collapsedGroups.value.includes(idx)

    if (isCurrentlyCollapsed) {
        // 展开，收起其他同级
        collapsedGroups.value = navData
            .map((item, i) => (item.children ? i : null))
            .filter(itemIdx => itemIdx !== null && itemIdx !== idx)
    } else {
        // 仅收起当前组
        const newCollapsed = [...collapsedGroups.value]
        if (!newCollapsed.includes(idx)) {
            newCollapsed.push(idx)
        }
        collapsedGroups.value = newCollapsed
    }
}

const isGroupActive = (item) => {
    if (!item.children) return false
    return item.children.some(child => child.id === activeCategory.value)
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

const checkScreen = () => {
    isMobile.value = window.innerWidth < 1024
    if (isMobile.value) isCollapsed.value = true
}

const handleScroll = () => {
    showBackToTop.value = window.scrollY > 500

    const sections = document.querySelectorAll('.category-section')
    let currentId = ''

    const offset = 100

    sections.forEach((section) => {
        const top = section.getBoundingClientRect().top
        if (top - offset <= 0) {
            currentId = section.getAttribute('id')
        }
    })

    if (currentId) {
        activeCategory.value = currentId
    }
}

watch(activeCategory, (newVal) => {
    if (!newVal) return
    navData.forEach((item, index) => {
        if (item.children) {
            const hasChild = item.children.some(child => child.id === newVal)
            if (hasChild) {
                if (collapsedGroups.value.includes(index)) {
                    collapsedGroups.value = navData
                        .map((it, idx) => (it.children ? idx : null))
                        .filter(itemIdx => itemIdx !== null && itemIdx !== index)
                }
            }
        }
    })
})

const displayData = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return siteData
    const res = {}

    const categoryInfo = {}
    navData.forEach(item => {
        if (item.id) {
            categoryInfo[item.id] = item.name.toLowerCase()
        }
        if (item.children) {
            item.children.forEach(child => {
                if (child.id) categoryInfo[child.id] = child.name.toLowerCase()
            })
        }
    })

    Object.keys(siteData).forEach(id => {
        const categoryName = categoryInfo[id] || ''
        const isCategoryMatch = categoryName.includes(q)

        if (isCategoryMatch) {
            if (siteData[id] && siteData[id].length) {
                res[id] = siteData[id]
            }
        } else {
            const matchSites = siteData[id].filter(s =>
                s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
            )
            if (matchSites.length) {
                res[id] = matchSites
            }
        }
    })
    return res
})

/* 生命周期 */
onMounted(() => {
    document.documentElement.style.scrollBehavior = 'smooth'

    const savedStatus = localStorage.getItem('menu_collapsed')
    isCollapsed.value = savedStatus !== null ? savedStatus === 'true' : window.innerWidth < 1024

    const theme = localStorage.getItem('theme')
    isDark.value = theme ? theme === 'dark' : true
    applyTheme()

    checkScreen()
    window.addEventListener('resize', checkScreen)
    window.addEventListener('scroll', handleScroll)

    setTimeout(() => {
        handleScroll()
        isMounted.value = true
    }, 50)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkScreen)
    window.removeEventListener('scroll', handleScroll)
})

watch(isCollapsed, v => localStorage.setItem('menu_collapsed', String(v)))
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.font-inter {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.theme-transition,
.theme-transition * {
    transition:
        background-color 0.25s ease,
        color 0.25s ease,
        border-color 0.25s ease,
        fill 0.25s ease !important;
}

.cubic-bezier {
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
    transform: translateY(8px);
    opacity: 0;
}

.slide-up-leave-to {
    transform: translateY(-8px);
    opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.dark ::-webkit-scrollbar-thumb {
    background: #1e1e24;
}

::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

.not-mounted {
    transition: none !important;
}
</style>