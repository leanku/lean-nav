/**
 * 渲染分享图 public/og-image.png（1200×630）。
 *
 * 设计源是 scripts/og-image.html：一张绝对定位的静态页，左上角直接引用
 * public/navigator.png 并反色（与站点暗色主题同法），保证分享图的标记
 * 与 favicon 永远同源。渲染需要本机的 Chrome / Edge / Chromium。
 *
 * 用法：npm run og（修改文案或换 logo 后重跑一次）
 */
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const htmlPath = join(root, 'scripts/og-image.html')
const target = join(root, 'public/og-image.png')
const WIDTH = 1200
const HEIGHT = 630

const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'google-chrome', 'chromium-browser', 'chromium', 'chrome',
].filter(Boolean)

const chrome = candidates.find((path) => {
  try {
    return existsSync(path) || spawnSync(path, ['--version'], { encoding: 'utf8' }).status === 0
  } catch { return false }
})
if (!chrome) {
  console.error('[og] 未找到 Chrome / Chromium：请安装，或用 CHROME_PATH 环境变量指定可执行文件路径')
  process.exit(1)
}

const workDir = mkdtempSync(join(tmpdir(), 'og-image-'))
const screenshot = join(workDir, 'og.png')
const result = spawnSync(chrome, [
  '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--virtual-time-budget=1500',
  `--screenshot=${screenshot}`, `--window-size=${WIDTH},${HEIGHT}`,
  pathToFileURL(htmlPath).href,
], { encoding: 'utf8' })
if (result.status !== 0 || !existsSync(screenshot)) {
  console.error('[og] Chrome 渲染失败：' + (result.stderr || result.stdout).split('\n').filter(Boolean).slice(-2).join(' '))
  process.exit(1)
}

// 尺寸校验：分享图必须是 1200×630，避免窗口缩放漂移后直接发布
const png = readFileSync(screenshot)
const width = png.readUInt32BE(16)
const height = png.readUInt32BE(20)
if (width !== WIDTH || height !== HEIGHT) {
  console.error(`[og] 输出尺寸 ${width}×${height} 不符合 ${WIDTH}×${HEIGHT}，请检查设备缩放设置`)
  process.exit(1)
}
copyFileSync(screenshot, target)
try { rmSync(workDir, { recursive: true, force: true }) } catch { /* 临时目录残留无害 */ }
console.log(`  og-image.png          ${width}×${height} 已由 scripts/og-image.html 重新渲染`)
