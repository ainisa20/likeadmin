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
        <!-- Dify 聊天组件（替换原有的 iframe 方案） -->
        <DifyChat v-if="content.dify_url && content.dify_token" :content="content" />
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
// #ifdef H5
import DifyChat from '@/components/DifyChat/index.vue'
// #endif

import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'

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
</script>

<style lang="scss">
</style>
