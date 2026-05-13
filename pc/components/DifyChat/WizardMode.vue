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
            <p v-if="!wizard.state.subsidyCalculated" class="gen-hint">正在计算补贴明细...</p>
          </div>
          <div class="gen-actions">
            <button 
              class="btn-export" 
              @click="exportPDF"
              :disabled="!wizard.state.subsidyCalculated"
            >
              <span class="btn-icon">📄</span>{{ wizard.state.subsidyCalculated ? '导出 PDF' : '计算中...' }}
            </button>
            <button 
              class="btn-done" 
              @click="$emit('complete')"
              :disabled="!wizard.state.subsidyCalculated"
            >
              {{ wizard.state.subsidyCalculated ? '完成' : '计算中...' }}
            </button>
          </div>
          <div class="gen-content final">
            <div id="report-content" class="stream-content" v-html="parseMarkdown(wizard.state.generatedContent)"></div>
          </div>
          <div v-if="!wizard.state.subsidyCalculated" class="subsidy-loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span>正在计算可申领补贴与收益预估...</span>
          </div>
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
import { marked } from 'marked'
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

marked.setOptions({
  breaks: true,
  gfm: true,
})

function parseMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text) as string
}

function exportPDF() {
  const printContent = document.getElementById('report-content')
  if (!printContent) return
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>OPC创业落地分析报告</title>
      <style>
        @page {
          size: A4;
          margin: 15mm 20mm;
        }
        * {
          box-sizing: border-box;
        }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          line-height: 1.5;
          color: #1a1a1a;
          font-size: 10pt;
        }
        .report-wrapper {
          width: 100%;
          max-width: 100%;
        }
        h1 { 
          color: #1a1a1a; 
          font-size: 18pt;
          border-bottom: 2px solid #3b82f6; 
          padding-bottom: 8px; 
          margin: 0 0 16px 0;
        }
        h2 { 
          color: #2d3748; 
          font-size: 14pt;
          margin: 20px 0 10px 0;
          padding-left: 8px;
          border-left: 3px solid #3b82f6;
        }
        h3 { 
          color: #4a5568; 
          font-size: 11pt;
          margin: 12px 0 6px 0;
        }
        p { margin: 6px 0; }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 10px 0;
          font-size: 9pt;
        }
        th, td { 
          border: 1px solid #cbd5e0; 
          padding: 6px 8px; 
          text-align: left;
        }
        th { 
          background: #edf2f7; 
          font-weight: 600;
        }
        tr:nth-child(even) td {
          background: #f7fafc;
        }
        ul, ol { 
          padding-left: 18px; 
          margin: 6px 0;
        }
        li { margin: 3px 0; }
        strong { color: #1a1a1a; font-weight: 600; }
        em { color: #4a5568; }
        code {
          background: #edf2f7;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 9pt;
          color: #c53030;
        }
        blockquote {
          border-left: 3px solid #3b82f6;
          background: #f7fafc;
          padding: 8px 12px;
          margin: 10px 0;
          color: #4a5568;
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 12px; 
          border-top: 1px solid #cbd5e0;
          font-size: 9pt;
          color: #718096;
          text-align: center;
          page-break-after: avoid;
        }
      </style>
    </head>
    <body>
      <div class="report-wrapper">
        ${printContent.innerHTML}
      </div>
      <div class="footer">本报告由九章数智人工智能（深圳）有限责任公司出具</div>
    </body>
    </html>
  `
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  setTimeout(() => {
    printWindow.print()
  }, 500)
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

.gen-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-icon {
  font-size: 16px;
}

.stream-content {
  font-size: 13px;
  line-height: 1.7;
  color: #374151;
}

.stream-content h1 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
  margin: 20px 0 16px;
}

.stream-content h2 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 24px 0 12px;
  padding-left: 8px;
  border-left: 3px solid #3b82f6;
}

.stream-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin: 16px 0 8px;
}

.stream-content p {
  margin: 8px 0;
}

.stream-content ul,
.stream-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.stream-content li {
  margin: 4px 0;
}

.stream-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 12px;
}

.stream-content th,
.stream-content td {
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  text-align: left;
}

.stream-content th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
}

.stream-content td {
  background: white;
}

.stream-content tr:nth-child(even) td {
  background: #fafbfc;
}

.stream-content strong {
  color: #1a1a1a;
  font-weight: 600;
}

.stream-content em {
  color: #4a5568;
}

.stream-content code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #dc2626;
}

.stream-content blockquote {
  border-left: 4px solid #3b82f6;
  background: #f8fafc;
  padding: 12px 16px;
  margin: 12px 0;
  color: #475569;
}

.subsidy-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #0369a1;
  font-size: 13px;
  margin-top: 12px;
}

.btn-export:disabled,
.btn-done:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ========== 移动端适配 ========== */
@media (max-width: 640px) {
  .wizard-container {
    padding: 10px;
  }

  /* 进度条：隐藏文字，只保留圆点 */
  .wizard-progress {
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .step-label {
    display: none;
  }

  .progress-step.active .step-label {
    display: block;
    font-size: 10px;
    position: absolute;
    top: 28px;
    white-space: nowrap;
    left: 50%;
    transform: translateX(-50%);
  }

  .step-dot {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  /* 向导主体 */
  .wizard-body {
    -webkit-overflow-scrolling: touch;
  }

  /* 底部按钮区 */
  .wizard-footer {
    padding: 10px 0 0;
  }

  .btn-prev,
  .btn-cancel {
    padding: 10px 20px;
    font-size: 14px;
  }

  /* 生成报告页 */
  .gen-header {
    padding: 14px 0;
  }

  .gen-icon {
    font-size: 32px;
  }

  .gen-header h3 {
    font-size: 15px;
  }

  .gen-content {
    max-height: 200px;
    padding: 10px;
  }

  .gen-content.final {
    max-height: 280px;
  }

  .gen-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn-export {
    justify-content: center;
  }

  .btn-done {
    padding: 12px;
    font-size: 14px;
  }

  /* Markdown 内容 */
  .stream-content {
    font-size: 12px;
  }

  .stream-content h1 { font-size: 15px; }
  .stream-content h2 { font-size: 14px; }
  .stream-content h3 { font-size: 13px; }

  .stream-content table {
    font-size: 11px;
  }

  .stream-content th,
  .stream-content td {
    padding: 6px;
  }
}
</style>
