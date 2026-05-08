<template>
  <div class="form-step">
    <h3>规划</h3>

    <div class="form-group">
      <label>计划何时注册公司？</label>
      <div class="radio-group">
        <label
          v-for="opt in timeOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.plan.registerTime === opt.value }]"
        >
          <input type="radio" :value="opt.value" v-model="wizard.state.plan.registerTime" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label>需要代办服务（可多选）</label>
      <div class="radio-group">
        <label
          v-for="opt in serviceOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.plan.services.includes(opt.value) }]"
          @click.prevent="toggleService(opt.value)"
        >
          <input
            type="checkbox"
            :checked="wizard.state.plan.services.includes(opt.value)"
            @click.prevent
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <button
      class="btn-primary"
      :disabled="!wizard.state.plan.registerTime || wizard.state.plan.services.length === 0"
      @click="wizard.nextStep()"
    >
      下一步 →
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWizard } from '@/composables/useWizard'

const wizard = useWizard()

const timeOptions = [
  { label: '本月内', value: '本月内' },
  { label: '1-3个月', value: '1-3个月' },
  { label: '3个月以上', value: '3个月以上' },
]

const serviceOptions = [
  { label: '企业注册', value: '企业注册' },
  { label: '代记账', value: '代记账' },
  { label: '补贴申报', value: '补贴申报' },
  { label: '全部需要', value: '全部需要' },
]

function toggleService(value: string) {
  const idx = wizard.state.plan.services.indexOf(value)
  if (idx >= 0) {
    wizard.state.plan.services.splice(idx, 1)
  } else {
    if (value === '全部需要') {
      wizard.state.plan.services = ['全部需要']
    } else {
      wizard.state.plan.services = wizard.state.plan.services.filter(s => s !== '全部需要')
      wizard.state.plan.services.push(value)
    }
  }
}
</script>

<style scoped>
.form-step { padding: 0 4px; }
h3 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px; }
.form-group { margin-bottom: 16px; }
.form-group > label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }

.radio-group { display: flex; flex-direction: column; gap: 6px; }
.radio-card {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer;
  font-size: 13px; color: #374151; transition: all 0.15s;
}
.radio-card:hover { border-color: #93c5fd; }
.radio-card.active { border-color: #3b82f6; background: #eff6ff; }
.radio-card input[type="radio"],
.radio-card input[type="checkbox"] { margin: 0; }

.btn-primary {
  display: block; width: 100%; padding: 10px; margin-top: 8px;
  background: #3b82f6; color: white; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 500; cursor: pointer;
}
.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }
</style>
