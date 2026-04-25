<template>
  <div class="card-list-section">
    <div class="card-list-container">
      <h2 v-if="heading" class="cl-heading">{{ heading }}</h2>
      <div class="cl-grid" :style="gridStyle">
        <!-- 手动数据源 -->
        <template v-if="source === 'manual'">
          <NuxtLink
            v-for="item in displayManualItems"
            :key="item.title"
            :to="item.link || '#'"
            class="cl-card"
          >
            <div v-if="showImage && item.image" class="cl-card-image">
              <img :src="appStore.getImageUrl(item.image)" :alt="item.title" />
            </div>
            <div class="cl-card-body">
              <span v-if="showTag && item.tag" class="cl-tag">{{ item.tag }}</span>
              <h3 class="cl-card-title">{{ item.title }}</h3>
              <p v-if="item.description" class="cl-card-desc">{{ item.description }}</p>
            </div>
          </NuxtLink>
        </template>
        <!-- 自动文章数据源 -->
        <template v-else>
          <NuxtLink
            v-for="article in displayArticles"
            :key="article.id"
            :to="`/information/${article.id}`"
            class="cl-card"
          >
            <div v-if="showImage && article.image" class="cl-card-image">
              <img :src="appStore.getImageUrl(article.image)" :alt="article.title" />
            </div>
            <div class="cl-card-body">
              <span v-if="showTag && article.cate_name" class="cl-tag">{{ article.cate_name }}</span>
              <h3 class="cl-card-title">{{ article.title }}</h3>
              <p v-if="article.desc" class="cl-card-desc">{{ article.desc }}</p>
            </div>
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CardListProps } from '@/types/page-builder'

const props = withDefaults(defineProps<CardListProps & { sectionId?: string }>(), {
  source: 'manual',
  columns: 3,
  limit: 6,
  showImage: true,
  showTag: true,
  items: () => []
})

import { useAppStore } from '~~/stores/app'
const appStore = useAppStore()

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`
}))

const displayManualItems = computed(() => (props.items || []).slice(0, props.limit))

// 自动文章源需要从外部注入，通过 inject 获取
const articles = inject<{ new: any[]; hot: any[]; all: any[] }>('pageArticles', { new: [], hot: [], all: [] })

const displayArticles = computed(() => {
  const source = props.source
  const list = source === 'article-hot' ? articles.hot : source === 'article-latest' ? articles.new : articles.all
  return list.slice(0, props.limit)
})
</script>

<style scoped>
.card-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.cl-heading {
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  color: #303133;
  margin-bottom: 48px;
}

.cl-grid {
  display: grid;
  gap: 24px;
}

.cl-card {
  display: block;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  text-decoration: none;
}

.cl-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.cl-card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.cl-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cl-card:hover .cl-card-image img {
  transform: scale(1.05);
}

.cl-card-body {
  padding: 20px;
}

.cl-tag {
  display: inline-block;
  font-size: 0.75rem;
  color: #4153ff;
  background: #eef0ff;
  padding: 2px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.cl-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cl-card-desc {
  font-size: 0.875rem;
  color: #909399;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .cl-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .cl-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
