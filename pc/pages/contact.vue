<template>
  <div class="contact-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <h1 class="page-title">联系我们</h1>
        <p class="page-subtitle">期待与您合作</p>
      </div>
    </section>

    <!-- 联系信息 -->
    <section class="contact-info">
      <div class="container">
        <div class="info-grid">
          <div class="info-card">
            <div class="info-icon">
              <i class="el-icon-location"></i>
            </div>
            <h3 class="info-title">公司地址</h3>
            <p class="info-text">北京市朝阳区酒坊大街88号醉美酒坊</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">
              <i class="el-icon-phone"></i>
            </div>
            <h3 class="info-title">联系电话</h3>
            <p class="info-text">400-888-9999</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <h3 class="info-title">微信客服</h3>
            <p class="info-text">zuijiejiufang</p>
          </div>
          
          <div class="info-card">
            <div class="info-icon">
              <i class="el-icon-message"></i>
            </div>
            <h3 class="info-title">电子邮箱</h3>
            <p class="info-text">contact@zuijiejiufang.com</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 在线留言 -->
    <section class="contact-form">
      <div class="container">
        <div class="form-wrapper">
          <div class="form-info">
            <h2 class="form-title">在线留言</h2>
            <p class="form-desc">
              如果您有任何问题或建议，欢迎随时与我们联系。
              我们会尽快回复您的留言。
            </p>
            
            <div class="business-hours">
              <h3 class="hours-title">营业时间</h3>
              <p class="hours-text">周一至周五：9:00 - 18:00</p>
              <p class="hours-text">周六至周日：10:00 - 17:00</p>
            </div>
          </div>
          
          <div class="form-content">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入您的姓名" />
              </el-form-item>
              
              <el-form-item label="电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入您的联系电话" />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入您的邮箱（选填）" />
              </el-form-item>
              
              <el-form-item label="留言内容" prop="message">
                <el-input
                  v-model="form.message"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入您的留言内容"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="submitForm" size="large">
                  提交留言
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </section>

    <!-- 地图位置 -->
    <section class="map-section">
      <div class="container">
        <h2 class="section-title text-center">我们的位置</h2>
        <div class="map-wrapper">
          <div class="map-placeholder">
            <i class="el-icon-location-outline"></i>
            <p>地图加载中...</p>
            <p class="map-hint">（实际使用时请接入真实地图）</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  message: ''
})

const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入您的联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
})

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 调用API提交评估申请
        const { api } = await import('~/api/assessment')

        await api.submitAssessment({
          name: form.name,
          phone: form.phone,
          stage: 'idea', // 联系我们默认为需求了解阶段
          content: form.message
        })

        ElMessage.success('留言提交成功！我们会尽快与您联系。')

        // 重置表单
        formRef.value?.resetFields()
      } catch (error) {
        ElMessage.error('提交失败，请稍后重试')
        console.error('提交失败:', error)
      }
    } else {
      ElMessage.error('请填写完整且正确的信息')
      return false
    }
  })
}
</script>

<style scoped lang="scss">
.contact-page {
  width: 100%;
}

.page-header {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1A1A1A 0%, #8B0000 100%);
    z-index: 1;
  }
  
  .header-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
    padding: 0 20px;
    
    .page-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #D4AF37;
    }
    
    .page-subtitle {
      font-size: 20px;
      opacity: 0.9;
    }
  }
}

.contact-info {
  padding: 60px 0;
  background-color: #fff;
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .info-card {
    text-align: center;
    padding: 40px 30px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #8B0000;
      box-shadow: 0 8px 24px rgba(139, 0, 0, 0.15);
      transform: translateY(-5px);
    }
    
    .info-icon {
      font-size: 48px;
      color: #8B0000;
      margin-bottom: 20px;
    }
    
    .info-title {
      font-size: 18px;
      color: #1A1A1A;
      margin-bottom: 10px;
    }
    
    .info-text {
      font-size: 16px;
      color: #666;
    }
  }
}

.contact-form {
  padding: 60px 0;
  background-color: #f5f5f5;
  
  .form-wrapper {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 60px;
    background: #fff;
    padding: 50px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .form-info {
    .form-title {
      font-size: 32px;
      margin-bottom: 20px;
      color: #1A1A1A;
    }
    
    .form-desc {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    
    .business-hours {
      padding: 30px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #8B0000;
      
      .hours-title {
        font-size: 18px;
        color: #1A1A1A;
        margin-bottom: 15px;
      }
      
      .hours-text {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
    }
  }
  
  .form-content {
    :deep(.el-form-item__label) {
      color: #1A1A1A;
      font-weight: 500;
    }
    
    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      border-color: #e0e0e0;
      
      &:focus {
        border-color: #8B0000;
      }
    }
    
    :deep(.el-button--primary) {
      background-color: #8B0000;
      border-color: #8B0000;
      
      &:hover {
        background-color: #6B0000;
        border-color: #6B0000;
      }
    }
  }
}

.map-section {
  padding: 60px 0;
  background-color: #fff;
  
  .section-title {
    font-size: 36px;
    margin-bottom: 40px;
    color: #1A1A1A;
  }
  
  .map-wrapper {
    height: 400px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }
  
  .map-placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    color: #666;
    
    i {
      font-size: 64px;
      margin-bottom: 20px;
      color: #8B0000;
    }
    
    p {
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .map-hint {
      font-size: 14px;
      color: #999;
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .page-header {
    height: 200px;
    
    .header-content {
      .page-title {
        font-size: 32px;
      }
      
      .page-subtitle {
        font-size: 16px;
      }
    }
  }
  
  .contact-info,
  .contact-form,
  .map-section {
    padding: 30px 0;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .form-wrapper {
    grid-template-columns: 1fr;
    padding: 30px;
  }
  
  .form-info {
    .form-title {
      font-size: 24px;
    }
  }
  
  .section-title {
    font-size: 28px !important;
  }
  
  .map-wrapper {
    height: 300px;
  }
}
</style>
