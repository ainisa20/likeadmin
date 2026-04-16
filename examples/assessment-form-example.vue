<template>
  <div class="assessment-form-container">
    <div class="form-header">
      <h2 class="form-title">在线咨询</h2>
      <p class="form-subtitle">填写信息，我们将于24小时内联系您</p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="assessment-form"
    >
      <!-- 姓名 -->
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入您的姓名"
          clearable
        />
      </el-form-item>

      <!-- 电话 -->
      <el-form-item label="电话" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入您的联系电话"
          clearable
          maxlength="11"
        />
      </el-form-item>

      <!-- 咨询类型 -->
      <el-form-item label="咨询类型" prop="stage">
        <el-select
          v-model="form.stage"
          placeholder="请选择咨询类型"
          style="width: 100%"
        >
          <el-option label="产品咨询" value="idea">
            <span>产品咨询</span>
            <span style="color: #8492a6; font-size: 13px; margin-left: 8px">
              了解产品详情和功能
            </span>
          </el-option>
          <el-option label="商务合作" value="direction">
            <span>商务合作</span>
            <span style="color: #8492a6; font-size: 13px; margin-left: 8px">
              企业级合作洽谈
            </span>
          </el-option>
          <el-option label="企业采购" value="company">
            <span>企业采购</span>
            <span style="color: #8492a6; font-size: 13px; margin-left: 8px">
              批量采购需求
            </span>
          </el-option>
          <el-option label="其他咨询" value="team">
            <span>其他咨询</span>
            <span style="color: #8492a6; font-size: 13px; margin-left: 8px">
              其他业务咨询
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 留言内容（新增字段） -->
      <el-form-item label="留言内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          placeholder="请简要描述您的需求或问题（选填，最多500字）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitting"
          style="width: 100%"
          size="large"
        >
          {{ submitting ? '提交中...' : '提交咨询' }}
        </el-button>
      </el-form-item>

      <!-- 提示信息 -->
      <div class="form-tips">
        <i class="el-icon-info"></i>
        <span>我们承诺保护您的隐私，信息仅用于联系您</span>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 表单引用
const formRef = ref()
const submitting = ref(false)

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  stage: 'idea',
  content: ''
})

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入您的联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  stage: [
    { required: true, message: '请选择咨询类型', trigger: 'change' }
  ],
  content: [
    { max: 500, message: '留言内容不能超过500个字符', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  await formRef.value.validate()

  submitting.value = true
  try {
    const res = await request({
      url: '/api/assessment/submit',
      method: 'POST',
      data: {
        name: form.name,
        phone: form.phone,
        stage: form.stage,
        content: form.content
      }
    })

    if (res.code === 1) {
      ElMessage.success('提交成功！我们将于24小时内联系您')
      formRef.value.resetFields()
      form.stage = 'idea' // 重置后设置默认值
    } else {
      ElMessage.error(res.msg || '提交失败，请稍后重试')
    }
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.assessment-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .form-header {
    text-align: center;
    margin-bottom: 40px;

    .form-title {
      font-size: 28px;
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 10px;
    }

    .form-subtitle {
      font-size: 14px;
      color: #666;
    }
  }

  .assessment-form {
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #1A1A1A;
    }

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      border-radius: 4px;
    }

    :deep(.el-select) {
      width: 100%;
    }
  }

  .form-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    color: #666;

    i {
      color: #409EFF;
      font-size: 16px;
    }
  }
}

@media (max-width: 768px) {
  .assessment-form-container {
    padding: 30px 20px;

    .form-header {
      .form-title {
        font-size: 24px;
      }
    }

    .assessment-form {
      :deep(.el-form-item__label) {
        width: 70px !important;
      }
    }
  }
}
</style>
