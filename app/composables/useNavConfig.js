import { ref } from 'vue'
import { navConfig as defaultNav } from '@/data/nav.js'
import siteDataRaw from '@/data/sites.json'

export const CONFIG_VERSION = 2
export const STORAGE_KEY = 'leannav:config:v1'
export const CONFIG_FILE = '/nav-config.json'

const clone = (value) => JSON.parse(JSON.stringify(value))
const uid = (prefix = 'c') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
export const newId = uid

function normalizeUrl(value) {
  let url = String(value || '').trim()
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) url = `https://${url.replace(/^\/+/, '')}`
  return url
}

function normalizeSites(sites) {
  if (!Array.isArray(sites)) return []
  return sites
    .filter((site) => site && typeof site === 'object')
    .map((site) => ({
      title: String(site.title || '').trim(),
      url: normalizeUrl(site.url),
      desc: String(site.desc || '').trim(),
    }))
}

/** 任何来源的配置都要先经过这里：补齐字段、去重 id、过滤非法数据 */
export function normalizeConfig(raw) {
  if (!raw || !Array.isArray(raw.groups)) {
    throw new Error('配置格式不正确：缺少 groups 列表')
  }

  const usedIds = new Set()
  const uniqueId = (candidate) => {
    let id = String(candidate || '').trim() || uid()
    while (usedIds.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 5)}`
    usedIds.add(id)
    return id
  }

  const groups = raw.groups
    .filter((group) => group && typeof group === 'object')
    .map((group) => {
      const item = {
        id: uniqueId(group.id),
        name: String(group.name || '未命名分类').trim(),
        icon: String(group.icon || 'Globe').trim(),
      }
      if (group.url) item.url = String(group.url).trim()

      if (Array.isArray(group.children) && group.children.length) {
        item.children = group.children
          .filter((child) => child && typeof child === 'object')
          .map((child) => ({
            id: uniqueId(child.id),
            name: String(child.name || '未命名栏目').trim(),
            icon: String(child.icon || 'Globe').trim(),
            sites: normalizeSites(child.sites),
          }))
      } else {
        item.sites = normalizeSites(group.sites)
      }
      return item
    })

  return { version: CONFIG_VERSION, groups }
}

/** 把仓库里的 nav.js + sites.json 合并成一份可编辑的配置 */
export function buildDefaultConfig() {
  const groups = defaultNav.map((item) => {
    const group = {
      id: item.id || uid('g'),
      name: item.name,
      icon: item.icon || 'Globe',
      ...(item.url ? { url: item.url } : {}),
    }
    if (item.children) {
      group.children = item.children.map((child) => ({
        id: child.id,
        name: child.name,
        icon: child.icon || item.icon,
        sites: clone(siteDataRaw[child.id] || []),
      }))
    } else {
      group.sites = clone(siteDataRaw[item.id] || [])
    }
    return group
  })

  // 兜底：sites.json 里有数据、但 nav.js 忘了登记的分类，自动补成一个分组，避免内容静默丢失
  const registered = new Set()
  defaultNav.forEach((item) => {
    if (item.children) item.children.forEach((child) => registered.add(child.id))
    else if (!item.url) registered.add(item.id)
  })
  Object.keys(siteDataRaw).forEach((id) => {
    if (!registered.has(id)) {
      groups.push({ id, name: id, icon: 'Box', sites: clone(siteDataRaw[id] || []) })
    }
  })

  return normalizeConfig({ version: CONFIG_VERSION, groups })
}

/** 所有可放网站的栏目（含所属分组名），供编辑器下拉使用 */
export function listCategories(config) {
  const result = []
  ;(config?.groups || []).forEach((group) => {
    if (!group.url && !group.children) {
      result.push({ id: group.id, name: group.name, groupName: '', sites: group.sites || [] })
    }
    ;(group.children || []).forEach((child) => {
      result.push({ id: child.id, name: child.name, groupName: group.name, sites: child.sites || [] })
    })
  })
  return result
}

export function countSites(config) {
  return listCategories(config).reduce((sum, category) => sum + category.sites.length, 0)
}

/* ---------- 文件与分享 ---------- */

export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function readConfigFile(file) {
  const text = await file.text()
  return normalizeConfig(JSON.parse(text))
}

function bytesToBase64Url(bytes) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

/** 优先用浏览器原生 gzip 压缩，不支持时退化为原始 JSON（链接会更长） */
export async function encodeConfig(config) {
  const bytes = new TextEncoder().encode(JSON.stringify(config))
  let payload = bytes
  let flag = 'r'
  if (typeof CompressionStream !== 'undefined') {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))
    payload = new Uint8Array(await new Response(stream).arrayBuffer())
    flag = 'g'
  }
  return flag + bytesToBase64Url(payload)
}

export async function decodeConfig(encoded) {
  const flag = encoded.slice(0, 1)
  let bytes = base64UrlToBytes(encoded.slice(1))
  if (flag === 'g') {
    if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持解压分享配置')
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
    bytes = new Uint8Array(await new Response(stream).arrayBuffer())
  }
  return normalizeConfig(JSON.parse(new TextDecoder().decode(bytes)))
}

/* ---------- 全局单例状态 ---------- */

const state = {
  config: ref(buildDefaultConfig()),
  source: ref('default'), // default | file | local | link
  ready: ref(false),
  fileConfig: null,
}

export function useNavConfig() {
  const { config, source, ready } = state

  async function init() {
    if (ready.value) return
    let base = buildDefaultConfig()

    // 1. 站点级默认配置：把 nav-config.json 传到静态目录即可对所有访客生效
    try {
      const response = await fetch(CONFIG_FILE, { cache: 'no-cache' })
      const type = response.headers.get('content-type') || ''
      if (response.ok && type.includes('json')) {
        const data = await response.json()
        if (data && Array.isArray(data.groups)) {
          base = normalizeConfig(data)
          state.fileConfig = base
          source.value = 'file'
        }
      }
    } catch (error) {
      // 文件不存在或格式不正确时静默使用内置默认
    }

    // 2. 分享链接（只预览，不写进本机）
    let shared = null
    try {
      const match = window.location.hash.match(/(?:^#|&)c=([^&]+)/)
      if (match) shared = await decodeConfig(match[1])
    } catch (error) {
      console.warn('[LeanNav] 分享链接解析失败：', error)
    }

    // 3. 本机自定义
    let local = null
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) local = normalizeConfig(JSON.parse(saved))
    } catch (error) {
      console.warn('[LeanNav] 本机配置读取失败，已回退到默认配置')
    }

    config.value = shared || local || base
    source.value = shared ? 'link' : local ? 'local' : state.fileConfig ? 'file' : 'default'
    ready.value = true
  }

  function save(next) {
    const normalized = normalizeConfig(next || config.value)
    config.value = normalized
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      source.value = 'local'
    } catch (error) {
      console.warn('[LeanNav] 本机存储不可用，改动仅在本次会话有效')
    }
    return normalized
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY) } catch (error) {}
    config.value = state.fileConfig ? clone(state.fileConfig) : buildDefaultConfig()
    source.value = state.fileConfig ? 'file' : 'default'
  }

  return { config, source, ready, init, save, reset }
}
