<template>
    <div class="opc-intro-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">什么是OPC？</h1>
                <p class="page-subtitle">One Person Company - 一人公司的完整指南</p>
            </div>
        </section>

        <!-- OPC定义 -->
        <section class="definition-section">
            <div class="section-container">
                <div class="content-card">
                    <h2 class="section-title">OPC定义</h2>
                    <p class="definition-text">
                        <strong>OPC（One Person Company）</strong>，即一人公司，是一种由单个人拥有和经营的企业形式。
                        它不同于传统的独资企业或个体工商户，具有独立的法人地位，结合了公司制度的优势和个体经营的灵活性。
                    </p>
                </div>
            </div>
        </section>

        <!-- 四个核心特征 -->
        <section class="features-section">
            <div class="section-container">
                <h2 class="section-title">OPC的四个核心特征</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🏢</div>
                        <h3 class="feature-title">独立法人</h3>
                        <p class="feature-desc">具有独立的法人地位，股东承担有限责任，个人财产与公司财产分离。</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">👤</div>
                        <h3 class="feature-title">单一股东</h3>
                        <p class="feature-desc">只有一个自然人股东，无需合伙人，决策灵活高效。</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔄</div>
                        <h3 class="feature-title">股权可转让</h3>
                        <p class="feature-desc">股权可以自由转让给他人，便于引入投资或团队扩展。</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3 class="feature-title">规范治理</h3>
                        <p class="feature-desc">需要按照公司法规进行规范运营，建立基本的财务和管理制度。</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 对比表格 -->
        <section class="comparison-section">
            <div class="section-container">
                <h2 class="section-title">OPC vs 其他形式对比</h2>
                <div class="table-container">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>对比维度</th>
                                <th>OPC</th>
                                <th>个体工商户</th>
                                <th>有限公司</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>法人资格</td>
                                <td class="check">✓ 有</td>
                                <td class="cross">✗ 无</td>
                                <td class="check">✓ 有</td>
                            </tr>
                            <tr>
                                <td>股东数量</td>
                                <td>1人</td>
                                <td>1人</td>
                                <td>1-50人</td>
                            </tr>
                            <tr>
                                <td>有限责任</td>
                                <td class="check">✓ 是</td>
                                <td class="cross">✗ 无限责任</td>
                                <td class="check">✓ 是</td>
                            </tr>
                            <tr>
                                <td>设立门槛</td>
                                <td>低</td>
                                <td>极低</td>
                                <td>中等</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- CTA 区域 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2 class="cta-title">准备好创建你的OPC了吗？</h2>
                <p class="cta-subtitle">我们提供从注册到运营的全链条服务</p>
                <div class="cta-actions">
                    <ElButton type="primary" size="large" @click="goToAssessment">
                        免费评估
                    </ElButton>
                    <ElButton size="large" @click="goToServices">
                        了解服务
                    </ElButton>
                </div>
            </div>
        </section>
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

// 跳转到核心服务
const goToServices = () => {
    navigateTo('/services')
}

// SEO 优化
useHead({
    title: 'OPC百科 - 一人公司完整指南',
    meta: [
        { name: 'description', content: 'OPC（One Person Company）一人公司的完整介绍：定义、特征、与个体工商户和有限公司的对比分析' },
        { name: 'keywords', content: 'OPC,一人公司,个体工商户,有限公司,创业,公司注册' }
    ]
})
</script>

<style lang="scss" scoped>
.opc-intro-page {
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

// OPC定义区域
.definition-section {
    padding: 60px 20px;
    background: white;
}

.section-container {
    max-width: 1000px;
    margin: 0 auto;
}

.content-card {
    background: #f5f7fa;
    padding: 40px;
    border-radius: 12px;
}

.section-title {
    font-size: 32px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 24px;
    text-align: center;
}

.definition-text {
    font-size: 18px;
    line-height: 1.8;
    color: #606266;
    text-align: justify;

    strong {
        color: #4153ff;
    }
}

// 四个核心特征
.features-section {
    padding: 60px 20px;
    background: #f5f7fa;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.feature-card {
    text-align: center;
    padding: 40px 32px;
    background: white;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
}

.feature-icon {
    font-size: 56px;
    margin-bottom: 20px;
}

.feature-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.feature-desc {
    font-size: 16px;
    color: #606266;
    line-height: 1.6;
}

// 对比表格
.comparison-section {
    padding: 60px 20px;
    background: white;
}

.table-container {
    overflow-x: auto;
}

.comparison-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    th {
        background: #4153ff;
        color: white;
        padding: 16px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
    }

    td {
        padding: 16px;
        text-align: center;
        border-bottom: 1px solid #e4e7ed;
        color: #606266;
        font-size: 15px;
    }

    tr:last-child td {
        border-bottom: none;
    }

    tr:hover {
        background: #f5f7fa;
    }

    .check {
        color: #67c23a;
        font-weight: bold;
        font-size: 18px;
    }

    .cross {
        color: #f56c6c;
        font-weight: bold;
        font-size: 18px;
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
</style>
