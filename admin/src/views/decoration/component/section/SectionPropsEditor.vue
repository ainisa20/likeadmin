<template>
    <div class="section-props-editor" v-if="section">
        <!-- 根据组件类型渲染不同的编辑表单 -->
        
        <!-- hero-banner -->
        <template v-if="section.type === 'hero-banner'">
            <el-form label-width="90px">
                <el-form-item label="主标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="副标题"><el-input v-model="section.props.subheading" /></el-form-item>
                <el-form-item label="背景色"><el-color-picker v-model="section.props.backgroundColor" show-alpha /></el-form-item>
                <el-form-item label="文字颜色"><el-color-picker v-model="section.props.textColor" show-alpha /></el-form-item>
                <el-form-item label="文字对齐">
                    <el-radio-group v-model="section.props.textAlign">
                        <el-radio value="left">左对齐</el-radio>
                        <el-radio value="center">居中</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="高度"><el-input v-model="section.props.height" placeholder="420px" /></el-form-item>
                <el-form-item label="按钮文字"><el-input v-model="section.props.ctaText" /></el-form-item>
                <el-form-item label="按钮链接"><el-input v-model="section.props.ctaLink" /></el-form-item>
                <el-form-item label="按钮样式">
                    <el-radio-group v-model="section.props.ctaStyle">
                        <el-radio value="primary">填充</el-radio>
                        <el-radio value="outline">描边</el-radio>
                        <el-radio value="link">链接</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </template>

        <!-- feature-grid -->
        <template v-if="section.type === 'feature-grid'">
            <el-form label-width="90px">
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="副标题"><el-input v-model="section.props.subheading" /></el-form-item>
                <el-form-item label="列数">
                    <el-radio-group v-model="section.props.columns">
                        <el-radio :value="2">2列</el-radio>
                        <el-radio :value="3">3列</el-radio>
                        <el-radio :value="4">4列</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-divider>特性列表</el-divider>
                <div v-for="(item, i) in section.props.items" :key="i" class="list-item-editor">
                    <div class="flex gap-2 items-center">
                        <el-input v-model="item.icon" placeholder="emoji" style="width:70px" />
                        <el-input v-model="item.title" placeholder="标题" />
                        <el-button v-if="section.props.items.length > 1" :icon="Delete" circle size="small" type="danger" plain @click="removeItem('items', i)" />
                    </div>
                    <el-input v-model="item.description" placeholder="描述" class="mt-1" />
                </div>
                <el-button v-if="section.props.items.length < 8" class="mt-2" @click="addItem('items', { icon: '🎯', title: '新特性', description: '描述' })">
                    添加特性
                </el-button>
            </el-form>
        </template>

        <!-- rich-text -->
        <template v-if="section.type === 'rich-text'">
            <el-form label-width="90px">
                <el-form-item label="布局">
                    <el-radio-group v-model="section.props.layout">
                        <el-radio value="text-only">纯文字</el-radio>
                        <el-radio value="left-image">左图右文</el-radio>
                        <el-radio value="right-image">左文右图</el-radio>
                        <el-radio value="full-width">全宽</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="section.props.content" type="textarea" :rows="6" />
                </el-form-item>
                <el-form-item label="按钮文字"><el-input v-model="section.props.ctaText" /></el-form-item>
                <el-form-item label="按钮链接"><el-input v-model="section.props.ctaLink" /></el-form-item>
            </el-form>
        </template>

        <!-- image-carousel -->
        <template v-if="section.type === 'image-carousel'">
            <el-form label-width="90px">
                <el-form-item label="高度"><el-input v-model="section.props.height" placeholder="340px" /></el-form-item>
                <el-form-item label="自动播放"><el-switch v-model="section.props.autoplay" /></el-form-item>
                <el-form-item label="间隔(ms)"><el-input-number v-model="section.props.interval" :min="1000" :max="10000" :step="500" /></el-form-item>
                <el-divider>轮播图片</el-divider>
                <div v-for="(item, i) in section.props.items" :key="i" class="list-item-editor">
                    <div class="flex gap-2 items-center">
                        <el-input v-model="item.image" placeholder="图片URL" />
                        <el-button v-if="section.props.items.length > 1" :icon="Delete" circle size="small" type="danger" plain @click="removeItem('items', i)" />
                    </div>
                    <el-input v-model="item.title" placeholder="标题" class="mt-1" />
                    <el-input v-model="item.link" placeholder="链接" class="mt-1" />
                </div>
                <el-button v-if="section.props.items.length < 8" class="mt-2" @click="addItem('items', { image: '', title: '', link: '' })">
                    添加图片
                </el-button>
            </el-form>
        </template>

        <!-- stats-bar -->
        <template v-if="section.type === 'stats-bar'">
            <el-form label-width="90px">
                <div v-for="(item, i) in section.props.items" :key="i" class="list-item-editor">
                    <div class="flex gap-2 items-center">
                        <el-input v-model="item.icon" placeholder="emoji" style="width:60px" />
                        <el-input v-model="item.value" placeholder="数值" />
                        <el-input v-model="item.label" placeholder="标签" />
                        <el-button v-if="section.props.items.length > 1" :icon="Delete" circle size="small" type="danger" plain @click="removeItem('items', i)" />
                    </div>
                </div>
                <el-button v-if="section.props.items.length < 6" class="mt-2" @click="addItem('items', { value: '100+', label: '统计项', icon: '' })">
                    添加统计
                </el-button>
            </el-form>
        </template>

        <!-- testimonials -->
        <template v-if="section.type === 'testimonials'">
            <el-form label-width="90px">
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="列数">
                    <el-radio-group v-model="section.props.columns">
                        <el-radio :value="2">2列</el-radio>
                        <el-radio :value="3">3列</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-divider>评价列表</el-divider>
                <div v-for="(item, i) in section.props.items" :key="i" class="list-item-editor">
                    <div class="flex gap-2 items-center">
                        <el-input v-model="item.name" placeholder="姓名" />
                        <el-button v-if="section.props.items.length > 1" :icon="Delete" circle size="small" type="danger" plain @click="removeItem('items', i)" />
                    </div>
                    <el-input v-model="item.role" placeholder="职位/公司" class="mt-1" />
                    <el-input v-model="item.content" type="textarea" :rows="2" placeholder="评价内容" class="mt-1" />
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs text-gray-500">评分</span>
                        <el-input-number v-model="item.rating" :min="1" :max="5" size="small" />
                    </div>
                </div>
                <el-button v-if="section.props.items.length < 9" class="mt-2" @click="addItem('items', { name: '客户名', role: '', content: '评价内容', rating: 5 })">
                    添加评价
                </el-button>
            </el-form>
        </template>

        <!-- faq-accordion -->
        <template v-if="section.type === 'faq-accordion'">
            <el-form label-width="90px">
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-divider>问答列表</el-divider>
                <div v-for="(item, i) in section.props.items" :key="i" class="list-item-editor">
                    <el-input v-model="item.question" placeholder="问题" />
                    <el-input v-model="item.answer" type="textarea" :rows="2" placeholder="回答" class="mt-1" />
                    <el-button v-if="section.props.items.length > 1" :icon="Delete" circle size="small" type="danger" plain class="mt-1" @click="removeItem('items', i)" />
                </div>
                <el-button v-if="section.props.items.length < 15" class="mt-2" @click="addItem('items', { question: '新问题', answer: '回答内容' })">
                    添加问答
                </el-button>
            </el-form>
        </template>

        <!-- cta-section -->
        <template v-if="section.type === 'cta-section'">
            <el-form label-width="90px">
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="副标题"><el-input v-model="section.props.subheading" /></el-form-item>
                <el-form-item label="按钮文字"><el-input v-model="section.props.ctaText" /></el-form-item>
                <el-form-item label="按钮链接"><el-input v-model="section.props.ctaLink" /></el-form-item>
                <el-form-item label="背景色"><el-color-picker v-model="section.props.backgroundColor" show-alpha /></el-form-item>
                <el-form-item label="文字颜色"><el-color-picker v-model="section.props.textColor" show-alpha /></el-form-item>
                <el-form-item label="布局">
                    <el-radio-group v-model="section.props.style">
                        <el-radio value="centered">居中</el-radio>
                        <el-radio value="split">左右分栏</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </template>

        <!-- card-list -->
        <template v-if="section.type === 'card-list'">
            <el-form label-width="90px">
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="数据源">
                    <el-radio-group v-model="section.props.source">
                        <el-radio value="manual">手动</el-radio>
                        <el-radio value="article-latest">最新文章</el-radio>
                        <el-radio value="article-hot">热门文章</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="列数">
                    <el-radio-group v-model="section.props.columns">
                        <el-radio :value="2">2列</el-radio>
                        <el-radio :value="3">3列</el-radio>
                        <el-radio :value="4">4列</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="数量"><el-input-number v-model="section.props.limit" :min="1" :max="12" /></el-form-item>
                <template v-if="section.props.source === 'manual'">
                    <el-divider>卡片列表</el-divider>
                    <div v-for="(item, i) in section.props.items" :key="i" class="list-item-editor">
                        <div class="flex gap-2 items-center">
                            <el-input v-model="item.title" placeholder="标题" />
                            <el-button :icon="Delete" circle size="small" type="danger" plain @click="removeItem('items', i)" />
                        </div>
                        <el-input v-model="item.description" placeholder="描述" class="mt-1" />
                        <el-input v-model="item.tag" placeholder="标签" class="mt-1" />
                    </div>
                    <el-button class="mt-2" @click="addItem('items', { title: '新卡片', description: '', tag: '', link: '' })">
                        添加卡片
                    </el-button>
                </template>
            </el-form>
        </template>

        <!-- contact-form -->
        <template v-if="section.type === 'contact-form'">
            <el-form label-width="90px">
                <el-form-item label="标题"><el-input v-model="section.props.heading" /></el-form-item>
                <el-form-item label="副标题"><el-input v-model="section.props.subheading" /></el-form-item>
                <el-form-item label="按钮文字"><el-input v-model="section.props.submitText" /></el-form-item>
                <el-form-item label="成功提示"><el-input v-model="section.props.successMessage" /></el-form-item>
                <el-divider>表单字段</el-divider>
                <div v-for="(field, i) in section.props.fields" :key="i" class="list-item-editor">
                    <div class="flex gap-2 items-center">
                        <el-input v-model="field.name" placeholder="字段标识" style="width:120px" />
                        <el-input v-model="field.label" placeholder="显示标签" />
                        <el-button :icon="Delete" circle size="small" type="danger" plain @click="removeItem('fields', i)" />
                    </div>
                    <div class="flex gap-2 items-center mt-1">
                        <el-select v-model="field.type" style="width:120px">
                            <el-option label="文本" value="text" />
                            <el-option label="邮箱" value="email" />
                            <el-option label="手机" value="phone" />
                            <el-option label="下拉" value="select" />
                            <el-option label="文本域" value="textarea" />
                        </el-select>
                        <el-switch v-model="field.required" active-text="必填" inactive-text="选填" />
                    </div>
                    <el-input v-model="field.placeholder" placeholder="占位符" class="mt-1" />
                    <template v-if="field.type === 'select'">
                        <div class="text-xs text-gray-500 mt-1">选项（每行一个）</div>
                        <el-input v-model="field.optionsText" type="textarea" :rows="2" class="mt-1" @change="parseOptions(field)" />
                    </template>
                </div>
                <el-button class="mt-2" @click="addField()">
                    添加字段
                </el-button>
            </el-form>
        </template>

        <!-- divider -->
        <template v-if="section.type === 'divider'">
            <el-form label-width="90px">
                <el-form-item label="样式">
                    <el-radio-group v-model="section.props.style">
                        <el-radio value="space">间距</el-radio>
                        <el-radio value="line">线条</el-radio>
                        <el-radio value="gradient">渐变</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="高度"><el-input v-model="section.props.height" placeholder="40px" /></el-form-item>
                <el-form-item v-if="section.props.style === 'line'" label="颜色">
                    <el-color-picker v-model="section.props.color" />
                </el-form-item>
            </el-form>
        </template>

        <!-- custom-html -->
        <template v-if="section.type === 'custom-html'">
            <el-form label-width="90px">
                <el-form-item label="HTML内容">
                    <el-input v-model="section.props.html" type="textarea" :rows="12" />
                </el-form-item>
            </el-form>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { Delete } from '@element-plus/icons-vue'

const props = defineProps<{
    section: Record<string, any> | null
}>()

// 确保样式对象存在
const ensureStyles = () => {
    if (props.section && !props.section.styles) {
        props.section.styles = {}
    }
}
watch(() => props.section, ensureStyles, { immediate: true })

const removeItem = (listKey: string, index: number) => {
    if (!props.section?.props?.[listKey]) return
    props.section.props[listKey].splice(index, 1)
}

const addItem = (listKey: string, template: any) => {
    if (!props.section?.props) return
    if (!props.section.props[listKey]) props.section.props[listKey] = []
    props.section.props[listKey].push({ ...template })
}

const addField = () => {
    if (!props.section?.props?.fields) return
    props.section.props.fields.push({
        name: `field_${Date.now()}`,
        label: '新字段',
        type: 'text',
        required: false,
        placeholder: ''
    })
}

const parseOptions = (field: any) => {
    if (field.optionsText) {
        field.options = field.optionsText.split('\n').filter((s: string) => s.trim())
    }
}
</script>

<style lang="scss" scoped>
.list-item-editor {
    padding: 12px;
    margin-bottom: 8px;
    background: #fafafa;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
}
</style>
