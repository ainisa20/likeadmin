<template>
    <div class="page-json-editor min-w-[1100px]">
        <el-card shadow="never" class="!border-none !rounded-none !bg-primary">
            <div class="flex justify-between w-full">
                <div class="flex items-center gap-4">
                    <el-button link type="primary" :icon="ArrowLeft" style="color: #fff" @click="handleBack">
                        返回
                    </el-button>
                    <span class="text-white font-medium">{{ pageName }}</span>
                    <el-tag size="small" type="success">id={{ pageId }}</el-tag>
                </div>
                <div class="flex gap-2">
                    <el-button @click="handleFormat" :icon="MagicStick">格式化</el-button>
                    <el-button @click="handleReset" :icon="RefreshLeft">重置</el-button>
                    <el-button @click="openPreview" :icon="View">新窗口预览</el-button>
                    <el-button v-perms="['decorate:pages:save']" type="primary" @click="handleSave" :loading="saving">
                        保存
                    </el-button>
                </div>
            </div>
        </el-card>

        <div class="editor-body">
            <div class="editor-left">
                <div class="editor-header">
                    <span class="font-medium text-white">页面数据 (JSON)</span>
                    <el-tag v-if="isValid" type="success" size="small">格式正确</el-tag>
                    <el-tag v-else type="danger" size="small">格式错误</el-tag>
                </div>
                <el-input
                    v-model="jsonText"
                    type="textarea"
                    :rows="30"
                    placeholder="请输入 JSON 格式的页面数据..."
                    class="json-editor"
                    @input="handleInput"
                />
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>
            </div>

            <div class="editor-right">
                <div class="editor-header">
                    <span class="font-medium">实时预览</span>
                    <el-button size="small" @click="refreshPreview" :icon="RefreshLeft">刷新</el-button>
                    <el-button size="small" @click="openPreview" :icon="View">新窗口</el-button>
                </div>
                <div class="preview-frame-wrapper">
                    <iframe
                        ref="previewFrame"
                        :src="previewUrl"
                        class="preview-frame"
                        frameborder="0"
                    ></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup name="decorationPcJson">
import { ArrowLeft, MagicStick, RefreshLeft, Monitor, View } from '@element-plus/icons-vue'
import { getDecoratePages, setDecoratePages } from '@/api/decoration'
import feedback from '@/utils/feedback'

const route = useRoute()
const router = useRouter()

const pageId = Number(route.query.id) || 4
const pageName = (route.query.name as string) || '页面装修'
const saving = ref(false)
const jsonText = ref('')
const isValid = ref(true)
const errorMessage = ref('')
const previewBaseUrl = ref('')
const originalData = ref('')
const previewFrame = ref<HTMLIFrameElement>()

const pathMap: Record<number, string> = { 4: '', 6: '/services', 7: '/cases', 8: '/about' }
const previewUrl = ref('about:blank')

const buildPreviewUrl = () => {
    const path = pathMap[pageId] || ''
    return `/pc${path}?t=${Date.now()}`
}

const initPreviewUrl = () => {
    previewUrl.value = buildPreviewUrl()
    // openPreview 用完整 URL，从后端 config 获取 domain
    fetch('/api/pc/config')
        .then(r => r.json())
        .then(json => {
            let domain = json?.data?.domain || ''
            if (domain.endsWith('/')) domain = domain.slice(0, -1)
            previewBaseUrl.value = domain
        })
        .catch(() => {})
}

const refreshPreview = () => {
    if (previewFrame.value) {
        previewFrame.value.src = buildPreviewUrl()
    }
}

const loadData = async () => {
    try {
        const data = await getDecoratePages({ id: String(pageId) })
        if (data?.data) {
            const parsed = JSON.parse(data.data)
            jsonText.value = JSON.stringify(parsed, null, 2)
            originalData.value = jsonText.value
        }
    } catch (error: any) {
        console.error('Failed to load page data:', error)
    }
}

const handleInput = () => {
    try {
        JSON.parse(jsonText.value)
        isValid.value = true
        errorMessage.value = ''
    } catch (error: any) {
        isValid.value = false
        errorMessage.value = `JSON 格式错误: ${error.message}`
    }
}

const handleFormat = () => {
    try {
        const parsed = JSON.parse(jsonText.value)
        jsonText.value = JSON.stringify(parsed, null, 2)
        isValid.value = true
        errorMessage.value = ''
    } catch (error: any) {
        feedback.msgError('JSON 格式错误，无法格式化')
    }
}

const handleReset = () => {
    jsonText.value = originalData.value
    isValid.value = true
    errorMessage.value = ''
    feedback.msgInfo('已重置为原始数据')
}

const handleSave = async () => {
    if (!isValid.value) {
        feedback.msgError('JSON 格式错误，无法保存')
        return
    }

    try {
        saving.value = true
        const parsed = JSON.parse(jsonText.value)
        const compactData = JSON.stringify(parsed)

        await setDecoratePages({
            id: pageId,
            type: pageId,
            data: compactData
        })

        originalData.value = jsonText.value
        feedback.msgSuccess('保存成功')
        refreshPreview()
    } catch (error: any) {
        feedback.msgError('保存失败: ' + error.message)
    } finally {
        saving.value = false
    }
}

const openPreview = () => {
    const pathMap: Record<number, string> = { 4: '', 6: '/services', 7: '/cases', 8: '/about' }
    const path = pathMap[pageId] || ''
    window.open(`/pc${path}?t=${Date.now()}`, '_blank')
}

const handleBack = async () => {
    if (jsonText.value !== originalData.value) {
        await feedback.confirm('有未保存的更改，确定离开吗？')
    }
    router.back()
}

onMounted(() => {
    loadData()
    initPreviewUrl()
})
</script>

<style lang="scss" scoped>
.page-json-editor {
    min-height: calc(100vh);
    @apply flex flex-col;
}

.editor-body {
    @apply flex flex-1;
    height: calc(100vh - 52px);
}

.editor-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: #1e1e1e;
    border-right: 1px solid #333;
}

.editor-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: #f5f7fa;
}

.editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 8px 12px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
}

.editor-right .editor-header {
    color: #303133;
}

.json-editor {
    flex: 1;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
}

.json-editor :deep(.el-textarea__inner) {
    background: #1e1e1e;
    color: #d4d4d4;
    border: none;
    font-family: inherit;
    resize: none;
}

.error-message {
    margin-top: 8px;
    padding: 8px 12px;
    background: rgba(245, 108, 108, 0.1);
    border: 1px solid rgba(245, 108, 108, 0.3);
    border-radius: 4px;
    color: #f56c6c;
    font-size: 12px;
}

.preview-frame-wrapper {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    overflow: hidden;
}

.preview-frame {
    width: 100%;
    height: 100%;
    border: none;
}
</style>
