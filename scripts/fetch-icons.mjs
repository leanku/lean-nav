/**
 * 构建期把站点 favicon 抓到 public/icons/，让静态站脱离运行时外部图标服务。
 *
 *   npm run icons             抓取所有缺失的图标（首次使用，约需 1 分钟）
 *   npm run icons -- --quick  prebuild 使用：缺失数 <= 24 才联网，失败静默跳过
 *
 * 不同站点返回 PNG / ICO / SVG / WEBP，脚本按文件头判断真实格式并保存正确的扩展名，
 * 再写出 app/data/local-icons.json 的 域名 → 文件名 映射。页面只加载清单里的本地图片，
 * 其他域名回退首字母色块，不会出现破图或运行时外部依赖。
 */
import {
  existsSync, mkdirSync, readFileSync, readdirSync,
  renameSync, statSync, unlinkSync, writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const iconDir = join(root, 'public/icons')
const manifestPath = join(root, 'app/data/local-icons.json')
const quick = process.argv.includes('--quick')
const DEADLINE = Date.now() + (quick ? 25000 : 240000)
const CONCURRENCY = 10
const TIMEOUT = 7000
const QUICK_LIMIT = 24
const EXTS = ['png', 'ico', 'svg', 'jpg', 'webp', 'gif']

mkdirSync(iconDir, { recursive: true })

const safeName = (domain) => domain.toLowerCase().replace(/[^a-z0-9.-]/g, '_')
function domainOf(url) {
  try { return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase() }
  catch { return '' }
}
/** 按文件头判断真实格式：静态服务器按扩展名给 MIME，扩展名错了浏览器就解码失败 */
function detectExt(buffer, contentType = '') {
  if (buffer.length < 200) return null
  if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') return 'png'
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) return 'ico'
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'jpg'
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  if (buffer.toString('ascii', 0, 3) === 'GIF') return 'gif'
  const head = buffer.subarray(0, 400).toString('utf8').trim().toLowerCase()
  if (head.includes('<svg') || contentType.includes('svg')) return 'svg'
  if (contentType.includes('icon')) return 'ico'
  return null
}

const sites = JSON.parse(readFileSync(join(root, 'app/data/sites.json'), 'utf8'))
const domains = [...new Set(Object.values(sites).flat()
  .map((site) => domainOf(site?.url || ''))
  .filter(Boolean))]
const nameToDomain = new Map(domains.map((domain) => [safeName(domain), domain]))

/** 兼容早期版本：把内容格式与扩展名不一致的旧文件纠正过来 */
function normalizeExisting() {
  for (const filename of readdirSync(iconDir)) {
    const path = join(iconDir, filename)
    try {
      if (!statSync(path).isFile()) continue
      const key = basename(filename, extname(filename))
      const buffer = readFileSync(path)
      const ext = detectExt(buffer)
      // 同步盘 / macOS AppleDouble 元数据或只读目录都可能让清理失败，
      // 这类残留不参与清单生成，忽略即可，绝不能阻断构建。
      if (!ext) { try { unlinkSync(path) } catch { /* 忽略 */ } continue }
      if (extname(filename).slice(1) === ext) continue
      const target = join(iconDir, `${key}.${ext}`)
      if (existsSync(target)) { try { unlinkSync(path) } catch { /* 忽略 */ } }
      else renameSync(path, target)
    } catch (error) {
      console.warn(`[icons] 跳过无法处理的文件 ${filename}：${error.code || error.message}`)
    }
  }
}
function hasIcon(domain) {
  return EXTS.some((ext) => {
    const file = join(iconDir, `${safeName(domain)}.${ext}`)
    return existsSync(file) && statSync(file).size > 200
  })
}
function writeManifest() {
  const files = {}
  for (const filename of readdirSync(iconDir)) {
    const key = basename(filename, extname(filename))
    const domain = nameToDomain.get(key)
    const path = join(iconDir, filename)
    if (domain && EXTS.includes(extname(filename).slice(1)) && statSync(path).size > 200) {
      files[domain] = filename
    }
  }
  const count = Object.keys(files).length
  // 防呆：图标目录为空（干净 clone 没带资源 / 本地误删）时，不要用空映射覆写仓库里
  // 已有的清单——那会让构建产物静默丢掉全部 favicon 引用，页面只剩首字母色块。
  if (!count && existsSync(manifestPath)) {
    try {
      const previous = JSON.parse(readFileSync(manifestPath, 'utf8'))
      const previousCount = Object.keys(previous?.files || {}).length
      if (previousCount) {
        console.warn(`[icons] 图标目录为空，保留清单中原有的 ${previousCount} 条映射；` +
          `若 public/icons/ 未随构建提供，线上会请求到 404 并回退首字母兜底`)
        return previousCount
      }
    } catch { /* 清单损坏则照常重写 */ }
  }
  writeFileSync(manifestPath, JSON.stringify({
    updatedAt: new Date().toISOString().slice(0, 10),
    domains: Object.keys(files).sort(),
    files,
  }, null, 2) + '\n')
  return count
}

normalizeExisting()
const existing = domains.filter(hasIcon)
const pending = domains.filter((domain) => !hasIcon(domain))

if (quick && pending.length > QUICK_LIMIT) {
  const kept = writeManifest()
  console.log(`[icons] 有 ${pending.length} 个新图标待抓取，构建默认跳过；请手动运行 npm run icons`)
  console.log(`[icons] 清单保留 ${kept} 条映射；请确认 public/icons/ 随构建产物一起提供`)
  process.exit(0)
}
if (!pending.length) {
  console.log(`[icons] ${writeManifest()} 个图标均已存在，无需下载`)
  process.exit(0)
}
console.log(`[icons] 已有 ${existing.length} 个，准备抓取 ${pending.length} 个…`)

async function fetchIcon(domain) {
  const sources = [`https://icon.horse/icon/${domain}`, `https://${domain}/favicon.ico`]
  for (const url of sources) {
    if (Date.now() > DEADLINE) return false
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 LeanNav-IconFetcher', Accept: 'image/*' },
      })
      if (!response.ok) continue
      const type = response.headers.get('content-type') || ''
      const buffer = Buffer.from(await response.arrayBuffer())
      const ext = detectExt(buffer, type)
      if (!ext) continue
      writeFileSync(join(iconDir, `${safeName(domain)}.${ext}`), buffer)
      return true
    } catch {
      // 换下一个来源
    } finally {
      clearTimeout(timer)
    }
  }
  return false
}

let cursor = 0
let ok = 0
let failed = 0
async function worker() {
  while (cursor < pending.length) {
    if (Date.now() > DEADLINE) break
    const domain = pending[cursor++]
    const success = await fetchIcon(domain)
    if (success) ok += 1
    else failed += 1
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

const total = writeManifest()
console.log(`[icons] 完成：新增 ${ok} 个，失败/跳过 ${failed} 个，本地图标共 ${total} 个`)
