<template>
  <div class="wizard-page">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <WizardMode v-else @cancel="goHome" @complete="goHome" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDifyStore } from '@/stores/dify'
import { useWizard } from '@/composables/useWizard'

const router = useRouter()
const difyStore = useDifyStore()
const wizard = useWizard()
const loading = ref(true)

function goHome() {
  router.push('/')
}

onMounted(async () => {
  // 确保 Dify 配置已加载
  if (!difyStore.config.opcToken) {
    await difyStore.initConfig()
  }
  // 启动向导
  wizard.startWizard()
  loading.value = false
})
</script>

<style scoped>
.wizard-page {
  min-height: calc(100vh - var(--header-height) - 80px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
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
</style>
