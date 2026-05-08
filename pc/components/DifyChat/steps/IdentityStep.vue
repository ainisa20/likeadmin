<template>
  <div class="form-step">
    <h3>基础身份信息</h3>

    <div class="form-group">
      <label>您的姓名</label>
      <input v-model="wizard.state.identity.name" placeholder="化名即可" class="form-input" />
    </div>

    <div class="form-group">
      <label>联系方式</label>
      <input v-model="wizard.state.identity.phone" placeholder="手机号码" class="form-input" type="tel" maxlength="11" />
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
  { label: '🧑‍🎓 应届/毕业5年内', value: 'graduate' },
  { label: '🤖 OPC/AI创业者', value: 'opc' },
  { label: '🎓 在校大学生（2026届毕业生）', value: 'student' },
  { label: '🚀 大学生+OPC创业双重身份', value: 'both' },
]

const areaOptions = [
  { label: '罗湖区', value: 'luohu' },
  { label: '龙岗区', value: 'longgang' },
  { label: '光明区', value: 'guangming' },
  { label: '南山区', value: 'nanshan' },
  { label: '其他区/暂未确定', value: 'other' },
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
