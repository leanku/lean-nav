# 贡献指南

感谢你考虑为 LeanNav 做贡献！本项目是**纯静态前端**（Nuxt 4 + Vue 3 + Tailwind），无后端、无数据库，所有改动都可以通过本地 `npm` 脚本完成验证。

## 环境要求

- Node.js **22**（见 [`.nvmrc`](./.nvmrc)，可用 `nvm use` 切换）
- 包管理器使用 **npm**（仓库以 `package-lock.json` 为准，请勿混用 pnpm/yarn 提交额外 lockfile）

## 本地开发

```bash
npm install
npm run dev          # http://localhost:3000
```

常用脚本：

| 命令 | 作用 |
|---|---|
| `npm run dev` | 本地开发服务器 |
| `npm run check` | 校验 `nav.js` 与 `sites.json` 的分类 id 一致性（不一致直接报错） |
| `npm run icons` | 抓取站点 favicon 到 `public/icons`（需联网，约 1 分钟） |
| `npm run brand` | 从 `public/navigator.png` 重新生成全站品牌图标，并联动重渲染分享图 |
| `npm run og` | 单独重新渲染分享图 `public/og-image.png`（设计源 `scripts/og-image.html`，需本机 Chrome） |
| `npm run generate` | 生成静态站点到 `.output/public`（`pregenerate` 会先跑 `check` + 补抓图标） |

> 提交前请运行 `npm run check`；数据 id 不一致会在构建时被阻断。

## 目录结构

```
app/components/   AppShell（页面壳）· AppHeader / AppSidebar / AppFooter / AppLogo
                  NavEditor（抽屉 + 独立页双模式）· IconPicker（图标网格）
app/composables/  useNavConfig（配置）· useTheme（主题）· useFavorites（收藏与最近访问）
app/plugins/      pwa.client.js（仅生产环境注册 Service Worker）
app/assets/css/   main.css（双主题 token、焦点态、动效偏好、content-visibility）
app/data/         nav.js（分类结构）· sites.json（网站）· local-icons.json（已本地化图标域名）
app/pages/        index.vue（首页）· about.vue（关于）· customize.vue（自定义）
app/utils/        icons.js（Lucide 图标名 → 组件映射）
scripts/          check-config.mjs · fetch-icons.mjs · brand-icons.mjs · og-image.mjs + og-image.html
public/           navigator.png（唯一品牌图）· icons/ · manifest.webmanifest · sw.js · og-image.png
```

## 代码规范

- 缩进 2 空格、UTF-8、LF 换行（见 [`.editorconfig`](./.editorconfig)）；可用 Prettier（见 [`.prettierrc.json`](./.prettierrc.json)）。
- **双主题必须走 CSS 变量**：样式一律引用 `app/assets/css/main.css` 里的 token，禁止在组件里写死色值（如 `bg-[#222327]`）。
- **无彩色外壳**：`--primary` 是墨色反相，页面里唯一的彩色来自站点 favicon，新增 UI 不要引入第二色相。
- **不改技术栈**：保持 Nuxt 4 + Vue 3 + Tailwind + `nuxt generate`，性能问题只做局部治理。
- 视觉细节请对照 [`DESIGN.md`](./DESIGN.md) 的「设计不变量」，确保改动与全站视觉语言一致。

## 配置与数据格式

- `app/data/nav.js`：分类结构，`icon` 为 Lucide 图标名字符串（可选值见 `app/utils/icons.js`）。
- `app/data/sites.json`：各栏目下的网站。
- 两边 `id` 必须一致；不一致时未登记分类会被自动补成一个分组，不会丢内容，但 `npm run check` 会报错阻断构建。
- 访客自定义的新域名会尝试外部图标服务，失败回退首字母色块，不会出现破图。

## 部署配置

`nuxt.config.ts` 在构建期读取两个环境变量，修改后需重新 `npm run generate`：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `NUXT_PUBLIC_SITE_URL` | `https://nav.leanku.com` | Open Graph 图片与结构化数据的绝对地址前缀；部署到自己的域名时请覆盖 |
| `NUXT_PUBLIC_ANALYTICS_ID` | 空 | 可选 GA4 统计 ID；留空时不注入任何第三方统计脚本 |

## 品牌资源

- `public/navigator.png` 是全站唯一品牌标记（黑色圆角方形 + 镂空箭头）。**不要手改** `icon-192/512`、`favicon.*`、`apple-touch-icon`、`navigator-dark` 等派生图——改完 `navigator.png` 后跑 `npm run brand` 重新生成（分享图会联动渲染）。
- `public/icon.svg` 是需手工同步的矢量副本。

## Issue 与 PR

- Bug 请使用 **Bug Report** 模板，附复现步骤、浏览器/系统、截图。
- 新功能请先开 **Feature Request** 讨论，避免重复劳动。
- PR 请保持单一职责、描述清楚动机；CI 会跑 `npm ci` + `npm run check` + `npm run generate`，请确保本地通过。
- 提交信息建议遵循 Conventional Commits（`feat:` / `fix:` / `docs:` / `chore:` 等）。
