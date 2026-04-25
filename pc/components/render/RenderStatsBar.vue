<template>
  <div class="stats-bar">
    <div class="stats-container" :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }">
      <div class="stats-grid">
        <div v-for="item in items" :key="item.label" class="stat-item">
          <span v-if="item.icon" class="stat-icon">{{ item.icon }}</span>
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StatsBarProps } from '@/types/page-builder'

withDefaults(defineProps<StatsBarProps & { sectionId?: string }>(), {
  items: () => []
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(v-bind('items.length > 4 ? 4 : items.length'), 1fr);
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px 12px;
}

.stat-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: #909399;
  margin-top: 6px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
