<template>
  <div class="custom-html-section">
    <div class="custom-html-container" v-html="sanitizedHtml" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomHtmlProps } from '@/types/page-builder'

const props = withDefaults(defineProps<CustomHtmlProps & { sectionId?: string }>(), {
  html: ''
})

// 简单的 HTML 清理：移除危险标签
const sanitizedHtml = computed(() => {
  let clean = props.html
  // 移除 script 标签及内容
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '')
  // 移除 iframe 标签
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
  // 移除 style 标签及内容
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '')
  // 移除 on* 事件属性
  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')
  // 移除 javascript: 协议
  clean = clean.replace(/href\s*=\s*["']javascript:/gi, 'href="')
  clean = clean.replace(/src\s*=\s*["']javascript:/gi, 'src="')
  return clean
})
</script>

<style scoped>
.custom-html-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  line-height: 1.8;
  color: #303133;
  font-size: 1rem;
}

.custom-html-container :deep(img) {
  max-width: 100%;
  height: auto;
}

.custom-html-container :deep(a) {
  color: #4153ff;
  text-decoration: none;
}

.custom-html-container :deep(a:hover) {
  text-decoration: underline;
}
</style>
