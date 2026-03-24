<template>
    <div class="community-page">
        <!-- 页面标题区域 -->
        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">社区动态</h1>
                <p class="page-subtitle">OPC创业社区最新资讯与活动</p>
            </div>
        </section>

        <!-- 最新活动 -->
        <section class="events-section">
            <div class="section-container">
                <h2 class="section-title">最新活动</h2>
                <div class="events-grid">
                    <div class="event-card">
                        <div class="event-badge">🎯 创业训练营</div>
                        <h3 class="event-title">OPC创业训练营</h3>
                        <p class="event-time">
                            <ElIcon><Calendar /></ElIcon>
                            2026-03-25
                        </p>
                        <p class="event-desc">
                            为期3天的集中训练营，涵盖商业模式打磨、BP撰写、路演技巧等核心内容。
                        </p>
                        <div class="event-cta">
                            <ElButton type="primary" link>立即报名 →</ElButton>
                        </div>
                    </div>

                    <div class="event-card">
                        <div class="event-badge">💼 沙龙</div>
                        <h3 class="event-title">政策解读沙龙</h3>
                        <p class="event-time">
                            <ElIcon><Calendar /></ElIcon>
                            2026-04-01
                        </p>
                        <p class="event-desc">
                            邀请政府政策专家，深度解读深圳各区最新的OPC扶持政策。
                        </p>
                        <div class="event-cta">
                            <ElButton type="primary" link>预约席位 →</ElButton>
                        </div>
                    </div>

                    <div class="event-card">
                        <div class="event-badge">🤝 对接会</div>
                        <h3 class="event-title">创业者对接会</h3>
                        <p class="event-time">
                            <ElIcon><Calendar /></ElIcon>
                            2026-04-10
                        </p>
                        <p class="event-desc">
                            连接投资机构、政府园区、技术服务商，为OPC创业者提供资源对接。
                        </p>
                        <div class="event-cta">
                            <ElButton type="primary" link>了解详情 →</ElButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 社区资讯 -->
        <section class="news-section">
            <div class="section-container">
                <h2 class="section-title">社区资讯</h2>
                <div class="news-list">
                    <div class="news-item">
                        <div class="news-date">2026-03-15</div>
                        <h3 class="news-title">深圳发布OPC扶持新政</h3>
                        <p class="news-summary">
                            深圳发布最新的OPC扶持政策，包括最高1000万跟投、人才补贴、算力券等多项支持措施...
                        </p>
                        <ElButton type="primary" link>查看详情 →</ElButton>
                    </div>

                    <div class="news-item">
                        <div class="news-date">2026-03-10</div>
                        <h3 class="news-title">OPC模式在中国的发展趋势</h3>
                        <p class="news-summary">
                            随着AI技术的普及，一人公司正在成为新的创业趋势。OPC模式结合了公司制度的优势和个体经营的灵活性...
                        </p>
                        <ElButton type="primary" link>阅读更多 →</ElButton>
                    </div>

                    <div class="news-item">
                        <div class="news-date">2026-03-05</div>
                        <h3 class="news-title">技术赋能：算力券申领指南</h3>
                        <p class="news-summary">
                            为支持AI创业，深圳各区推出算力券补贴政策。本文详细介绍申请条件、流程和注意事项...
                        </p>
                        <ElButton type="primary" link>下载指南 →</ElButton>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA 区域 -->
        <section class="cta-section">
            <div class="cta-container">
                <h2 class="cta-title">加入OPC创业社区</h2>
                <p class="cta-subtitle">与100+ OPC创业者一起交流学习</p>
                <div class="cta-actions">
                    <ElButton type="primary" size="large" @click="goToAssessment">
                        立即加入
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
import { Calendar } from '@element-plus/icons-vue'

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

// 返回首页
const goToHome = () => {
    navigateTo('/')
}

// SEO 优化
useHead({
    title: '社区动态 - OPC创业社区',
    meta: [
        { name: 'description', content: 'OPC创业社区最新资讯与活动：创业训练营、政策解读沙龙、创业者对接会等' },
        { name: 'keywords', content: 'OPC社区,创业活动,政策解读,创业者交流,创业培训' }
    ]
})
</script>

<style lang="scss" scoped>
.community-page {
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

// 最新活动
.events-section {
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

.events-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.event-card {
    background: #f5f7fa;
    padding: 32px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        background: white;
    }
}

.event-badge {
    display: inline-block;
    padding: 6px 16px;
    background: #4153ff;
    color: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
}

.event-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.event-time {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #909399;
    font-size: 14px;
    margin-bottom: 16px;

    .el-icon {
        font-size: 16px;
    }
}

.event-desc {
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 20px;
}

.event-cta {
    margin-top: 16px;
}

// 社区资讯
.news-section {
    padding: 60px 20px;
    background: #f5f7fa;
}

.news-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.news-item {
    background: white;
    padding: 32px;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }
}

.news-date {
    color: #909399;
    font-size: 14px;
    margin-bottom: 12px;
}

.news-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.news-summary {
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
    margin-bottom: 16px;
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
