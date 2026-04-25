<template>
  <div class="testimonials-section">
    <div class="testimonials-container">
      <h2 v-if="heading" class="tm-heading">{{ heading }}</h2>
      <div class="tm-grid" :style="gridStyle">
        <div v-for="item in items" :key="item.name" class="tm-card">
          <div class="tm-quote">&ldquo;</div>
          <p class="tm-content">{{ item.content }}</p>
          <div class="tm-rating" v-if="item.rating">
            <span v-for="n in 5" :key="n" class="tm-star" :class="{ active: n <= item.rating }">&#9733;</span>
          </div>
          <div class="tm-author">
            <div v-if="item.avatar" class="tm-avatar">
              <img :src="appStore.getImageUrl(item.avatar)" :alt="item.name" />
            </div>
            <div v-else class="tm-avatar tm-avatar-placeholder">
              {{ item.name.charAt(0) }}
            </div>
            <div class="tm-info">
              <div class="tm-name">{{ item.name }}</div>
              <div v-if="item.role" class="tm-role">{{ item.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TestimonialsProps } from '@/types/page-builder'

const props = withDefaults(defineProps<TestimonialsProps & { sectionId?: string }>(), {
  columns: 3,
  items: () => []
})

import { useAppStore } from '~~/stores/app'
const appStore = useAppStore()

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`
}))
</script>

<style scoped>
.testimonials-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tm-heading {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: #303133;
  margin-bottom: 60px;
}

.tm-grid {
  display: grid;
  gap: 24px;
}

.tm-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s ease;
}

.tm-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tm-quote {
  font-size: 3rem;
  line-height: 1;
  color: #4153ff;
  opacity: 0.3;
  font-family: Georgia, serif;
  margin-bottom: 8px;
}

.tm-content {
  font-size: 0.9375rem;
  color: #606266;
  line-height: 1.7;
  margin-bottom: 16px;
}

.tm-rating {
  margin-bottom: 16px;
}

.tm-star {
  color: #dcdfe6;
  font-size: 1rem;
  margin-right: 2px;
}

.tm-star.active {
  color: #f7ba2a;
}

.tm-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.tm-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.tm-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tm-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4153ff;
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
}

.tm-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #303133;
}

.tm-role {
  font-size: 0.8125rem;
  color: #909399;
  margin-top: 2px;
}

@media (max-width: 1024px) {
  .tm-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .tm-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
