/**
 * 组件库定义
 * 
 * 提供可复用的组件类型，用于构建自定义页面
 */

export interface ComponentLibrary {
  name: string
  category: ComponentCategory
  description: string
  props: ComponentProp[]
  examples: ComponentExample[]
}

export type ComponentCategory =
  | 'layout'
  | 'content'
  | 'media'
  | 'form'
  | 'navigation'
  | 'data-display'

export interface ComponentProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'color'
  required: boolean
  default?: any
  description: string
  options?: string[]
}

export interface ComponentExample {
  name: string
  props: Record<string, any>
  template: string
}

// 组件库
export const COMPONENT_LIBRARY: ComponentLibrary[] = [
  // ==================== 内容组件 ====================
  {
    name: 'heading',
    category: 'content',
    description: '标题组件',
    props: [
      { name: 'text', type: 'string', required: true, description: '标题文字' },
      { name: 'level', type: 'number', required: false, default: 1, description: '标题级别（1-6）' },
      { name: 'align', type: 'string', required: false, default: 'left', options: ['left', 'center', 'right'], description: '对齐方式' },
      { name: 'color', type: 'color', required: false, description: '文字颜色' }
    ],
    examples: [
      {
        name: '主标题示例',
        props: { text: '关于我们', level: 1, align: 'center' },
        template: '<h1 class="title">关于我们</h1>'
      }
    ]
  },

  {
    name: 'text',
    category: 'content',
    description: '文本组件',
    props: [
      { name: 'content', type: 'string', required: true, description: '文本内容' },
      { name: 'align', type: 'string', required: false, default: 'left', options: ['left', 'center', 'right'], description: '对齐方式' },
      { name: 'size', type: 'string', required: false, default: 'base', options: ['xs', 'sm', 'base', 'lg', 'xl'], description: '文字大小' }
    ],
    examples: [
      {
        name: '段落文本',
        props: { content: '这是一段描述文字...', align: 'left', size: 'base' },
        template: '<p class="text">这是一段描述文字...</p>'
      }
    ]
  },

  {
    name: 'button',
    category: 'content',
    description: '按钮组件',
    props: [
      { name: 'text', type: 'string', required: true, description: '按钮文字' },
      { name: 'type', type: 'string', required: false, default: 'primary', options: ['primary', 'default', 'success', 'warning', 'danger'], description: '按钮类型' },
      { name: 'size', type: 'string', required: false, default: 'default', options: ['large', 'default', 'small'], description: '按钮大小' },
      { name: 'link', type: 'string', required: false, description: '跳转链接' }
    ],
    examples: [
      {
        name: '主要按钮',
        props: { text: '立即咨询', type: 'primary', size: 'large', link: '/contact' },
        template: '<el-button type="primary" size="large" link="/contact">立即咨询</el-button>'
      }
    ]
  },

  // ==================== 媒体组件 ====================
  {
    name: 'image',
    category: 'media',
    description: '图片组件',
    props: [
      { name: 'src', type: 'string', required: true, description: '图片地址' },
      { name: 'alt', type: 'string', required: false, description: '替代文字' },
      { name: 'width', type: 'string', required: false, description: '宽度（如：100%, 600px）' },
      { name: 'height', type: 'string', required: false, description: '高度' },
      { name: 'fit', type: 'string', required: false, default: 'cover', description: '填充方式' }
    ],
    examples: [
      {
        name: '响应式图片',
        props: { src: '/images/hero.jpg', alt: '产品图片', width: '100%', height: '400px', fit: 'cover' },
        template: '<img src="/images/hero.jpg" alt="产品图片" style="width: 100%; height: 400px; object-fit: cover;" />'
      }
    ]
  },

  {
    name: 'video',
    category: 'media',
    description: '视频组件',
    props: [
      { name: 'src', type: 'string', required: true, description: '视频地址' },
      { name: 'poster', type: 'string', required: false, description: '封面图' },
      { name: 'autoplay', type: 'boolean', required: false, default: false, description: '自动播放' },
      { name: 'loop', type: 'boolean', required: false, default: false, description: '循环播放' }
    ],
    examples: [
      {
        name: '产品视频',
        props: { src: '/videos/product-intro.mp4', poster: '/images/poster.jpg', autoplay: false },
        template: '<video src="/videos/product-intro.mp4" poster="/images/poster.jpg" controls></video>'
      }
    ]
  },

  // ==================== 数据展示组件 ====================
  {
    name: 'card',
    category: 'data-display',
    description: '卡片组件',
    props: [
      { name: 'title', type: 'string', required: true, description: '卡片标题' },
      { name: 'description', type: 'string', required: false, description: '卡片描述' },
      { name: 'icon', type: 'string', required: false, description: '图标（emoji）' },
      { name: 'image', type: 'string', required: false, description: '图片地址' },
      { name: 'link', type: 'string', required: false, description: '跳转链接' }
    ],
    examples: [
      {
        name: '图标卡片',
        props: { title: '我们的优势', description: '专业的团队', icon: '🎯' },
        template: `
<div class="card">
  <div class="card-icon">🎯</div>
  <h3 class="card-title">我们的优势</h3>
  <p class="card-desc">专业的团队</p>
</div>
<style scoped>
.card {
  text-align: center;
  padding: 32px 24px;
  background: #f5f7fa;
  border-radius: 12px;
}
.card-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
</style>
`
      }
    ]
  },

  {
    name: 'list',
    category: 'data-display',
    description: '列表组件',
    props: [
      { name: 'items', type: 'array', required: true, description: '列表项' },
      { name: 'type', type: 'string', required: false, default: 'ul', options: ['ul', 'ol', 'custom'], description: '列表类型' },
      { name: 'icon', type: 'string', required: false, description: '列表项图标' }
    ],
    examples: [
      {
        name: '功能列表',
        props: { 
          items: [
            { text: '需求分析', icon: '✓' },
            { text: '方案设计', icon: '✓' },
            { text: '实施部署', icon: '✓' }
          ],
          type: 'ul'
        },
        template: `
<ul class="feature-list">
  <li>✓ 需求分析</li>
  <li>✓ 方案设计</li>
  <li>✓ 实施部署</li>
</ul>
<style scoped>
.feature-list {
  list-style: none;
  padding: 0;
}
.feature-list li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
}
.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: bold;
}
</style>
`
      }
    ]
  },

  {
    name: 'table',
    category: 'data-display',
    description: '表格组件',
    props: [
      { name: 'columns', type: 'array', required: true, description: '列定义' },
      { name: 'data', type: 'array', required: true, description: '表格数据' },
      { name: 'bordered', type: 'boolean', required: false, default: true, description: '是否有边框' }
    ],
    examples: [
      {
        name: '价格表',
        props: {
          columns: [
            { key: 'name', label: '服务项目' },
            { key: 'price', label: '价格' },
            { key: 'description', label: '说明' }
          ],
          data: [
            { name: '基础版', price: '￥2,999/月', description: '适合小团队' },
            { name: '专业版', price: '￥5,999/月', description: '适合中型团队' },
            { name: '企业版', price: '联系我们', description: '按需定制' }
          ]
        },
        template: `
<table class="price-table">
  <thead>
    <tr>
      <th>服务项目</th>
      <th>价格</th>
      <th>说明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>基础版</td>
      <td>￥2,999/月</td>
      <td>适合小团队</td>
    </tr>
  </tbody>
</table>
<style scoped>
.price-table {
  width: 100%;
  border-collapse: collapse;
}
.price-table th,
.price-table td {
  padding: 12px;
  border: 1px solid #e4e7ed;
  text-align: left;
}
.price-table th {
  background: #f5f7fa;
  font-weight: 600;
}
</style>
`
      }
    ]
  },

  {
    name: 'timeline',
    category: 'data-display',
    description: '时间线组件',
    props: [
      { name: 'items', type: 'array', required: true, description: '时间线项目' },
      { name: 'orientation', type: 'string', required: false, default: 'vertical', options: ['vertical', 'horizontal'], description: '方向' }
    ],
    examples: [
      {
        name: '发展历程',
        props: {
          items: [
            { year: '2020', title: '公司成立', description: '开始创业之旅' },
            { year: '2022', title: 'A轮融资', description: '获得千万级投资' },
            { year: '2024', title: '业务扩展', description: '客户突破1000家' }
          ],
          orientation: 'vertical'
        },
        template: `
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-year">2020</div>
    <div class="timeline-content">
      <h3>公司成立</h3>
      <p>开始创业之旅</p>
    </div>
  </div>
</div>
<style scoped>
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
  margin-bottom: 30px;
}
.timeline-year {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 8px;
}
</style>
`
      }
    ]
  },

  // ==================== 表单组件 ====================
  {
    name: 'form',
    category: 'form',
    description: '表单组件',
    props: [
      { name: 'fields', type: 'array', required: true, description: '表单字段' },
      { name: 'action', type: 'string', required: false, description: '提交动作' },
      { name: 'method', type: 'string', required: false, default: 'POST', description: '请求方法' }
    ],
    examples: [
      {
        name: '联系表单',
        props: {
          fields: [
            { name: 'name', label: '姓名', type: 'input', required: true },
            { name: 'email', label: '邮箱', type: 'email', required: true },
            { name: 'message', label: '留言', type: 'textarea', required: true }
          ],
          action: '/api/contact',
          method: 'POST'
        },
        template: `
<el-form @submit="handleSubmit">
  <el-form-item label="姓名">
    <el-input v-model="form.name" />
  </el-form-item>
  <el-form-item label="邮箱">
    <el-input v-model="form.email" type="email" />
  </el-form-item>
  <el-form-item label="留言">
    <el-input v-model="form.message" type="textarea" />
  </el-form-item>
  <el-button type="primary" @click="handleSubmit">提交</el-button>
</el-form>
<script setup lang="ts">
const form = ref({
  name: '',
  email: '',
  message: ''
})
const handleSubmit = async () => {
  // 表单提交逻辑
}
<\/script>
`
      }
    ]
  },

  // ==================== 布局组件 ====================
  {
    name: 'container',
    category: 'layout',
    description: '容器组件',
    props: [
      { name: 'maxWidth', type: 'string', required: false, default: '1200px', description: '最大宽度' },
      { name: 'padding', type: 'string', required: false, default: '60px 20px', description: '内边距' },
      { name: 'background', type: 'color', required: false, description: '背景颜色' }
    ],
    examples: [
      {
        name: '标准容器',
        props: { maxWidth: '1200px', padding: '60px 20px', background: '#f5f7fa' },
        template: `
<div class="section-container">
  <!-- 内容 -->
</div>
<style scoped>
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  background: #f5f7fa;
}
</style>
`
      }
    ]
  },

  {
    name: 'grid',
    category: 'layout',
    description: '网格布局',
    props: [
      { name: 'columns', type: 'number', required: true, description: '列数（2-4）' },
      { name: 'gap', type: 'string', required: false, default: '24px', description: '间距' },
      { name: 'responsive', type: 'boolean', required: false, default: true, description: '响应式' }
    ],
    examples: [
      {
        name: '4列网格',
        props: { columns: 4, gap: '24px', responsive: true },
        template: `
<div class="grid-4">
  <div>项目1</div>
  <div>项目2</div>
  <div>项目3</div>
  <div>项目4</div>
</div>
<style scoped>
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
@media (max-width: 1024px) {
  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
`
      }
    ]
  },

  {
    name: 'flex',
    category: 'layout',
    description: '弹性布局',
    props: [
      { name: 'direction', type: 'string', required: false, default: 'row', options: ['row', 'column'], description: '方向' },
      { name: 'align', type: 'string', required: false, default: 'flex-start', description: '对齐方式' },
      { name: 'gap', type: 'string', required: false, default: '16px', description: '间距' }
    ],
    examples: [
      {
        name: '水平居中',
        props: { direction: 'row', align: 'center', gap: '16px' },
        template: `
<div class="flex-center">
  <div>项目1</div>
  <div>项目2</div>
  <div>项目3</div>
</div>
<style scoped>
.flex-center {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}
</style>
`
      }
    ]
  },

  // ==================== 导航组件 ====================
  {
    name: 'tabs',
    category: 'navigation',
    description: '标签页组件',
    props: [
      { name: 'items', type: 'array', required: true, description: '标签页列表' },
      { name: 'defaultActive', type: 'number', required: false, default: 0, description: '默认激活的标签' }
    ],
    examples: [
      {
        name: '产品分类',
        props: {
          items: [
            { label: '全部', key: 'all' },
            { label: '茶叶', key: 'tea' },
            { label: '茶具', key: 'teapot' },
            { label: '礼品', key: 'gift' }
          ],
          defaultActive: 0
        },
        template: `
<el-tabs v-model="activeTab">
  <el-tab-pane label="全部" name="all">
    全部内容
  </el-tab-pane>
  <el-tab-pane label="茶叶" name="tea">
    茶叶内容
  </el-tab-pane>
</el-tabs>
<script setup lang="ts">
const activeTab = ref('all')
<\/script>
`
      }
    ]
  },

  {
    name: 'accordion',
    category: 'navigation',
    description: '折叠面板组件',
    props: [
      { name: 'items', type: 'array', required: true, description: '面板列表' },
      { name: 'multiple', type: 'boolean', required: false, default: false, description: '是否可展开多个' }
    ],
    examples: [
      {
        name: 'FAQ常见问题',
        props: {
          items: [
            { title: '如何发货？', content: '我们使用顺丰快递，全国包邮' },
            { title: '支持退换货吗？', content: '7天无理由退换货' }
          ],
          multiple: true
        },
        template: `
<el-collapse v-model="activeNames">
  <el-collapse-item title="如何发货？" name="1">
    <p>我们使用顺丰快递，全国包邮</p>
  </el-collapse-item>
  <el-collapse-item title="支持退换货吗？" name="2">
    <p>7天无理由退换货</p>
  </el-collapse-item>
</el-collapse>
<script setup lang="ts">
const activeNames = ref(['1'])
<\/script>
`
      }
    ]
  },

  // ==================== 其他组件 ====================
  {
    name: 'divider',
    category: 'layout',
    description: '分隔线组件',
    props: [
      { name: 'text', type: 'string', required: false, description: '分隔线文字' },
      { name: 'dashed', type: 'boolean', required: false, default: false, description: '是否虚线' },
      { name: 'margin', type: 'string', required: false, default: '40px 0', description: '上下边距' }
    ],
    examples: [
      {
        name: '文字分隔线',
        props: { text: '或', margin: '20px 0', dashed: false },
        template: `
<div class="divider">
  <span class="divider-text">或</span>
</div>
<style scoped>
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}
.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-top: 1px solid #e4e7ed;
}
.divider-text {
  padding: 0 16px;
  color: #909399;
}
</style>
`
      }
    ]
  },

  {
    name: 'spacer',
    category: 'layout',
    description: '空白间隔组件',
    props: [
      { name: 'height', type: 'string', required: false, default: '40px', description: '间隔高度' }
    ],
    examples: [
      {
        name: '40px间隔',
        props: { height: '40px' },
        template: `<div style="height: 40px"></div>`
      }
    ]
  },

  {
    name: 'badge',
    category: 'data-display',
    description: '徽章组件',
    props: [
      { name: 'text', type: 'string', required: true, description: '徽章文字' },
      { name: 'type', type: 'string', required: false, default: 'success', options: ['success', 'info', 'warning', 'danger'], description: '徽章类型' }
    ],
    examples: [
      {
        name: '热销标签',
        props: { text: '热销', type: 'success' },
        template: `<el-tag type="success">热销</el-tag>`
      }
    ]
  },

  {
    name: 'progress',
    category: 'data-display',
    description: '进度条组件',
    props: [
      { name: 'percentage', type: 'number', required: true, description: '进度百分比（0-100）' },
      { name: 'status', type: 'string', required: false, description: '状态文字' },
      { name: 'color', type: 'string', required: false, description: '进度条颜色' }
    ],
    examples: [
      {
        name: '项目进度',
        props: { percentage: 75, status: '进行中', color: '#409eff' },
        template: `
<el-progress :percentage="75" :status="'success'" />
`
      }
    ]
  },

  {
    name: 'alert',
    category: 'content',
    description: '警告提示组件',
    props: [
      { name: 'title', type: 'string', required: false, description: '标题' },
      { name: 'content', type: 'string', required: true, description: '内容' },
      { name: 'type', type: 'string', required: false, default: 'info', options: ['success', 'info', 'warning', 'error'], description: '类型' },
      { name: 'closable', type: 'boolean', required: false, default: false, description: '是否可关闭' }
    ],
    examples: [
      {
        name: '提示信息',
        props: { title: '提示', content: '这是一条重要提示信息', type: 'info', closable: true },
        template: `
<el-alert title="提示" type="info" closable>
  这是一条重要提示信息
</el-alert>
`
      }
    ]
  }
]

/**
 * 获取组件模板
 */
export function getComponentTemplate(componentName: string, props: Record<string, any>): string {
  const component = COMPONENT_LIBRARY.find(c => c.name === componentName)
  
  if (!component) {
    throw new Error(`组件不存在: ${componentName}`)
  }
  
  const example = component.examples.find(e => {
    // 检查props是否匹配
    return Object.keys(e.props).every(key => 
      props[key] === undefined || props[key] === e.props[key]
    )
  })
  
  return example?.template || `<div class="component-${componentName}">组件实现</div>`
}

/**
 * 验证组件配置
 */
export function validateComponentConfig(componentName: string, props: Record<string, any>): {
  valid: boolean
  errors: string[]
} {
  const component = COMPONENT_LIBRARY.find(c => c.name === componentName)
  
  if (!component) {
    return {
      valid: false,
      errors: [`组件不存在: ${componentName}`]
    }
  }
  
  const errors: string[] = []
  
  // 检查必需字段
  for (const prop of component.props) {
    if (prop.required && props[prop.name] === undefined) {
      errors.push(`缺少必需字段: ${prop.name}`)
    }
    
    // 检查类型
    if (props[prop.name] !== undefined) {
      if (prop.type === 'array' && !Array.isArray(props[prop.name])) {
        errors.push(`${prop.name} 应该是数组`)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
