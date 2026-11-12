/** @type {import('tailwindcss').Config} */
// 颜色全部指向 app/assets/css/main.css 的 token，亮/暗只换变量值，不改组件。
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
        hairline: 'var(--hairline)',
        'hairline-strong': 'var(--hairline-strong)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        'ink-subtle': 'var(--ink-subtle)',
        'ink-tertiary': 'var(--ink-tertiary)',
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'on-primary': 'var(--on-primary)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
      // DESIGN.md 第 3 节：工具型界面的紧凑字阶，字重只到 600
      // v1.2：栏目主标题单独放大到 22px（main.css 的 .section-title）；section 保留 16px 给次级标题，
      //       避免 about 页所有标题同尺寸。卡片尺寸与网格列数不变。
      fontSize: {
        title: ['22px', { lineHeight: '1.3', letterSpacing: '-0.5px', fontWeight: '600' }],
        section: ['16px', { lineHeight: '1.35', letterSpacing: '-0.3px', fontWeight: '600' }],
        'card-title': ['14px', { lineHeight: '1.4', letterSpacing: '-0.1px', fontWeight: '500' }],
        body: ['13px', { lineHeight: '1.6' }],
        caption: ['12px', { lineHeight: '1.5' }],
      },
      // 第 4 节：不再混用 rounded-lg / rounded-xl / rounded-2xl / bento
      borderRadius: {
        control: '8px',
        card: '12px',
        popover: '12px',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['ui-monospace', 'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        popover: 'var(--popover-shadow)',
      },
      // DESIGN.md 第 7 节：全站一条缓动，时长按距离分级；值来自 main.css 的 --ease-out / --dur-*
      transitionTimingFunction: {
        DEFAULT: 'var(--ease-out)',
        'out-expo': 'var(--ease-out)',
      },
      transitionDuration: {
        160: '160ms',
        240: '240ms',
        320: '320ms',
        380: '380ms',
      },
    },
  },
}
