<template>
    <div class="homepage">
        <!-- 轮播图 + 资讯展示区域（主视觉区域） -->
        <section class="content-section">
            <div class="content-container">
                <div class="content-wrapper">
                    <!-- 左侧轮播图 -->
                    <div class="carousel-container">
                        <ElCarousel
                            v-if="getSwiperData.enabled && showList.length > 0"
                            class="w-full"
                            trigger="click"
                            height="340px"
                        >
                            <ElCarouselItem v-for="item in showList" :key="item">
                                <NuxtLink :to="item.link.path" target="_blank">
                                    <ElImage
                                        class="w-full h-full rounded-[8px] bg-white overflow-hidden"
                                        :src="appStore.getImageUrl(item.image)"
                                        fit="contain"
                                    />
                                </NuxtLink>
                            </ElCarouselItem>
                        </ElCarousel>
                        <div v-else class="carousel-placeholder">
                            <ElIcon class="placeholder-icon"><Picture /></ElIcon>
                            <p>轮播图配置中...</p>
                        </div>
                    </div>

                    <!-- 右侧资讯卡片 -->
                    <div class="information-container">
                        <InformationCard
                            link="/information/new"
                            class="h-full"
                            header="最新资讯"
                            :data="pageData.new"
                            :show-time="false"
                        />
                    </div>
                </div>
            </div>
        </section>

        <!-- 快速表单区域 -->
        <section class="quick-form-section" id="assessment-form">
            <div class="form-container">
                <div class="form-header">
                    <h2 class="form-title">联系我们，获取专属方案</h2>
                    <p class="form-subtitle">填写您的需求，我们将在24小时内与您联系</p>
                </div>

                <ElForm
                    ref="formRef"
                    :model="form"
                    :rules="rules"
                    label-position="top"
                    class="assessment-form"
                >
                    <div class="form-row">
                        <ElFormItem label="姓名" prop="name">
                            <ElInput
                                v-model="form.name"
                                placeholder="请输入您的姓名"
                                size="large"
                            />
                        </ElFormItem>

                        <ElFormItem label="手机号" prop="phone">
                            <ElInput
                                v-model="form.phone"
                                placeholder="请输入您的手机号"
                                size="large"
                                maxlength="11"
                            />
                        </ElFormItem>
                    </div>

                    <ElFormItem label="咨询类型" prop="stage">
                        <ElSelect
                            v-model="form.stage"
                            placeholder="请选择咨询类型"
                            size="large"
                            class="w-full"
                        >
                            <ElOption
                                label="产品咨询"
                                value="product"
                            />
                            <ElOption
                                label="商务合作"
                                value="business"
                            />
                            <ElOption
                                label="技术支持"
                                value="support"
                            />
                            <ElOption
                                label="其他咨询"
                                value="other"
                            />
                        </ElSelect>
                    </ElFormItem>

                    <ElFormItem>
                        <ElButton
                            type="primary"
                            size="large"
                            class="submit-button"
                            :loading="submitting"
                            @click="submitForm"
                        >
                            提交咨询
                        </ElButton>
                    </ElFormItem>

                    <div class="form-tip">
                        <ElIcon class="tip-icon"><InfoFilled /></ElIcon>
                        我们将于24小时内联系您
                    </div>
                </ElForm>
            </div>
        </section>

        <!-- 服务亮点区域 -->
        <section class="highlights-section">
            <div class="highlights-container">
                <h2 class="section-title">为什么选择我们</h2>
                <div class="highlights-grid">
                    <div class="highlight-card">
                        <div class="card-icon">🎯</div>
                        <h3 class="card-title">专业团队</h3>
                        <p class="card-desc">多年行业经验，为您提供专业解决方案</p>
                    </div>
                    <div class="highlight-card">
                        <div class="card-icon">🤝</div>
                        <h3 class="card-title">优质服务</h3>
                        <p class="card-desc">以客户为中心，全程贴心服务保障</p>
                    </div>
                    <div class="highlight-card">
                        <div class="card-icon">💼</div>
                        <h3 class="card-title">成功经验</h3>
                        <p class="card-desc">服务众多客户，积累了丰富的成功案例</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { InfoFilled, Picture } from '@element-plus/icons-vue'
import { getIndex } from '@/api/shop'
import { submitAssessment } from '@/api/assessment'
import { useAppStore } from '~~/stores/app'

// 获取应用数据和轮播图（原有逻辑）
const appStore = useAppStore()
const { data: pageData } = await useAsyncData(() => getIndex(), {
    default: () => ({
        all: [],
        hot: [],
        new: [],
        page: {}
    })
})

const getSwiperData = computed(() => {
    try {
        const data = JSON.parse(pageData.value.page.data)
        return data.find((item) => item.name === 'pc-banner')?.content || {}
    } catch (error) {
        return {}
    }
})

const showList = computed(() => {
    return getSwiperData.value?.data || []
})

// 表单数据
const form = reactive({
    name: '',
    phone: '',
    stage: ''
})

// 表单验证规则
const rules = {
    name: [
        { required: true, message: '请输入您的姓名', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入您的手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    stage: [
        { required: true, message: '请选择您的当前阶段', trigger: 'change' }
    ]
}

const formRef = ref()
const submitting = ref(false)

// 提交表单
const submitForm = async () => {
    console.log('点击提交按钮', form)
    console.log('formRef:', formRef.value)
    if (!formRef.value) {
        console.log('formRef 不存在')
        return
    }

    try {
        // 验证表单
        await formRef.value.validate()
        console.log('验证通过，准备提交到后端')

        submitting.value = true

        const res = await submitAssessment({
            name: form.name,
            phone: form.phone,
            stage: form.stage
        })

        console.log('后端返回:', res)
        ElMessage.success('提交成功！我们将于24小时内联系您')

        formRef.value.resetFields()
    } catch (error: any) {
        console.log('验证或提交失败:', error)
        console.log('error 类型:', typeof error)
        console.log('error 详情:', JSON.stringify(error, null, 2))
        // error 可能是字符串（后端返回的错误消息）或 Error 对象
        const errorMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error))
        ElMessage.error(errorMsg)
    } finally {
        submitting.value = false
    }
}

// SEO 优化
useHead({
    title: '企业官网 - 专业服务与解决方案',
    meta: [
        { name: 'description', content: '我们致力于为客户提供专业、高效、创新的解决方案，助力企业实现数字化转型与业务增长' },
        { name: 'keywords', content: '企业服务,专业解决方案,商务合作,技术支持' }
    ]
})
</script>

<style lang="scss" scoped>
.homepage {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
}

// 轮播图 + 资讯区域（主视觉区域）
.content-section {
    padding: 40px 20px;
    background: white;
}

.content-container {
    max-width: 1200px;
    margin: 0 auto;
}

.content-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    @media (max-width: 1024px) {
        flex-direction: column;
    }
}

.carousel-container {
    width: 750px;
    height: 340px;
    flex-shrink: 0;

    @media (max-width: 1024px) {
        width: 100%;
        height: auto;
    }
}

.carousel-placeholder {
    width: 100%;
    height: 340px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border-radius: 8px;
    color: #909399;

    .placeholder-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    p {
        font-size: 16px;
    }
}

.information-container {
    flex: 1;
    min-width: 0;
    height: 340px;

    @media (max-width: 1024px) {
        height: auto;
    }
}

// 快速表单区域
.quick-form-section {
    padding: 80px 20px;
    background: #f5f7fa;
}

.form-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 48px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    @media (max-width: 768px) {
        padding: 32px 24px;
    }
}

.form-header {
    text-align: center;
    margin-bottom: 40px;
}

.form-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.form-subtitle {
    font-size: 16px;
    color: #606266;
}

.assessment-form {
    :deep(.el-form-item) {
        margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #303133;
    }
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 0;
    }
}

.submit-button {
    width: 100%;
    height: 50px;
    font-size: 18px;
    font-weight: 500;
    border-radius: 8px;
    margin-top: 8px;
}

.form-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #909399;
    font-size: 14px;
    margin-top: 24px;
}

.tip-icon {
    font-size: 18px;
}

// 服务亮点区域
.highlights-section {
    padding: 80px 20px;
    background: white;
}

.highlights-container {
    max-width: 1200px;
    margin: 0 auto;
}

.section-title {
    font-size: 36px;
    font-weight: 600;
    text-align: center;
    color: #303133;
    margin-bottom: 60px;

    @media (max-width: 768px) {
        font-size: 28px;
        margin-bottom: 40px;
    }
}

.highlights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.highlight-card {
    text-align: center;
    padding: 40px 32px;
    border-radius: 12px;
    background: #f5f7fa;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        background: white;
    }
}

.card-icon {
    font-size: 48px;
    margin-bottom: 20px;
}

.card-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.card-desc {
    font-size: 16px;
    color: #606266;
    line-height: 1.6;
}
</style>
