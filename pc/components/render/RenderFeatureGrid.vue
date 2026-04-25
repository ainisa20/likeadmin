<template>
  <div class="feature-section">
    <div class="feature-container">
      <h2 v-if="heading" class="feature-heading">{{ heading }}</h2>
      <p v-if="subheading" class="feature-subheading">{{ subheading }}</p>
      <div class="feature-grid" :style="gridStyle">
        <div
          v-for="item in items"
          :key="item.title"
          class="feature-card"
        >
          <div class="feature-icon">{{ item.icon }}</div>
          <h3 class="feature-title">{{ item.title }}</h3>
          <p class="feature-desc">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FeatureGridProps } from '@/types/page-builder'

const props = withDefaults(defineProps<FeatureGridProps & { sectionId?: string }>(), {
  columns: 3,
  items: () => []
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`
}))
</script>

<style scoped>
.feature-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.feature-heading {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: #303133;
  margin-bottom: 12px;
}

.feature-subheading {
  text-align: center;
  color: #909399;
  font-size: 1rem;
  margin-bottom: 60px;
}

.feature-grid {
  display: grid;
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 40px 28px;
  border-radius: 12px;
  background: #f5f7fa;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background: #ffffff;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
  line-height: 1;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.feature-desc {
  font-size: 0.9375rem;
  color: #606266;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .feature-grid {
    grid-template-columns: 1fr !important;
    gap: 20px;
  }
  .feature-card {
    padding: 28px 20px;
  }
}
</style>
