# Changelog

## v1.4.0

- 新增「AI热门 › AI Agent」栏目：收录 DeepSeek Harness、Hermes Agent、Anthropic Skills、MCP 官方文档、Smithery、MCP Servers、getdesign.md 等 Agent 生态站点；「AI编程」补充 v0 与 Cline。
- 分享图重绘：文案与站点定位统一为「极简的网址导航」，去掉站数与个人域名；新增 `scripts/og-image.html` 设计源与 `npm run og` 渲染脚本，`npm run brand` 会联动重渲染。
- 字体与排版：收敛字体栈为单一 token（`--font-sans`，组件与 Tailwind 共用），新增灰度抗锯齿、字体合成禁用、`text-wrap: balance` 用于栏目标题；正文渲染更干净锐利。
- 按钮系统化：把 `NavEditor` 内游离的 `.icon-btn` / `.tool-btn` 抽成全局 token 驱动样式（统一 `--radius-control` 圆角、与全站一致的焦点环），新增 `.tool-btn-primary` / `.tool-btn-danger`（危险操作给极淡语义底色而非彩色描边）。
- 微交互：按钮新增按压缩放（`active: scale`，尊重 `prefers-reduced-motion`），触觉反馈更明确。
- 线条：新增 `.hr-soft` / `.hr-soft-v` 中性渐变分隔线（仅用于装饰性分隔），自定义页预览分隔线已采用。
- 链接：新增 `.link` 类，hover 时下划线随 `text-underline-offset` 出现，页脚链接已采用。
- 一致性：回到顶部按钮由圆形改为 8px 圆角方形，与全站圆角语言统一。

## v1.3.0

- 品牌标记由圆形改为圆角方形（画布圆角 22%），与 8px 按钮 / 12px 卡片 / favicon 底片等全站几何同族。
- 搜索框聚焦去掉硬黑边，改为 1px 焦点线 + 4px 中性柔光（同 200ms 长出），鼠标与键盘焦点反馈一致。
- 链接卡片 hover 由「只换底色」升级为底色 + 边框 + 1px 外圈柔光 + favicon 底片边框同步，无投影、无位移。
- 自定义编辑器输入框复用同一套焦点语言（盒式 `.field` / 下划线式 `.field-underline`），屏蔽全局 2px outline 以避免双重反馈。
- `npm run brand` 新增分享图左上角标记同步；`sw.js` 缓存版本 v2 → v3。

## v1.2.0

- 引入中性材质光：玻璃顶栏、首屏径向微光、卡片 inset 顶面高光（均为黑白 ≤8% alpha，无色相）。
- 统一 `--ease-out` 缓动与分级时长；栏目主标题放大到 22px，section 间距 72px。
- 亮色改为白卡片浮在灰画布；收藏星标默认隐藏，仅 hover / 聚焦 / 已收藏 / 触屏常显。

## v1.1.0

- 去除「AI 紫」：`--primary` 改为墨色反相，页面唯一彩色来源为站点 favicon。
- 品牌标记统一为 `public/navigator.png`，`npm run brand` 一键派生全站图标与分享图。
- 顶栏三区网格使搜索真正居中，新增 GitHub 链接；修复折叠态 logo 重复与选中跳动。

## v1.0.0

- 基于 Nuxt 4 + Vue 3 + Tailwind 的纯静态导航站，无后端、无数据库。
- 用户可在页面内自定义分类与网站（抽屉 + `/customize` 独立页）；配置优先级：分享链接 > 本机 > 站点配置文件 > 内置默认。
- 图标本地化、双主题、滚动联动高亮、PWA 等基础能力就绪。
