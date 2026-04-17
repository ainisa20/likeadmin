import { createSSRApp } from 'vue'
import App from './App.vue'
import plugins from './plugins'
import router from './router'
import './styles/index.scss'
import { setupMixin } from './mixins'

// #ifdef H5
import DifyChat from '@/components/DifyChat/index.vue'
// #endif

export function createApp() {
    const app = createSSRApp(App)
    setupMixin(app)
    app.use(plugins)
    app.use(router)

    // #ifdef H5
    // 全局注册 DifyChat 组件
    app.component('DifyChat', DifyChat)
    // #endif

    return {
        app
    }
}
