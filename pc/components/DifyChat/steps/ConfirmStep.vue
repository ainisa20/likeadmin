<template>
  <div class="confirm-step">
    <h3>确认信息</h3>

    <div class="confirm-section">
      <h4>🎯 创业方向</h4>
      <div class="confirm-row"><span>业务描述</span><span>{{ wizard.state.directionInput }}</span></div>
      <div class="confirm-row"><span>主题</span><span>{{ wizard.state.themeData?.themeName }}</span></div>
      <div class="confirm-row"><span>分类</span><span>{{ wizard.state.themeData?.category }}</span></div>
      <div class="confirm-row"><span>经营范围</span><span class="scopes-text">{{ scopeNames }}</span></div>
    </div>

    <div class="confirm-section">
      <h4>👤 身份信息</h4>
      <div class="confirm-row"><span>姓名</span><span>{{ wizard.state.identity.name }}</span></div>
      <div class="confirm-row"><span>身份</span><span>{{ wizard.state.identity.identityType }}</span></div>
      <div class="confirm-row"><span>注册区域</span><span>{{ wizard.state.identity.registerArea }}</span></div>
    </div>

    <div class="confirm-section">
      <h4>👥 团队与资金</h4>
      <div class="confirm-row"><span>团队人数</span><span>{{ wizard.state.team.size }}人</span></div>
      <div class="confirm-row"><span>启动资金</span><span>{{ wizard.state.team.budget }}</span></div>
      <div class="confirm-row"><span>生活预留</span><span>{{ wizard.state.team.livingFund }}</span></div>
    </div>

    <div class="confirm-section">
      <h4>💻 技术需求</h4>
      <div class="confirm-row"><span>云服务器</span><span>{{ wizard.state.tech.needServer ? '需要' : '不需要' }}</span></div>
      <div class="confirm-row"><span>AI日均调用</span><span>{{ wizard.state.tech.aiCallsPerDay }}</span></div>
      <div class="confirm-row"><span>海外市场</span><span>{{ wizard.state.tech.overseas ? '是' : '否' }}</span></div>
    </div>

    <div class="confirm-section">
      <h4>📅 规划</h4>
      <div class="confirm-row"><span>注册时间</span><span>{{ wizard.state.plan.registerTime }}</span></div>
      <div class="confirm-row"><span>代办服务</span><span>{{ wizard.state.plan.services.join('、') }}</span></div>
    </div>

    <button
      class="btn-generate"
      :disabled="wizard.state.isGenerating"
      @click="handleGenerate"
    >
      {{ wizard.state.isGenerating ? '正在生成报告...' : '✅ 确认无误，生成报告' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWizard } from '@/composables/useWizard'
import { useDifyStore } from '@/stores/dify'

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const wizard = useWizard()
const difyStore = useDifyStore()

const scopeNames = computed(() => {
  return wizard.selectedScopeItems.value
    .map(item => item.standardItem)
    .join('、')
})

async function handleGenerate() {
  const userMsgId = `opc_user_${Date.now()}`
  const assistantMsgId = `opc_assistant_${Date.now()}`

  difyStore.messages.push({
    id: userMsgId,
    role: 'user',
    content: `生成OPC创业落地分析报告：${wizard.state.directionInput}`,
    createdAt: new Date(),
  })

  const assistantMsg: any = {
    id: assistantMsgId,
    role: 'assistant',
    content: '',
    createdAt: new Date(),
  }
  difyStore.messages.push(assistantMsg)

  await wizard.generateReport(
    (text: string) => {
      assistantMsg.content += text
    },
    () => {},
  )
}
</script>

<style scoped>
.confirm-step { padding: 0 4px; }
h3 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px; }

.confirm-section {
  margin-bottom: 14px;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
}

h4 {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 12px;
  padding: 3px 0;
  gap: 8px;
}

.confirm-row > span:first-child {
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.confirm-row > span:last-child {
  color: #111827;
  text-align: right;
  word-break: break-all;
}

.scopes-text { font-size: 11px; line-height: 1.4; }

.btn-generate {
  display: block;
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-generate:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
.btn-generate:disabled { background: #93c5fd; cursor: not-allowed; transform: none; box-shadow: none; }
</style>