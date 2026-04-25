import { defineStore } from 'pinia'
import { getConfig } from '~~/api/app'

interface AppSate {
    config: Record<string, any>
}
export const useAppStore = defineStore({
    id: 'appStore',
    state: (): AppSate => ({
        config: {}
    }),
    getters: {
        getImageUrl: (state) => (url: string) => {
            if (!url) return ''
            // Already has full URL (http:// or https://)
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url
            }
            // Relative path - prepend domain
            return `${state.config.domain}${url}`
        },
        getWebsiteConfig: (state) => state.config.website || {},
        getLoginConfig: (state) => state.config.login || {},
        getCopyrightConfig: (state) => state.config.copyright || [],
        getQrcodeConfig: (state) => state.config.qrcode || {},
        getAdminUrl: (state) => state.config.admin_url,
        getSiteStatistics: (state) => state.config.siteStatistics || {},
        getThemeConfig: (state) => state.config.theme_config || {}
    },
    actions: {
        async getConfig() {
            const config = await getConfig()
            this.config = config
        }
    }
})
