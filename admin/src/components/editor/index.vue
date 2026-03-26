<template>
    <div class="border border-br flex flex-col" :style="styles">
        <div class="border-b border-br bg-gray-50 px-3 py-2 flex items-center gap-2">
            <el-button size="small" type="primary" @click="showMarkdownDialog = true">
                <el-icon class="mr-1"><Document /></el-icon>
                粘贴Markdown
            </el-button>
            <span class="text-xs text-tx-secondary">支持将Markdown内容转换为HTML</span>
        </div>
        <toolbar
            class="border-b border-br"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
        />
        <w-editor
            class="flex-1 overflow-hidden"
            v-model="valueHtml"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
        />
        <material-picker
            ref="materialPickerRef"
            :type="fileType"
            :limit="-1"
            hidden-upload
            @change="selectChange"
        />

        <!-- Markdown粘贴对话框 -->
        <el-dialog
            v-model="showMarkdownDialog"
            title="粘贴Markdown内容"
            width="800px"
            :close-on-click-modal="false"
        >
            <el-alert
                title="使用说明"
                type="info"
                :closable="false"
                class="mb-3"
            >
                <p>1. 将Markdown内容粘贴到下方文本框</p>
                <p>2. 点击"转换为HTML"按钮</p>
                <p>3. 内容将自动插入到编辑器中</p>
                <p class="mt-2 text-xs text-tx-secondary">支持：标题、加粗、斜体、列表、链接、图片、代码块等标准Markdown语法</p>
            </el-alert>

            <el-input
                v-model="markdownText"
                type="textarea"
                :rows="15"
                placeholder="在此粘贴Markdown内容...

示例：
## 二级标题
**加粗文本** 和 *斜体文本*

- 列表项1
- 列表项2

1. 有序列表1
2. 有序列表2

[链接文字](https://example.com)

```javascript
console.log('代码块');
```"
            />

            <template #footer>
                <div class="flex justify-between">
                    <el-button @click="clearMarkdown">清空</el-button>
                    <div class="flex gap-2">
                        <el-button @click="showMarkdownDialog = false">取消</el-button>
                        <el-button type="primary" @click="convertMarkdown" :loading="converting">
                            <el-icon class="mr-1"><Check /></el-icon>
                            转换为HTML
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import type { IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { Editor as WEditor, Toolbar } from '@wangeditor/editor-for-vue'
import type { CSSProperties } from 'vue'
import { Document, Check } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'

import MaterialPicker from '@/components/material/picker.vue'
import { addUnit } from '@/utils/util'

// 配置marked选项
marked.setOptions({
    breaks: true, // 支持GitHub风格的换行（单个换行符转为<br>）
    gfm: true, // 启用GitHub Flavored Markdown
})

const props = withDefaults(
    defineProps<{
        modelValue?: string
        mode?: 'default' | 'simple'
        height?: string | number
        width?: string | number
        toolbarConfig?: Partial<IToolbarConfig>
    }>(),
    {
        modelValue: '',
        mode: 'default',
        height: '100%',
        width: 'auto',
        toolbarConfig: () => ({})
    }
)

const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
}>()

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const materialPickerRef = shallowRef<InstanceType<typeof MaterialPicker>>()
const fileType = ref('')

// Markdown对话框相关
const showMarkdownDialog = ref(false)
const markdownText = ref('')
const converting = ref(false)

let insertFn: any

const editorConfig: Partial<IEditorConfig> = {
    MENU_CONF: {
        uploadImage: {
            customBrowseAndUpload(insert: any) {
                fileType.value = 'image'
                materialPickerRef.value?.showPopup(-1)
                insertFn = insert
            }
        },
        uploadVideo: {
            customBrowseAndUpload(insert: any) {
                fileType.value = 'video'
                materialPickerRef.value?.showPopup(-1)
                insertFn = insert
            }
        }
    }
}

const styles = computed<CSSProperties>(() => ({
    height: addUnit(props.height),
    width: addUnit(props.width)
}))
const valueHtml = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

const selectChange = (fileUrl: string[]) => {
    fileUrl.forEach((url) => {
        insertFn(url)
    })
}

/**
 * 预处理Markdown文本，处理常见的转义问题
 */
const preprocessMarkdown = (text: string): string => {
    // 处理字面的 \n 为真正的换行符
    let processed = text.replace(/\\n/g, '\n')

    // 处理字面的 \r\n 为真正的换行符
    processed = processed.replace(/\\r\\n/g, '\n')

    // 处理字制的 \t 为制表符
    processed = processed.replace(/\\t/g, '\t')

    // 处理其他可能的转义序列
    processed = processed.replace(/\\"/g, '"')
    processed = processed.replace(/\\\\/g, '\\')

    return processed
}

/**
 * 转换Markdown为HTML并插入到编辑器
 */
const convertMarkdown = async () => {
    if (!markdownText.value.trim()) {
        ElMessage.warning('请输入Markdown内容')
        return
    }

    converting.value = true

    try {
        // 检查编辑器是否已初始化
        if (!editorRef.value) {
            ElMessage.error('编辑器未初始化，请稍后重试')
            return
        }

        // 预处理Markdown文本，处理转义字符
        const processedText = preprocessMarkdown(markdownText.value)

        // 使用marked将预处理后的Markdown转换为HTML
        const html = await marked(processedText)

        // 获取编辑器当前内容
        const currentHtml = editorRef.value.getHtml()

        // 将转换后的HTML插入到编辑器
        // 如果编辑器有内容，在末尾追加；如果没有，直接设置
        if (currentHtml && currentHtml !== '<p><br></p>') {
            // 追加内容：在当前HTML后面添加一个空段落和新内容
            const separator = '<p><br></p>' // 空段落作为分隔
            const newHtml = currentHtml + separator + html
            editorRef.value.setHtml(newHtml)
        } else {
            // 直接设置内容
            editorRef.value.setHtml(html)
        }

        // 关闭对话框并清空输入
        showMarkdownDialog.value = false
        markdownText.value = ''
        ElMessage.success('Markdown内容已成功转换为HTML')
    } catch (error: any) {
        console.error('Markdown转换失败:', error)
        ElMessage.error('转换失败：' + (error.message || '未知错误'))
    } finally {
        converting.value = false
    }
}

/**
 * 清空Markdown输入框
 */
const clearMarkdown = () => {
    markdownText.value = ''
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}
</script>

<style lang="scss">
.w-e-full-screen-container {
    z-index: 999;
}
.w-e-text-container [data-slate-editor] ul {
    list-style: disc;
}
.w-e-text-container [data-slate-editor] ol {
    list-style: decimal;
}
h1 {
    font-size: 2em;
}
h2 {
    font-size: 1.5em;
}
h3 {
    font-size: 1.17em;
}
h4 {
    font-size: 1em;
}
h5 {
    font-size: 0.83em;
}
h1,
h2,
h3,
h4,
h5 {
    font-weight: bold;
}

// Markdown对话框样式
:deep(.el-dialog__body) {
    padding-top: 10px;
}

:deep(.el-textarea__inner) {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.6;
}
</style>
