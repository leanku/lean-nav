import { ref, computed, onMounted } from 'vue'

/* 侧栏分组展开状态（v1.5）：默认全部收起，用户手动展开/收起的分组写入 localStorage。
   无记录时 = 全部收起（首次访问 / 清过缓存）；有记录时尊重用户选择，
   滚动联动不再自动展开「当前分组」，也不改写用户手动设置过的状态。

   读取放在 onMounted：nuxt generate 预渲染的 HTML 一律是「全收起」，
   hydrate 后再应用用户选择，避免 SSR/客户端 DOM 不一致（配合分组展开动画自然过渡）。 */
const KEY = 'leannav:groups:v1'

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null')
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : null
  } catch (error) {
    return null
  }
}

function write(expandedIds) {
  try { localStorage.setItem(KEY, JSON.stringify(expandedIds)) } catch (error) {}
}

// 模块级共享状态：首页 / about 切换时展开状态保持一致
const expandedIds = ref(null) // null = 尚未读取 localStorage
let initialized = false

export function useGroupExpansion(navData) {
  onMounted(() => {
    if (initialized) return
    expandedIds.value = read() || []
    initialized = true
  })

  const expanded = computed(() => new Set(expandedIds.value || []))

  const groupIds = computed(() =>
    (navData.value || []).filter((group) => group.children?.length).map((group) => group.id)
  )

  // collapsedGroups 传给 AppSidebar；默认（无记录）时所有分组都在其中 = 全收起
  const collapsedGroups = computed(() =>
    groupIds.value.filter((id) => !expanded.value.has(id))
  )

  function toggleGroup(id) {
    const next = new Set(expanded.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    expandedIds.value = [...next]
    write(expandedIds.value)
  }

  return { collapsedGroups, toggleGroup, expandedIds }
}
