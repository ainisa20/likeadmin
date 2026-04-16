<template>
  <div class="story-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <h1 class="page-title">品牌故事</h1>
        <p class="page-subtitle">传承百年 匠心酿造</p>
      </div>
    </section>

    <!-- 品牌使命 -->
    <section class="mission">
      <div class="container">
        <div class="mission-content">
          <div class="mission-text">
            <h2 class="section-title">我们的使命</h2>
            <p class="mission-desc">
              醉美酒坊成立于2004年，致力于为每一位爱酒人士提供世界各地的优质佳酿。
              我们相信，每一瓶好酒都承载着酿酒师的心血与岁月的沉淀。
            </p>
            <p class="mission-desc">
              二十年来，我们始终秉持"品质至上、诚信经营"的理念，
              与全球知名酒庄建立深度合作关系，从源头确保每一瓶酒的品质。
            </p>
            <div class="mission-values">
              <div class="value-item">
                <i class="el-icon-medal"></i>
                <span>品质至上</span>
              </div>
              <div class="value-item">
                <i class="el-icon-star-on"></i>
                <span>诚信经营</span>
              </div>
              <div class="value-item">
                <i class="el-icon-service"></i>
                <span>客户第一</span>
              </div>
            </div>
          </div>
          <div class="mission-image">
            <img src="https://placehold.co/600x400/1A1A1A/D4AF37?text=Our+Mission" alt="品牌使命" />
          </div>
        </div>
      </div>
    </section>

    <!-- 发展历程 -->
    <section class="timeline">
      <div class="container">
        <h2 class="section-title text-center">发展历程</h2>
        <div class="timeline-list">
          <div
            v-for="(milestone, index) in milestones"
            :key="index"
            class="timeline-item"
            :class="{ 'timeline-item-right': index % 2 === 1 }"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-year">{{ milestone.year }}</div>
              <h3 class="timeline-title">{{ milestone.title }}</h3>
              <p class="timeline-desc">{{ milestone.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 酿造工艺 -->
    <section class="craft">
      <div class="container">
        <h2 class="section-title text-center">酿造工艺</h2>
        <p class="section-subtitle text-center">传统与现代的完美结合</p>
        
        <div class="craft-grid">
          <div
            v-for="(craft, index) in crafts"
            :key="index"
            class="craft-card"
          >
            <div class="craft-icon">
              <i :class="craft.icon"></i>
            </div>
            <h3 class="craft-title">{{ craft.title }}</h3>
            <p class="craft-desc">{{ craft.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 企业荣誉 -->
    <section class="honors">
      <div class="container">
        <h2 class="section-title text-center">企业荣誉</h2>
        <div class="honors-grid">
          <div
            v-for="(honor, index) in honors"
            :key="index"
            class="honor-item"
          >
            <div class="honor-icon">
              <i class="el-icon-trophy"></i>
            </div>
            <h3 class="honor-title">{{ honor.title }}</h3>
            <p class="honor-year">{{ honor.year }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="contact">
      <div class="container">
        <h2 class="section-title text-center">联系我们</h2>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">
              <i class="el-icon-location"></i>
            </div>
            <h3 class="contact-title">地址</h3>
            <p class="contact-info">北京市朝阳区酒坊大街88号醉美酒坊</p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="el-icon-phone"></i>
            </div>
            <h3 class="contact-title">电话</h3>
            <p class="contact-info">400-888-9999</p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <h3 class="contact-title">微信</h3>
            <p class="contact-info">zuijiejiufang</p>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i class="el-icon-message"></i>
            </div>
            <h3 class="contact-title">邮箱</h3>
            <p class="contact-info">contact@zuijiejiufang.com</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const milestones = ref([
  {
    year: '2004',
    title: '品牌创立',
    desc: '醉美酒坊在北京成立，开启精品酒水零售业务'
  },
  {
    year: '2008',
    title: '全球采购',
    desc: '建立国际采购团队，与法国、意大利酒庄建立合作'
  },
  {
    year: '2012',
    title: '品牌升级',
    desc: '全面升级品牌形象，推出高端会员服务体系'
  },
  {
    year: '2016',
    title: '线上平台',
    desc: '推出官方网站和电商平台，拓展线上销售渠道'
  },
  {
    year: '2020',
    title: '连锁扩张',
    desc: '在全国开设20家连锁门店，服务更多客户'
  },
  {
    year: '2024',
    title: '全新起航',
    desc: '品牌全面升级，致力于成为行业领先酒水品牌'
  }
])

const crafts = ref([
  {
    icon: 'el-icon-grape',
    title: '严选原料',
    desc: '精选优质葡萄和粮食，从源头保证品质'
  },
  {
    icon: 'el-icon-cpu',
    title: '传统工艺',
    desc: '传承古法酿造工艺，保留原始风味'
  },
  {
    icon: 'el-icon-box',
    title: '现代设备',
    desc: '引进先进生产设备，确保品质稳定'
  },
  {
    icon: 'el-icon-aim',
    title: '严格品控',
    desc: '专业品酒师团队，每批产品严格检测'
  }
])

const honors = ref([
  {
    title: '中国酒水行业十佳品牌',
    year: '2023'
  },
  {
    title: '消费者信赖品牌',
    year: '2022'
  },
  {
    title: '质量信得过产品',
    year: '2021'
  },
  {
    title: '最佳服务质量奖',
    year: '2020'
  },
  {
    title: '行业创新奖',
    year: '2019'
  },
  {
    title: '诚信经营示范单位',
    year: '2018'
  }
])
</script>

<style scoped lang="scss">
.story-page {
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

.mission {
  padding: 80px 0;
  background-color: #fff;
  
  .mission-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  
  .mission-text {
    .section-title {
      font-size: 36px;
      margin-bottom: 30px;
      color: #1A1A1A;
    }
    
    .mission-desc {
      font-size: 16px;
      color: #666;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    
    .mission-values {
      display: flex;
      gap: 30px;
      margin-top: 40px;
      
      .value-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        
        i {
          font-size: 36px;
          color: #8B0000;
        }
        
        span {
          font-size: 16px;
          color: #1A1A1A;
          font-weight: 500;
        }
      }
    }
  }
  
  .mission-image {
    img {
      width: 100%;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  }
}

.timeline {
  padding: 80px 0;
  background-color: #f5f5f5;
  
  .section-title {
    font-size: 36px;
    margin-bottom: 50px;
    color: #1A1A1A;
  }
  
  .timeline-list {
    position: relative;
    max-width: 1000px;
    margin: 0 auto;
    
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, #8B0000 0%, #D4AF37 100%);
      transform: translateX(-50%);
    }
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: 60px;
    width: 50%;
    padding-right: 60px;
    text-align: right;
    
    &.timeline-item-right {
      margin-left: 50%;
      padding-right: 0;
      padding-left: 60px;
      text-align: left;
    }
    
    .timeline-dot {
      position: absolute;
      right: -8px;
      top: 0;
      width: 16px;
      height: 16px;
      background-color: #8B0000;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 3px #8B0000;
    }
    
    &.timeline-item-right .timeline-dot {
      right: auto;
      left: -8px;
    }
    
    .timeline-content {
      background: #fff;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      
      .timeline-year {
        display: inline-block;
        padding: 5px 15px;
        background-color: #8B0000;
        color: #fff;
        border-radius: 20px;
        font-weight: 600;
        margin-bottom: 15px;
      }
      
      .timeline-title {
        font-size: 20px;
        color: #1A1A1A;
        margin-bottom: 10px;
      }
      
      .timeline-desc {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

.craft {
  padding: 80px 0;
  background-color: #fff;
  
  .section-title {
    font-size: 36px;
    margin-bottom: 10px;
    color: #1A1A1A;
  }
  
  .section-subtitle {
    font-size: 18px;
    color: #666;
    margin-bottom: 50px;
  }
  
  .craft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .craft-card {
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
    
    .craft-icon {
      font-size: 48px;
      color: #8B0000;
      margin-bottom: 20px;
    }
    
    .craft-title {
      font-size: 22px;
      color: #1A1A1A;
      margin-bottom: 15px;
    }
    
    .craft-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }
}

.honors {
  padding: 80px 0;
  background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
  color: #fff;
  
  .section-title {
    font-size: 36px;
    margin-bottom: 50px;
    color: #D4AF37;
  }
  
  .honors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .honor-item {
    text-align: center;
    padding: 30px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-5px);
    }
    
    .honor-icon {
      font-size: 48px;
      color: #D4AF37;
      margin-bottom: 20px;
    }
    
    .honor-title {
      font-size: 18px;
      margin-bottom: 10px;
      color: #fff;
    }
    
    .honor-year {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

.contact {
  padding: 80px 0;
  background-color: #fff;
  
  .section-title {
    font-size: 36px;
    margin-bottom: 50px;
    color: #1A1A1A;
  }
  
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .contact-item {
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
    
    .contact-icon {
      font-size: 48px;
      color: #8B0000;
      margin-bottom: 20px;
    }
    
    .contact-title {
      font-size: 18px;
      color: #1A1A1A;
      margin-bottom: 10px;
    }
    
    .contact-info {
      font-size: 16px;
      color: #666;
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
  
  .mission {
    padding: 40px 0;
    
    .mission-content {
      grid-template-columns: 1fr;
      gap: 30px;
    }
    
    .mission-text {
      .section-title {
        font-size: 28px;
      }
      
      .mission-values {
        flex-direction: column;
        gap: 20px;
      }
    }
  }
  
  .timeline {
    padding: 40px 0;
    
    .timeline-list::before {
      left: 20px;
    }
    
    .timeline-item {
      width: 100%;
      padding-left: 60px;
      padding-right: 0;
      text-align: left !important;
      margin-left: 0 !important;
      
      .timeline-dot {
        left: 12px !important;
        right: auto !important;
      }
    }
  }
  
  .craft,
  .honors,
  .contact {
    padding: 40px 0;
  }
  
  .section-title {
    font-size: 28px !important;
  }
  
  .craft-grid,
  .honors-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
