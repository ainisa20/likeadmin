<template>
  <div class="wizard-standalone">
    <!-- 顶栏 -->
    <header class="wizard-header">
      <button class="back-btn" @click="goHome" aria-label="返回">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="header-title">OPC创业落地分析</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 向导内容 -->
    <div class="wizard-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <WizardMode v-else @cancel="goHome" @complete="goHome" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDifyStore } from '@/stores/dify'
import { useWizard } from '@/composables/useWizard'
import WizardMode from '@/components/DifyChat/WizardMode.vue'

definePageMeta({ layout: 'blank' })

const difyStore = useDifyStore()
const wizard = useWizard()
const loading = ref(true)

function goHome() {
  window.location.href = '/pc/'
}

onMounted(async () => {
  await difyStore.initConfig()
  wizard.startWizard()
  loading.value = false
})
</script>

<style scoped>
.wizard-standalone {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  z-index: 9999;
}

.wizard-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #374151;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}

.back-btn:hover {
  background: #f3f4f6;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
}

.header-spacer {
  width: 32px;
  flex-shrink: 0;
}

.wizard-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

/* 覆盖 WizardMode 内部的 height: 100% 依赖链 */
.wizard-content > div {
  height: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 移动端优化 */
@media (max-width: 640px) {
  .wizard-header {
    padding: 10px 12px;
  }

  .header-title {
    font-size: 15px;
  }
}
</style>
