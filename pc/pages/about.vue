<template>
    <div class="about-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">关于我们</h1>
                <p class="page-subtitle">专业、创新、值得信赖的企业合作伙伴</p>
            </div>
        </section>

        <!-- 使命宣言 -->
        <section class="mission-section">
            <div class="section-container">
                <div class="mission-card">
                    <h2 class="section-title">我们的使命</h2>
                    <blockquote class="mission-quote">
                        "以专业服务创造价值，以创新精神引领未来——致力于成为客户最值得信赖的合作伙伴。"
                    </blockquote>
                    <p class="mission-desc">
                        我们始终坚持以客户需求为导向，以技术创新为驱动，为客户提供高质量的解决方案。我们的目标是通过专业的服务和不懈的努力，帮助客户实现商业价值最大化。
                    </p>
                </div>
            </div>
        </section>

        <!-- 愿景与价值观 -->
        <section class="values-section">
            <div class="section-container">
                <h2 class="section-title">愿景与价值观</h2>
                <div class="values-grid">
                    <div class="value-card">
                        <div class="value-icon">🎯</div>
                        <h3 class="value-title">我们的愿景</h3>
                        <p class="value-desc">成为行业领先的服务提供商，为客户创造持续价值，推动行业创新发展。</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">💡</div>
                        <h3 class="value-title">创新驱动</h3>
                        <p class="value-desc">持续技术创新和模式创新，用先进技术解决客户实际问题。</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">🤝</div>
                        <h3 class="value-title">客户至上</h3>
                        <p class="value-desc">以客户需求为中心，提供专业、高效、贴心的全周期服务。</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">🌱</div>
                        <h3 class="value-title">合作共赢</h3>
                        <p class="value-desc">与客户、合作伙伴共同成长，建立长期稳定的合作关系。</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon">📊</div>
                        <h3 class="value-title">追求卓越</h3>
                        <p class="value-desc">精益求精，不断优化服务和产品质量，为客户创造更大价值。</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 联系方式 -->
        <section class="contact-section">
            <div class="section-container">
                <h2 class="section-title">联系我们</h2>
                <div class="contact-grid">
                    <div class="contact-item">
                        <div class="contact-icon">📧</div>
                        <div class="contact-info">
                            <div class="contact-label">邮箱</div>
                            <div class="contact-value">contact@company.com</div>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">📱</div>
                        <div class="contact-info">
                            <div class="contact-label">电话</div>
                            <div class="contact-value">0755-12345678</div>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">📍</div>
                        <div class="contact-info">
                            <div class="contact-label">地址</div>
                            <div class="contact-value">深圳市南山区科技园</div>
                        </div>
                    </div>
                    <div class="contact-item">
                        <div class="contact-icon">💬</div>
                        <div class="contact-info">
                            <div class="contact-label">微信公众号</div>
                            <div class="contact-value">company_service</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 在线留言 -->
        <section class="message-section">
            <div class="section-container">
                <div class="message-card">
                    <h2 class="section-title">在线留言</h2>
                    <ElForm label-position="top" class="message-form">
                        <ElFormItem label="姓名">
                            <ElInput placeholder="请输入您的姓名" size="large" />
                        </ElFormItem>
                        <ElFormItem label="手机号">
                            <ElInput placeholder="请输入您的手机号" size="large" />
                        </ElFormItem>
                        <ElFormItem label="留言内容">
                            <ElInput
                                type="textarea"
                                :rows="4"
                                placeholder="请描述您的需求或问题..."
                                size="large"
                            />
                        </ElFormItem>
                        <ElFormItem>
                            <ElButton type="primary" size="large" class="submit-button">
                                提交留言
                            </ElButton>
                        </ElFormItem>
                    </ElForm>
                </div>
            </div>
        </section>

        <!-- CTA 区域 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2 class="cta-title">准备好开始合作了吗？</h2>
                <p class="cta-subtitle">立即联系我们，获取专业解决方案</p>
                <div class="cta-actions">
                    <ElButton type="primary" size="large" @click="goToAssessment">
                        立即咨询
                    </ElButton>
                    <ElButton size="large" @click="downloadResources">
                        了解更多
                    </ElButton>
                </div>
            </div>
        </section>

        <!-- 页脚 -->
        <footer class="page-footer">
            <div class="footer-container">
                <div class="footer-section">
                    <h3 class="footer-title">关于我们</h3>
                    <p class="footer-desc">专业的企业服务提供商，致力于为客户提供高质量的创新解决方案。</p>
                </div>
                <div class="footer-section">
                    <h3 class="footer-title">联系我们</h3>
                    <p class="footer-contact">
                        📍 深圳市南山区科技园<br>
                        📧 contact@opc-service.com<br>
                        📞 0755-12345678
                    </p>
                </div>
                <div class="footer-section">
                    <p class="footer-copyright">
                        &copy; 2026 企业名称. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script lang="ts" setup>
// 跳转到需求评估
const goToAssessment = () => {
    navigateTo('/')
    setTimeout(() => {
        const formElement = document.getElementById('assessment-form')
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' })
        }
    }, 300)
}

// 下载资源（暂时跳转到首页）
const downloadResources = () => {
    ElMessage.info('资源库页面即将上线，敬请期待！')
}

// SEO 优化
useHead({
    title: '关于我们 - 企业官网',
    meta: [
        { name: 'description', content: '了解我们的企业使命、愿景和价值观。专业的企业服务提供商，致力于为客户提供高质量的创新解决方案' },
        { name: 'keywords', content: '关于我们,企业介绍,公司文化,联系方式' }
    ]
})
</script>

<style lang="scss" scoped>
.about-page {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
}

// 页面标题区域
.page-header {
    padding: 80px 20px 60px;
    background: linear-gradient(135deg, #4153ff 0%, #7583ff 100%);
    text-align: center;
    color: white;

    @media (max-width: 768px) {
        padding: 60px 20px 40px;
    }
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
}

.page-title {
    font-size: 42px;
    font-weight: 700;
    margin-bottom: 16px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
        font-size: 32px;
    }
}

.page-subtitle {
    font-size: 18px;
    font-weight: 300;
    opacity: 0.95;

    @media (max-width: 768px) {
        font-size: 16px;
    }
}

// 使命宣言
.mission-section {
    padding: 60px 20px;
    background: white;
}

.section-container {
    max-width: 1000px;
    margin: 0 auto;
}

.section-title {
    font-size: 36px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 32px;
    text-align: center;
}

.mission-card {
    background: #f5f7fa;
    padding: 48px;
    border-radius: 16px;
    text-align: center;
}

.mission-quote {
    font-size: 20px;
    font-weight: 500;
    color: #4153ff;
    line-height: 1.8;
    margin-bottom: 24px;
    padding: 0 32px;
    position: relative;

    &::before {
        content: '"';
        position: absolute;
        left: 0;
        font-size: 60px;
        line-height: 1;
        color: #4153ff;
        opacity: 0.2;
    }
}

.mission-desc {
    font-size: 16px;
    color: #606266;
    line-height: 1.8;
    max-width: 800px;
    margin: 0 auto;
}

// 愿景与价值观
.values-section {
    padding: 60px 20px;
    background: white;
}

.values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}

.value-card {
    text-align: center;
    padding: 32px 24px;
    background: #f5f7fa;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        background: white;
    }
}

.value-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.value-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
}

.value-desc {
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
}

// 联系方式
.contact-section {
    padding: 60px 20px;
    background: #f5f7fa;
}

.contact-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
}

.contact-icon {
    font-size: 32px;
    flex-shrink: 0;
}

.contact-info {
    flex: 1;
}

.contact-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 4px;
}

.contact-value {
    font-size: 16px;
    color: #303133;
    font-weight: 500;
}

// 在线留言
.message-section {
    padding: 60px 20px;
    background: white;
}

.message-card {
    max-width: 700px;
    margin: 0 auto;
    padding: 40px;
    background: #f5f7fa;
    border-radius: 16px;
}

.message-form {
    :deep(.el-form-item) {
        margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #303133;
    }

    .submit-button {
        width: 100%;
        height: 50px;
        font-size: 18px;
        font-weight: 500;
        border-radius: 8px;
    }
}

// CTA 区域
.cta-section {
    padding: 80px 20px;
    background: #f5f7fa;
}

.cta-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    padding: 48px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    @media (max-width: 768px) {
        padding: 32px 24px;
    }
}

.cta-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;

    @media (max-width: 768px) {
        font-size: 24px;
    }
}

.cta-subtitle {
    font-size: 16px;
    color: #606266;
    margin-bottom: 32px;
}

.cta-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;

    .el-button {
        min-width: 140px;
        height: 50px;
        font-size: 18px;
        font-weight: 500;
        border-radius: 8px;
    }
}

// 页脚
.page-footer {
    padding: 60px 20px 40px;
    background: #222;
    color: #bebebe;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 32px;
    }
}

.footer-section {
    .footer-title {
        font-size: 18px;
        font-weight: 600;
        color: white;
        margin-bottom: 16px;
    }

    .footer-desc {
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
    }

    .footer-contact {
        font-size: 14px;
        line-height: 2;
        margin: 0;
    }

    .footer-copyright {
        font-size: 14px;
        color: #999;
        text-align: center;
        padding-top: 20px;
        margin-top: 20px;
        border-top: 1px solid #333;
    }
}
</style>
