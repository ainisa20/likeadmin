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

                <!-- PC端主题配置 -->
                <el-divider class="my-5"></el-divider>

                <div class="mb-4">
                    <span class="text-lg font-medium">🎨 PC端主题配置</span>
                    <span class="ml-3 text-sm text-gray-500">修改后刷新PC端页面即可生效</span>
                </div>

                <el-form
                    ref="themeFormRef"
                    :model="themeConfig"
                    label-width="140px"
                    class="max-w-3xl"
                >
                    <el-form-item label="主题模式">
                        <el-radio-group v-model="themeConfig.mode" @change="handleThemeModeChange">
                            <el-radio value="preset">预设主题</el-radio>
                            <el-radio value="custom">自定义颜色</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <!-- 预设主题选择 -->
                    <template v-if="themeConfig.mode === 'preset'">
                        <el-form-item label-width="0">
                            <div class="grid grid-cols-5 gap-4">
                                <div
                                    v-for="theme in presetThemes"
                                    :key="theme.id"
                                    @click="selectPresetTheme(theme)"
                                    class="cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md"
                                    :class="themeConfig.presetId === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'"
                                >
                                    <div class="text-sm font-medium mb-2 text-center">{{ theme.name }}</div>
                                    <div class="flex gap-1 justify-center">
                                        <div class="w-6 h-6 rounded-full" :style="{ background: theme.primary }"></div>
                                        <div class="w-6 h-6 rounded-full" :style="{ background: theme.minor }"></div>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                    </template>

                    <!-- 自定义颜色 -->
                    <template v-if="themeConfig.mode === 'custom'">
                        <el-form-item label="主题色">
                            <div class="flex items-center gap-3">
                                <el-color-picker v-model="themeConfig.primaryColor" show-alpha />
                                <span class="text-sm text-gray-500">主要按钮、链接颜色</span>
                                <el-tag size="small" effect="plain">{{ themeConfig.primaryColor }}</el-tag>
                            </div>
                        </el-form-item>

                        <el-form-item label="次要色">
                            <div class="flex items-center gap-3">
                                <el-color-picker v-model="themeConfig.minorColor" show-alpha />
                                <span class="text-sm text-gray-500">渐变色、悬停效果</span>
                                <el-tag size="small" effect="plain">{{ themeConfig.minorColor }}</el-tag>
                            </div>
                        </el-form-item>

                        <el-form-item label="页面背景">
                            <div class="flex items-center gap-3">
                                <el-color-picker v-model="themeConfig.pageBgColor" />
                                <span class="text-sm text-gray-500">整体页面背景</span>
                            </div>
                        </el-form-item>

                        <el-form-item label="Header背景">
                            <div class="flex items-center gap-3">
                                <el-color-picker v-model="themeConfig.headerBgColor" />
                                <span class="text-sm text-gray-500">顶部导航背景</span>
                            </div>
                        </el-form-item>

                        <el-form-item label="Header文字">
                            <el-radio-group v-model="themeConfig.headerTextColor">
                                <el-radio value="white">白色</el-radio>
                                <el-radio value="black">黑色</el-radio>
                            </el-radio-group>
                        </el-form-item>

                        <el-form-item label="圆角风格">
                            <div class="flex items-center gap-3">
                                <el-slider v-model="themeConfig.borderRadius" :min="0" :max="16" style="width: 200px" />
                                <span class="text-sm text-gray-500">{{ themeConfig.borderRadius }}px</span>
                            </div>
                        </el-form-item>

                        <el-form-item label="Footer风格">
                            <el-radio-group v-model="themeConfig.footerStyle">
                                <el-radio value="theme">主题色</el-radio>
                                <el-radio value="dark">深色</el-radio>
                                <el-radio value="gray">浅灰（推荐）</el-radio>
                                <el-radio value="white">纯白</el-radio>
                            </el-radio-group>
                            <div class="text-sm text-gray-500 mt-1">
                                <span v-if="themeConfig.footerStyle === 'theme'">使用主题色的柔和版本</span>
                                <span v-if="themeConfig.footerStyle === 'dark'">深色背景+白色文字，稳重专业</span>
                                <span v-if="themeConfig.footerStyle === 'gray'">浅灰背景+深色文字，简洁清爽（默认）</span>
                                <span v-if="themeConfig.footerStyle === 'white'">纯白背景+深色文字，极简现代</span>
                            </div>
                        </el-form-item>
                    </template>

                    <!-- 实时预览 -->
                    <el-form-item label="效果预览">
                        <div class="border rounded-lg overflow-hidden" style="width: 400px">
                            <!-- Header预览 -->
                            <div class="px-4 py-3 flex items-center justify-between" :style="{ background: themeConfig.headerBgColor, color: themeConfig.headerTextColor === 'white' ? '#fff' : '#000' }">
                                <span class="font-medium">Logo</span>
                                <div class="flex gap-4 text-sm">
                                    <span>首页</span>
                                    <span>资讯</span>
                                    <span>关于</span>
                                </div>
                                <span>用户</span>
                            </div>
                            <!-- 内容预览 -->
                            <div class="p-4" :style="{ background: themeConfig.pageBgColor }">
                                <div class="mb-3 p-3 bg-white rounded" :style="{ borderRadius: themeConfig.borderRadius + 'px' }">
                                    <div class="text-sm text-gray-500 mb-2">内容卡片示例</div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-3 h-3 rounded-full" :style="{ background: themeConfig.primaryColor }"></div>
                                        <div class="w-3 h-3 rounded-full" :style="{ background: themeConfig.minorColor }"></div>
                                    </div>
                                </div>
                                <button
                                    class="w-full py-2 rounded text-white text-sm"
                                    :style="{
                                        background: `linear-gradient(to right, ${themeConfig.primaryColor}, ${themeConfig.minorColor})`,
                                        borderRadius: themeConfig.borderRadius + 'px'
                                    }"
                                >
                                    主要按钮
                                </button>
                            </div>
                            <!-- Footer预览 -->
                            <div class="px-4 py-3 text-center text-xs" :style="getFooterPreviewStyle()">
                                <span class="mx-2">用户协议</span>
                                <span class="mx-2">|</span>
                                <span class="mx-2">隐私政策</span>
                                <span class="mx-2">|</span>
                                <span class="mx-2">会员中心</span>
                            </div>
                        </div>
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="handleSaveThemeConfig" :loading="themeSaving">
                            保存主题配置
                        </el-button>
                        <el-button @click="handleResetTheme">重置</el-button>
                    </el-form-item>
                </el-form>

                <!-- Dify 配置 -->
                <el-divider class="my-5"></el-divider>

                <div class="mb-4">
                    <span class="text-lg font-medium">📦 Dify 聊天机器人配置</span>
                    <div class="mt-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <div class="flex items-start">
                            <svg class="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                            </svg>
                            <div>
                                <div class="font-medium text-blue-800 mb-1">统一配置入口</div>
                                <div class="text-blue-700">
                                    此配置同时应用于 <span class="font-semibold">PC端</span> 和 <span class="font-semibold">移动端（H5/小程序）</span>。
                                    无需在其他地方重复配置，所有终端将自动使用此处的设置。
                                </div>
                            </div>
                        </div>
                    </div>
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

                    <el-divider class="my-4"></el-divider>

                    <!-- 对话开场白 -->
                    <el-form-item label="对话开场白">
                        <el-switch v-model="difyConfig.welcomeEnabled" />
                        <span class="ml-2 text-gray-500 text-sm">开启后用户打开聊天窗口时显示</span>
                    </el-form-item>

                    <el-form-item v-if="difyConfig.welcomeEnabled">
                        <el-input
                            v-model="difyConfig.welcomeText"
                            type="textarea"
                            :rows="3"
                            placeholder="请输入开场白内容，例如：您好！我是智能客服，有什么可以帮您的吗？"
                            :disabled="!difyConfig.enabled"
                            maxlength="200"
                            show-word-limit
                        />
                        <div class="text-xs text-gray-400 mt-1">建议控制在 50 字以内，显示效果更佳</div>
                    </el-form-item>

                    <!-- 推荐提问 -->
                    <el-form-item label="推荐提问">
                        <el-switch v-model="difyConfig.suggestionsEnabled" />
                        <span class="ml-2 text-gray-500 text-sm">开启后显示 3-5 个推荐问题</span>
                    </el-form-item>

                    <template v-if="difyConfig.suggestionsEnabled">
                        <el-form-item
                            v-for="(suggestion, index) in difyConfig.suggestions"
                            :key="index"
                            :label="`问题 ${index + 1}`"
                        >
                            <div class="flex gap-2 w-full">
                                <el-input
                                    v-model="difyConfig.suggestions[index]"
                                    :placeholder="`推荐问题 ${index + 1}`"
                                    :disabled="!difyConfig.enabled"
                                    maxlength="50"
                                    show-word-limit
                                />
                                <el-button
                                    v-if="difyConfig.suggestions.length > 3"
                                    type="danger"
                                    :icon="Delete"
                                    circle
                                    @click="removeSuggestion(index)"
                                    :disabled="!difyConfig.enabled"
                                />
                            </div>
                        </el-form-item>

                        <el-form-item v-if="difyConfig.suggestions.length < 5">
                            <el-button
                                type="primary"
                                :icon="Plus"
                                @click="addSuggestion"
                                :disabled="!difyConfig.enabled"
                            >
                                添加推荐问题
                            </el-button>
                            <span class="ml-2 text-gray-500 text-sm">最多可添加 5 个问题</span>
                        </el-form-item>
                    </template>

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
import { Delete, Plus } from '@element-plus/icons-vue'

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
        welcomeEnabled: false,
        welcomeText: '',
        suggestionsEnabled: false,
        suggestions: ['', '', '']
    },
    theme_config: {
        mode: 'preset',
        presetId: 1,
        primaryColor: '#4153ff',
        minorColor: '#7583ff',
        pageBgColor: '#f7f7f7',
        headerBgColor: '#4153ff',
        headerTextColor: 'white',
        borderRadius: 8,
        footerStyle: 'gray',
    }
})

const difyConfig = ref({ ...state.value.dify_config })
const saving = ref(false)

// 主题配置
const themeConfig = ref({ ...state.value.theme_config })
const themeSaving = ref(false)

// 预设主题
const presetThemes = ref([
    { id: 1, name: '科技蓝', primary: '#4153ff', minor: '#7583ff' },
    { id: 2, name: '翡翠绿', primary: '#10b981', minor: '#34d399' },
    { id: 3, name: '高贵紫', primary: '#8b5cf6', minor: '#a78bfa' },
    { id: 4, name: '活力橙', primary: '#f59e0b', minor: '#fbbf24' },
    { id: 5, name: '经典红', primary: '#ef4444', minor: '#f87171' },
])

const getData = async () => {
    try {
        const data = await getDecoratePc()
        state.value = data
        
        // 加载 Dify 配置
        if (data.dify_config) {
            difyConfig.value = {
                ...data.dify_config,
                enabled: data.dify_config.enabled === true || data.dify_config.enabled === 'true' || data.dify_config.enabled === '1' || data.dify_config.enabled === 1,
                windowWidth: Number(data.dify_config.windowWidth || 24),
                windowHeight: Number(data.dify_config.windowHeight || 40),
                welcomeEnabled: data.dify_config.welcomeEnabled === true || data.dify_config.welcomeEnabled === 'true' || data.dify_config.welcomeEnabled === 1,
                welcomeText: data.dify_config.welcomeText || '',
                suggestionsEnabled: data.dify_config.suggestionsEnabled === true || data.dify_config.suggestionsEnabled === 'true' || data.dify_config.suggestionsEnabled === 1,
                suggestions: data.dify_config.suggestions && Array.isArray(data.dify_config.suggestions) 
                    ? data.dify_config.suggestions 
                    : ['', '', '']
            }
        }
        
        // 加载主题配置
        if (data.theme_config) {
            themeConfig.value = {
                ...state.value.theme_config,
                ...data.theme_config
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// 选择预设主题
const selectPresetTheme = (theme: any) => {
    themeConfig.value.presetId = theme.id
    themeConfig.value.primaryColor = theme.primary
    themeConfig.value.minorColor = theme.minor
    themeConfig.value.headerBgColor = theme.primary
    themeConfig.value.footerStyle = 'gray'  // 预设主题默认使用浅灰色Footer
}

// 主题模式切换
const handleThemeModeChange = (mode: string) => {
    if (mode === 'preset') {
        // 切换到预设模式，应用当前选中的预设
        const theme = presetThemes.value.find(t => t.id === themeConfig.value.presetId)
        if (theme) {
            selectPresetTheme(theme)
        }
    } else if (mode === 'custom') {
        // 切换到自定义模式，设置默认Footer风格为浅灰
        themeConfig.value.footerStyle = 'gray'
    }
}

// 保存主题配置
const handleSaveThemeConfig = async () => {
    try {
        themeSaving.value = true

        // 组装保存数据 - 只发送主题配置，不影响Dify配置
        const saveData = {
            theme_config: themeConfig.value
        }

        await saveDifyConfig(saveData)
        feedback.msgSuccess('主题配置保存成功，刷新PC端页面即可生效')
        await getData()
    } catch (error) {
        console.log(error)
        feedback.msgError('保存失败')
    } finally {
        themeSaving.value = false
    }
}

// 重置主题配置
const handleResetTheme = () => {
    themeConfig.value = { ...state.value.theme_config }
}

// 获取Footer预览样式
const getFooterPreviewStyle = () => {
    const style: any = {
        padding: '12px',
        borderTop: '1px solid rgba(0,0,0,0.1)'
    }
    
    switch (themeConfig.value.footerStyle) {
        case 'theme':
            style.background = lightenColor(themeConfig.value.primaryColor, 40)
            style.color = '#ffffff'
            break
        case 'dark':
            style.background = '#1a1a1a'
            style.color = '#e0e0e0'
            break
        case 'gray':
            style.background = '#fafafa'
            style.color = '#666666'
            break
        case 'white':
            style.background = '#ffffff'
            style.color = '#333333'
            style.borderTop = '1px solid #e0e0e0'
            break
    }
    
    return style
}

// 辅助函数：提亮颜色
const lightenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '')
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) * (100 + percent) / 100)
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) * (100 + percent) / 100)
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) * (100 + percent) / 100)
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
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

        // 只发送 Dify 配置，不影响主题配置
        const saveData = {
            dify_config: difyConfig.value
        }

        await saveDifyConfig(saveData)
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

// 添加推荐问题
const addSuggestion = () => {
    if (difyConfig.value.suggestions.length >= 5) {
        feedback.msgError('最多只能添加 5 个推荐问题')
        return
    }
    difyConfig.value.suggestions.push('')
}

// 删除推荐问题
const removeSuggestion = (index: number) => {
    if (difyConfig.value.suggestions.length <= 3) {
        feedback.msgError('至少需要保留 3 个推荐问题')
        return
    }
    difyConfig.value.suggestions.splice(index, 1)
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
