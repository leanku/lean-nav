/**
 * 构建期数据校验：nav.js 的分类 id 必须与 sites.json 一一对应。
 * 目的是杜绝「sites.json 里加了站点、nav.js 忘了登记 → 内容静默丢失」。
 * 运行：npm run check
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { navConfig } = await import(pathToFileURL(join(root, 'app/data/nav.js')).href)
const sites = JSON.parse(readFileSync(join(root, 'app/data/sites.json'), 'utf8'))

const errors = []
const warnings = []

const leafIds = []
const allIds = []
for (const group of navConfig) {
  if (!group?.name) errors.push('存在没有 name 的分类')
  if (group.id) allIds.push(group.id)
  if (group.children) {
    for (const child of group.children) {
      if (!child.id) errors.push(`分组「${group.name}」下存在没有 id 的栏目`)
      else { allIds.push(child.id); leafIds.push(child.id) }
    }
  } else if (!group.url) {
    if (!group.id) errors.push(`分类「${group.name}」缺少 id`)
    else leafIds.push(group.id)
  }
}

const duplicates = allIds.filter((id, index) => allIds.indexOf(id) !== index)
if (duplicates.length) errors.push(`分类 id 重复：${[...new Set(duplicates)].join(', ')}`)

const siteIds = Object.keys(sites)
const missingNav = siteIds.filter((id) => !leafIds.includes(id))
const emptyCategories = leafIds.filter((id) => !siteIds.includes(id))
if (missingNav.length) errors.push(`sites.json 中有数据但 nav.js 未登记：${missingNav.join(', ')}`)
if (emptyCategories.length) warnings.push(`nav.js 中有栏目但 sites.json 无数据（会显示为空）：${emptyCategories.join(', ')}`)

let siteCount = 0
const seenUrls = new Map()
for (const [category, list] of Object.entries(sites)) {
  if (!Array.isArray(list)) { errors.push(`分类 ${category} 不是数组`); continue }
  list.forEach((site, index) => {
    siteCount += 1
    const label = `${category}[${index}]`
    if (!site?.title) errors.push(`${label} 缺少 title`)
    if (!site?.url) errors.push(`${label} 缺少 url`)
    else if (/^(javascript|data|file):/i.test(site.url)) errors.push(`${label} 使用了不安全的协议：${site.url}`)
    const key = `${category}::${site.url}`
    if (seenUrls.has(key)) warnings.push(`${category} 中网址重复：${site.url}`)
    seenUrls.set(key, true)
  })
}

console.log(`[check-config] ${navConfig.length} 个分类 / ${leafIds.length} 个栏目 / ${siteCount} 个网站`)
warnings.forEach((message) => console.warn(`[check-config] ⚠ ${message}`))
if (errors.length) {
  errors.forEach((message) => console.error(`[check-config] ✖ ${message}`))
  console.error(`[check-config] 校验失败（${errors.length} 个错误），已阻止构建`)
  process.exit(1)
}
console.log('[check-config] ✓ 分类与网站 id 完全一致')
