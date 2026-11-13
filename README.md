# LeanNav

纯静态部署的极简导航站：Nuxt 4 + Tailwind，**无后端、无数据库、无运行时接口**。访客可以直接在页面里自定义分类与网站，不需要懂代码。

> 视觉基准见项目根目录的 [`DESIGN.md`](./DESIGN.md)：Linear 基调 + 派生亮色阶梯、**无彩色外壳**（`--primary` 是墨色反相，颜色只来自站点 favicon）、双主题 token，以及一份「设计不变量」维护约束。任何 UI 改动先查它；样式一律走 `app/assets/css/main.css` 里的 CSS 变量，不要在组件里写死颜色。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # 校验 nav.js 与 sites.json 的分类 id 一致性
npm run icons      # 抓取站点 favicon 到 public/icons（约 1 分钟，需联网）
npm run brand      # 从 public/navigator.png 重新生成全站品牌图标与分享图源
npm run generate   # 生成静态站点到 .output/public，直接上传即可
```

`npm run build` / `npm run generate` 会自动执行 `prebuild` / `pregenerate`：
先校验数据一致性（不一致直接阻断构建），再补抓少量新增图标（缺失超过 24 个时跳过，需手动跑 `npm run icons`）；图标抓取失败不会阻断构建。
`public/icons/` 已随仓库提交，干净环境构建（CI / Cloudflare Pages）无需联网即可带齐 favicon。

## 用户怎么自定义

打开网站右上角「自定义」（抽屉，快速增删改，改完能立刻看到首页变化），或访问 `/customize` 独立页（左编辑 / 右实时预览，适合批量管理、导入导出、发布引导）。两者共用同一个编辑器组件。

- **自己用**：增删改分类/网站、换 Lucide 图标、排序、批量粘贴，改动实时生效并自动保存在这个浏览器
- **收藏 / 最近访问**：卡片右上角星标收藏，首页顶部展示收藏与最近访问（localStorage）
- **换设备**：「下载配置备份」→ 新设备「导入配置文件」
- **分享别人**：「复制分享链接」，对方打开即可预览，再点「保存到我的导航」
- **全站生效**：下载 `nav-config.json` 上传到静态站点根目录（与 `index.html` 同级），刷新即生效，**不需要重新打包**

配置优先级：分享链接 > 本机自定义 > 站点配置文件 > 内置默认。

## 数据与图标

- `app/data/nav.js` — 分类结构（图标用字符串名，见 `app/utils/icons.js`）
- `app/data/sites.json` — 各栏目的网站
- `app/data/local-icons.json` — 已本地化的图标域名清单（由 `npm run icons` 生成）
- `public/icons/<domain>.<ext>` — 构建期抓取的 favicon（`png` / `ico` / `svg` 按真实文件头判定），页面按 `local-icons.json` 映射优先加载；缺失时自动回退到首字母色块，不会出现破图
- 访客自定义的新域名会尝试外部图标服务，失败同样回退首字母色块
- `public/navigator.png` — **全站唯一品牌标记**（黑色圆角方形 + 镂空箭头，圆角 22%）。`npm run brand` 从它派生 `icon-192/512.png`、`favicon.ico`、`favicon-16/32`、`apple-touch-icon.png`、`navigator-dark.png`（暗色标签页），并同步替换 `og-image.png` 左上角的标记；`icon.svg` 是需手工同步的矢量副本。暗色下页面内的 logo 用 CSS 反相。换 logo 只改这一张图再跑一次命令；原圆形原稿备份在 `.workbuddy/brand-backup/navigator-circle.png`。

新增站点后跑一次 `npm run check && npm run icons`，数据错误和图标缺失都能在发布前发现。

## 页面与交互

- 首页 `/`、关于页 `/about` 共用 `AppShell`（侧栏 + 顶栏 + 页脚 + 主题）；`/customize` 是独立编辑页
- 搜索：`/` 或 `⌘K` / `Ctrl+K` 聚焦，`Esc` 清空，回车打开首个结果（只在首页有可搜内容）
- 主题：首屏内联脚本决定，默认跟随系统偏好；亮/暗只换 CSS 变量，侧栏与浮层跟随；`prefers-reduced-motion` 自动关闭动效
- 侧栏：分组默认全部收起，手动展开的分组记在 `localStorage`，滚动只负责高亮、不改写展开状态；折叠时悬停/聚焦弹出二级分类；桌面与移动端分别记忆折叠状态。点击栏目会锁定高亮直到滚动结束，避免平滑滚动途中选中态连续跳动
- 顶栏：三区网格让搜索在内容区真正居中；右侧 GitHub / 自定义 / 主题；品牌只在侧栏（移动端抽屉关闭时顶栏补一个紧凑 logo），同一屏不会重复
- 9 个分组 + 25 个栏目各配唯一 Lucide 图标，图标可在编辑器里用网格选择器更换；二级栏目有缩进与 1px 引导线
- 性能：零外部字体 / 零外部图标请求；视口外 section 用 `content-visibility` 跳过渲染；统计脚本延后到浏览器空闲
- PWA：`manifest.webmanifest` + `sw.js`，仅生产环境注册，可添加到主屏幕与离线打开

## 部署到自己的静态托管

`npm run generate` 后把 `.output/public` 整个目录上传到任意静态托管（GitHub Pages、Cloudflare Pages、Vercel、对象存储 + CDN 等）即可。站长更新全站内容只需覆盖根目录的 `nav-config.json`，无需重新打包。

## 贡献

欢迎 Issue 与 PR。开发脚本、目录结构与配置格式见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)；视觉基准与「设计不变量」维护约束见 [`DESIGN.md`](./DESIGN.md)。提交前请运行 `npm run check` 确保数据一致。

## 许可证

[MIT](./LICENSE) © LeanNav Contributors
