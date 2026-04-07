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
const { pc_title, pc_ico, pc_keywords, pc_desc } = appStore.getWebsiteConfig
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
  await difyStore.initConfig()

  if (difyStore.config.enabled) {
    console.log('[Dify] Custom chat initialized')
  }
})
</script>

<template>
    <ElConfigProvider v-bind="config">
        <NuxtLayout>
            <NuxtLoadingIndicator color="#4a5dff" :height="2" />
            <NuxtPage />
        </NuxtLayout>
    </ElConfigProvider>
</template>
