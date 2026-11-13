# LeanNav

纯静态部署的极简导航站：Nuxt 4 + Vue 3 + Tailwind，**无后端、无数据库、无运行时接口**。访客可以直接在页面里自定义分类与网站，不需要懂代码。

- `npm run generate` 产出静态文件，上传到任意静态托管即可
- 双主题、键盘搜索、PWA、本地收藏与最近访问
- 配置四层优先级：分享链接 > 浏览器本地 > 站点根目录 `nav-config.json` > 内置默认
- 内置站点的 favicon 随仓库发布，默认零外部字体 / 图标 / 统计请求

视觉规范见 [`DESIGN.md`](./DESIGN.md)。样式一律走 `app/assets/css/main.css` 里的 CSS 变量，不要在组件里写死颜色。

## 本地开发

需要 Node.js 22（见 [`.nvmrc`](./.nvmrc)）。

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # 校验 nav.js 与 sites.json 的分类 id 一致性
npm run generate   # 生成静态站点到 .output/public
```

另有 `npm run icons`（抓取新站点 favicon，需联网）、`npm run brand`（从 `public/navigator.png` 重新派生全站品牌图标并联动分享图）与 `npm run og`（单独重新渲染分享图，需本机 Chrome）。`build` / `generate` 前会自动执行数据校验与图标补抓，详见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。

## 部署配置

`nuxt.config.ts` 在构建期读取两个环境变量：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | `https://nav.leanku.com` | Open Graph 图片与结构化数据的绝对地址前缀，**部署到自己的域名时请覆盖** |
| `NUXT_PUBLIC_ANALYTICS_ID` | 空 | 可选 GA4 统计 ID；留空时不注入任何第三方统计脚本 |

```bash
NUXT_PUBLIC_SITE_URL=https://example.com npm run generate
```

修改后需重新生成静态站点。把 `.output/public` 整个目录上传到 GitHub Pages、Cloudflare Pages、Vercel、对象存储 + CDN 等任意静态托管即可。站长更新全站内容只需覆盖根目录的 `nav-config.json`，无需重新打包。

## 怎么自定义

打开网站右上角「自定义」（抽屉，快速增删改），或访问 `/customize` 独立页（左编辑 / 右实时预览，适合批量管理、导入导出、发布引导）。两者共用同一个编辑器组件。

- **自己用**：增删改分类/网站、换 Lucide 图标、排序、批量粘贴，改动实时生效并自动保存在这个浏览器
- **收藏 / 最近访问**：卡片右上角星标收藏，首页顶部展示收藏与最近访问
- **换设备**：「下载配置备份」→ 新设备「导入配置文件」
- **分享别人**：「复制分享链接」，对方打开即可预览，再点「保存到我的导航」
- **全站生效**：下载 `nav-config.json` 上传到静态站点根目录（与 `index.html` 同级），刷新即生效，**不需要重新打包**

## 数据与图标

- `app/data/nav.js` — 分类结构（图标用字符串名，见 `app/utils/icons.js`）
- `app/data/sites.json` — 各栏目的网站
- `app/data/local-icons.json` — 已本地化的图标域名清单（由 `npm run icons` 生成）
- `public/icons/<domain>.<ext>` — 随仓库发布的 favicon，页面按 `local-icons.json` 映射加载；缺失时回退首字母色块，不会出现破图
- `scripts/og-image.html` + `npm run og` — 分享图的设计源与渲染脚本（1200×630，需本机 Chrome）
- `public/navigator.png` — 全站唯一品牌标记（黑色圆角方形 + 镂空箭头）。`npm run brand` 从它派生 `icon-192/512.png`、`favicon.ico`、`favicon-16/32`、`apple-touch-icon.png`、`navigator-dark.png`，并联动重渲染 `og-image.png`；`public/icon.svg` 是需手工同步的矢量副本。换 logo 只改这一张图再跑一次命令

访客自行添加、且未收录在 `local-icons.json` 的域名会尝试向 `icon.horse` 请求 favicon，失败同样回退首字母色块；内置站点不产生该请求。

新增站点后跑一次 `npm run check && npm run icons`，数据错误和图标缺失都能在发布前发现。

## 页面与交互

- 首页 `/`、关于页 `/about` 共用 `AppShell`（侧栏 + 顶栏 + 页脚 + 主题）；`/customize` 是独立编辑页
- 搜索：`/` 或 `⌘K` / `Ctrl+K` 聚焦，`Esc` 清空，回车打开首个结果
- 主题：首屏内联脚本决定，默认跟随系统偏好；亮/暗只换 CSS 变量；`prefers-reduced-motion` 自动关闭动效
- 侧栏：分组默认全部收起、单开手风琴；滚动到某栏目时自动展开所属分组并收起其他，手动收起的分组不会被抢回，手动展开的 id 记在 `localStorage`；点击栏目会锁定高亮直到滚动结束
- 顶栏：三区网格让搜索在内容区真正居中；右侧 GitHub / 自定义 / 主题
- 9 个分组 + 26 个栏目各配唯一 Lucide 图标，可在编辑器里更换
- 性能：视口外 section 用 `content-visibility` 跳过渲染；可选统计脚本延后到浏览器空闲
- PWA：`manifest.webmanifest` + `sw.js`，仅生产环境注册

## 隐私

- 自定义配置、收藏、最近访问只存在浏览器 `localStorage`，不上传服务器。
- 默认构建不加载第三方统计 / 字体 / 图标服务；自行部署并开启统计或添加新站点时的例外见上文。
- `nav-config.json` 是公开可覆盖的全站配置文件，请勿在其中放入密钥或个人敏感信息。详见 [`SECURITY.md`](./SECURITY.md)。

## 贡献

欢迎 Issue 与 PR。开发脚本、目录结构与配置格式见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)；视觉规范见 [`DESIGN.md`](./DESIGN.md)。提交前请运行 `npm run check`。

## 许可证

[MIT](./LICENSE) © LeanNav Contributors
