<template>
  <div class="wizard-container">
    <div class="wizard-progress">
      <div
        v-for="(label, idx) in stepLabels"
        :key="idx"
        :class="['progress-step', { active: wizard.state.currentStep === idx + 1, done: wizard.state.currentStep > idx + 1 }]"
      >
        <span class="step-dot">{{ wizard.state.currentStep > idx + 1 ? '✓' : idx + 1 }}</span>
        <span class="step-label">{{ label }}</span>
      </div>
      <div class="progress-line" :style="{ width: progressWidth }" />
    </div>

    <div class="wizard-body">
      <DirectionStep v-if="wizard.state.currentStep === 1" />
      <IdentityStep v-if="wizard.state.currentStep === 2" />
      <TeamStep v-if="wizard.state.currentStep === 3" />
      <TechStep v-if="wizard.state.currentStep === 4" />
      <PlanStep v-if="wizard.state.currentStep === 5" />
      
      <!-- Step 6: Generation state -->
      <div v-if="wizard.state.currentStep === 6" class="generation-state">
        <template v-if="wizard.state.isGenerating">
          <div class="gen-header">
            <div class="gen-icon">🤖</div>
            <h3>正在生成创业分析报告</h3>
            <p class="gen-hint">AI 正在根据您的信息撰写报告，请稍候...</p>
          </div>
          <div class="gen-content">
            <div class="stream-content" v-html="parseMarkdown(wizard.state.generatedContent)"></div>
          </div>
          <div class="gen-loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
        </template>
        
        <template v-else-if="wizard.state.generationComplete">
          <div class="gen-header complete">
            <div class="gen-icon">✅</div>
            <h3>报告生成完成</h3>
          </div>
          <div class="gen-content final">
            <div class="stream-content" v-html="parseMarkdown(wizard.state.generatedContent)"></div>
          </div>
          <button class="btn-done" @click="$emit('complete')">完成，进入聊天查看完整报告</button>
        </template>
        
        <template v-else>
          <ConfirmStep />
        </template>
      </div>
    </div>

    <div v-if="wizard.state.error" class="wizard-error">
      {{ wizard.state.error }}
      <button @click="wizard.state.error = null">×</button>
    </div>

    <div class="wizard-footer">
      <button v-if="wizard.state.currentStep > 1 && !wizard.state.isGenerating && !wizard.state.generationComplete" class="btn-prev" @click="wizard.prevStep()">
        ← 上一步
      </button>
      <div class="footer-spacer" />
      <button v-if="!wizard.state.isGenerating && !wizard.state.generationComplete" class="btn-cancel" @click="$emit('cancel')">取消</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWizard } from '@/composables/useWizard'
import DirectionStep from './steps/DirectionStep.vue'
import IdentityStep from './steps/IdentityStep.vue'
import TeamStep from './steps/TeamStep.vue'
import TechStep from './steps/TechStep.vue'
import PlanStep from './steps/PlanStep.vue'
import ConfirmStep from './steps/ConfirmStep.vue'

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'complete'): void
}>()

const wizard = useWizard()

const stepLabels = ['创业方向', '身份信息', '团队资金', '技术需求', '规划', '生成报告']

const progressWidth = computed(() => {
  return `${((wizard.state.currentStep - 1) / (stepLabels.length - 1)) * 100}%`
})

function parseMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n/g, '<br>')
  return html
}
</script>

<style scoped>
.wizard-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.wizard-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 20px;
  padding: 0 8px;
}

.wizard-progress::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 24px;
  right: 24px;
  height: 2px;
  background: #e5e7eb;
}

.progress-line {
  position: absolute;
  top: 10px;
  left: 24px;
  height: 2px;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  z-index: 1;
}

.step-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}

.progress-step.active .step-dot {
  background: #3b82f6;
  color: white;
}

.progress-step.done .step-dot {
  background: #10b981;
  color: white;
}

.step-label {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
}

.progress-step.active .step-label {
  color: #3b82f6;
  font-weight: 500;
}

.progress-step.done .step-label {
  color: #10b981;
}

.wizard-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.wizard-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin: 8px 0;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.wizard-error button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}

.wizard-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.footer-spacer {
  flex: 1;
}

.btn-prev,
.btn-next {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-prev:hover,
.btn-next:hover {
  background: #f9fafb;
}

.btn-prev:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f9fafb;
  color: #374151;
}

.generation-state {
  padding: 0 4px;
}

.gen-header {
  text-align: center;
  padding: 20px 0;
}

.gen-header.complete .gen-icon {
  font-size: 48px;
}

.gen-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.gen-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px;
}

.gen-hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.gen-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.gen-content.final {
  max-height: 400px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.stream-content {
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
}

.stream-content h1,
.stream-content h2,
.stream-content h3 {
  margin: 12px 0 8px;
  font-weight: 600;
}

.stream-content h1 { font-size: 16px; }
.stream-content h2 { font-size: 15px; }
.stream-content h3 { font-size: 14px; }

.gen-loading {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 12px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: loadingPulse 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes loadingPulse {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.btn-done {
  display: block;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
}

.btn-done:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}
</style>
