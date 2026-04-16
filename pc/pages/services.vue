<template>
    <div class="services-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">我们的核心服务</h1>
                <p class="page-subtitle">为您提供专业、全面的解决方案</p>
            </div>
        </section>

        <!-- 四大核心服务 -->
        <section class="services-section">
            <div class="services-container">
                <div class="services-grid">
                    <!-- 产品咨询服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">🚀</div>
                            <h2 class="service-title">产品咨询服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>需求分析与规划</li>
                                <li>产品方案设计</li>
                                <li>技术架构选型</li>
                                <li>项目实施指导</li>
                                <li>全生命周期支持</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">服务特点：</span>
                                <span class="case-value">定制化解决方案</span>
                            </div>
                        </div>
                    </div>

                    <!-- 技术开发服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">💻</div>
                            <h2 class="service-title">技术开发服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>前端应用开发</li>
                                <li>后端系统开发</li>
                                <li>移动端应用开发</li>
                                <li>系统部署与运维</li>
                                <li>技术支持与维护</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">技术栈：</span>
                                <span class="case-value">主流前沿技术</span>
                            </div>
                        </div>
                    </div>

                    <!-- 商务合作服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">🤝</div>
                            <h2 class="service-title">商务合作服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>商务方案策划</li>
                                <li>合作资源对接</li>
                                <li>项目谈判支持</li>
                                <li>合同协议拟定</li>
                                <li>项目落地执行</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">服务特点：</span>
                                <span class="case-value">全程专业支持</span>
                            </div>
                        </div>
                    </div>

                    <!-- 培训与咨询 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">📚</div>
                            <h2 class="service-title">培训与咨询</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>企业内训课程</li>
                                <li>技术咨询顾问</li>
                                <li>最佳实践分享</li>
                                <li>行业趋势分析</li>
                                <li>持续学习支持</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">服务模式：</span>
                                <span class="case-value">线上线下结合</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 为什么选择我们 -->
        <section class="advantages-section">
            <div class="advantages-container">
                <h2 class="section-title">为什么选择我们</h2>
                <div class="advantages-grid">
                    <div class="advantage-card">
                        <div class="card-icon">🎯</div>
                        <h3 class="card-title">专业团队</h3>
                        <p class="card-desc">多年行业经验，专业背景深厚</p>
                    </div>
                    <div class="advantage-card">
                        <div class="card-icon">🤝</div>
                        <h3 class="card-title">优质服务</h3>
                        <p class="card-desc">客户至上，提供贴心周到的服务</p>
                    </div>
                    <div class="advantage-card">
                        <div class="card-icon">💼</div>
                        <h3 class="card-title">丰富经验</h3>
                        <p class="card-desc">众多成功案例，值得信赖</p>
                    </div>
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
                    <ElButton size="large" @click="goToHome">
                        返回首页
                    </ElButton>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus'

// 跳转到首页的表单区域
const goToAssessment = () => {
    navigateTo('/')
    setTimeout(() => {
        const formElement = document.getElementById('assessment-form')
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' })
        }
    }, 300)
}

// 返回首页
const goToHome = () => {
    navigateTo('/')
}

// SEO 优化
useHead({
    title: '核心服务 - 企业官网',
    meta: [
        { name: 'description', content: '提供专业、全面的企业服务：产品咨询、技术开发、商务合作、培训咨询，助力企业实现数字化转型' },
        { name: 'keywords', content: '企业服务,产品咨询,技术开发,商务合作,培训咨询' }
    ]
})
</script>

<style lang="scss" scoped>
.services-page {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
}

// 页面标题区域 - 使用浅灰色背景
.page-header {
    padding: 80px 20px 60px;
    background: #f5f7fa;
    text-align: center;
    color: #333;

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

// 四大核心服务 - 与首页服务亮点风格一致
.services-section {
    padding: 60px 20px;
    background: white;
}

.services-container {
    max-width: 1200px;
    margin: 0 auto;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.service-card {
    background: #f5f7fa;
    border-radius: 12px;
    padding: 32px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        background: white;
    }
}

.card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
}

.service-icon {
    font-size: 48px;
    flex-shrink: 0;
}

.service-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

.card-content {
    .service-list {
        list-style: none;
        padding: 0;
        margin: 0 0 20px 0;

        li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            color: #606266;
            font-size: 15px;
            line-height: 1.6;

            &:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #67c23a;
                font-weight: bold;
            }
        }
    }

    .reference-case {
        padding-top: 16px;
        border-top: 1px solid #e4e7ed;
        font-size: 14px;
    }

    .case-label {
        color: #909399;
    }

    .case-value {
        color: #409eff;
        font-weight: 500;
    }
}

// 为什么选择我们 - 与首页服务亮点完全一致
.advantages-section {
    padding: 80px 20px;
    background: white;
}

.advantages-container {
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

.advantages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.advantage-card {
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
    margin: 0;
}

// CTA 区域 - 简洁白色背景
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
</style>
