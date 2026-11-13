<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
/* 首屏防跳：与 nuxt.config.ts 的主题防闪脚本同一模式——head 内同步执行、早于首次绘制。
   收藏/最近访问来自 localStorage，预渲染 HTML 里不存在；若等 hydration 后再插入，
   会把整个分类列表往下推（CLS）。这里只判定「有没有」，由 CSS 在首帧就撑好容器高度。
   放在 .vue 而非 nuxt.config.ts：dev server 能热更新，不必重构 build 才能验证。 */
useHead({
  script: [{
    type: 'text/javascript',
    innerHTML: `(function(){try{
var f=JSON.parse(localStorage.getItem('leannav:favorites:v1')||'[]');
var r=JSON.parse(localStorage.getItem('leannav:recent:v1')||'[]');
var has=function(v){return Array.isArray(v)&&v.some(function(s){return s&&s.url&&s.title})};
var a=has(f),b=has(r);
document.documentElement.dataset.personal=a&&b?'both':a?'fav':b?'recent':'none';
}catch(e){document.documentElement.dataset.personal='none'}})()`,
  }],
})
</script>