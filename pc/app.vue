<script lang="ts" setup>
import { ID_INJECTION_KEY, ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useAppStore } from './stores/app'
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

// ========== 阶段1优化：Dify 聊天机器人 - 提前初始化 ==========

// 优化1：提前生成用户 ID（在 setup 阶段立即执行）
const getOrGenerateUserId = (): string => {
    let userId = localStorage.getItem('dify_user_id')
    if (!userId) {
        try {
            userId = crypto.randomUUID()
            localStorage.setItem('dify_user_id', userId)
            console.log('[Dify] Generated new user ID:', userId)
        } catch (error) {
            // 降级方案：使用时间戳 + 随机数
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            localStorage.setItem('dify_user_id', userId)
            console.log('[Dify] Fallback user ID generated:', userId)
        }
    } else {
        console.log('[Dify] Using existing user ID:', userId)
    }
    return userId
}

// 优化2：提前发起 API 请求（不等待 onMounted）
const initDifyChatbot = async () => {
    try {
        // 并行处理：同时生成用户 ID 和获取配置
        const [userId, apiConfig] = await Promise.all([
            Promise.resolve(getOrGenerateUserId()), // 同步操作，包装成 Promise
            getConfig() // 异步 API 请求
        ])
        
        const difyConfig = apiConfig.dify || {}

        // 检查是否启用
        if (!difyConfig.enabled || !difyConfig.token) {
            console.log('[Dify] Chatbot is disabled or token is missing')
            return
        }

        console.log('[Dify] Initializing chatbot with config:', difyConfig)

        // 优化3：动态添加预连接（基于实际的 baseUrl）
        if (difyConfig.baseUrl) {
            try {
                const url = new URL(difyConfig.baseUrl)
                const preconnectLink = document.createElement('link')
                preconnectLink.rel = 'preconnect'
                preconnectLink.href = url.origin
                preconnectLink.crossOrigin = 'anonymous'
                document.head.appendChild(preconnectLink)
                
                const dnsPrefetchLink = document.createElement('link')
                dnsPrefetchLink.rel = 'dns-prefetch'
                dnsPrefetchLink.href = url.origin
                document.head.appendChild(dnsPrefetchLink)
                
                console.log('[Dify] Added preconnect for:', url.origin)
            } catch (error) {
                console.warn('[Dify] Failed to add preconnect:', error)
            }
        }

        // 设置 Dify 配置（必须在加载脚本之前）
        window.difyChatbotConfig = {
            token: difyConfig.token,
            baseUrl: difyConfig.baseUrl,
            inputs: {},
            systemVariables: {
                user_id: userId
            },
            userVariables: {},
            dynamicScript: true
        }

        // 添加自定义样式
        const style = document.createElement('style')
        style.innerHTML = `
            #dify-chatbot-bubble-button {
                background-color: ${difyConfig.buttonColor} !important;
            }
            #dify-chatbot-bubble-window {
                width: ${difyConfig.windowWidth}rem !important;
                height: ${difyConfig.windowHeight}rem !important;
            }
        `
        document.head.appendChild(style)

        // 优化4：使用 async 加载脚本（比 defer 更快）
        const script = document.createElement('script')
        script.src = `${difyConfig.baseUrl}/embed.min.js`
        script.id = difyConfig.token
        script.async = true
        
        // 监听脚本加载完成
        script.onload = () => {
            console.log('[Dify] Chatbot script loaded successfully')
        }
        
        script.onerror = () => {
            console.error('[Dify] Failed to load chatbot script')
        }
        
        document.body.appendChild(script)
        
        console.log('[Dify] Chatbot initialization completed')

    } catch (error) {
        console.error('[Dify] Chatbot initialization failed:', error)
    }
}

// 优化5：立即执行初始化（不等待 onMounted）
// 使用 requestIdleCallback 或 setTimeout 避免阻塞页面渲染
if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => initDifyChatbot(), { timeout: 2000 })
    } else {
        // 降级方案：使用 setTimeout
        setTimeout(() => initDifyChatbot(), 0)
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
