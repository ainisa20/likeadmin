<template>
  <div
    class="cta-section relative overflow-hidden"
    :style="ctaStyle"
  >
    <div class="cta-container" :class="layoutClass">
      <div class="cta-text">
        <h2 class="cta-heading" :style="{ color: textColor }">{{ heading }}</h2>
        <p v-if="subheading" class="cta-subheading" :style="{ color: textColor + 'cc' }">
          {{ subheading }}
        </p>
      </div>
      <div v-if="ctaText" class="cta-action">
        <NuxtLink
          :to="ctaLink || '#'"
          class="cta-button"
          :style="{ color: props.backgroundColor || '#4153ff', background: textColor || '#ffffff' }"
        >
          {{ ctaText }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CtaSectionProps } from '@/types/page-builder'

const props = withDefaults(defineProps<CtaSectionProps & { sectionId?: string }>(), {
  backgroundColor: '#4153ff',
  textColor: '#ffffff',
  style: 'centered'
})

import { useAppStore } from '~~/stores/app'
const appStore = useAppStore()

const ctaStyle = computed(() => {
  const s: Record<string, string> = {
    padding: '80px 20px'
  }
  if (props.backgroundImage) {
    s.backgroundImage = `url(${appStore.getImageUrl(props.backgroundImage)})`
    s.backgroundSize = 'cover'
    s.backgroundPosition = 'center'
  } else {
    s.backgroundColor = props.backgroundColor
  }
  return s
})

const layoutClass = computed(() =>
  props.style === 'split' ? 'cta-layout-split' : 'cta-layout-centered'
)
</script>

<style scoped>
.cta-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cta-layout-centered {
  text-align: center;
}

.cta-layout-split {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.cta-heading {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.cta-subheading {
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 500px;
}

.cta-layout-centered .cta-subheading {
  margin: 0 auto;
}

.cta-button {
  display: inline-block;
  padding: 14px 36px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.cta-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .cta-layout-split {
    flex-direction: column;
    text-align: center;
  }
  .cta-heading {
    font-size: 1.5rem;
  }
}
</style>
