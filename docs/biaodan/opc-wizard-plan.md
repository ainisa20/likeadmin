# OPC 创业落地分析 — 引导式流程实施方案

> 纯前端引导组件 + 独立 Dify 应用（OPC 专用，与聊天窗口的 Dify 应用分开）
> 不影响现有 DifyChat 自由对话功能
> OPC Dify Token: `app-ItrLHzXgkL9jCMTMHEAIKkvz`（独立应用，聊天窗口用另一个挂知识库的应用）

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────────┐
│  DifyChat 聊天窗口（现有功能不变）                           │
│                                                         │
│  ┌─ 正常模式 ─────────────────────────────────────────┐  │
│  │ 自由对话 + 建议提问 + 欢迎消息                       │  │
│  │                                                    │  │
│  │ 欢迎区域新增入口卡片:                               │  │
│  │ ┌──────────────────────────────┐                   │  │
│  │ │ 🚀 OPC创业落地分析            │                   │  │
│  │ │ 一键生成你的专属创业分析报告    │                   │  │
│  │ └──────────────────────────────┘                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                         │
│  点击入口卡片 → 切换到引导模式                               │
│                                                         │
│  ┌─ 引导模式（WizardMode 组件）────────────────────────┐  │
│  │                                                    │  │
│  │  Step 1  方向输入 + 主题匹配                         │  │
│  │    用户输入一句话 → 调 Dify（匹配 prompt）→ 返回主题  │  │
│  │    → 前端加载该主题的 standardItems → 用户勾选        │  │
│  │    → 展示选中项的 detail（许可、包含/不含）            │  │
│  │                                                    │  │
│  │  Step 2  分步表单收集（4组卡片）                       │  │
│  │    ① 基础身份 → ② 团队资金 → ③ 技术需求 → ④ 规划     │  │
│  │                                                    │  │
│  │  Step 3  确认信息 + 生成报告                         │  │
│  │    汇总展示 → 用户确认 → 调 Dify（报告 prompt）      │  │
│  │    → 退出引导模式 → 报告流式输出到聊天窗口             │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 数据流全景

```
              用户输入方向
                  │
                  ▼
    ┌─── Dify（主题匹配 prompt）────┐
    │  query 中拼接 84 条 themeName  │
    │  + 用户的一句话                 │
    │  输出: {themeName, category}   │
    │  方式: blocking（非流式）       │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─── 前端按需加载 ───────────┐
    │  themes/{themeName}.json    │
    │  该主题下的 standardItems    │
    │  → 用户勾选 → 展示 detail   │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─── 纯前端表单（4组）───────┐
    │  身份 → 团队 → 技术 → 规划  │
    └──────────────┬──────────────┘
                   │
                   ▼
    ┌─── Dify（报告生成 prompt）──┐
    │  query 中拼接全部结构化数据    │
    │  + 报告模板指令               │
    │  输出: Markdown 报告（流式）  │
    │  → 写入聊天窗口消息流         │
    └──────────────────────────────┘

    ※ 两次调用使用同一个 OPC Dify App（opcToken）
    ※ 聊天窗口用的是另一个 Dify App（config.token，挂知识库）
    ※ 两个应用完全独立，互不影响
```

---

## 二、数据预处理

### 2.1 输入

`docs/biaodan/theme_full_shenzhen.json`（76,614 行，84 个主题）

### 2.2 输出

#### ① `pc/public/themes/index.json`（~3KB，前端首屏加载）

```json
[
  {
    "id": "2b6e979a89477f6fe2b35903c0887acc",
    "themeName": "我要开餐饮服务公司",
    "category": "餐饮服务"
  },
  {
    "id": "xxx",
    "themeName": "我要开科技公司",
    "category": "科技服务"
  }
]
```

共 84 条。仅用于 Dify App A 的 Prompt 构建 + 前端匹配结果回查。

#### ② `pc/public/themes/{themeId}.json`（每个 5-20KB，按需加载）

以 `2b6e979a...json` 为例：

```json
{
  "themeName": "我要开餐饮服务公司",
  "category": "餐饮服务",
  "items": [
    {
      "scopeId": "d7f8226e...",
      "standardItem": "餐饮管理",
      "scopeCode": "L2015",
      "description": "指从事餐饮管理的活动。不包括餐饮服务、食品经营管理。",
      "permitType": 0,
      "detail": {
        "isPermission": "否",
        "permitExplain": "",
        "includedItems": "家宴管理服务",
        "notIncluded": "餐饮服务；食品经营管理",
        "remarks": "依据《食品经营许可和备案管理办法》..."
      }
    }
  ]
}
```

### 2.3 数据处理脚本

写一个 Node.js 脚本 `scripts/split-themes.js` 执行一次：

```javascript
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('docs/biaodan/theme_full_shenzhen.json', 'utf8'))

// 生成 index.json
const index = data.map(t => ({
  id: t.themeId,
  themeName: t.themeName,
  category: t.category
}))
fs.writeFileSync('pc/public/themes/index.json', JSON.stringify(index, null, 2))

// 生成每个主题的独立文件
for (const theme of data) {
  const simplified = {
    themeName: theme.themeName,
    category: theme.category,
    items: theme.items.map(item => ({
      scopeId: item.scopeId,
      standardItem: item.standardItem,
      scopeCode: item.scopeCode,
      description: item.description,
      permitType: item.permitType,
      detail: item.detail
    }))
  }
  fs.writeFileSync(`pc/public/themes/${theme.themeId}.json`, JSON.stringify(simplified, null, 2))
}

console.log(`Generated index.json + ${data.length} theme files`)
```

---

## 三、Dify 调用设计（OPC 专用应用）

**核心思路**：OPC 引导流程使用独立的 Dify 应用（`app-ItrLHzXgkL9jCMTMHEAIKkvz`），与聊天窗口的 Dify 应用（挂知识库的）完全分离。前端通过构造不同的 `query` 内容来区分"主题匹配"和"报告生成"两种模式。

**两个 Dify 应用：**
- `config.token` → 聊天窗口（现有，挂知识库，自由对话）
- `config.opcToken` → OPC 引导流程（独立应用，匹配 + 报告）

### 3.1 调用一：主题匹配（blocking）

前端构造 query，将 84 条主题列表 + 用户输入拼接在一起发送：

```typescript
async function matchTheme(userInput: string): Promise<ThemeMatchResult> {
  const config = useDifyStore().config

  const themeIndex = await fetch('/themes/index.json').then(r => r.json())
  const themeListText = themeIndex.map((t, i) => `${i + 1}. ${t.themeName} (${t.category})`).join('\n')

  const query = `请从以下84个创业主题中，为用户的创业描述选择最匹配的1-3个主题。

## 主题列表
${themeListText}

## 用户的创业描述
${userInput}

## 要求
严格返回JSON，不要任何其他文字：
{"matches":[{"themeName":"主题名","category":"分类","confidence":0.95,"reason":"匹配理由(不超过30字)}]}`

  const response = await fetch(`${config.baseUrl}/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.opcToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      response_mode: 'blocking',
      user: getUserId(),
      inputs: {}
    })
  })

  const data = await response.json()
  return JSON.parse(data.answer)
}
```

### 3.2 调用二：报告生成（streaming）

前端将所有收集到的信息拼接为结构化 query，流式获取报告：

```typescript
async function generateReport(
  wizardData: WizardState,
  onChunk: (text: string) => void,
  onComplete: (conversationId: string) => void
): Promise<void> {
  const config = useDifyStore().config

  const scopeDetails = wizardData.selectedScopeIds.map(id => {
    const item = wizardData.themeData!.items.find(i => i.scopeId === id)
    return `${item!.standardItem}(${item!.scopeCode},${item!.permitType === 0 ? '无需许可' : '需许可'})`
  }).join('; ')

  const query = `请根据以下创业信息，生成完整的《九章数智·OPC创业落地分析报告》。

## 创业方向
主题：${wizardData.themeData!.themeName}
分类：${wizardData.themeData!.category}
业务描述：${wizardData.directionInput}

## 选定经营范围
${scopeDetails}

## 身份信息
姓名：${wizardData.identity.name}
身份：${wizardData.identity.identityType}
注册区域：${wizardData.identity.registerArea}

## 团队与资金
团队人数：${wizardData.team.size}人
启动资金：${wizardData.team.budget}
生活预留：${wizardData.team.livingFund}

## 技术需求
云服务器：${wizardData.tech.needServer ? '需要' : '不需要'}
AI日均调用：${wizardData.tech.aiCallsPerDay}
海外市场：${wizardData.tech.overseas ? '是' : '否'}

## 规划
注册时间：${wizardData.plan.registerTime}
代办服务：${wizardData.plan.services.join('、')}

## 报告结构要求
一、公司命名建议（推荐3个名称+寓意）
二、经营范围建议及冲突预检（表格+冲突预警+结论）
三、可申领补贴与收益预估（成本表+补贴表+净收益测算）
四、下一步行动清单（含时间节点）`

  const response = await fetch(`${config.baseUrl}/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.opcToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      response_mode: 'streaming',
      user: getUserId(),
      inputs: {}
    })
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim()
        if (!jsonStr || jsonStr === '[DONE]') continue
        try {
          const chunk = JSON.parse(jsonStr)
          if (chunk.event === 'message' && chunk.answer) {
            onChunk(chunk.answer)
          } else if (chunk.event === 'message_end' && chunk.conversation_id) {
            onComplete(chunk.conversation_id)
          }
        } catch (e) { /* skip */ }
      }
    }
  }
}
```

### 3.3 关键简化

| 项目 | 说明 |
|------|------|
| OPC 应用 | 独立 Dify 应用（`app-ItrLHzXgkL9jCMTMHEAIKkvz`），不挂知识库 |
| 聊天应用 | 现有 Dify 应用（`config.token`），挂知识库，自由对话 |
| 后端新增 | 只加一个 `opcToken` 配置字段 |
| Dify 配置 | OPC 应用 System Prompt 设为通用"九章数智创业顾问"角色即可 |
| 区分匹配/报告 | 前端构造不同 query 内容，无需 Dify 内做分支 |

---

## 四、前端组件设计

### 4.1 文件结构

```
pc/components/DifyChat/
├── index.vue                  # 修改：+入口卡片 +引导模式切换
├── WizardMode.vue             # 新增：引导模式主容器
├── steps/
│   ├── DirectionStep.vue      # 新增：Step 1 方向输入+主题匹配+经营范围选择
│   ├── IdentityStep.vue       # 新增：Step 2a 基础身份
│   ├── TeamStep.vue           # 新增：Step 2b 团队与资金
│   ├── TechStep.vue           # 新增：Step 2c 技术需求
│   └── PlanStep.vue           # 新增：Step 2d 规划
└── ConfirmStep.vue            # 新增：Step 3 确认信息

pc/composables/
└── useWizard.ts               # 新增：引导流程状态管理 + Dify 调用逻辑

pc/public/themes/
├── index.json                 # 新增：84条主题索引
└── {themeId}.json             # 新增：每个主题的详细数据（84个文件）
```

### 4.2 useWizard.ts 状态管理

```typescript
// pc/composables/useWizard.ts
import { reactive, computed } from 'vue'

interface WizardState {
  // 流程控制
  active: boolean           // 引导模式是否激活
  currentStep: number       // 当前步骤 1-6

  // Step 1: 方向匹配
  directionInput: string    // 用户输入的创业方向
  isMatching: boolean       // 正在匹配中
  matchResult: ThemeMatchResult | null
  selectedThemeId: string   // 选中的主题 ID
  themeData: ThemeData | null  // 加载的主题数据
  selectedScopeIds: string[]   // 用户勾选的经营范围 ID

  // Step 2: 表单数据
  identity: {
    name: string
    identityType: string    // 在校大学生 | 毕业5年内大学生 | 深户登记失业 | 其他
    registerArea: string    // 龙岗区 | 罗湖区 | 光明区 | 其他
  }
  team: {
    size: number
    education: string       // 本科 | 硕士 | 博士
    budget: string          // 1万以下 | 1-5万 | 5-10万 | 10万以上
    livingFund: string      // 3万 | 5万 | 8万以上
  }
  tech: {
    needServer: boolean
    aiCallsPerDay: string   // 1000以下 | 1万左右 | 5万以上
    overseas: boolean
  }
  plan: {
    registerTime: string    // 本月内 | 1-3个月 | 3个月以上
    services: string[]      // 企业注册 | 代记账 | 补贴申报 | 全部需要
  }

  // Step 3: 报告生成
  isGenerating: boolean
}

export function useWizard() {
  const state = reactive<WizardState>({
    active: false,
    currentStep: 1,
    // ... 初始化所有字段
  })

  // Actions
  const startWizard = () => { state.active = true; state.currentStep = 1 }

  const matchDirection = async (input: string) => { /* 调 Dify（匹配 prompt） */ }
  const loadThemeData = async (themeId: string) => { /* fetch /themes/{id}.json */ }
  const nextStep = () => { state.currentStep++ }
  const prevStep = () => { state.currentStep-- }
  const confirmAndGenerate = async () => { /* 退出引导 → 调 Dify（报告 prompt）→ 流式写入聊天 */ }
  const cancelWizard = () => { state.active = false }

  return { state, startWizard, matchDirection, loadThemeData, nextStep, prevStep, confirmAndGenerate, cancelWizard }
}
```

### 4.3 DifyChat/index.vue 改动点

**改动 1：入口卡片（在欢迎消息区域）**

```vue
<!-- 在现有 chat-suggestions div 之后添加 -->
<div v-if="!wizard.active && difyStore.config.wizardEnabled" class="wizard-entry-card" @click="wizard.startWizard()">
  <div class="entry-icon">🚀</div>
  <div class="entry-body">
    <div class="entry-title">OPC创业落地分析</div>
    <div class="entry-desc">一键生成你的专属创业分析报告</div>
  </div>
  <div class="entry-arrow">→</div>
</div>
```

**改动 2：引导模式 / 正常模式切换**

```vue
<!-- 引导模式（替换整个消息区域 + 输入区域） -->
<WizardMode v-if="wizard.active" @cancel="wizard.cancelWizard()" @complete="onReportComplete" />

<!-- 正常模式（现有内容，v-else） -->
<template v-else>
  <!-- 保持现有 chat-messages + chat-input 不变 -->
</template>
```

**改动 3：报告完成回调**

```typescript
const onReportComplete = () => {
  wizard.state.active = false
  // 报告已在 Dify 流式回调中写入 difyStore.messages
  // 回到正常模式后自动显示
  nextTick(() => scrollToBottom())
}
```

### 4.4 WizardMode.vue 主容器

```vue
<template>
  <div class="wizard-container">
    <!-- 进度条 -->
    <div class="wizard-progress">
      <div 
        v-for="(label, idx) in stepLabels" 
        :key="idx"
        :class="['progress-step', { active: currentStep === idx + 1, done: currentStep > idx + 1 }]"
      >
        <span class="step-dot">{{ currentStep > idx + 1 ? '✓' : idx + 1 }}</span>
        <span class="step-label">{{ label }}</span>
      </div>
    </div>

    <!-- 步骤内容 -->
    <div class="wizard-body">
      <DirectionStep v-if="currentStep === 1" />
      <IdentityStep v-if="currentStep === 2" />
      <TeamStep v-if="currentStep === 3" />
      <TechStep v-if="currentStep === 4" />
      <PlanStep v-if="currentStep === 5" />
      <ConfirmStep v-if="currentStep === 6" />
    </div>

    <!-- 底部导航 -->
    <div class="wizard-footer">
      <button v-if="currentStep > 1" class="btn-prev" @click="prevStep">← 上一步</button>
      <div class="footer-spacer" />
      <button class="btn-cancel" @click="$emit('cancel')">取消</button>
    </div>
  </div>
</template>
```

### 4.5 DirectionStep.vue（Step 1，最复杂的一步）

这一步包含三个子阶段：方向输入 → 主题匹配结果选择 → 经营范围勾选 + 详情确认。

```vue
<template>
  <div class="direction-step">
    <!-- 子阶段 1: 输入方向 -->
    <div v-if="subPhase === 'input'" class="phase-input">
      <h3>描述您的创业方向</h3>
      <p class="hint">一句话描述您想做的业务，我们会为您匹配最合适的创业主题</p>
      <textarea 
        v-model="state.directionInput" 
        placeholder="例如：用AI帮深圳美妆商家做自动客服和营销文案"
        rows="3"
      />
      <button 
        class="btn-primary" 
        :disabled="!state.directionInput.trim() || state.isMatching"
        @click="handleMatch"
      >
        {{ state.isMatching ? '正在分析匹配...' : '开始匹配 →' }}
      </button>
    </div>

    <!-- 子阶段 2: 匹配结果选择 -->
    <div v-if="subPhase === 'select-theme'" class="phase-select">
      <h3>为您匹配到以下创业主题</h3>
      <div v-for="match in state.matchResult.matches" :key="match.themeName" 
           :class="['theme-card', { selected: state.selectedThemeId === getThemeId(match.themeName) }]"
           @click="selectTheme(match)">
        <div class="theme-header">
          <span class="theme-name">{{ match.themeName }}</span>
          <span class="theme-category">{{ match.category }}</span>
        </div>
        <div class="theme-reason">{{ match.reason }}</div>
        <div class="theme-confidence">匹配度 {{ (match.confidence * 100).toFixed(0) }}%</div>
      </div>
    </div>

    <!-- 子阶段 3: 经营范围选择 -->
    <div v-if="subPhase === 'select-scopes'" class="phase-scopes">
      <h3>选择经营范围</h3>
      <p class="scope-hint">已选择主题：{{ state.themeData.themeName }}（{{ state.themeData.category }}）</p>
      
      <div class="scope-list">
        <div v-for="item in state.themeData.items" :key="item.scopeId" class="scope-item">
          <label :class="{ checked: state.selectedScopeIds.includes(item.scopeId) }">
            <input type="checkbox" :value="item.scopeId" v-model="state.selectedScopeIds" />
            <div class="scope-info">
              <span class="scope-name">{{ item.standardItem }}</span>
              <span class="scope-code">{{ item.scopeCode }}</span>
              <span :class="['scope-permit', item.permitType === 0 ? 'safe' : 'warn']">
                {{ item.permitType === 0 ? '无需许可' : '需要许可' }}
              </span>
            </div>
            <div class="scope-desc">{{ item.description }}</div>
          </label>
        </div>
      </div>

      <!-- 已选项目的 detail 展示 -->
      <div v-if="selectedDetails.length" class="scope-details">
        <h4>已选经营范围详情</h4>
        <div v-for="d in selectedDetails" :key="d.scopeId" class="detail-card">
          <div class="detail-name">{{ d.standardItem }}</div>
          <div v-if="d.detail.includedItems" class="detail-row">
            <span class="label">包含:</span> {{ d.detail.includedItems }}
          </div>
          <div v-if="d.detail.notIncluded" class="detail-row">
            <span class="label">不含:</span> {{ d.detail.notIncluded }}
          </div>
          <div class="detail-row">
            <span class="label">许可:</span> 
            <span :class="d.detail.isPermission === '否' ? 'safe' : 'warn'">
              {{ d.detail.isPermission === '否' ? '无需前置许可' : d.detail.permitExplain }}
            </span>
          </div>
        </div>
      </div>

      <button class="btn-primary" :disabled="state.selectedScopeIds.length === 0" @click="confirmScopes">
        确认经营范围，继续 →
      </button>
    </div>
  </div>
</template>
```

### 4.6 表单步骤（Step 2a-2d）

每一步都是简单的表单卡片，结构类似：

```vue
<!-- IdentityStep.vue 示例 -->
<template>
  <div class="form-step">
    <h3>基础身份信息</h3>
    
    <div class="form-group">
      <label>您的姓名</label>
      <input v-model="state.identity.name" placeholder="请输入姓名（化名即可）" />
    </div>

    <div class="form-group">
      <label>您的身份</label>
      <div class="radio-group">
        <label v-for="opt in identityOptions" :key="opt.value"
               :class="['radio-card', { active: state.identity.identityType === opt.value }]">
          <input type="radio" :value="opt.value" v-model="state.identity.identityType" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label>拟注册区域</label>
      <div class="radio-group">
        <label v-for="opt in areaOptions" :key="opt.value"
               :class="['radio-card', { active: state.identity.registerArea === opt.value }]">
          <input type="radio" :value="opt.value" v-model="state.identity.registerArea" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
```

### 4.7 ConfirmStep.vue（Step 3，确认 + 触发报告）

```vue
<template>
  <div class="confirm-step">
    <h3>确认信息</h3>
    
    <div class="confirm-table">
      <div class="confirm-section">
        <h4>🎯 创业方向</h4>
        <div class="confirm-row"><span>主题</span><span>{{ state.themeData.themeName }}</span></div>
        <div class="confirm-row"><span>分类</span><span>{{ state.themeData.category }}</span></div>
        <div class="confirm-row"><span>经营范围</span><span>{{ selectedScopeNames }}</span></div>
      </div>

      <div class="confirm-section">
        <h4>👤 身份信息</h4>
        <div class="confirm-row"><span>姓名</span><span>{{ state.identity.name }}</span></div>
        <div class="confirm-row"><span>身份</span><span>{{ state.identity.identityType }}</span></div>
        <div class="confirm-row"><span>注册区域</span><span>{{ state.identity.registerArea }}</span></div>
      </div>

      <div class="confirm-section">
        <h4>👥 团队与资金</h4>
        <!-- ... -->
      </div>

      <div class="confirm-section">
        <h4>💻 技术需求</h4>
        <!-- ... -->
      </div>

      <div class="confirm-section">
        <h4>📅 规划</h4>
        <!-- ... -->
      </div>
    </div>

    <button class="btn-generate" :disabled="state.isGenerating" @click="generateReport">
      {{ state.isGenerating ? '正在生成报告...' : '✅ 确认无误，生成报告' }}
    </button>
  </div>
</template>
```

---

## 五、后端改动（最小化）

只需在后端配置中新增一个 `opcToken` 字段，前端代码中新增对应类型。

### 5.1 DecorateDataLogic.php 保存逻辑

```php
// 在现有的 $difyConfig 构建逻辑中添加
$difyConfig = [
    // ... 现有字段 ...
    'opcToken' => $difyParams['opcToken'] ?? '',       // OPC 引导流程专用 Dify Token
    'wizardEnabled' => isset($difyParams['wizardEnabled']) && (
        $difyParams['wizardEnabled'] === true || 
        $difyParams['wizardEnabled'] === 'true' || 
        $difyParams['wizardEnabled'] === 1 || 
        $difyParams['wizardEnabled'] === '1'
    ),
];
```

PcLogic.php 读取逻辑无需改动（array_merge 自动包含新字段）。

### 5.2 types/dify.ts

```typescript
export interface DifyConfig {
  // ... 现有字段 ...
  opcToken?: string         // OPC 引导流程专用 Dify Token
  wizardEnabled?: boolean   // 是否启用引导模式入口卡片
}
```

---

## 六、移动端（Uniapp）

需要同步改动的文件：

```
uniapp/src/components/DifyChat/
├── index.vue              # 同 PC 改动
├── WizardMode.vue         # 复制 + 适配 uniapp 组件
├── steps/                 # 复制 + 适配
│   ├── DirectionStep.vue
│   ├── IdentityStep.vue
│   ├── TeamStep.vue
│   ├── TechStep.vue
│   └── PlanStep.vue
└── ConfirmStep.vue

uniapp/src/composables/
└── useWizard.ts           # 与 PC 共享，无需改动

uniapp/src/api/
└── difyWizard.ts          # 适配 uni.request
```

---

## 七、开发节奏

| 阶段 | 内容 | 产出 | 工期 |
|------|------|------|------|
| **1** ~~数据预处理~~ | ~~已完成~~ | `themes/index.json` + 84 个主题文件 | ~~0.5天~~ ✅ |
| **2** | 前端 useWizard + difyWizard API | 状态管理 + API 调用封装 | 0.5天 |
| **3** | DirectionStep 组件 | 方向匹配 + 经营范围选择（最复杂） | 1天 |
| **4** | 表单步骤组件（4个）+ ConfirmStep | 分步表单 + 确认页 | 1天 |
| **5** | WizardMode + DifyChat 集成 | 引导模式切换 + 报告流式渲染 | 1天 |
| **6** | 移动端同步 | uniapp 适配 | 1天 |
| **7** | 联调测试 + 优化 | 端到端跑通 | 1天 |
| **合计** | | | **~5.5天** |

---

## 八、关键决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 主题匹配方式 | 模型语义匹配（query 中拼接84条主题） | 关键词匹配无法覆盖自然语言描述 |
| 主题匹配数据 | 84条 themeName 拼入 query（~12KB） | 上下文可控，无需知识库 |
| 经营范围数据 | 按需加载单个主题文件 | 避免加载 76K 行全量数据 |
| Dify 应用 | OPC 独立应用（`opcToken`），与聊天应用分开 | 聊天应用挂知识库，OPC 应用不需要 |
| 报告生成 | query 中拼接全部结构化信息 | 不依赖 Dify inputs 变量，灵活简单 |
| 引导模式实现 | 纯前端 Vue 组件 | 不影响现有聊天功能，按需切换 |
| 后端改动 | 新增 1 个配置字段 `opcToken` | 最小化后端改动 |
