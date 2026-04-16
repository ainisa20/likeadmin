<script lang="ts" setup>
import { ID_INJECTION_KEY, ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from './stores/app'
import { useDifyStore } from './stores/dify'
import { getConfig } from './api/app'

provide(ID_INJECTION_KEY, {
    prefix: 100,
    current: 0
})
const config = {
    locale: zhCn
}
const appStore = useAppStore()
const { pc_title, pc_ico, pc_keywords, pc_desc } = computed(() => {
  const config = appStore.getWebsiteConfig
  return {
    pc_title: config.shop_name || 'LikeAdmin',
    pc_ico: config.pc_logo || '',
    pc_keywords: config.pc_keywords || '',
    pc_desc: config.pc_desc || ''
  }
}).value
const { clarity_code } = appStore.getSiteStatistics

// ========== 阶段1优化：预连接优化 ==========
// 注意：这里使用常见的 Dify 部署地址进行预连接
// 实际部署时可以根据环境变量配置
const headOptions: any = {
    title: pc_title,
    meta: [
        { name: 'description', content: pc_desc },
        { name: 'keywords', content: pc_keywords }
    ],
    link: [
        {
            rel: 'icon',
            href: pc_ico
        },
        // 预连接优化：DNS 预解析和预连接
        {
            rel: 'dns-prefetch',
            href: 'https://cloud.dify.ai'
        },
        {
            rel: 'preconnect',
            href: 'https://cloud.dify.ai',
            crossorigin: 'anonymous'
        }
    ],
    script: []
}

if (clarity_code) {
    headOptions.script.push({
        type: 'text/javascript',
        innerHTML: `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarity_code}");
      `
    })
}
useHead(headOptions)

const difyStore = useDifyStore()

onMounted(async () => {
  await appStore.getConfig()
  
  // 先应用主题配置（在组件渲染前）
  applyThemeConfig()
  
  await difyStore.initConfig()

  if (difyStore.config.enabled) {
    console.log('[Dify] Custom chat initialized')
  }
})

// 应用主题配置
const applyThemeConfig = () => {
  if (typeof document === 'undefined') return
  
  try {
    // 直接从 store 获取主题配置
    const themeConfig = appStore.getThemeConfig
    
    if (themeConfig && Object.keys(themeConfig).length > 0) {
      console.log('[Theme] Applying theme config:', themeConfig)
      
      const root = document.documentElement
      
      // 应用颜色变量
      if (themeConfig.primaryColor) {
        root.style.setProperty('--color-primary', themeConfig.primaryColor)
        root.style.setProperty('--el-color-primary', themeConfig.primaryColor)
      }
      
      if (themeConfig.minorColor) {
        root.style.setProperty('--color-minor', themeConfig.minorColor)
      }
      
      if (themeConfig.pageBgColor) {
        root.style.setProperty('--el-bg-color-page', themeConfig.pageBgColor)
      }
      
      if (themeConfig.headerBgColor) {
        root.style.setProperty('--header-bg', themeConfig.headerBgColor)
        // 同时更新 primary 相关的变量，确保导航菜单颜色正确
        root.style.setProperty('--el-color-primary', themeConfig.headerBgColor)
      }
      
      if (themeConfig.headerTextColor) {
        root.style.setProperty('--header-text', themeConfig.headerTextColor)
      }
      
      if (themeConfig.borderRadius !== undefined) {
        root.style.setProperty('--border-radius', `${themeConfig.borderRadius}px`)
      }
      
      console.log('[Theme] Theme applied successfully')
      
      // 强制触发一次样式更新
      nextTick(() => {
        console.log('[Theme] Next tick - theme should be applied now')
      })
    } else {
      console.log('[Theme] No theme config found, using default')
    }
  } catch (error) {
    console.error('[Theme] Failed to apply theme:', error)
  }
}
</script>

<template>
    <ElConfigProvider v-bind="config">
        <NuxtLayout>
            <NuxtLoadingIndicator color="#4a5dff" :height="2" />
            <NuxtPage />
        </NuxtLayout>
    </ElConfigProvider>
</template>
