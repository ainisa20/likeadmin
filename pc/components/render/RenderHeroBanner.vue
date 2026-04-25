<template>
  <div
    class="hero-banner relative overflow-hidden flex items-center justify-center"
    :style="bannerStyle"
  >
    <div class="hero-content text-center px-6" :style="{ textAlign }">
      <h1 class="hero-heading" :style="{ color: textColor }">{{ heading }}</h1>
      <p v-if="subheading" class="hero-subheading" :style="{ color: textColor + 'cc' }">
        {{ subheading }}
      </p>
      <NuxtLink
        v-if="ctaText"
        :to="ctaLink || '#'"
        class="hero-cta inline-block mt-6"
        :class="ctaClass"
      >
        {{ ctaText }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HeroBannerProps } from '@/types/page-builder'

const props = withDefaults(defineProps<HeroBannerProps & { sectionId?: string }>(), {
  backgroundColor: '#1a1a2e',
  textColor: '#ffffff',
  textAlign: 'center',
  height: '420px',
  ctaStyle: 'primary'
})

import { useAppStore } from '~~/stores/app'
const appStore = useAppStore()

const themeConfig = computed(() => appStore.getThemeConfig)

const bannerStyle = computed(() => {
  const style: Record<string, string> = {
    height: props.height,
    minHeight: '280px'
  }
  if (props.backgroundImage) {
    style.backgroundImage = `url(${appStore.getImageUrl(props.backgroundImage)})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  } else {
    style.backgroundColor = props.backgroundColor || themeConfig.value.headerBgColor || '#4153ff'
  }
  return style
})

const textColor = computed(() => props.textColor || themeConfig.value.headerTextColor || '#ffffff')

const ctaClass = computed(() => {
  const base = 'text-base font-medium rounded-lg transition-all duration-300'
  switch (props.ctaStyle) {
    case 'outline':
      return `${base} px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-gray-900`
    case 'link':
      return `${base} px-2 py-1 text-white underline hover:no-underline`
    default:
      return `${base} px-8 py-3 bg-white text-gray-900 hover:bg-gray-100 shadow-lg`
  }
})
</script>

<style scoped>
.hero-heading {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subheading {
  font-size: 1.125rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .hero-heading {
    font-size: 1.75rem;
  }
  .hero-subheading {
    font-size: 1rem;
  }
}
</style>
