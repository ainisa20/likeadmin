<template>
    <div class="services-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">我们的核心服务</h1>
                <p class="page-subtitle">为OPC创业者提供全链条服务，让一人公司轻装上阵</p>
            </div>
        </section>

        <!-- 四大核心服务 -->
        <section class="services-section">
            <div class="services-container">
                <div class="services-grid">
                    <!-- OPC孵化服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">🚀</div>
                            <h2 class="service-title">OPC孵化服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>创业idea可行性评估</li>
                                <li>商业模式打磨</li>
                                <li>公司注册集群地址</li>
                                <li>财税法律基础包</li>
                                <li>π立方评审机制</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">参考案例：</span>
                                <span class="case-value">成都π立方社区</span>
                            </div>
                        </div>
                    </div>

                    <!-- 政策申报服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">📋</div>
                            <h2 class="service-title">政策申报服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>各区政策智能匹配</li>
                                <li>申报材料专业撰写</li>
                                <li>政府关系对接</li>
                                <li>补贴落地跟踪</li>
                                <li>最高1000万跟投</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">参考案例：</span>
                                <span class="case-value">罗湖区跟投政策</span>
                            </div>
                        </div>
                    </div>

                    <!-- 资本对接服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">💰</div>
                            <h2 class="service-title">资本对接服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>BP优化指导</li>
                                <li>投资人路演陪练</li>
                                <li>FA专业对接</li>
                                <li>种子基金直通车</li>
                                <li>AI陪练平台</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">参考案例：</span>
                                <span class="case-value">南京"阿拉丁工作平台"</span>
                            </div>
                        </div>
                    </div>

                    <!-- 技术赋能服务 -->
                    <div class="service-card">
                        <div class="card-header">
                            <div class="service-icon">⚡</div>
                            <h2 class="service-title">技术赋能服务</h2>
                        </div>
                        <div class="card-content">
                            <ul class="service-list">
                                <li>算力券代申领</li>
                                <li>模型接口对接</li>
                                <li>数据资源包</li>
                                <li>开源工具培训</li>
                                <li>算力直接打折</li>
                            </ul>
                            <div class="reference-case">
                                <span class="case-label">参考案例：</span>
                                <span class="case-value">成都算力补贴模式</span>
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
                        <h3 class="card-title">专业专注</h3>
                        <p class="card-desc">深耕OPC领域，理解一人公司特殊需求</p>
                    </div>
                    <div class="advantage-card">
                        <div class="card-icon">🤝</div>
                        <h3 class="card-title">资源丰富</h3>
                        <p class="card-desc">连接政府、园区、投资机构、技术资源</p>
                    </div>
                    <div class="advantage-card">
                        <div class="card-icon">💼</div>
                        <h3 class="card-title">成功案例</h3>
                        <p class="card-desc">帮助多家OPC获得千万融资和政府补贴</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA 区域 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2 class="cta-title">准备好开始你的OPC之旅了吗？</h2>
                <p class="cta-subtitle">立即联系我们，获取专属创业方案</p>
                <div class="cta-actions">
                    <ElButton type="primary" size="large" @click="goToAssessment">
                        免费评估
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
    title: '核心服务 - OPC创业服务平台',
    meta: [
        { name: 'description', content: '为OPC创业者提供全链条服务：OPC孵化、政策申报、资本对接、技术赋能，让一人公司轻装上阵' },
        { name: 'keywords', content: 'OPC服务,创业孵化,政策申报,资本对接,技术赋能,创业服务' }
    ]
})
</script>

<style lang="scss" scoped>
.services-page {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
}

// 页面标题区域 - 使用主题色渐变
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
