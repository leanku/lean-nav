<template>
  <div ref="rootEl" class="relative shrink-0">
    <button type="button" @click="open = !open" :aria-label="`选择图标，当前：${currentLabel}`"
      :title="currentLabel" :aria-expanded="open"
      class="w-10 h-10 flex items-center justify-center rounded-control bg-surface-1 border border-hairline text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors">
      <component :is="iconOf(modelValue)" class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
    </button>

    <div v-if="open"
      class="absolute z-40 top-full left-0 mt-1 w-[264px] p-2 rounded-popover bg-surface-4 border border-hairline shadow-popover"
      role="listbox" aria-label="选择图标">
      <div class="grid grid-cols-6 gap-1">
        <button v-for="opt in ICON_OPTIONS" :key="opt.name" type="button" :title="opt.label"
          :aria-label="opt.label" role="option" :aria-selected="opt.name === modelValue"
          @click="select(opt.name)"
          :class="[
            'w-10 h-10 flex items-center justify-center rounded-control transition-colors',
            opt.name === modelValue ? 'bg-surface-2 text-primary' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
          ]">
          <component :is="iconOf(opt.name)" class="nav-icon w-[18px] h-[18px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { iconOf, ICON_OPTIONS } from '@/utils/icons'

const props = defineProps({
  modelValue: { type: String, default: 'Globe' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const rootEl = ref(null)
const currentLabel = computed(() => ICON_OPTIONS.find((opt) => opt.name === props.modelValue)?.label || props.modelValue)

function select(name) {
  emit('update:modelValue', name)
  open.value = false
}
function onOutside(event) {
  if (rootEl.value && !rootEl.value.contains(event.target)) open.value = false
}
function onEscape(event) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', onOutside)
  document.addEventListener('keydown', onEscape)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onOutside)
  document.removeEventListener('keydown', onEscape)
})
</script>
