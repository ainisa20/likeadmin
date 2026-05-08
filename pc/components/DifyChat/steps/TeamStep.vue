<template>
  <div class="form-step">
    <h3>团队与资金</h3>

    <div class="form-group">
      <label>启动资金预算</label>
      <div class="radio-group">
        <label
          v-for="opt in budgetOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.team.budget === opt.value }]"
        >
          <input type="radio" :value="opt.value" v-model="wizard.state.team.budget" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label>预计带动就业人数（含自己）</label>
      <div class="radio-group">
        <label
          v-for="opt in employeeOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.team.employeeCount === opt.value }]"
        >
          <input type="radio" :value="opt.value" v-model="wizard.state.team.employeeCount" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <button
      class="btn-primary"
      :disabled="!wizard.state.team.budget || !wizard.state.team.employeeCount"
      @click="wizard.nextStep()"
    >
      下一步 →
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWizard } from '@/composables/useWizard'

const wizard = useWizard()

const budgetOptions = [
  { label: '1万以下', value: '1万以下' },
  { label: '1-5万', value: '1-5万' },
  { label: '5-10万', value: '5-10万' },
  { label: '10万以上', value: '10万以上' },
]

const employeeOptions = [
  { label: '只有我自己（0人带动）', value: '0' },
  { label: '1-3人', value: '1-3' },
  { label: '4人及以上', value: '4+' },
]
</script>

<style scoped>
.form-step { padding: 0 4px; }
h3 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px; }
.form-group { margin-bottom: 16px; }
.form-group > label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }

.number-input {
  display: flex; align-items: center; gap: 0; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden;
}
.num-btn {
  width: 40px; height: 38px; background: #f9fafb; border: none;
  font-size: 18px; color: #374151; cursor: pointer;
}
.num-btn:hover { background: #f3f4f6; }
.num-value {
  flex: 1; text-align: center; border: none; border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db; border-radius: 0; padding: 8px;
}
.num-value:focus { outline: none; }

.form-input {
  width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; box-sizing: border-box;
}

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
