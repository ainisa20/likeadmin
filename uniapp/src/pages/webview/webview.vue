<template>
    <web-view :src="url" />
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const url = ref('')

onLoad((options) => {
    url.value = decodeURIComponent(options.url!)
    nextTick(() => {
        const title = appStore.getWebsiteConfig?.shop_name || '商城'
        uni.setNavigationBarTitle({ title })
        uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#ffffff' })
    })
})
</script>

<style></style>
