<template>
    <div class="decoration-pc min-w-[1100px]">
        <el-card shadow="never" class="!border-none flex-1 flex">
            <div class="w-full">
                <div class="text-xl font-medium mb-5">首页装修</div>

                <router-link
                    :to="{
                        path: '/decoration/pc_details',
                        query: {
                            url: state.pc_url
                        }
                    }"
                >
                    <el-button class="mr-5" type="primary" size="large">去装修</el-button>
                </router-link>

                <el-form label-width="120px" class="mt-5">
                    <el-form-item label="最近更新">{{ state.update_time }}</el-form-item>
                    <el-form-item label="PC端链接">
                        <el-input style="width: 350px" v-model="state.pc_url" disabled></el-input>
                        <el-button type="primary" v-copy="state.pc_url" class="ml-2">复制</el-button>
                    </el-form-item>
                </el-form>

                <!-- Dify 配置 -->
                <el-divider class="my-5"></el-divider>

                <div class="mb-4">
                    <span class="text-lg font-medium">📦 Dify 聊天机器人配置</span>
                </div>

                <el-form
                    ref="difyFormRef"
                    :model="difyConfig"
                    label-width="120px"
                    class="max-w-2xl"
                >
                    <el-form-item label="启用状态">
                        <el-switch v-model="difyConfig.enabled" />
                        <span class="ml-2 text-gray-500 text-sm">开启后将在页面显示聊天机器人</span>
                    </el-form-item>

                    <el-form-item label="服务地址" required>
                        <el-input
                            v-model="difyConfig.baseUrl"
                            placeholder="例如: http://localhost 或 http://your-domain.com"
                            :disabled="!difyConfig.enabled"
                        />
                    </el-form-item>

                    <el-form-item label="Token" required>
                        <el-input
                            v-model="difyConfig.token"
                            placeholder="请输入 Dify 聊天机器人 Token"
                            :disabled="!difyConfig.enabled"
                        />
                    </el-form-item>

                    <el-form-item label="按钮颜色">
                        <el-color-picker v-model="difyConfig.buttonColor" :disabled="!difyConfig.enabled" />
                        <span class="ml-2 text-gray-500 text-sm">聊天按钮的背景颜色</span>
                    </el-form-item>

                    <el-form-item label="窗口宽度">
                        <el-input-number
                            v-model="difyConfig.windowWidth"
                            :min="10"
                            :max="50"
                            :disabled="!difyConfig.enabled"
                        />
                        <span class="ml-2 text-gray-500 text-sm">单位: rem (1rem ≈ 16px)</span>
                    </el-form-item>

                    <el-form-item label="窗口高度">
                        <el-input-number
                            v-model="difyConfig.windowHeight"
                            :min="20"
                            :max="80"
                            :disabled="!difyConfig.enabled"
                        />
                        <span class="ml-2 text-gray-500 text-sm">单位: rem (1rem ≈ 16px)</span>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="handleSaveDifyConfig" :loading="saving">
                            保存 Dify 配置
                        </el-button>
                        <el-button @click="handleReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script lang="ts" setup name="decorationPc">
import { getDecoratePc, saveDifyConfig } from '@/api/decoration'
import { onMounted, ref, watch } from 'vue'
import feedback from '@/utils/feedback'

const state = ref({
    update_time: '',
    pc_url: '',
    dify_config: {
        enabled: false,
        token: '',
        baseUrl: 'http://localhost',
        buttonColor: '#1C64F2',
        windowWidth: '24',
        windowHeight: '40',
    }
})

const difyConfig = ref({ ...state.value.dify_config })
const saving = ref(false)

const getData = async () => {
    try {
        const data = await getDecoratePc()
        state.value = data
        if (data.dify_config) {
            difyConfig.value = {
                ...data.dify_config,
                enabled: data.dify_config.enabled === true || data.dify_config.enabled === 'true' || data.dify_config.enabled === '1' || data.dify_config.enabled === 1,
                windowWidth: Number(data.dify_config.windowWidth || 24),
                windowHeight: Number(data.dify_config.windowHeight || 40)
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const handleSaveDifyConfig = async () => {
    // 验证
    if (!difyConfig.value.enabled) {
        // 如果未启用，直接保存
        await saveConfig()
        return
    }

    if (!difyConfig.value.baseUrl || !difyConfig.value.baseUrl.trim()) {
        feedback.msgError('请输入服务地址')
        return
    }

    if (!difyConfig.value.token || !difyConfig.value.token.trim()) {
        feedback.msgError('请输入 Token')
        return
    }

    await saveConfig()
}

const saveConfig = async () => {
    try {
        saving.value = true
        await saveDifyConfig(difyConfig.value)
        feedback.msgSuccess('保存成功')
        await getData()
    } catch (error) {
        console.log(error)
    } finally {
        saving.value = false
    }
}

const handleReset = () => {
    difyConfig.value = { ...state.value.dify_config }
}

getData()

// Dify 聊天机器人初始化
const initDifyChatbot = () => {
    if (!difyConfig.value.enabled) {
        return
    }

    if (!difyConfig.value.token || !difyConfig.value.baseUrl) {
        console.warn('Dify 配置不完整，跳过加载')
        return
    }

    // 配置 Dify Chatbot
    ;(window as any).difyChatbotConfig = {
        token: difyConfig.value.token,
        baseUrl: difyConfig.value.baseUrl,
        inputs: {},
        systemVariables: {},
        userVariables: {},
    }

    // 动态加载 Dify 脚本
    const scriptId = 'dify-chatbot-script'
    const existingScript = document.getElementById(scriptId)

    if (!existingScript) {
        const script = document.createElement('script')
        script.src = `${difyConfig.value.baseUrl}/embed.min.js`
        script.id = scriptId
        script.defer = true
        document.head.appendChild(script)
    }
}

// 动态注入样式
const updateDifyStyles = () => {
    const styleId = 'dify-custom-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.id = styleId
        document.head.appendChild(styleElement)
    }

    styleElement.innerHTML = `
        #dify-chatbot-bubble-button {
            background-color: ${difyConfig.value.buttonColor} !important;
        }
        #dify-chatbot-bubble-window {
            width: ${difyConfig.value.windowWidth}rem !important;
            height: ${difyConfig.value.windowHeight}rem !important;
        }
    `
}

// 监听配置变化，更新样式
watch(
    () => [difyConfig.value.buttonColor, difyConfig.value.windowWidth, difyConfig.value.windowHeight],
    () => {
        updateDifyStyles()
    },
    { deep: true }
)

onMounted(() => {
    // 初始化 Dify
    initDifyChatbot()
    // 更新样式
    updateDifyStyles()
})
</script>

<style scoped>
:deep(#dify-chatbot-bubble-button) {
    background-color: v-bind('difyConfig.buttonColor') !important;
}

:deep(#dify-chatbot-bubble-window) {
    width: v-bind('difyConfig.windowWidth + "rem"') !important;
    height: v-bind('difyConfig.windowHeight + "rem"') !important;
}
</style>
