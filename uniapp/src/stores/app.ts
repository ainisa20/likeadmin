import { defineStore } from 'pinia'
import { getConfig } from '@/api/app'
import { useDifyStore } from './dify'

interface AppSate {
    config: Record<string, any>
}
export const useAppStore = defineStore({
    id: 'appStore',
    state: (): AppSate => ({
        config: {
            domain: ''
        }
    }),
    getters: {
        getWebsiteConfig: (state) => state.config.website || {},
        getLoginConfig: (state) => state.config.login || {},
        getTabbarConfig: (state) => state.config.tabbar || [],
        getStyleConfig: (state) => state.config.style || {},
        getH5Config: (state) => state.config.webPage || {},
        getCopyrightConfig: (state) => state.config.copyright || [],
    },
    actions: {
        getImageUrl(url: string) {
            return url.indexOf('http') ? `${this.config.domain}${url}` : url
        },
        async getConfig() {
            const data = await getConfig()
            this.config = data

            // 同步设置 Dify 配置（统一使用PC端配置）
            if (data.dify_config) {
                const difyStore = useDifyStore()
                difyStore.setDifyConfig(data.dify_config)
            }
        }
    }
})
