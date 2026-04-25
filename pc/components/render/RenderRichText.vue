<template>
  <div class="rich-text-section">
    <div class="rich-text-container">
      <div class="rich-text-layout" :class="layoutClass">
        <!-- 图片区（left-image / right-image 布局） -->
        <div v-if="showImage && image" class="rich-text-image">
          <img
            :src="appStore.getImageUrl(image)"
            :alt="imageAlt || heading || ''"
            class="rt-image"
          />
        </div>
        <!-- 文字区 -->
        <div class="rich-text-content">
          <h2 v-if="heading" class="rt-heading">{{ heading }}</h2>
          <div class="rt-body" v-html="content" />
          <NuxtLink
            v-if="ctaText"
            :to="ctaLink || '#'"
            class="rt-cta"
          >
            {{ ctaText }} &rarr;
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RichTextProps } from '@/types/page-builder'

const props = withDefaults(defineProps<RichTextProps & { sectionId?: string }>(), {
  layout: 'text-only',
  content: ''
})

import { useAppStore } from '~~/stores/app'
const appStore = useAppStore()

const layoutClass = computed(() => `layout-${props.layout}`)

const showImage = computed(() => props.layout === 'left-image' || props.layout === 'right-image')
</script>

<style scoped>
.rich-text-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.rich-text-layout {
  display: flex;
  gap: 48px;
  align-items: center;
}

.layout-text-only,
.layout-full-width {
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
}

.layout-left-image {
  flex-direction: row;
}

.layout-right-image {
  flex-direction: row-reverse;
}

.rich-text-image {
  flex: 0 0 40%;
}

.rt-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
}

.rich-text-content {
  flex: 1;
  min-width: 0;
}

.rt-heading {
  font-size: 2rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.rt-body {
  font-size: 1rem;
  color: #606266;
  line-height: 1.8;
}

.rt-body :deep(p) {
  margin-bottom: 12px;
}

.rt-body :deep(p:last-child) {
  margin-bottom: 0;
}

.rt-body :deep(strong) {
  color: #303133;
}

.rt-cta {
  display: inline-block;
  margin-top: 24px;
  color: #4153ff;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.rt-cta:hover {
  color: #7583ff;
}

@media (max-width: 768px) {
  .rich-text-layout {
    flex-direction: column !important;
  }
  .rich-text-image {
    flex: none;
    width: 100%;
  }
  .rt-heading {
    font-size: 1.5rem;
  }
}
</style>
