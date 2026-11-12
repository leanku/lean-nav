<template>
  <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0 focus-visible:rounded-control" aria-label="LeanNav 首页">
    <img src="/navigator.png" alt="" width="28" height="28" aria-hidden="true"
      class="brand-mark w-7 h-7 shrink-0" />
    <span v-if="!compact"
      class="text-[15px] leading-none font-semibold tracking-[-0.3px] whitespace-nowrap text-ink">LeanNav</span>
  </NuxtLink>
</template>

<script setup>
defineProps({ compact: { type: Boolean, default: false } })
</script>
