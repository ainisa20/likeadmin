<template>
    <div class="dynamic-page" :style="{ backgroundColor: settings.backgroundColor }">
        <section
            v-for="section in visibleSections"
            :key="section.id"
            :id="section.id"
            :style="section.styles || {}"
        >
            <div class="section-inner" :style="{ maxWidth: settings.maxWidth, margin: '0 auto' }">
                <SectionRenderer :section="section" />
            </div>
        </section>

        <div v-if="visibleSections.length === 0" class="empty-page">
            <p>页面内容配置中...</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import SectionRenderer from '@/components/render/SectionRenderer.vue'

const { visibleSections, settings, articles } = await usePageSections()

provide('pageArticles', {
    new: articles.value.new || [],
    hot: articles.value.hot || [],
    all: articles.value.all || []
})
</script>

<style lang="scss" scoped>
.dynamic-page {
    width: 100%;
    min-height: 100vh;
}

.section-inner {
    padding: 0 20px;
}

.empty-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    color: #c0c4cc;
    font-size: 1.125rem;
}
</style>
