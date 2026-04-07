<template>
    <div>
        <el-form label-width="90px" size="large" label-position="top">
            <el-card shadow="never" class="!border-none flex mt-2">
                <el-form-item label="平台名称">
                    <el-input
                        class="w-[400px]"
                        show-word-limit
                        maxlength="20"
                        v-model="contentData.title"
                    />
                </el-form-item>

                <el-form-item label="客服二维码">
                    <div>
                        <material-picker v-model="contentData.qrcode" exclude-domain />
                    </div>
                </el-form-item>

                <el-form-item label="备注">
                    <el-input
                        class="w-[400px]"
                        show-word-limit
                        maxlength="20"
                        v-model="contentData.remark"
                    />
                </el-form-item>
                <el-form-item label="联系电话">
                    <el-input class="w-[400px]" v-model="contentData.mobile" />
                </el-form-item>
                <el-form-item label="服务时间">
                    <el-input
                        class="w-[400px]"
                        show-word-limit
                        maxlength="20"
                        v-model="contentData.time"
                    />
                </el-form-item>
            </el-card>

            <el-card shadow="never" class="!border-none flex mt-2">
                <template #header>
                    <div class="font-bold text-base">在线客服配置（Dify Chatbot）</div>
                </template>

                <el-form-item label="Dify URL">
                    <el-input
                        class="w-[400px]"
                        placeholder="例如: http://localhost"
                        v-model="contentData.dify_url"
                    />
                    <div class="text-xs text-gray-400 mt-1">
                        请输入 Dify 服务地址，不包含 /chatbot/xxx 部分
                    </div>
                </el-form-item>

                <el-form-item label="Dify Token">
                    <el-input
                        class="w-[400px]"
                        placeholder="例如: DOvk6D9nyaO5J06r"
                        v-model="contentData.dify_token"
                    />
                    <div class="text-xs text-gray-400 mt-1">
                        请输入 Dify 机器人 Token
                    </div>
                </el-form-item>
            </el-card>
        </el-form>
    </div>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue'

import type options from './options'

type OptionsType = ReturnType<typeof options>
const emits = defineEmits<(event: 'update:content', data: OptionsType['content']) => void>()
const props = defineProps({
    content: {
        type: Object as PropType<OptionsType['content']>,
        default: () => ({})
    },
    styles: {
        type: Object as PropType<OptionsType['styles']>,
        default: () => ({})
    }
})
const contentData = computed({
    get: () => props.content,
    set: (newValue) => {
        emits('update:content', newValue)
    }
})
</script>

<style lang="scss" scoped></style>
