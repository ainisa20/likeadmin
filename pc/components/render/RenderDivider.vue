<template>
  <div class="divider" :style="dividerStyle">
    <div v-if="props.style === 'line'" class="divider-line" :style="{ borderColor: color || '#e0e0e0' }" />
    <div v-else-if="props.style === 'gradient'" class="divider-gradient" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DividerProps } from '@/types/page-builder'

const props = withDefaults(defineProps<DividerProps & { sectionId?: string }>(), {
  style: 'space',
  height: '40px',
  color: '#e0e0e0'
})

const dividerStyle = computed(() => ({
  height: props.height,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))
</script>

<style scoped>
.divider-line {
  width: 100%;
  border-top: 1px solid;
}

.divider-gradient {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #d0d0d0, transparent);
}
</style>
