/**
 * PC Page Builder 类型定义
 *
 * 用途: 为 PC 端动态页面构建器提供完整的 TypeScript 类型支持
 * 支持: 新旧数据格式兼容、Section 组件类型定义、渲染属性规范
 */

/**
 * Section 组件类型枚举
 * 所有可用的页面组件类型（12种）
 */
export type SectionType =
  | 'hero-banner'      // 大图横幅
  | 'feature-grid'     // 特性展示
  | 'rich-text'        // 图文混排
  | 'image-carousel'   // 图片轮播
  | 'stats-bar'        // 数据统计条
  | 'testimonials'     // 客户评价
  | 'faq-accordion'    // FAQ 折叠
  | 'cta-section'      // 行动号召
  | 'card-list'        // 卡片列表
  | 'contact-form'     // 联系表单
  | 'divider'          // 分隔线
  | 'custom-html'      // 自定义 HTML

/**
 * 通用 Section 接口
 * 所有 section 组件的基础结构
 */
export interface Section {
  /** 语义化唯一标识 */
  id: string
  /** 组件类型 */
  type: SectionType
  /** 管理员可读标题 */
  title: string
  /** 是否显示 */
  visible: boolean
  /** 组件特有属性 */
  props: Record<string, any>
  /** 可选 CSS 样式覆盖 */
  styles?: SectionStyles
}

/**
 * Section 样式接口
 * 使用标准 CSS 属性名（camelCase）
 */
export interface SectionStyles {
  /** 内边距 */
  padding?: string
  /** 上内边距 */
  paddingTop?: string
  /** 下内边距 */
  paddingBottom?: string
  /** 背景色 */
  backgroundColor?: string
  /** 背景图 */
  backgroundImage?: string
  /** 文字颜色 */
  color?: string
  /** 文字对齐 */
  textAlign?: 'left' | 'center' | 'right'
}

/**
 * 页面设置接口
 */
export interface PageSettings {
  /** 内容区域最大宽度 */
  maxWidth: string
  /** section 之间的全局间距 */
  gap: string
  /** 页面全局背景色 */
  backgroundColor: string
}

/**
 * 元数据接口
 */
export interface PageMeta {
  /** Schema 版本号 */
  version: string
  /** 对应 la_decorate_page.id */
  pageId: number
  /** 页面类型标识 */
  pageType: string
  /** 生成方式：agent 或 manual */
  generatedBy?: 'agent' | 'manual'
  /** ISO 8601 时间戳 */
  updatedAt?: string
}

/**
 * 完整页面数据接口（新格式）
 */
export interface PageData {
  /** 元数据 */
  _meta: PageMeta
  /** 全局设置 */
  settings: PageSettings
  /** Section 列表 */
  sections: Section[]
}

/**
 * 旧 Widget 接口（兼容旧格式）
 */
export interface LegacyWidget {
  /** Widget 标题 */
  title: string
  /** Widget 名称标识 */
  name: string
  /** 是否禁用 */
  disabled?: number
  /** Widget 内容 */
  content: Record<string, any>
  /** Widget 样式 */
  styles?: Record<string, any>
}

/**
 * 旧格式数据结构
 */
export type LegacyPageData = LegacyWidget[]

/**
 * Hero Banner Props
 */
export interface HeroBannerProps {
  /** 主标题 */
  heading: string
  /** 副标题 */
  subheading?: string
  /** 背景图 URL */
  backgroundImage?: string
  /** 背景色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 文字对齐 */
  textAlign?: 'left' | 'center'
  /** 高度 */
  height?: string
  /** 按钮文字 */
  ctaText?: string
  /** 按钮链接 */
  ctaLink?: string
  /** 按钮样式 */
  ctaStyle?: 'primary' | 'outline' | 'link'
}

/**
 * Feature Grid Props
 */
export interface FeatureGridProps {
  /** 区域标题 */
  heading?: string
  /** 区域副标题 */
  subheading?: string
  /** 列数 */
  columns?: 2 | 3 | 4
  /** 特性项列表 */
  items: Array<{
    /** emoji 或图标名 */
    icon: string
    /** 标题 */
    title: string
    /** 描述 */
    description: string
  }>
}

/**
 * Rich Text Props
 */
export interface RichTextProps {
  /** 布局方式 */
  layout?: 'text-only' | 'left-image' | 'right-image' | 'full-width'
  /** 标题 */
  heading?: string
  /** 正文内容（支持基础 HTML） */
  content: string
  /** 配图 URL */
  image?: string
  /** 图片描述 */
  imageAlt?: string
  /** 底部按钮文字 */
  ctaText?: string
  /** 底部按钮链接 */
  ctaLink?: string
}

/**
 * Image Carousel Props
 */
export interface ImageCarouselProps {
  /** 轮播高度 */
  height?: string
  /** 自动播放 */
  autoplay?: boolean
  /** 切换间隔（毫秒） */
  interval?: number
  /** 图片项列表 */
  items: Array<{
    /** 图片 URL */
    image: string
    /** 图片标题 */
    title?: string
    /** 点击跳转 URL */
    link?: string
  }>
}

/**
 * Stats Bar Props
 */
export interface StatsBarProps {
  /** 数据项列表 */
  items: Array<{
    /** 数字文本 */
    value: string
    /** 描述文字 */
    label: string
    /** emoji */
    icon?: string
  }>
}

/**
 * Testimonials Props
 */
export interface TestimonialsProps {
  /** 区域标题 */
  heading?: string
  /** 列数 */
  columns?: 2 | 3
  /** 评价项列表 */
  items: Array<{
    /** 头像 URL */
    avatar?: string
    /** 姓名 */
    name: string
    /** 职位/公司 */
    role?: string
    /** 评价内容 */
    content: string
    /** 评分（1-5星） */
    rating?: number
  }>
}

/**
 * FAQ Accordion Props
 */
export interface FaqAccordionProps {
  /** 区域标题 */
  heading?: string
  /** 问答项列表 */
  items: Array<{
    /** 问题 */
    question: string
    /** 答案（支持基础 HTML） */
    answer: string
  }>
}

/**
 * CTA Section Props
 */
export interface CtaSectionProps {
  /** 主标题 */
  heading: string
  /** 副标题 */
  subheading?: string
  /** 按钮文字 */
  ctaText: string
  /** 按钮链接 */
  ctaLink?: string
  /** 背景图 URL */
  backgroundImage?: string
  /** 背景色 */
  backgroundColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 样式 */
  style?: 'centered' | 'split'
}

/**
 * Card List Props
 */
export interface CardListProps {
  /** 区域标题 */
  heading?: string
  /** 数据源 */
  source?: 'manual' | 'article-latest' | 'article-hot'
  /** 列数 */
  columns?: 2 | 3 | 4
  /** 自动拉取数量 */
  limit?: number
  /** 是否显示图片 */
  showImage?: boolean
  /** 是否显示标签 */
  showTag?: boolean
  /** 卡片项列表（source为manual时使用） */
  items?: Array<{
    /** 封面图 URL */
    image?: string
    /** 标题 */
    title: string
    /** 摘要 */
    description?: string
    /** 标签 */
    tag?: string
    /** 跳转链接 */
    link?: string
  }>
}

/**
 * Contact Form Props
 */
export interface ContactFormProps {
  /** 标题 */
  heading: string
  /** 副标题 */
  subheading?: string
  /** 表单字段列表 */
  fields: Array<{
    /** 字段标识 */
    name: string
    /** 显示标签 */
    label: string
    /** 字段类型 */
    type?: 'text' | 'email' | 'phone' | 'select' | 'textarea'
    /** 是否必填 */
    required?: boolean
    /** 占位符 */
    placeholder?: string
    /** 选项（type为select时） */
    options?: string[]
  }>
  /** 提交按钮文字 */
  submitText?: string
  /** 成功提示消息 */
  successMessage?: string
}

/**
 * Divider Props
 */
export interface DividerProps {
  /** 分隔线样式 */
  style?: 'line' | 'space' | 'gradient'
  /** 高度 */
  height?: string
  /** 颜色（仅style为line时生效） */
  color?: string
}

/**
 * Custom HTML Props
 */
export interface CustomHtmlProps {
  /** HTML 内容 */
  html: string
}

/**
 * Section Props 类型映射
 * 根据 section.type 确定 props 的具体类型
 */
export type SectionPropsMap = {
  'hero-banner': HeroBannerProps
  'feature-grid': FeatureGridProps
  'rich-text': RichTextProps
  'image-carousel': ImageCarouselProps
  'stats-bar': StatsBarProps
  'testimonials': TestimonialsProps
  'faq-accordion': FaqAccordionProps
  'cta-section': CtaSectionProps
  'card-list': CardListProps
  'contact-form': ContactFormProps
  'divider': DividerProps
  'custom-html': CustomHtmlProps
}

/**
 * 获取指定 Section 类型的 Props 类型
 */
export type GetSectionProps<T extends SectionType> = SectionPropsMap[T]
