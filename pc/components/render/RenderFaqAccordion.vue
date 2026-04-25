<template>
  <div class="faq-section">
    <div class="faq-container">
      <h2 v-if="heading" class="faq-heading">{{ heading }}</h2>
      <el-collapse class="faq-collapse" accordion>
        <el-collapse-item
          v-for="(item, index) in items"
          :key="index"
          :name="index"
        >
          <template #title>
            <span class="faq-question">{{ item.question }}</span>
          </template>
          <div class="faq-answer" v-html="item.answer" />
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FaqAccordionProps } from '@/types/page-builder'

withDefaults(defineProps<FaqAccordionProps & { sectionId?: string }>(), {
  items: () => []
})
</script>

<style scoped>
.faq-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.faq-heading {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: #303133;
  margin-bottom: 48px;
}

.faq-collapse {
  border: none;
}

.faq-collapse :deep(.el-collapse-item__header) {
  font-size: 1rem;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  padding: 4px 0;
  height: auto;
  line-height: 1.6;
}

.faq-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: 1px solid #f0f0f0;
}

.faq-collapse :deep(.el-collapse-item__content) {
  padding: 16px 0;
}

.faq-question {
  line-height: 1.6;
}

.faq-answer {
  font-size: 0.9375rem;
  color: #606266;
  line-height: 1.8;
}

.faq-answer :deep(p) {
  margin-bottom: 8px;
}

.faq-answer :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
