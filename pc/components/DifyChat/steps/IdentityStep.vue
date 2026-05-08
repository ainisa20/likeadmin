<template>
  <div class="form-step">
    <h3>基础身份信息</h3>

    <div class="form-group">
      <label>您的姓名</label>
      <input v-model="wizard.state.identity.name" placeholder="化名即可" class="form-input" />
    </div>

    <div class="form-group">
      <label>您的身份</label>
      <div class="radio-group">
        <label
          v-for="opt in identityOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.identity.identityType === opt.value }]"
        >
          <input type="radio" :value="opt.value" v-model="wizard.state.identity.identityType" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label>拟注册区域</label>
      <div class="radio-group">
        <label
          v-for="opt in areaOptions"
          :key="opt.value"
          :class="['radio-card', { active: wizard.state.identity.registerArea === opt.value }]"
        >
          <input type="radio" :value="opt.value" v-model="wizard.state.identity.registerArea" />
          <span>{{ opt.label }}</span>
        </label>
      </div>
    </div>

    <button
      class="btn-primary"
      :disabled="!wizard.state.identity.name || !wizard.state.identity.identityType || !wizard.state.identity.registerArea"
      @click="wizard.nextStep()"
    >
      下一步 →
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWizard } from '@/composables/useWizard'

const wizard = useWizard()

const identityOptions = [
  { label: '在校大学生(2026届)', value: '在校大学生' },
  { label: '毕业5年内大学生', value: '毕业5年内大学生' },
  { label: '深户登记失业人员', value: '深户登记失业人员' },
  { label: '其他社会人员(本科+)', value: '其他' },
]

const areaOptions = [
  { label: '龙岗区', value: '龙岗区' },
  { label: '罗湖区', value: '罗湖区' },
  { label: '光明区', value: '光明区' },
  { label: '其他', value: '其他' },
]
</script>

<style scoped>
.form-step { padding: 0 4px; }
h3 { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px; }
.form-group { margin-bottom: 16px; }
.form-group > label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-input {
  width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.15); }

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
