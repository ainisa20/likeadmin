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
import { computed, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// #ifdef H5
declare global {
    interface Window {
        __OPC_USER_ID__?: string
        __OPC_CONVERSATION_ID__?: string
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
// Dify Chatbot 相关配置
let difyIframeOpen = false

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
 * 打开 Dify Chatbot - 使用 iframe 嵌入方式
 */
const openDifyChatbot = () => {
    // 防止重复点击
    if (difyIframeOpen) {
        return
    }

    // 从装修数据中获取配置
    const difyUrl = props.content.dify_url || ''
    const difyToken = props.content.dify_token || ''

    // 检查是否配置了 Dify
    if (!difyUrl || !difyToken) {
        uni.showToast({
            title: '在线客服配置错误',
            icon: 'none'
        })
        return
    }

    // 检查是否登录
    if (!userStore.isLogin) {
        uni.showModal({
            title: '提示',
            content: '请先注册/登录后再使用在线客服',
            confirmText: '去登录',
            success: (res) => {
                if (res.confirm) {
                    uni.navigateTo({ url: '/pages/login/login' })
                }
            }
        })
        return
    }

    difyIframeOpen = true

    const userId = getUserId()
    const conversationId = getConversationId()

    // 使用 iframe 方式嵌入，从装修数据中获取 URL 和 token
    const iframeUrl = `${difyUrl}/chatbot/${difyToken}?user_id=${userId}&conversation_id=${conversationId}`
    
    // 创建 iframe
    const iframe = document.createElement('iframe')
    iframe.src = iframeUrl
    iframe.id = 'dify-chatbot-iframe'
    iframe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999999;
        border: none;
        background: white;
    `
    
    // 添加关闭按钮
    const closeBtn = document.createElement('div')
    closeBtn.innerHTML = '✕'
    closeBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: #333;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 10000000;
        cursor: pointer;
    `
    
    const cleanup = () => {
        iframe.remove()
        closeBtn.remove()
        difyIframeOpen = false
    }
    
    closeBtn.onclick = cleanup
    
    document.body.appendChild(iframe)
    document.body.appendChild(closeBtn)
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
    // #endif
})

// 组件卸载时清理
onUnmounted(() => {
    // #ifdef H5
    // 清理可能残留的 iframe
    const existingIframe = document.getElementById('dify-chatbot-iframe')
    if (existingIframe) {
        existingIframe.remove()
    }
    const existingCloseBtn = document.querySelector('[style*="z-index: 10000000"]')
    if (existingCloseBtn) {
        existingCloseBtn.remove()
    }
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
