<template>
  <NuxtLink to="/" :class="['flex items-center shrink-0 focus-visible:rounded-control', boxed ? '' : 'gap-2.5']"
    aria-label="LeanNav 首页">
    <!-- boxed：把 28px 品牌图装进与侧栏菜单 iconBox 同宽的 32px 盒子并居中，
         让 logo 与菜单图标结构性对齐（中心都落在 40px / 折叠态 36px）。
         文字改由 CSS 淡出（brand-label），与侧栏折叠动画同步；不用 gap 是为了折叠时能收到 0。 -->
    <span v-if="boxed" class="w-8 h-8 shrink-0 flex items-center justify-center">
      <img src="/navigator.png" alt="" width="28" height="28" aria-hidden="true" class="brand-mark w-7 h-7" />
    </span>
    <img v-else src="/navigator.png" alt="" width="28" height="28" aria-hidden="true"
      class="brand-mark w-7 h-7 shrink-0" />
    <span v-if="boxed || !compact" :class="[
      'text-[15px] leading-none font-semibold tracking-[-0.3px] whitespace-nowrap text-ink',
      boxed ? 'brand-label ml-3' : ''
    ]">LeanNav</span>
  </NuxtLink>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false },
  boxed: { type: Boolean, default: false },
})
</script>
