<template>
  <div class="carousel-section">
    <div class="carousel-container">
      <el-carousel
        v-if="displayItems.length > 0"
        :height="height"
        :interval="interval"
        :autoplay="autoplay"
        trigger="click"
        class="w-full"
      >
        <el-carousel-item v-for="(item, index) in displayItems" :key="index">
          <a
            v-if="item.link"
            :href="normalizeLink(item.link)"
            target="_blank"
            rel="noopener noreferrer"
            class="carousel-link"
          >
            <el-image
              class="carousel-image"
              :src="appStore.getImageUrl(item.image)"
              fit="cover"
            >
              <template #error>
                <div class="carousel-placeholder">
                  <el-icon :size="48"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-if="item.title" class="carousel-title-overlay">
              {{ item.title }}
            </div>
          </a>
          <div v-else class="carousel-link">
            <el-image
              class="carousel-image"
              :src="appStore.getImageUrl(item.image)"
              fit="cover"
            >
              <template #error>
                <div class="carousel-placeholder">
                  <el-icon :size="48"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-if="item.title" class="carousel-title-overlay">
              {{ item.title }}
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div v-else class="carousel-empty">
        <el-icon :size="48"><Picture /></el-icon>
        <p>暂无轮播图</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import type { ImageCarouselProps } from '@/types/page-builder'

const props = withDefaults(defineProps<ImageCarouselProps & { sectionId?: string }>(), {
  height: '340px',
  autoplay: true,
  interval: 4000,
  items: () => []
})

import { useAppStore } from '~~/stores/app'
const appStore = useAppStore()

const displayItems = computed(() => props.items.filter(item => item.image))

function normalizeLink(link: string) {
    if (!link) return ''
    if (link.match(/^https?:\/\//)) return link
    return 'https://' + link
}
</script>

<style scoped>
.carousel-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.carousel-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  text-decoration: none;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0 0 8px 8px;
}

.carousel-placeholder,
.carousel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
  border-radius: 8px;
  color: #c0c4cc;
}

.carousel-placeholder {
  height: v-bind('height');
}

.carousel-empty {
  height: v-bind('height');
}
</style>
