<template>
  <div class="direction-step">
    <!-- Phase 1: Input direction -->
    <div v-if="subPhase === 'input'" class="phase-input">
      <h3>描述您的创业方向</h3>
      <p class="hint">一句话描述您想做的业务</p>
      <textarea
        v-model="wizard.state.directionInput"
        placeholder="例如：用AI帮深圳美妆商家做自动客服和营销文案"
        rows="3"
        class="direction-textarea"
      />
      <button
        class="btn-primary"
        :disabled="!wizard.state.directionInput.trim() || wizard.state.isMatching"
        @click="handleMatch"
      >
        {{ wizard.state.isMatching ? '正在分析匹配...' : '开始匹配 →' }}
      </button>
    </div>

    <!-- Phase 2: Select matched theme -->
    <div v-if="subPhase === 'select-theme'" class="phase-select">
      <h3>为您匹配到以下创业主题</h3>
      <div
        v-for="match in wizard.state.matchResult?.matches"
        :key="match.themeName"
        :class="['theme-card', { selected: isSelected(match) }]"
        @click="handleSelectTheme(match)"
      >
        <div class="theme-header">
          <span class="theme-name">{{ match.themeName }}</span>
          <span class="theme-category">{{ match.category }}</span>
        </div>
        <div class="theme-reason">{{ match.reason }}</div>
        <div class="theme-confidence">匹配度 {{ (match.confidence * 100).toFixed(0) }}%</div>
      </div>

      <div class="phase-actions">
        <button class="btn-secondary" @click="subPhase = 'input'">← 重新输入</button>
        <button
          class="btn-primary"
          :disabled="!wizard.state.selectedThemeId || !wizard.state.themeData"
          @click="subPhase = 'select-scopes'"
        >
          选择经营范围 →
        </button>
      </div>
    </div>

    <!-- Phase 3: Select scopes -->
    <div v-if="subPhase === 'select-scopes'" class="phase-scopes">
      <div class="scope-header">
        <h3>选择经营范围</h3>
        <p class="scope-hint">
          主题：{{ wizard.state.themeData?.themeName }}（{{ wizard.state.themeData?.category }}）
        </p>
      </div>

      <div class="scope-list">
        <label
          v-for="item in wizard.state.themeData?.items"
          :key="item.scopeId"
          :class="['scope-item', { checked: wizard.state.selectedScopeIds.includes(item.scopeId) }]"
        >
          <input
            type="checkbox"
            :value="item.scopeId"
            :checked="wizard.state.selectedScopeIds.includes(item.scopeId)"
            @change="toggleScope(item.scopeId)"
          />
          <div class="scope-info">
            <span class="scope-name">{{ item.standardItem }}</span>
            <span class="scope-code">{{ item.scopeCode }}</span>
            <span :class="['scope-permit', item.permitType === 0 ? 'safe' : 'warn']">
              {{ item.permitType === 0 ? '无需许可' : '需要许可' }}
            </span>
          </div>
          <div class="scope-desc">{{ item.description }}</div>
        </label>
      </div>

      <div v-if="wizard.selectedScopeItems.value.length" class="scope-details">
        <h4>已选经营范围详情</h4>
        <div v-for="d in wizard.selectedScopeItems.value" :key="d.scopeId" class="detail-card">
          <div class="detail-name">{{ d.standardItem }}</div>
          <div v-if="d.detail?.includedItems" class="detail-row">
            <span class="label">包含:</span> {{ d.detail.includedItems }}
          </div>
          <div v-if="d.detail?.notIncluded" class="detail-row">
            <span class="label">不含:</span> {{ d.detail.notIncluded }}
          </div>
          <div class="detail-row">
            <span class="label">许可:</span>
            <span :class="d.detail?.isPermission === '否' ? 'safe' : 'warn'">
              {{ d.detail?.isPermission === '否' ? '无需前置许可' : (d.detail?.permitExplain || '需要许可') }}
            </span>
          </div>
        </div>
      </div>

      <div class="phase-actions">
        <button class="btn-secondary" @click="subPhase = 'select-theme'">← 返回选择主题</button>
        <button
          class="btn-primary"
          :disabled="wizard.state.selectedScopeIds.length === 0"
          @click="wizard.nextStep()"
        >
          确认，继续 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWizard, type ThemeMatchItem } from '@/composables/useWizard'

const wizard = useWizard()
const subPhase = ref<'input' | 'select-theme' | 'select-scopes'>('input')

async function handleMatch() {
  await wizard.matchDirection(wizard.state.directionInput)
  if (wizard.state.matchResult?.matches?.length) {
    subPhase.value = 'select-theme'
  }
}

function isSelected(match: ThemeMatchItem) {
  const entry = wizard.state.themeIndex.find(t => t.themeName === match.themeName)
  return entry && wizard.state.selectedThemeId === entry.id
}

async function handleSelectTheme(match: ThemeMatchItem) {
  const entry = wizard.state.themeIndex.find(t => t.themeName === match.themeName)
  if (entry) {
    await wizard.selectTheme(entry.id)
  }
}

function toggleScope(scopeId: string) {
  const idx = wizard.state.selectedScopeIds.indexOf(scopeId)
  if (idx >= 0) {
    wizard.state.selectedScopeIds.splice(idx, 1)
  } else {
    wizard.state.selectedScopeIds.push(scopeId)
  }
}
</script>

<style scoped>
.direction-step { padding: 0 4px; }

h3 {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px;
}

h4 {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 16px 0 8px;
}

.hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 12px;
}

.direction-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
  font-family: inherit;
}

.direction-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.btn-primary {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover { background: #2563eb; }
.btn-primary:disabled { background: #93c5fd; cursor: not-allowed; }

.btn-secondary {
  padding: 8px 16px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn-secondary:hover { background: #f9fafb; }

.theme-card {
  padding: 12px;
  margin-bottom: 8px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.theme-card:hover { border-color: #93c5fd; }
.theme-card.selected { border-color: #3b82f6; background: #eff6ff; }

.theme-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.theme-name { font-weight: 500; font-size: 14px; color: #111827; }
.theme-category {
  font-size: 11px;
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  color: #6b7280;
}
.theme-reason { font-size: 12px; color: #6b7280; margin: 4px 0; }
.theme-confidence { font-size: 11px; color: #3b82f6; font-weight: 500; }

.scope-header { margin-bottom: 12px; }
.scope-hint { font-size: 12px; color: #6b7280; margin: 2px 0 0; }

.scope-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scope-item {
  display: block;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.scope-item:hover { border-color: #93c5fd; }
.scope-item.checked { border-color: #3b82f6; background: #eff6ff; }
.scope-item input[type="checkbox"] { margin-right: 8px; }

.scope-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.scope-name { font-weight: 500; font-size: 13px; }
.scope-code { font-size: 11px; color: #9ca3af; }
.scope-permit { font-size: 11px; padding: 1px 6px; border-radius: 4px; }
.scope-permit.safe { background: #ecfdf5; color: #059669; }
.scope-permit.warn { background: #fef3c7; color: #d97706; }
.scope-desc { font-size: 12px; color: #6b7280; margin-top: 4px; line-height: 1.4; }

.scope-details {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.detail-card {
  padding: 10px 12px;
  margin-bottom: 6px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 12px;
}

.detail-name { font-weight: 600; color: #374151; margin-bottom: 4px; }
.detail-row { color: #6b7280; line-height: 1.5; }
.detail-row .label { color: #374151; font-weight: 500; }
.safe { color: #059669; }
.warn { color: #d97706; }

.phase-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
}
</style>
