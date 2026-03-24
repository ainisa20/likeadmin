<template>
    <view class="bg-white p-[30rpx] flex text-[#101010] font-medium text-lg">
        联系我们
    </view>
    <view
        class="customer-service bg-white flex flex-col justify-center items-center mx-[36rpx] mt-[30rpx] rounded-[20rpx] px-[20rpx] pb-[100rpx]"
    >
        <view
            class="w-full border-solid border-0 border-b border-[#f5f5f5] p-[30rpx] text-center text-[#101010] text-base font-medium">
            {{ content.title }}
        </view>

        <!-- #ifdef H5 -->
        <!-- Dify Chatbot 在线客服 -->
        <view class="mt-[40rpx] w-full flex flex-col items-center">
            <view class="text-sm text-muted mb-[20rpx]">或使用智能客服</view>
            <view 
                class="dify-chatbot-trigger bg-primary text-white px-[40rpx] py-[20rpx] rounded-full text-base"
                @click="openDifyChatbot"
            >
                💬 在线咨询
            </view>
        </view>
        <!-- #endif -->

        <!-- 全局元素：二维码展示 -->
        <view class="mt-[60rpx]">
            <!--      这样渲染是为了能在小程序中长按识别二维码      -->
            <u-parse :html="richTxt"></u-parse>
<!--            <u-image width="200" height="200" border-radius="10rpx" :src="getImageUrl(content.qrcode)"/>-->
        </view>

        <!-- 全局元素：备注 -->
        <view v-if="content.remark" class="text-sm mt-[40rpx] font-medium">{{ content.remark }}</view>

        <!-- 全局元素：电话拨打 -->
        <view v-if="content.mobile" class="text-sm mt-[24rpx] flex flex-wrap">
            <!-- #ifdef H5 -->
            <a class="ml-[10rpx] phone text-primary underline" :href="'tel:' + content.mobile">
                {{ content.mobile }}
            </a>
            <!-- #endif -->
            <!-- #ifndef H5 -->
            <view class="ml-[10rpx] phone text-primary underline" @click="handleCall">
                {{ content.mobile }}
            </view>
            <!-- #endif -->
        </view>

        <!-- 全局元素：服务时间 -->
        <view v-if="content.time" class="text-muted text-sm mt-[30rpx]">
            服务时间：{{ content.time }}
        </view>
    </view>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// #ifdef H5
declare global {
    interface Window {
        __OPC_USER_ID__?: string
        __OPC_CONVERSATION_ID__?: string
        difyChatbotConfig?: any
    }
}
// #endif

const props = defineProps({
    content: {
        type: Object,
        default: () => ({})
    },
    styles: {
        type: Object,
        default: () => ({})
    }
})

const { getImageUrl } = useAppStore()
const userStore = useUserStore()

const richTxt = computed(() => {
    const src = getImageUrl(props.content.qrcode)
    return `<img src="${src}" style="width: 100px;height: 100px; border-radius: 8px" />`
})

const handleCall = () => {
    uni.makePhoneCall({
        phoneNumber: String(props.content.mobile)
    })
}

// #ifdef H5
// Dify Chatbot 相关功能
let heartbeatTimer: any = null
const HEARTBEAT_INTERVAL = 60000 // 60秒心跳间隔

/**
 * 生成或获取用户ID
 */
const getUserId = (): string => {
    let userId = uni.getStorageSync('opc_user_id')
    if (!userId) {
        // 如果用户已登录，使用用户ID；否则生成新的
        userId = userStore.isLogin ? String(userStore.userInfo.id || '') : generateUUID()
        uni.setStorageSync('opc_user_id', userId)
    }
    return userId
}

/**
 * 生成或获取会话ID
 */
const getConversationId = (): string => {
    let conversationId = uni.getStorageSync('opc_conversation_id')
    if (!conversationId) {
        conversationId = generateUUID()
        uni.setStorageSync('opc_conversation_id', conversationId)
    }
    return conversationId
}

/**
 * 生成UUID
 */
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

/**
 * 上报用户心跳
 */
const reportHeartbeat = async () => {
    try {
        // TODO: 根据实际API接口调整上报逻辑
        console.log('[Dify Chatbot] Heartbeat:', {
            user_id: getUserId(),
            conversation_id: getConversationId(),
            timestamp: Date.now()
        })
        
        // 这里可以调用后端API上报心跳
        // await reportUserHeartbeat({
        //     user_id: getUserId(),
        //     conversation_id: getConversationId()
        // })
    } catch (error) {
        console.error('[Dify Chatbot] Heartbeat error:', error)
    }
}

/**
 * 启动心跳上报
 */
const startHeartbeat = () => {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
    }
    heartbeatTimer = setInterval(reportHeartbeat, HEARTBEAT_INTERVAL)
    // 立即上报一次
    reportHeartbeat()
}

/**
 * 停止心跳上报
 */
const stopHeartbeat = () => {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
    }
}

/**
 * 动态加载 Dify Chatbot 脚本
 */
let difyLoaded = false
let difyReady = false
const loadDifyScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // 检查是否已经加载
        if (difyLoaded) {
            resolve()
            return
        }

        console.log('开始加载 Dify Chatbot...')

        // 创建配置脚本 - 必须在加载脚本之前设置
        const configScript = document.createElement('script')
        configScript.textContent = `
            window.difyChatbotConfig = {
                token: 'DOvk6D9nyaO5J06r',
                baseUrl: 'http://56uznsgemurp.xiaomiqiu.com',
                systemVariables: {
                    user_id: '',
                    conversation_id: '',
                },
                onReady: function() {
                    console.log('Dify Chatbot 已就绪')
                    window.__DIFY_READY__ = true
                },
                onOpen: function() {
                    console.log('Dify Chatbot 已打开')
                },
                onClose: function() {
                    console.log('Dify Chatbot 已关闭')
                }
            }
        `
        document.head.appendChild(configScript)

        // 创建加载脚本
        const loadScript = document.createElement('script')
        loadScript.src = 'http://56uznsgemurp.xiaomiqiu.com/embed.min.js'
        loadScript.id = 'DOvk6D9nyaO5J06r'
        loadScript.defer = true
        loadScript.onload = () => {
            console.log('Dify 脚本加载完成')
            difyLoaded = true
            
            // 等待 Dify 初始化
            setTimeout(() => {
                difyReady = true
                console.log('Dify 准备完成')
                resolve()
            }, 1000)
        }
        loadScript.onerror = (e) => {
            console.error('Dify 脚本加载失败:', e)
            reject(new Error('Dify 脚本加载失败'))
        }
        document.head.appendChild(loadScript)

        // 添加样式
        const style = document.createElement('style')
        style.textContent = `
            #dify-chatbot-bubble-button {
                background-color: #1C64F2 !important;
                z-index: 9999999 !important;
            }
            #dify-chatbot-bubble-window {
                width: 24rem !important;
                height: 40rem !important;
                z-index: 9999999 !important;
            }
        `
        document.head.appendChild(style)
    })
}

/**
 * 打开 Dify Chatbot
 */
let difyOpening = false  // 防止重复打开
const openDifyChatbot = async () => {
    // 防止重复点击
    if (difyOpening) {
        console.log('Dify 正在打开中，跳过')
        return
    }
    difyOpening = true
    
    // 检查是否登录
    if (!userStore.isLogin) {
        difyOpening = false
        uni.showModal({
            title: '提示',
            content: '请先注册/登录后再使用在线客服',
            confirmText: '去登录',
            cancelText: '取消',
            success: (res) => {
                if (res.confirm) {
                    uni.navigateTo({
                        url: '/pages/login/login'
                    })
                }
            }
        })
        return
    }
    
    uni.showLoading({ title: '客服加载中...' })
    
    try {
        await loadDifyScript()
        
        const userId = getUserId()
        const conversationId = getConversationId()
        
        if (typeof window !== 'undefined') {
            window.__OPC_USER_ID__ = userId
            window.__OPC_CONVERSATION_ID__ = conversationId
            
            if (window.difyChatbotConfig) {
                window.difyChatbotConfig.systemVariables = {
                    user_id: userId,
                    conversation_id: conversationId
                }
            }
        }
        
        uni.hideLoading()
        
        console.log('等待 Dify UI 创建...')
        
        // 轮询检查按钮是否存在，最多等待5秒
        let buttonFound = false
        const maxAttempts = 10
        const buttonSelectors = [
            '#dify-chatbot-bubble-button',
            '#dify-chatbot-bubble',
            '.dify-chatbot-bubble-button',
            '[class*="dify-chatbot-bubble"]'
        ]
        
        for (let i = 0; i < maxAttempts; i++) {
            for (const selector of buttonSelectors) {
                const btn = document.querySelector(selector)
                if (btn) {
                    console.log(`找到按钮: ${selector}，尝试打开 (${i+1}/${maxAttempts})`)
                    ;(btn as HTMLElement).click()
                    buttonFound = true
                    break
                }
            }
            
            if (buttonFound) {
                // 等待1秒让 Dify 响应
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // 检查窗口是否打开
                const chatWindow = document.querySelector('[class*="dify-chatbot-window"], [id*="dify-chatbot-window"]')
                if (chatWindow) {
                    console.log('✅ Dify 聊天窗口已打开')
                    difyOpening = false
                    return
                }
            }
            
            // 每次等待0.5秒
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // 检查是否有任何 Dify 相关元素
        const allDifyElements = document.querySelectorAll('[class*="dify"], [id*="dify"]')
        console.log(`页面中 Dify 相关元素数量: ${allDifyElements.length}`)
        
        if (allDifyElements.length > 0) {
            console.log('Dify 元素已存在但无法点击，尝试其他方式...')
            // 尝试点击找到的第一个元素
            const firstElement = allDifyElements[0] as HTMLElement
            firstElement.click()
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // 检查 window 对象
        console.log('检查 Dify 全局对象...')
        // @ts-ignore
        console.log('window.difyChatbot:', typeof window.difyChatbot)
        // @ts-ignore
        console.log('window.DifyChatbot:', typeof window.DifyChatbot)
        // @ts-ignore
        console.log('window.difyChatbotConfig:', typeof window.difyChatbotConfig)
        
        difyOpening = false
        uni.showToast({
            title: '请点击右下角客服图标',
            icon: 'none',
            duration: 3000
        })
        
    } catch (error) {
        difyOpening = false
        uni.hideLoading()
        uni.showToast({
            title: '客服加载失败',
            icon: 'none'
        })
        console.error('Dify Chatbot 加载失败:', error)
    }
}

// 页面显示时初始化
onShow(() => {
    // #ifdef H5
    // 初始化用户追踪
    const userId = getUserId()
    const conversationId = getConversationId()
    
    // 设置全局变量
    if (typeof window !== 'undefined') {
        window.__OPC_USER_ID__ = userId
        window.__OPC_CONVERSATION_ID__ = conversationId
    }
    
    // 启动心跳
    startHeartbeat()
    // #endif
})

// 组件卸载时清理
onUnmounted(() => {
    // #ifdef H5
    stopHeartbeat()
    // #endif
})
// #endif
</script>

<style lang="scss">
.dify-chatbot-trigger {
    transition: all 0.3s ease;
    
    &:active {
        opacity: 0.8;
        transform: scale(0.98);
    }
}
</style>
