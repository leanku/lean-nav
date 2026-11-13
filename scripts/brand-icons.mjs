/**
 * 从 public/navigator.png 生成全站品牌图标。
 *
 * navigator.png 是一张 512×512 的 RGBA 遮罩：黑色圆角方形（圆角 22%）+ 被「挖空」的
 * 透明导航箭头。因此只要保留 alpha 通道、替换 RGB，就能得到在浅色/深色标签页都清晰
 * 的图标，不需要引入图像处理依赖。
 *
 * 除 favicon / PWA / apple-touch / 暗色标签页外，还会重新渲染分享图 og-image.png
 * （其设计源 scripts/og-image.html 直接引用本图，换 logo 后自动保持同源）。
 *
 * 用法：npm run brand（修改 navigator.png 后重跑一次）
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync, deflateSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'public/navigator.png')
const publicDir = join(root, 'public')

/* ---------- 最小 PNG 解码（8bit RGBA / RGB；分享图是 RGB） ---------- */
function decodePng(buffer, channels = 4) {
  let pos = 8
  let width = 0
  let height = 0
  const idat = []
  while (pos < buffer.length) {
    const length = buffer.readUInt32BE(pos)
    const type = buffer.toString('ascii', pos + 4, pos + 8)
    const data = buffer.subarray(pos + 8, pos + 8 + length)
    pos += 12 + length
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      if (data[8] !== 8 || data[9] !== (channels === 4 ? 6 : 2)) {
        throw new Error(`仅支持 8bit ${channels === 4 ? 'RGBA' : 'RGB'} PNG`)
      }
    } else if (type === 'IDAT') idat.push(data)
    else if (type === 'IEND') break
  }
  const raw = inflateSync(Buffer.concat(idat))
  const bpp = channels
  const stride = width * bpp
  const pixels = Buffer.alloc(width * height * bpp)
  let offset = 0
  let previous = Buffer.alloc(stride)
  for (let y = 0; y < height; y += 1) {
    const filter = raw[offset]
    offset += 1
    const line = Buffer.from(raw.subarray(offset, offset + stride))
    offset += stride
    for (let x = 0; x < stride; x += 1) {
      const a = x >= bpp ? line[x - bpp] : 0
      const b = previous[x]
      const c = x >= bpp ? previous[x - bpp] : 0
      if (filter === 1) line[x] = (line[x] + a) & 255
      else if (filter === 2) line[x] = (line[x] + b) & 255
      else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a)
        const pb = Math.abs(p - b)
        const pc = Math.abs(p - c)
        const predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
        line[x] = (line[x] + predictor) & 255
      }
    }
    line.copy(pixels, y * stride)
    previous = line
  }
  return { width, height, pixels }
}

/* ---------- 最小 PNG 编码 ---------- */
const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()
function crc32(buffer) {
  let c = 0xffffffff
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), body.length + 4)
  return out
}
function encodePng(width, height, pixels, channels = 4) {
  const stride = width * channels
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = channels === 4 ? 6 : 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- 面积平均缩放（按 alpha 加权，边缘不会发灰/发白） ---------- */
function downscale(mask, size) {
  const { width, height, pixels } = mask
  const out = Buffer.alloc(size * size * 4)
  const scale = width / size
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const x0 = Math.floor(x * scale)
      const x1 = Math.min(width, Math.ceil((x + 1) * scale))
      const y0 = Math.floor(y * scale)
      const y1 = Math.min(height, Math.ceil((y + 1) * scale))
      let alpha = 0
      let count = 0
      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          alpha += pixels[(sy * width + sx) * 4 + 3]
          count += 1
        }
      }
      const i = (y * size + x) * 4
      out[i + 3] = count ? Math.round(alpha / count) : 0
    }
  }
  return { width: size, height: size, pixels: out }
}
function paint(mask, rgb) {
  const out = Buffer.from(mask.pixels)
  for (let i = 0; i < out.length; i += 4) {
    out[i] = rgb[0]
    out[i + 1] = rgb[1]
    out[i + 2] = rgb[2]
  }
  return { ...mask, pixels: out }
}
function write(name, image) {
  writeFileSync(join(publicDir, name), encodePng(image.width, image.height, image.pixels))
  console.log(`  ${name.padEnd(24)} ${image.width}×${image.height}`)
}

/* iOS 会把透明像素压成黑色，导致镂空箭头消失；这里显式画成白箭头 + 深色实底。
   方形遮罩的四角同样是透明，但底色与标记同为深色，iOS 自行裁圆角后看不出差别。 */
function appleTouch(mask) {
  const { width: size, pixels } = mask
  const out = Buffer.alloc(size * size * 4)
  const center = size / 2
  const radius = size / 2
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      const alpha = pixels[i + 3]
      const dx = x + 0.5 - center
      const dy = y + 0.5 - center
      // 只在中心 88% 半径内把透明像素当作箭头，避开圆角边缘抗锯齿产生的白点
      const inner = radius * 0.88
      const inMarkArea = dx * dx + dy * dy <= inner * inner
      let rgb
      if (alpha > 128) rgb = [10, 11, 13]           // 方形实底
      else if (inMarkArea) rgb = [246, 247, 248]    // 镂空箭头
      else rgb = [10, 11, 13]                      // 四角/圆角外
      out[i] = rgb[0]
      out[i + 1] = rgb[1]
      out[i + 2] = rgb[2]
      out[i + 3] = 255
    }
  }
  return { width: size, height: size, pixels: out }
}

const mask = decodePng(readFileSync(source))
console.log(`读取 ${source.replace(root + '/', '')}：${mask.width}×${mask.height} RGBA 遮罩`)
console.log('生成品牌图标：')

write('icon-512.png', paint(downscale(mask, 512), [0, 0, 0]))
const icon192 = downscale(mask, 192)
write('icon-192.png', paint(icon192, [0, 0, 0]))
write('favicon-32x32.png', paint(downscale(mask, 32), [0, 0, 0]))
write('favicon-16x16.png', paint(downscale(mask, 16), [0, 0, 0]))
write('apple-touch-icon.png', appleTouch(downscale(mask, 180)))
// 深色标签页：方形实底变白，镂空箭头仍透出深色背景
write('navigator-dark.png', paint(downscale(mask, 512), [246, 247, 248]))

// 根路径 favicon.ico 仍会被部分浏览器/爬虫直接请求；ICO 内嵌一张 32×32 PNG
const faviconPng = encodePng(32, 32, paint(downscale(mask, 32), [0, 0, 0]).pixels)
const icoHeader = Buffer.alloc(22)
icoHeader.writeUInt16LE(0, 0)      // reserved
icoHeader.writeUInt16LE(1, 2)      // type: icon
icoHeader.writeUInt16LE(1, 4)      // count
icoHeader[6] = 32; icoHeader[7] = 32 // width / height
icoHeader[8] = 0; icoHeader[9] = 0   // palette / reserved
icoHeader.writeUInt16LE(1, 10)     // color planes
icoHeader.writeUInt16LE(32, 12)    // bits per pixel
icoHeader.writeUInt32LE(faviconPng.length, 14)
icoHeader.writeUInt32LE(22, 18)    // offset
writeFileSync(join(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, faviconPng]))
console.log('  favicon.ico               32×32 (内嵌 PNG)')
// 分享图 og-image.png 的设计源（scripts/og-image.html）直接引用 navigator.png，
// 换 logo 后一起重绘；无 Chrome 环境时跳过，不阻断品牌图标生成。
const og = spawnSync(process.execPath, [join(root, 'scripts/og-image.mjs')], { encoding: 'utf8' })
if (og.status === 0) process.stdout.write(og.stdout)
else console.log('  og-image.png          未同步（渲染需要本机 Chrome，可稍后运行 npm run og）')
console.log('完成。')
