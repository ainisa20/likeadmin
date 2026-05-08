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
      <ConfirmStep v-if="wizard.state.currentStep === 6" />
    </div>

    <div v-if="wizard.state.error" class="wizard-error">
      {{ wizard.state.error }}
      <button @click="wizard.state.error = null">×</button>
    </div>

    <div class="wizard-footer">
      <button v-if="wizard.state.currentStep > 1" class="btn-prev" @click="wizard.prevStep()">
        ← 上一步
      </button>
      <div class="footer-spacer" />
      <button class="btn-next" @click="wizard.cancelWizard()">取消</button>
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
</style>
