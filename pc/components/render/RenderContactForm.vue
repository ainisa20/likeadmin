<template>
  <div class="contact-form-section">
    <div class="cf-container">
      <div class="cf-card">
        <h2 class="cf-heading">{{ heading }}</h2>
        <p v-if="subheading" class="cf-subheading">{{ subheading }}</p>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          class="cf-form"
        >
          <div class="cf-row" v-if="isTwoColumn">
            <template v-for="(field, index) in fields" :key="field.name">
              <el-form-item :label="field.label" :prop="field.name">
                <el-select
                  v-if="field.type === 'select'"
                  v-model="formData[field.name]"
                  :placeholder="field.placeholder || `请选择${field.label}`"
                  size="large"
                  class="w-full"
                >
                  <el-option
                    v-for="opt in field.options"
                    :key="opt"
                    :label="opt"
                    :value="opt"
                  />
                </el-select>
                <el-input
                  v-else-if="field.type === 'textarea'"
                  v-model="formData[field.name]"
                  type="textarea"
                  :rows="4"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  :maxlength="500"
                  show-word-limit
                />
                <el-input
                  v-else
                  v-model="formData[field.name]"
                  :placeholder="field.placeholder || `请输入${field.label}`"
                  size="large"
                  :maxlength="field.type === 'phone' ? 11 : undefined"
                />
              </el-form-item>
            </template>
          </div>
          <template v-else>
            <el-form-item
              v-for="field in fields"
              :key="field.name"
              :label="field.label"
              :prop="field.name"
            >
              <el-select
                v-if="field.type === 'select'"
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                size="large"
                class="w-full"
              >
                <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.name]"
                type="textarea"
                :rows="4"
                :placeholder="field.placeholder || `请输入${field.label}`"
                :maxlength="500"
                show-word-limit
              />
              <el-input
                v-else
                v-model="formData[field.name]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                size="large"
                :maxlength="field.type === 'phone' ? 11 : undefined"
              />
            </el-form-item>
          </template>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="cf-submit"
              :loading="submitting"
              @click="handleSubmit"
            >
              {{ submitText }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ContactFormProps } from '@/types/page-builder'
import { submitAssessment } from '@/api/assessment'

const props = withDefaults(defineProps<ContactFormProps & { sectionId?: string }>(), {
  submitText: '提交',
  successMessage: '提交成功',
  fields: () => []
})

const formRef = ref()
const submitting = ref(false)

// 动态构建表单数据和验证规则
const formData = reactive<Record<string, string>>({})
const formRules = reactive<Record<string, any[]>>({})

for (const field of props.fields) {
  formData[field.name] = ''
  const rules: any[] = []
  if (field.required) {
    rules.push({ required: true, message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}`, trigger: field.type === 'select' ? 'change' : 'blur' })
  }
  if (field.type === 'phone') {
    rules.push({ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' })
  }
  if (field.type === 'email') {
    rules.push({ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' })
  }
  if (rules.length) {
    formRules[field.name] = rules
  }
}

const isTwoColumn = computed(() => {
  const nonTextarea = props.fields.filter(f => f.type !== 'textarea')
  return nonTextarea.length >= 2
})

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    await submitAssessment({
      name: formData.name || '',
      phone: formData.phone || '',
      content: formData.content || ''
    })
    ElMessage.success(props.successMessage)
    formRef.value.resetFields()
  } catch (error: any) {
    if (typeof error === 'string') {
      ElMessage.error(error)
    } else if (error?.message) {
      ElMessage.error(error.message)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cf-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.cf-card {
  background: #ffffff;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.cf-heading {
  font-size: 1.75rem;
  font-weight: 600;
  color: #303133;
  text-align: center;
  margin-bottom: 12px;
}

.cf-subheading {
  font-size: 1rem;
  color: #606266;
  text-align: center;
  margin-bottom: 40px;
}

.cf-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.cf-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

.cf-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* textarea 和最后一个 field-item 撑满整行 */
.cf-row :deep(.el-form-item:last-child) {
  grid-column: 1 / -1;
}

.cf-submit {
  width: 100%;
  height: 50px;
  font-size: 1.125rem;
  font-weight: 500;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .cf-card {
    padding: 32px 24px;
  }
  .cf-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
