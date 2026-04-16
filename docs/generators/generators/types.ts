/**
 * 页面配置类型定义
 * 
 * 对应 page-config.schema.json
 */

export interface PageConfig {
  pageInfo: PageInfo
  sections: Section[]
}

export interface PageInfo {
  fileName: string
  title: string
  description: string
  keywords: string
}

export type Section =
  | PageHeaderSection
  | MissionSection
  | ValuesSection
  | ProductsSection
  | ServicesSection
  | CasesSection
  | ContactSection
  | CTASection

export interface SectionBase {
  enabled: boolean
  order: number
}

// 页面标题区
export interface PageHeaderSection extends SectionBase {
  type: 'page-header'
  config: {
    title: string
    subtitle: string
  }
}

// 使命宣言
export interface MissionSection extends SectionBase {
  type: 'mission'
  config: {
    title: string
    quote: string
    content: string
  }
}

// 价值观卡片
export interface ValuesSection extends SectionBase {
  type: 'values'
  config: {
    title: string
    items: ValueItem[]
  }
}

export interface ValueItem {
  icon: string
  title: string
  description: string
}

// 产品展示
export interface ProductsSection extends SectionBase {
  type: 'products'
  config: {
    title: string
    items: ProductItem[]
  }
}

export interface ProductItem {
  name: string
  description: string
  price: string
  badge: string
}

// 服务列表
export interface ServicesSection extends SectionBase {
  type: 'services'
  config: {
    title: string
    items: ServiceItem[]
  }
}

export interface ServiceItem {
  icon: string
  title: string
  description: string
  features: string[]
}

// 案例展示
export interface CasesSection extends SectionBase {
  type: 'cases'
  config: {
    title: string
    items: CaseItem[]
  }
}

export interface CaseItem {
  name: string
  category: string
  description: string
  result: string
}

// 联系方式
export interface ContactSection extends SectionBase {
  type: 'contact'
  config: {
    title: string
    items: ContactItem[]
  }
}

export interface ContactItem {
  icon: string
  label: string
  value: string
}

// CTA行动号召
export interface CTASection extends SectionBase {
  type: 'cta'
  config: {
    title: string
    subtitle: string
    buttons: CTAButton[]
  }
}

export interface CTAButton {
  text: string
  type: 'primary' | 'default'
}
