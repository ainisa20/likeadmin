<template>
    <div class="policy-map-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">深圳OPC政策地图</h1>
                <p class="page-subtitle">各区政策对比，为你的OPC找到最佳落地选择</p>
            </div>
        </section>

        <!-- 政策对比表 -->
        <section class="policy-table-section">
            <div class="section-container">
                <h2 class="section-title">深圳各区政策对比表</h2>
                <div class="table-wrapper">
                    <table class="policy-table">
                        <thead>
                            <tr>
                                <th>区域</th>
                                <th>最高跟投</th>
                                <th>人才补贴</th>
                                <th>算力补贴</th>
                                <th>社区入驻</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="district">🏙️ 罗湖区</td>
                                <td class="highlight"><strong>1000万</strong></td>
                                <td>10万</td>
                                <td>100万/年</td>
                                <td class="check">✓</td>
                            </tr>
                            <tr>
                                <td class="district">🏗️ 龙岗区</td>
                                <td class="highlight"><strong>1000万</strong></td>
                                <td>10万</td>
                                <td>400万</td>
                                <td class="check">✓</td>
                            </tr>
                            <tr>
                                <td class="district">🌆 南山区</td>
                                <td>-</td>
                                <td>10万</td>
                                <td>三券支持</td>
                                <td class="check">✓</td>
                            </tr>
                            <tr>
                                <td class="district">🏙️ 福田区</td>
                                <td class="highlight"><strong>500万</strong></td>
                                <td>10万</td>
                                <td>200万</td>
                                <td class="check">✓</td>
                            </tr>
                            <tr>
                                <td class="district">🚀 宝安区</td>
                                <td>300万</td>
                                <td>5万</td>
                                <td>100万</td>
                                <td class="check">✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <!-- 政策解读 -->
        <section class="policy-detail-section">
            <div class="section-container">
                <h2 class="section-title">政策解读</h2>
                <div class="policy-cards">
                    <div class="policy-card">
                        <div class="card-icon">📊</div>
                        <h3 class="card-title">跟投政策</h3>
                        <p class="card-desc">政府按一定比例跟投优质项目，最高可达1000万元，降低创业风险。</p>
                    </div>
                    <div class="policy-card">
                        <div class="card-icon">👨‍💼</div>
                        <h3 class="card-title">人才补贴</h3>
                        <p class="card-desc">对符合条件的创业人才给予一次性生活补贴，各区标准不同。</p>
                    </div>
                    <div class="policy-card">
                        <div class="card-icon">💻</div>
                        <h3 class="card-title">算力补贴</h3>
                        <p class="card-desc">为AI、大数据等方向提供算力券补贴，最高可达400万元/年。</p>
                    </div>
                    <div class="policy-card">
                        <div class="card-icon">🏢</div>
                        <h3 class="card-title">社区入驻</h3>
                        <p class="card-desc">提供免费或优惠的办公空间，包括集群注册地址。</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA 区域 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2 class="cta-title">需要政策申报帮助？</h2>
                <p class="cta-subtitle">我们提供政策匹配、材料撰写、政府对接全流程服务</p>
                <div class="cta-actions">
                    <ElButton type="primary" size="large" @click="goToAssessment">
                        立即咨询
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
    title: '深圳OPC政策地图 - 各区政策对比',
    meta: [
        { name: 'description', content: '深圳各区OPC扶持政策对比：罗湖区、龙岗区、南山区、福田区、宝安区的跟投、人才补贴、算力补贴等政策详情' },
        { name: 'keywords', content: 'OPC政策,深圳政策,政策申报,政府补贴,跟投政策,算力券' }
    ]
})
</script>

<style lang="scss" scoped>
.policy-map-page {
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

// 政策对比表
.policy-table-section {
    padding: 60px 20px;
    background: white;
}

.section-container {
    max-width: 1200px;
    margin: 0 auto;
}

.section-title {
    font-size: 36px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 40px;
    text-align: center;
}

.table-wrapper {
    overflow-x: auto;
}

.policy-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    th {
        background: #4153ff;
        color: white;
        padding: 18px 16px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
    }

    td {
        padding: 18px 16px;
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

    .district {
        font-weight: 600;
        color: #303133;
        font-size: 16px;
    }

    .highlight {
        color: #4153ff;
        font-size: 18px;

        strong {
            font-weight: 700;
        }
    }

    .check {
        color: #67c23a;
        font-weight: bold;
        font-size: 20px;
    }
}

// 政策解读
.policy-detail-section {
    padding: 60px 20px;
    background: #f5f7fa;
}

.policy-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.policy-card {
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

.card-icon {
    font-size: 56px;
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

// CTA 区域
.cta-section {
    padding: 80px 20px;
    background: white;
}

.cta-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    padding: 48px;
    background: #f5f7fa;
    border-radius: 16px;

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
