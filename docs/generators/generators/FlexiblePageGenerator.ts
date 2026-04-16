/**
 * 灵活的页面代码生成器
 * 
 * 支持预定义组件、自定义组件和原始模板三种模式
 */

import { getComponentTemplate, validateComponentConfig } from '../libraries/component-library'
import type { PageConfig } from './types'

export class FlexiblePageGenerator {
  /**
   * 生成Vue组件代码
   */
  static generate(config: PageConfig): string {
    const { pageInfo, sections } = config

    return `<template>
    <div class="${pageInfo.fileName}-page">
${this.generateTemplate(sections)}
    </div>
</template>

<script lang="ts" setup>
${this.generateScript(sections)}

// SEO 优化
useHead({
  title: '${pageInfo.title}',
  meta: [
    { name: 'description', content: '${pageInfo.description}' },
    { name: 'keywords', content: '${pageInfo.keywords}' }
  ]
})
</script>

<style lang="scss" scoped>
${this.generateStyle(pageInfo.fileName, sections)}
</style>`
  }

  /**
   * 生成template部分
   */
  private static generateTemplate(sections: PageConfig['sections']): string {
    return sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order)
      .map(section => {
        if (section.type.startsWith('custom-')) {
          return this.generateCustomSection(section)
        } else if (section.type.startsWith('raw-')) {
          return section.config.template
        } else {
          return this.generatePredefinedSection(section)
        }
      })
      .join('\n\n')
  }

  /**
   * 生成预定义版块
   */
  private static generatePredefinedSection(section: any): string {
    switch (section.type) {
      case 'page-header':
      case 'hero':
        return this.generatePageHeader(section.config)
      
      case 'mission':
        return this.generateMission(section.config)
      
      case 'text-block':
        return this.generateTextBlock(section.config)
      
      case 'values':
      case 'cards':
        return this.generateCards(section.config)
      
      case 'products':
        return this.generateProducts(section.config)
      
      case 'services':
        return this.generateServices(section.config)
      
      case 'cases':
        return this.generateCases(section.config)
      
      case 'contact':
        return this.generateContact(section.config)
      
      case 'cta':
        return this.generateCTA(section.config)
      
      case 'stats':
        return this.generateStats(section.config)
      
      case 'timeline':
        return this.generateTimeline(section.config)
      
      case 'team':
        return this.generateTeam(section.config)
      
      case 'faq':
        return this.generateFAQ(section.config)
      
      case 'pricing':
        return this.generatePricing(section.config)
      
      case 'testimonials':
        return this.generateTestimonials(section.config)
      
      default:
        return `<!-- 未知版块类型: ${section.type} -->`
    }
  }

  /**
   * 生成自定义版块（基于组件库）
   */
  private static generateCustomSection(section: any): string {
    const { layout, content } = section.config
    
    const layoutClass = layout === 'container' ? 'section-container' : `layout-${layout}`
    
    return `        <!-- 自定义版块 -->
        <section class="custom-section ${layoutClass}">
${this.generateCustomContent(content)}
        </section>`
  }

  /**
   * 生成自定义内容（基于组件库）
   */
  private static generateCustomContent(content: any[]): string {
    return content.map(item => {
      const { component, props } = item
      
      // 验证组件配置
      const validation = validateComponentConfig(component, props)
      if (!validation.valid) {
        return `<!-- 组件错误: ${validation.errors.join(', ')} -->`
      }
      
      // 获取组件模板
      return getComponentTemplate(component, props)
    }).join('\n')
  }

  /**
   * 生成原始版块（完全自定义代码）
   */
  private static generateRawSectionPlaceholder(section: any): string {
    return `        <!-- 原始版块 -->
        <section class="raw-section">
${section.config.template}
        </section>`
  }

  // ============================================================
  // 预定义版块生成方法
  // ============================================================

  private static generatePageHeader(config: any): string {
    return `        <section class="page-header">
            <div class="header-container">
                <h1 class="page-title">${config.title}</h1>
                <p class="page-subtitle">${config.subtitle}</p>
            </div>
        </section>`
  }

  private static generateMission(config: any): string {
    return `        <section class="mission-section">
            <div class="section-container">
                <div class="mission-card">
                    <h2 class="section-title">${config.title}</h2>
                    <blockquote class="mission-quote">
                        "${config.quote}"
                    </blockquote>
                    <p class="mission-desc">
                        ${config.content}
                    </p>
                </div>
            </div>
        </section>`
  }

  private static generateTextBlock(config: any): string {
    return `        <section class="text-block-section">
            <div class="section-container">
                <h2 class="section-title">${config.title}</h2>
                <div class="text-content">
                    ${config.content}
                </div>
            </div>
        </section>`
  }

  private static generateCards(config: any): string {
    const items = config.items.map((item: any) => `                <div class="card">
                    ${item.icon ? `<div class="card-icon">${item.icon}</div>` : ''}
                    ${item.image ? `<img src="${item.image}" alt="${item.title}" class="card-image">` : ''}
                    <h3 class="card-title">${item.title}</h3>
                    ${item.description ? `<p class="card-desc">${item.description}</p>` : ''}
                </div>`).join('\n')

    return `        <section class="cards-section">
            <div class="section-container">
                <h2 class="section-title">${config.title}</h2>
                <div class="cards-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateProducts(config: any): string {
    const items = config.items.map((item: any, index: number) => `                <div class="product-card">
                    <div class="product-image">
                        <div class="image-placeholder">
                            ${item.name || '产品'}
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${item.name}</h3>
                        <p class="product-desc">${item.description}</p>
                        <div class="product-meta">
                            <span class="product-price">${item.price}</span>
                            ${item.badge ? `<el-tag type="success" size="small">${item.badge}</el-tag>` : ''}
                        </div>
                    </div>
                </div>`).join('\n')

    return `        <section class="products-section">
            <div class="section-container">
                <h2 class="section-title">${config.title}</h2>
                <div class="products-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateServices(config: any): string {
    const items = config.items.map((item: any) => `                <div class="service-card">
                    <div class="card-header">
                        <div class="service-icon">${item.icon}</div>
                        <h2 class="service-title">${item.title}</h2>
                    </div>
                    <div class="card-content">
                        <ul class="service-list">
${item.features.map((f: string) => `                            <li>${f}</li>`).join('\n')}
                        </ul>
                    </div>
                </div>`).join('\n')

    return `        <section class="services-section">
            <div class="services-container">
                <h2 class="section-title">${config.title}</h2>
                <div class="services-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateCases(config: any): string {
    const items = config.items.map((item: any) => `                    <div class="case-card">
                        <div class="case-header">
                            <div class="case-avatar">
                                <div class="avatar-placeholder">
                                    ${item.name.charAt(0)}
                                </div>
                            </div>
                            <div class="case-info">
                                <h3 class="case-name">${item.name}</h3>
                                <p class="case-role">${item.category}</p>
                            </div>
                        </div>
                        <div class="case-body">
                            <div class="case-result">
                                <span class="result-label">合作成果</span>
                                <p class="result-value">${item.result}</p>
                            </div>
                            <p class="case-desc">
                                ${item.description}
                            </p>
                        </div>
                    </div>`).join('\n')

    return `        <section class="cases-section">
            <div class="section-container">
                <h2 class="section-title">${config.title}</h2>
                <div class="cases-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateContact(config: any): string {
    const items = config.items.map((item: any) => `                    <div class="contact-item">
                        <div class="contact-icon">${item.icon}</div>
                        <div class="contact-info">
                            <div class="contact-label">${item.label}</div>
                            <div class="contact-value">${item.value}</div>
                        </div>
                    </div>`).join('\n')

    return `        <section class="contact-section">
            <div class="section-container">
                <h2 class="section-title">${config.title}</h2>
                <div class="contact-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateCTA(config: any): string {
    const buttons = config.buttons.map((btn: any) => {
      const btnTag = btn.type === 'primary' ? 'ElButton type="primary"' : 'ElButton'
      return `                    <${btnTag} size="large">
                        ${btn.text}
                    </${btnTag}>`
    }).join('\n')

    return `        <section class="cta-section">
            <div class="cta-container">
                <h2 class="cta-title">${config.title}</h2>
                <p class="cta-subtitle">${config.subtitle}</p>
                <div class="cta-actions">
${buttons}
                </div>
            </div>
        </section>`
  }

  private static generateStats(config: any): string {
    const items = config.items.map((item: any) => `                <div class="stat-item">
                    <div class="stat-value">${item.value}</div>
                    <div class="stat-label">${item.title}</div>
                </div>`).join('\n')

    return `        <section class="stats-section">
            <div class="stats-container">
                <h2 class="section-title">${config.title || '数据统计'}</h2>
                <div class="stats-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateTimeline(config: any): string {
    const items = config.items.map((item: any) => `                <div class="timeline-item">
                    <div class="timeline-year">${item.year || item.date}</div>
                    <div class="timeline-content">
                        <h3 class="timeline-title">${item.title}</h3>
                        ${item.description ? `<p class="timeline-desc">${item.description}</p>` : ''}
                    </div>
                </div>`).join('\n')

    return `        <section class="timeline-section">
            <div class="timeline-container">
                <h2 class="section-title">${config.title || '发展历程'}</h2>
                <div class="timeline">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateTeam(config: any): string {
    const items = config.items.map((item: any) => `                <div class="team-member">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="team-avatar">` : ''}
                    <h3 class="team-name">${item.name}</h3>
                    <p class="team-role">${item.role}</p>
                    ${item.bio ? `<p class="team-bio">${item.bio}</p>` : ''}
                </div>`).join('\n')

    return `        <section class="team-section">
            <div class="team-container">
                <h2 class="section-title">${config.title || '团队介绍'}</h2>
                <div class="team-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateFAQ(config: any): string {
    const items = config.items.map((item: any) => `          <el-collapse-item :title="${item.question}">
              <p>${item.answer}</p>
          </el-collapse-item>`).join('\n')

    return `        <section class="faq-section">
            <div class="section-container">
                <h2 class="section-title">${config.title || '常见问题'}</h2>
                <el-collapse>
${items}
                </el-collapse>
            </div>
        </section>`
  }

  private static generatePricing(config: any): string {
    const items = config.plans.map((plan: any) => `                <div class="pricing-card">
                    <div class="pricing-header">
                        <h3 class="plan-name">${plan.name}</h3>
                        <div class="plan-price">${plan.price}</div>
                        <p class="period">${plan.period}</p>
                    </div>
                    <div class="pricing-features">
                        <ul>
${plan.features.map((f: string) => `                            <li>${f}</li>`).join('\n')}
                        </ul>
                    </div>
                    <div class="pricing-cta">
                        <el-button type="primary">选择此方案</el-button>
                    </div>
                </div>`).join('\n')

    return `        <section class="pricing-section">
            <div class="pricing-container">
                <h2 class="section-title">${config.title || '价格方案'}</h2>
                <div class="pricing-grid">
${items}
                </div>
            </div>
        </section>`
  }

  private static generateTestimonials(config: any): string {
    const items = config.items.map((item: any) => `                <div class="testimonial-card">
                    <div class="testimonial-avatar">
                        <div class="avatar-placeholder">
                            ${item.name.charAt(0)}
                        </div>
                    </div>
                    <p class="testimonial-content">"${item.content}"</p>
                    <div class="testimonial-author">
                        <div class="author-name">${item.name}</div>
                        <div class="author-role">${item.role}</div>
                    </div>
                </div>`).join('\n')

    return `        <section class="testimonials-section">
            <div class="testimonials-container">
                <h2 class="section-title">${config.title || '客户评价'}</h2>
                <div class="testimonials-grid">
${items}
                </div>
            </div>
        </section>`
  }

  // ============================================================
  // Script生成方法
  // ============================================================

  private static generateScript(sections: PageConfig['sections']): string {
    const hasCTA = sections.some(s => s.type === 'cta' && s.enabled)
    const hasForm = sections.some(s => s.type === 'form' && s.enabled)
    const hasTabs = sections.some(s => s.type === 'tabs' && s.enabled)
    
    let script = '// 页面逻辑\n'
    
    if (hasCTA) {
      script += this.generateCTAScript()
    }
    
    if (hasForm) {
      script += this.generateFormScript()
    }
    
    if (hasTabs) {
      script += this.generateTabsScript()
    }
    
    return script || '// 暂无逻辑代码'
  }

  private static generateCTAScript(): string {
    return `// CTA按钮事件
const goToAssessment = () => {
    navigateTo('/')
    setTimeout(() => {
        const formElement = document.getElementById('assessment-form')
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' })
        }
    }, 300)
}

const downloadResources = () => {
    ElMessage.info('更多页面即将上线，敬请期待！')
}
`
  }

  private static generateFormScript(): string {
    return `// 表单数据
const formData = ref({
  name: '',
  email: '',
  message: ''
})

// 表单提交
const handleSubmit = async () => {
  try {
    // 表单验证
    if (!formData.value.name || !formData.value.email) {
      ElMessage.warning('请填写完整信息')
      return
    }
    
    // 提交逻辑
    await $fetch('/api/contact/submit', {
      method: 'POST',
      body: formData.value
    })
    
    ElMessage.success('提交成功！')
    formData.value = { name: '', email: '', message: '' }
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  }
}
`
  }

  private static generateTabsScript(): string {
    return `// 标签页
const activeTab = ref('all')

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}
`
  }

  // ============================================================
  // Style生成方法
  // ============================================================

  private static generateStyle(fileName: string, sections: PageConfig['sections']): string {
    const styles: string[] = []

    // 页面基础样式
    styles.push(`
.${fileName}-page {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
}`)

    // 各个版块的样式
    sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        if (section.type.startsWith('custom-')) {
          // 自定义版块使用基础样式
          styles.push(this.generateCustomSectionStyle())
        } else if (section.type.startsWith('raw-')) {
          // 原始版块不生成样式（包含在template中）
        } else {
          styles.push(this.generatePredefinedSectionStyle(section.type))
        }
      })

    return styles.join('\n\n')
  }

  private static generatePredefinedSectionStyle(type: string): string {
    const styleMap: Record<string, () => string> = {
      'page-header': () => this.generatePageHeaderStyle(),
      'hero': () => this.generatePageHeaderStyle(),
      'mission': () => this.generateMissionStyle(),
      'text-block': () => this.generateTextBlockStyle(),
      'values': () => this.generateCardsStyle(),
      'cards': () => this.generateCardsStyle(),
      'products': () => this.generateProductsStyle(),
      'services': () => this.generateServicesStyle(),
      'cases': () => this.generateCasesStyle(),
      'contact': () => this.generateContactStyle(),
      'cta': () => this.generateCTAStyle(),
      'stats': () => this.generateStatsStyle(),
      'timeline': () => this.generateTimelineStyle(),
      'team': () => this.generateTeamStyle(),
      'faq': () => generateFAQStyle(),
      'pricing': () => generatePricingStyle(),
      'testimonials': () => generateTestimonialsStyle()
    }
    
    const styleFn = styleMap[type]
    return styleFn ? styleFn() : ''
  }

  private static generateCustomSectionStyle(): string {
    return `// 自定义版块样式
.custom-section {
  padding: 60px 20px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}`
  }

  // 复用之前的样式生成方法
  private static generatePageHeaderStyle(): string {
    return `// 页面标题区
.page-header {
    padding: 80px 20px 60px;
    background: #f5f7fa;
    text-align: center;

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
    color: #303133;

    @media (max-width: 768px) {
        font-size: 32px;
    }
}

.page-subtitle {
    font-size: 18px;
    color: #606266;
    opacity: 0.95;

    @media (max-width: 768px) {
        font-size: 16px;
    }
}`
  }

  private static generateMissionStyle(): string {
    return `// 使命宣言
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
    color: var(--primary-color, #4153ff);
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
        color: var(--primary-color, #4153ff);
        opacity: 0.2;
    }
}

.mission-desc {
    font-size: 16px;
    color: #606266;
    line-height: 1.8;
    max-width: 800px;
    margin: 0 auto;
}`
  }

  private static generateCardsStyle(): string {
    return `// 卡片版块
.cards-section,
.values-section {
    padding: 60px 20px;
    background: white;
}

.cards-grid,
.values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 20px;
    }
}

.card,
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

.card-icon,
.value-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.card-title,
.value-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
}

.card-desc,
.value-desc {
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
}`
  }

  private static generateServicesStyle(): string {
    return `// 服务/产品列表
.services-section,
.products-section {
    padding: 60px 20px;
    background: white;
}

.services-container,
.products-container,
.section-container {
    max-width: 1200px;
    margin: 0 auto;
}

.services-grid,
.products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}

.service-card,
.product-card {
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
}

.service-title,
.product-name {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0;
}

.service-list {
    list-style: none;
    padding: 0;
    margin: 0;

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

.product-image {
    margin-bottom: 16px;
}

.image-placeholder {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.product-info {
    text-align: center;
}

.product-desc {
    font-size: 15px;
    color: #606266;
  line-height: 1.6;
  margin: 16px 0;
}

.product-meta {
    display: flex;
    justify-content: center;
  align-items: center;
  gap: 12px;
}

.product-price {
    font-size: 24px;
  font-weight: 700;
  color: var(--primary-color, #4153ff);
}`
  }

  private static generateContactStyle(): string {
    return `// 联系方式
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
}`
  }

  private static generateCTAStyle(): string {
    return `// CTA 区域
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
}`
  }

  private static generateStatsStyle(): string {
    return `// 统计数据
.stats-section {
    padding: 60px 20px;
    background: white;
}

.stats-container {
    max-width: 1200px;
    margin: 0 auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
}

.stat-item {
    text-align: center;
    padding: 32px 24px;
    background: #f5f7fa;
    border-radius: 12px;
}

.stat-value {
    font-size: 48px;
    font-weight: 700;
    color: var(--primary-color, #4153ff);
    margin-bottom: 8px;
}

.stat-label {
    font-size: 16px;
    color: #606266;
}`
  }

  private static generateTimelineStyle(): string {
    return `// 时间线
.timeline-section {
    padding: 60px 20px;
    background: white;
}

.timeline-container {
    max-width: 1000px;
    margin: 0 auto;
}

.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 2px;
    background: #e4e7ed;
}

.timeline-item {
    position: relative;
    margin-bottom: 40px;
}

.timeline-year {
    font-weight: 600;
    font-size: 18px;
    color: var(--primary-color, #4153ff);
    margin-bottom: 12px;
}

.timeline-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
}

.timeline-desc {
    font-size: 15px;
    color: #606266;
    line-height: 1.6;
}`
  }

  private static generateTeamStyle(): string {
    return `// 团队介绍
.team-section {
    padding: 60px 20px;
    background: white;
}

.team-container {
    max-width: 1200px;
    margin: 0 auto;
}

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.team-member {
    text-align: center;
    padding: 32px 24px;
    background: #f5f7fa;
    border-radius: 12px;
}

.team-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.team-name {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
}

.team-role {
    font-size: 14px;
    color: #909399;
    margin-bottom: 12px;
}

.team-bio {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
}`
  }
}

// 辅助函数
function generateFAQStyle(): string {
  return `// 常见问题
.faq-section {
    padding: 60px 20px;
    background: white;
}

.faq-container {
    max-width: 800px;
    margin: 0 auto;
}

.faq-section {
    padding: 60px 20px;
    background: white;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}`
}

function generatePricingStyle(): string {
  return `// 价格方案
.pricing-section {
    padding: 60px 20px;
    background: white;
}

.pricing-container {
    max-width: 1200px;
    margin: 0 auto;
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
}

.pricing-card {
    background: #f5f7fa;
    border-radius: 16px;
    padding: 32px;
    text-align: center;
}

.pricing-header {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e4e7ed;
}

.plan-name {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
}

.plan-price {
    font-size: 36px;
    font-weight: 700;
    color: var(--primary-color, #4153ff);
    margin-bottom: 8px;
}

.period {
    font-size: 14px;
    color: #909399;
}

.pricing-features {
  text-align: left;
  margin: 24px 0;
  padding: 0;
}

.pricing-features ul {
  list-style: none;
  padding: 0;
}

.pricing-features li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #606266;

  &:before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #67c23a;
    font-weight: bold;
  }
}

.pricing-cta {
  margin-top: 24px;
}
`

function generateTestimonialsStyle(): string {
  return `// 客户评价
.testimonials-section {
    padding: 60px 20px;
    background: white;
}

.testimonials-container {
    max-width: 1000px;
    margin: 0 auto;
}

.testimonials-grid {
  display: grid;
    grid-template-columns: repeat(2, 1fr);
  gap: 32px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
}

.testimonial-card {
  background: #f5f7fa;
  padding: 32px;
  border-radius: 12px;
}

.testimonial-avatar {
  margin-bottom: 16px;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.testimonial-content {
  font-size: 16px;
  color: #606266;
  line-height:  1.6;
  font-style: italic;
  margin-bottom: 16px;
  padding: 0 32px;
  border-left: 4px solid var(--primary-color, #4153ff);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.author-role {
  font-size: 14px;
  color: #909399;
}
}
