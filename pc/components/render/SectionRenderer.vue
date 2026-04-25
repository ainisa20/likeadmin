<template>
  <component
    :is="componentMap[section.type]"
    v-if="componentMap[section.type]"
    v-bind="section.props"
    :section-id="section.id"
  />
</template>

<script setup lang="ts">
import type { Section } from '@/types/page-builder'
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  section: Section
}>()

const componentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'hero-banner': defineAsyncComponent(() =>
    import('./RenderHeroBanner.vue')
  ),
  'feature-grid': defineAsyncComponent(() =>
    import('./RenderFeatureGrid.vue')
  ),
  'rich-text': defineAsyncComponent(() => import('./RenderRichText.vue')),
  'image-carousel': defineAsyncComponent(() =>
    import('./RenderCarousel.vue')
  ),
  'stats-bar': defineAsyncComponent(() => import('./RenderStatsBar.vue')),
  'testimonials': defineAsyncComponent(() =>
    import('./RenderTestimonials.vue')
  ),
  'faq-accordion': defineAsyncComponent(() => import('./RenderFaqAccordion.vue')),
  'cta-section': defineAsyncComponent(() => import('./RenderCtaSection.vue')),
  'card-list': defineAsyncComponent(() => import('./RenderCardList.vue')),
  'contact-form': defineAsyncComponent(() =>
    import('./RenderContactForm.vue')
  ),
  'divider': defineAsyncComponent(() => import('./RenderDivider.vue')),
  'custom-html': defineAsyncComponent(() =>
    import('./RenderCustomHtml.vue')
  )
}
</script>
