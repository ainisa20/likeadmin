import { reactive, computed } from 'vue'
import { useDifyStore } from '@/stores/dify'
import { useDifyUser } from '@/composables/useDifyUser'

function getBasePath(): string {
  try {
    const { public: config } = useRuntimeConfig()
    const base = config.baseUrl || '/'
    return base.endsWith('/') ? base : base + '/'
  } catch {
    return '/'
  }
}

interface ThemeMatchItem {
  themeName: string
  category: string
  confidence: number
  reason: string
}

interface ThemeMatchResult {
  matches: ThemeMatchItem[]
}

interface ThemeItem {
  scopeId: string
  standardItem: string
  scopeCode: string
  description: string
  permitType: number
  detail: {
    isPermission: string
    permitExplain: string
    includedItems: string
    notIncluded: string
    remarks: string
    specialTips: string
  } | null
}

interface ThemeData {
  themeName: string
  category: string
  items: ThemeItem[]
}

interface ThemeIndexEntry {
  id: string
  themeName: string
  category: string
  count: number
}

interface WizardState {
  active: boolean
  currentStep: number
  error: string | null

  directionInput: string
  isMatching: boolean
  matchResult: ThemeMatchResult | null
  themeIndex: ThemeIndexEntry[]
  selectedThemeId: string
  themeData: ThemeData | null
  selectedScopeIds: string[]

  identity: { name: string; identityType: string; registerArea: string }
  team: { budget: string; employeeCount: string }
  tech: { needServer: boolean; aiCallsPerDay: string; overseas: boolean }
  plan: { registerTime: string; services: string[] }

  isGenerating: boolean
  generatedContent: string
  generationComplete: boolean
  subsidyCalculated: boolean
}

const initialState: () => WizardState = () => ({
  active: false,
  currentStep: 1,
  error: null,

  directionInput: '',
  isMatching: false,
  matchResult: null,
  themeIndex: [],
  selectedThemeId: '',
  themeData: null,
  selectedScopeIds: [],

  identity: { name: '', identityType: '', registerArea: '' },
  team: { budget: '', employeeCount: '' },
  tech: { needServer: true, aiCallsPerDay: '', overseas: false },
  plan: { registerTime: '', services: [] },

  isGenerating: false,
  generatedContent: '',
  generationComplete: false,
  subsidyCalculated: false,
})

const state = reactive<WizardState>(initialState())

function getUserId(): string {
  const { getUserId: _getUserId } = useDifyUser()
  return _getUserId()
}

async function loadThemeIndex() {
  try {
    const base = getBasePath()
    const response = await fetch(`${base}themes/index.json`)
    if (!response.ok) throw new Error('Failed to load theme index')
    state.themeIndex = await response.json()
  } catch (e: any) {
    state.error = '加载主题数据失败'
    console.error('[Wizard] loadThemeIndex failed:', e)
  }
}

async function matchDirection(input: string) {
  state.isMatching = true
  state.error = null

  try {
    const config = useDifyStore().config
    const themeListText = state.themeIndex
      .map((t, i) => `${i + 1}. ${t.themeName} (${t.category})`)
      .join('\n')

    const query = `请从以下84个创业主题中，为用户的创业描述选择最匹配的1-3个主题。

## 主题列表
${themeListText}

## 用户的创业描述
${input}

## 要求
严格返回JSON，不要任何其他文字：
{"matches":[{"themeName":"主题名","category":"分类","confidence":0.95,"reason":"匹配理由(不超过30字)"}]}
规则：必须从列表中选择，不要自创；最多3个最少1个；confidence范围0-1。`

    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/v1/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.opcToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        response_mode: 'blocking',
        user: getUserId(),
        inputs: {},
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    const data = await response.json()
    let answer = data.answer || ''

    const jsonMatch = answer.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      state.matchResult = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('无法解析匹配结果')
    }
  } catch (e: any) {
    state.error = `主题匹配失败: ${e.message}`
    console.error('[Wizard] matchDirection failed:', e)
  } finally {
    state.isMatching = false
  }
}

async function selectTheme(themeId: string) {
  state.selectedThemeId = themeId
  state.selectedScopeIds = []

  try {
    const base = getBasePath()
    const response = await fetch(`${base}themes/${themeId}.json`)
    if (!response.ok) throw new Error('Failed to load theme data')
    state.themeData = await response.json()
  } catch (e: any) {
    state.error = '加载经营范围数据失败'
    console.error('[Wizard] selectTheme failed:', e)
  }
}

async function appendSubsidyCalculation() {
  try {
    const identityMap: Record<string, string> = {
      'graduate': 'graduate',
      'opc': 'opc',
      'student': 'student',
      'both': 'both',
    }

    const regionMap: Record<string, string> = {
      'luohu': 'luohu',
      'longgang': 'longgang',
      'guangming': 'guangming',
      'nanshan': 'nanshan',
      '其他': 'other',
    }

    const identity = identityMap[state.identity.identityType] || 'other'
    const region = regionMap[state.identity.registerArea] || 'other'
    const employee = state.team.employeeCount || '0'

    const reqBody: any = { identity, region, employee }
    if (state.tech.aiCallsPerDay) {
      reqBody.needServer = state.tech.needServer
      reqBody.aiCallsPerDay = state.tech.aiCallsPerDay
      reqBody.overseas = state.tech.overseas
      reqBody.budget = state.team.budget
    }

    const res = await fetch('/api/calculate/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    })

    const data = await res.json()

    if (!data.code || data.code !== 1) {
      console.error('[Wizard] calculate API error:', data)
      return
    }

    const calc = data.data
    const fmt = (n: number) => n >= 10000 ? `${(n/10000).toFixed(1)}万` : `${n.toLocaleString()}元`

    // ========== 构建第三节：补贴计算 ==========
    let subsidyHtml = `\n\n## 三、可申领补贴与收益预估\n\n`
    subsidyHtml += `**保守估算（普惠易得）：** ${fmt(calc.total_low)} ~ ${fmt(calc.total_high)}\n\n`
    subsidyHtml += `> 💡 若满足条件，总补贴上限可达 ${fmt(calc.total_high_all)}\n\n`

    const basic = calc.subsidies.filter((s: any) => !s.is_advanced)
    const advanced = calc.subsidies.filter((s: any) => s.is_advanced)

    if (basic.length > 0) {
      subsidyHtml += `### 🏆 普惠易得补贴\n\n`
      subsidyHtml += `| 补贴项目 | 估算金额 | 条件/备注 |\n`
      subsidyHtml += `|---------|---------|----------|\n`
      for (const s of basic) {
        subsidyHtml += `| ${s.name} | ${fmt(s.amount_low)} ~ ${fmt(s.amount_high)} | ${s.condition} |\n`
      }
      subsidyHtml += `\n`
    }

    if (advanced.length > 0) {
      subsidyHtml += `### 🚀 高难度专项补贴\n\n`
      subsidyHtml += `| 补贴项目 | 估算金额 | 条件/备注 |\n`
      subsidyHtml += `|---------|---------|----------|\n`
      for (const s of advanced) {
        subsidyHtml += `| ${s.name} | ${fmt(s.amount_low)} ~ ${fmt(s.amount_high)} | ${s.condition} |\n`
      }
      subsidyHtml += `\n`
    }

    subsidyHtml += `### 💸 前期6个月必要投入成本\n\n`
    subsidyHtml += `| 项目 | 估算金额 | 说明 |\n`
    subsidyHtml += `|------|---------|------|\n`
    for (const c of calc.costs) {
      subsidyHtml += `| ${c.name} | ${c.amount} | ${c.note} |\n`
    }
    subsidyHtml += `\n`
    subsidyHtml += `> 💡 最低总投入约 ${fmt(37339)} 元\n\n`

    subsidyHtml += `### 📊 投入产出分析（净收益）\n\n`
    subsidyHtml += `- **总投入（最低配置）：** 约 ${fmt(37339)} 元（6个月）\n`
    subsidyHtml += `- **减去普惠补贴：** -${fmt(calc.total_low)}\n`
    subsidyHtml += `- **净收益（保守）：** ${calc.net_benefit}\n\n`

    subsidyHtml += `> 💳 **可叠加创业担保贷款：** ${calc.loan_info}`

    // ========== 构建第四节：技术方案 ==========
    let techHtml = ''
    if (calc.tech_plan) {
      const tp = calc.tech_plan
      techHtml = `\n\n## 四、技术方案与成本估算\n\n`

      // 云服务器推荐
      if (tp.need_server && tp.servers) {
        const rec = tp.servers.recommended
        techHtml += `### ☁️ 推荐云服务器配置\n\n`
        techHtml += `> 基于 ${rec.provider} 实际定价推荐\n\n`
        techHtml += `| 配置项 | 详情 |\n`
        techHtml += `|-------|------|\n`
        techHtml += `| 推荐方案 | **${rec.name}** |\n`
        techHtml += `| 规格 | ${rec.spec} |\n`
        techHtml += `| 年费 | ${rec.yearly_cost}元/年（约${rec.monthly_cost}元/月） |\n`
        techHtml += `| 适用场景 | ${rec.suitable_for} |\n`
        techHtml += `\n`

        // 备选方案表格
        techHtml += `#### 其他可选配置\n\n`
        techHtml += `| 方案 | 规格 | 年费 | 适用场景 |\n`
        techHtml += `|------|------|------|----------|\n`
        for (const [, cfg] of Object.entries(tp.servers.all_configs as Record<string, any>)) {
          techHtml += `| ${cfg.name} | ${cfg.spec} | ${cfg.yearly_cost}元/年 | ${cfg.suitable_for} |\n`
        }
        techHtml += `\n`
      } else {
        techHtml += `### ☁️ 云服务器\n\n`
        techHtml += `当前阶段暂不需要云服务器，建议先使用免费开发环境验证业务模型。\n\n`
      }

      // AI 工具链
      if (tp.ai_tools) {
        const ai = tp.ai_tools
        const recModel = ai.models[ai.recommended_model]
        techHtml += `### 🤖 AI 模型与工具链\n\n`
        techHtml += `> 推荐模型：**${recModel.name}**（${recModel.provider}）\n\n`
        techHtml += `| 模型 | 提供商 | 输入价(元/百万Token) | 输出价(元/百万Token) | 适用场景 |\n`
        techHtml += `|------|-------|--------------------|--------------------|----------|\n`
        for (const [, m] of Object.entries(ai.models as Record<string, any>)) {
          const isRec = m.name === recModel.name ? ' ⭐推荐' : ''
          techHtml += `| ${m.name}${isRec} | ${m.provider} | ${m.input_price} | ${m.output_price} | ${m.suitable_for} |\n`
        }
        techHtml += `\n`

        if (ai.monthly_cost > 0) {
          techHtml += `> 💰 按日均调用估算，月费约 **${ai.monthly_cost}元/月**\n\n`
        }

        if (ai.free_options && ai.free_options.length > 0) {
          techHtml += `**省钱提示：**\n`
          for (const opt of ai.free_options) {
            techHtml += `- ${opt}\n`
          }
          techHtml += `\n`
        }
      }

      // 海外市场工具
      if (tp.overseas_tools && (tp.overseas_tools as any).items) {
        const ot = tp.overseas_tools as any
        techHtml += `### 🌍 海外市场基础设施\n\n`
        techHtml += `| 工具 | 月费 | 用途 |\n`
        techHtml += `|------|------|------|\n`
        for (const item of ot.items) {
          techHtml += `| ${item.name} | ${item.cost} | ${item.purpose} |\n`
        }
        techHtml += `\n`
      }

      // 开发工具
      if (tp.dev_tools) {
        const dt = tp.dev_tools
        techHtml += `### 🛠️ 开发工具链\n\n`
        techHtml += `| 工具 | 费用 | 说明 |\n`
        techHtml += `|------|------|------|\n`
        for (const item of dt.items) {
          techHtml += `| ${item.name} | ${item.cost} | ${item.note} |\n`
        }
        techHtml += `\n`
      }

      // 月度成本汇总
      techHtml += `### 💰 技术方案月度成本汇总\n\n`
      techHtml += `| 项目 | 月费 |\n`
      techHtml += `|------|------|\n`
      for (const item of tp.monthly_breakdown) {
        techHtml += `| ${item.item} | ${item.cost}元/月 |\n`
      }
      techHtml += `| **合计** | **${tp.monthly_cost}元/月（${tp.yearly_cost}元/年）** |\n`
    } else {
      // 没有技术方案数据时的兜底
      techHtml = `\n\n## 四、技术方案\n\n> 技术方案需根据实际云服务配置和AI调用量定制，请联系顾问获取详细方案。\n`
    }

    // ========== 替换占位符 ==========
    replacePlaceholder('SUBSIDY_PLACEHOLDER', subsidyHtml, '## 二、')
    replacePlaceholder('TECH_PLACEHOLDER', techHtml, '## 三、')

    // 清理 AI 输出的裸章节标题（如 "三、\n" 紧邻 "## 三：" 会导致重复）
    state.generatedContent = state.generatedContent
      .replace(/^[三四]、\s*\n(?=\n*## [三四])/gm, '')
      .replace(/\n[三四]、\s*\n(?=\n*## [三四])/g, '\n')

    // 同步到聊天记录（difyStore.messages 里最后一个 assistant 消息）
    syncToChatMessages()

    state.subsidyCalculated = true

  } catch (e) {
    console.error('[Wizard] appendSubsidyCalculation failed:', e)
  }
}

function syncToChatMessages() {
  const difyStore = useDifyStore()
  for (let i = difyStore.messages.length - 1; i >= 0; i--) {
    if (difyStore.messages[i].role === 'assistant') {
      difyStore.messages[i].content = state.generatedContent
      break
    }
  }
}

/**
 * 占位符替换（带 fallback）
 * 1. 优先替换 <!-- XXX_PLACEHOLDER -->
 * 2. 其次替换裸 XXX_PLACEHOLDER
 * 3. 最后 fallback: 插入到前一个章节之后
 */
function replacePlaceholder(tag: string, content: string, prevSectionMarker: string) {
  const htmlTag = `<!-- ${tag} -->`
  if (state.generatedContent.includes(htmlTag)) {
    state.generatedContent = state.generatedContent.replace(htmlTag, content)
  } else if (state.generatedContent.includes(tag)) {
    state.generatedContent = state.generatedContent.replace(tag, content)
  } else {
    // fallback: 找到前一个章节标题，在下一个 ## 标题前插入
    const idx = state.generatedContent.indexOf(prevSectionMarker)
    if (idx !== -1) {
      const afterPrevSection = state.generatedContent.indexOf('\n## ', idx + prevSectionMarker.length)
      if (afterPrevSection !== -1) {
        state.generatedContent = state.generatedContent.slice(0, afterPrevSection) + '\n\n' + content + state.generatedContent.slice(afterPrevSection)
        return
      }
    }
    state.generatedContent += content
  }
}

async function generateReport(
  onChunk: (text: string) => void,
  onComplete: (conversationId: string) => void,
) {
  state.isGenerating = true
  state.error = null

  try {
    const config = useDifyStore().config

    const scopeDetails = state.selectedScopeIds
      .map((id) => {
        const item = state.themeData!.items.find((i) => i.scopeId === id)
        if (!item) return ''
        return `${item.standardItem}(${item.scopeCode},${item.permitType === 0 ? '无需许可' : '需许可'})`
      })
      .filter(Boolean)
      .join('; ')

    const query = `请根据以下创业信息，生成完整的《九章数智·OPC创业落地分析报告》。

## 创业方向
主题：${state.themeData!.themeName}
分类：${state.themeData!.category}
业务描述：${state.directionInput}

## 选定经营范围
${scopeDetails}

## 身份信息
姓名：${state.identity.name}
身份：${state.identity.identityType}
注册区域：${state.identity.registerArea}

## 团队与资金
启动资金：${state.team.budget}
预计带动就业人数：${state.team.employeeCount}

## 技术需求
云服务器：${state.tech.needServer ? '需要' : '不需要'}
AI日均调用：${state.tech.aiCallsPerDay}
海外市场：${state.tech.overseas ? '是' : '否'}

## 规划
注册时间：${state.plan.registerTime}
代办服务：${state.plan.services.join('、')}

## 报告结构要求
一、公司命名建议（推荐3个名称+寓意+核名提示）
二、经营范围建议及冲突预检（表格列出规范表述|是否需前置许可|匹配度|风险提示 + 冲突预警 + 结论）
三、请直接输出以下占位符（不要输出其他内容）：<!-- SUBSIDY_PLACEHOLDER -->
四、请直接输出以下占位符（不要输出其他内容）：<!-- TECH_PLACEHOLDER -->
五、运营规划（获客渠道 + 变现路径 + 里程碑计划）
六、下一步行动清单（含时间节点）
末尾加声明：本报告由九章数智人工智能（深圳）有限责任公司出具，基于提供的信息及现行政策分析。

## 格式要求
- 使用Markdown表格，不要输出mermaid/flowchart/graph代码
- 所有图表用Markdown表格或列表呈现
- 绝对禁止输出任何以graph、flowchart、sequenceDiagram开头的代码块，所有流程图用文字列表或表格代替
- 不要在占位符前后输出"三、"或"四、"等章节标题，占位符本身就是完整内容`

    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/v1/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.opcToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        response_mode: 'streaming',
        user: getUserId(),
        inputs: {},
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

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
              state.generatedContent += chunk.answer
              onChunk(chunk.answer)
            } else if (chunk.event === 'message_end' && chunk.conversation_id) {
              state.generationComplete = true
              onComplete(chunk.conversation_id)
              setTimeout(() => appendSubsidyCalculation(), 2000)
            }
          } catch {
            // SSE chunks may be incomplete mid-stream, skip them
          }
        }
      }
    }
  } catch (e: any) {
    state.error = `报告生成失败: ${e.message}`
    console.error('[Wizard] generateReport failed:', e)
  } finally {
    state.isGenerating = false
  }
}

function nextStep() {
  if (state.currentStep < 6) state.currentStep++
}

function prevStep() {
  if (state.currentStep > 1) state.currentStep--
}

function startWizard() {
  Object.assign(state, initialState())
  state.active = true
  loadThemeIndex()
}

function cancelWizard() {
  state.active = false
}

const selectedScopeItems = computed(() => {
  if (!state.themeData) return []
  return state.selectedScopeIds
    .map((id) => state.themeData!.items.find((i) => i.scopeId === id))
    .filter(Boolean) as ThemeItem[]
})

const canProceedFromStep = computed(() => {
  switch (state.currentStep) {
    case 1:
      return state.selectedScopeIds.length > 0
    case 2:
      return !!(state.identity.name && state.identity.identityType && state.identity.registerArea)
    case 3:
      return !!(state.team.budget && state.team.employeeCount)
    case 4:
      return !!state.tech.aiCallsPerDay
    case 5:
      return !!(state.plan.registerTime && state.plan.services.length > 0)
    default:
      return true
  }
})

export function useWizard() {
  return {
    state,
    startWizard,
    cancelWizard,
    loadThemeIndex,
    matchDirection,
    selectTheme,
    generateReport,
    nextStep,
    prevStep,
    selectedScopeItems,
    canProceedFromStep,
  }
}

export type { WizardState, ThemeMatchResult, ThemeMatchItem, ThemeData, ThemeItem, ThemeIndexEntry }
