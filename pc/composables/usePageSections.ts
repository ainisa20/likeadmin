import type {
  PageData,
  PageSettings,
  Section,
  LegacyPageData
} from '@/types/page-builder'
import { getIndex, getPageData } from '@/api/shop'
import { useAppStore } from '~~/stores/app'

const PAGE_ID_MAP: Record<string, number> = {
  '/': 4,
  '/services': 6,
  '/cases': 7,
  '/about': 8
}

export async function usePageSections() {
  const route = useRoute()
  const pageId = PAGE_ID_MAP[route.path] || 4

  const fetcher = pageId === 4
    ? () => getIndex()
    : () => getPageData(pageId)

  const { data: rawData, refresh } = await useAsyncData(
    `page-${pageId}`,
    () => fetcher(),
    {
      default: () => ({
        all: [],
        hot: [],
        new: [],
        page: {}
      })
    }
  )

  const pageData = computed<PageData>(() => {
    try {
      const rawDataValue = rawData.value
      if (!rawDataValue?.page?.data) {
        return getDefaultPageData(pageId)
      }

      const parsed = JSON.parse(rawDataValue.page.data)

      if (parsed.sections && Array.isArray(parsed.sections)) {
        return {
          _meta: parsed._meta || { version: '1.0', pageId, pageType: 'pc-page' },
          settings: parsed.settings || { maxWidth: '1200px', gap: '0px', backgroundColor: '#f5f7fa' },
          sections: parsed.sections
        }
      }

      return migrateLegacyFormat(parsed as LegacyPageData, pageId)
    } catch (error) {
      console.error('Failed to parse page data:', error)
      return getDefaultPageData(pageId)
    }
  })

  const visibleSections = computed(() =>
    pageData.value.sections.filter(section => section.visible !== false)
  )

  const settings = computed<PageSettings>(() => pageData.value.settings)

  const articles = computed(() => ({
    new: rawData.value?.new || [],
    hot: rawData.value?.hot || [],
    all: rawData.value?.all || []
  }))

  return { pageData, visibleSections, settings, articles, refresh }
}

function getDefaultPageData(pageId: number): PageData {
  return {
    _meta: { version: '1.0', pageId, pageType: 'pc-page' },
    settings: { maxWidth: '1200px', gap: '0px', backgroundColor: '#f5f7fa' },
    sections: []
  }
}

function migrateLegacyFormat(legacyData: LegacyPageData, pageId: number): PageData {
  const migratedSections: Section[] = []

  for (const widget of legacyData) {
    if (widget.disabled === 1) continue

    if (widget.name === 'pc-banner') {
      const carouselItems = widget.content?.data || []
      migratedSections.push({
        id: 'carousel-legacy',
        type: 'image-carousel',
        title: '轮播图（迁移）',
        visible: true,
        props: {
          height: '340px', autoplay: true, interval: 4000,
          items: carouselItems.map((item: any) => ({
            image: item.image || '', title: item.name || '', link: item.link?.path || ''
          }))
        },
        styles: { padding: '40px 0', backgroundColor: '#ffffff' }
      })
    } else if (widget.name === 'news') {
      migratedSections.push({
        id: 'cards-latest-legacy',
        type: 'card-list',
        title: '最新资讯（迁移）',
        visible: true,
        props: { heading: '最新资讯', source: 'article-latest', columns: 3, limit: 6 },
        styles: { padding: '80px 0', backgroundColor: '#ffffff' }
      })
    }
  }

  return {
    _meta: { version: '1.0', pageId, pageType: 'pc-page' },
    settings: { maxWidth: '1200px', gap: '0px', backgroundColor: '#f5f7fa' },
    sections: migratedSections
  }
}
