import { ref, computed, onMounted } from 'vue'

/* 侧栏分组是单开手风琴：任何时刻最多一个分组展开。
     - 点击分组：展开它并收起其他；再点一次收起。
     - 滚动到某分组：自动展开它并收起其他（跟随）；用户手动收起的分组在本次停留内
       不再被自动展开，滑出后解除。
     - 只持久化用户手动展开的那个 id，滚动跟随不写 localStorage —— 记忆只记录手动选择。

   读取放在 onMounted：nuxt generate 预渲染的 HTML 一律是「全收起」，
   hydrate 后再应用用户选择，避免 SSR/客户端 DOM 不一致（配合分组展开动画自然过渡）。 */
const KEY = 'leannav:groups:v1'

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    // 兼容旧版的多开数组格式：只取第一个
    if (Array.isArray(raw)) return typeof raw[0] === 'string' ? raw[0] : ''
    return typeof raw === 'string' ? raw : ''
  } catch (error) {
    return ''
  }
}

function write(id) {
  try {
    if (id) localStorage.setItem(KEY, JSON.stringify(id))
    else localStorage.removeItem(KEY)
  } catch (error) {}
}

// 模块级共享状态：首页 / about 切换时展开状态保持一致
const openId = ref(null) // null = 尚未读取 localStorage，'' = 全收起
let initialized = false
// 本次停留内被用户手动收起的分组：只做门控，不参与渲染，无需响应式
const suppressed = new Set()
let currentGroupId = ''

export function useGroupExpansion(navData) {
  onMounted(() => {
    if (initialized) return
    openId.value = read()
    initialized = true
  })

  const groupIds = computed(() =>
    (navData.value || []).filter((group) => group.children?.length).map((group) => group.id)
  )

  // collapsedGroups 传给 AppSidebar；默认（无记录）时所有分组都在其中 = 全收起
  const collapsedGroups = computed(() =>
    groupIds.value.filter((id) => id !== openId.value)
  )

  // 子栏目 → 所属分组，供滚动高亮联动
  const parentOf = computed(() => {
    const map = new Map()
    for (const group of navData.value || []) {
      for (const child of group.children || []) map.set(child.id, group.id)
    }
    return map
  })

  function toggleGroup(id) {
    if (openId.value === id) {
      openId.value = ''
      suppressed.add(id) // 手动收起：本次停留内不再自动展开
      write('')
    } else {
      openId.value = id // 单开：展开这个即收起其他
      suppressed.delete(id)
      write(id)
    }
  }

  /** 滚动高亮到某个栏目时调用：展开它所属的分组并收起其他分组 */
  function revealFor(categoryId) {
    if (!initialized) return // localStorage 尚未读取，等 hydrate 完成
    const groupId = parentOf.value.get(categoryId) || ''
    if (groupId === currentGroupId) return
    if (currentGroupId) suppressed.delete(currentGroupId) // 离开上一个分组 → 解除抑制
    currentGroupId = groupId
    if (!groupId || suppressed.has(groupId)) {
      openId.value = ''
      return
    }
    openId.value = groupId
  }

  return { collapsedGroups, toggleGroup, revealFor, openGroupId: openId }
}
