<template>
  <div class="form-step">
    <h3>技术需求</h3>

    <div class="form-group">
      <label>是否需要云服务器和域名？</label>
      <div class="toggle-row">
        <button :class="['toggle-btn', { active: wizard.state.tech.needServer }]" @click="wizard.state.tech.needServer = true">是</button>
        <button :class="['toggle-btn', { active: !wizard.state.tech.needServer }]" @click="wizard.state.tech.needServer = false">否</button>
      </div>
    </div>

    <div class="form-group">
      <label>每日预计 AI 模型调用次数</label>
      <div class="radio-group">
        <label
          v-for="opt in aiCallsOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.tech.aiCallsPerDay === opt.value }]"
        >
          <input type="radio" :value="opt.value" v-model="wizard.state.tech.aiCallsPerDay" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <button
      class="btn-primary"
      :disabled="!wizard.state.tech.aiCallsPerDay"
      @click="wizard.nextStep()"
    >
      下一步 →
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWizard } from '@/composables/useWizard'

const wizard = useWizard()

const aiCallsOptions = [
  { label: '1000次以下', value: '1000次以下' },
  { label: '1万次左右', value: '1万次左右' },
  { label: '5万次以上', value: '5万次以上' },
]
</script>

<style scoped>
.form-step { padding: 0 4px; }
h3 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px; }
.form-group { margin-bottom: 16px; }
.form-group > label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }

.toggle-row { display: flex; gap: 8px; }
.toggle-btn {
  flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 8px;
  background: white; color: #374151; font-size: 13px; cursor: pointer; transition: all 0.15s;
}
.toggle-btn.active { border-color: #3b82f6; background: #eff6ff; color: #3b82f6; font-weight: 500; }

.radio-group { display: flex; flex-direction: column; gap: 6px; }
.radio-card {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer;
  font-size: 13px; color: #374151; transition: all 0.15s;
}
.radio-card:hover { border-color: #93c5fd; }
.radio-card.active { border-color: #3b82f6; background: #eff6ff; }
.radio-card input[type="radio"] { margin: 0; }

.btn-primary {
  display: block; width: 100%; padding: 10px; margin-top: 8px;
  background: #3b82f6; color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 500; cursor: pointer;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
</style>
