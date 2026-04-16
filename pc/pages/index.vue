<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <section class="hero-banner">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title">醉美酒坊</h1>
        <p class="hero-subtitle">传承百年 匠心酿造</p>
        <p class="hero-desc">每一滴都是岁月的沉淀</p>
        <el-button type="primary" size="large" class="hero-btn" @click="goToProducts">
          探索佳酿
        </el-button>
      </div>
    </section>

    <!-- 产品推荐 -->
    <section class="featured-products">
      <div class="container">
        <h2 class="section-title">精选推荐</h2>
        <p class="section-subtitle">臻选佳酿 品味非凡</p>
        
        <div class="product-grid">
          <div
            v-for="(product, index) in featuredProducts"
            :key="index"
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-overlay">
                <el-button type="primary" @click="viewProduct(product)">
                  查看详情
                </el-button>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.desc }}</p>
              <p class="product-price">¥{{ product.price }}</p>
            </div>
          </div>
        </div>

        <div class="text-center" style="margin-top: 40px;">
          <el-button size="large" @click="goToProducts">
            查看更多产品
          </el-button>
        </div>
      </div>
    </section>

    <!-- 品牌优势 -->
    <section class="advantages">
      <div class="container">
        <h2 class="section-title">为什么选择醉美酒坊</h2>
        
        <div class="advantage-grid">
          <div
            v-for="(advantage, index) in advantages"
            :key="index"
            class="advantage-card"
          >
            <div class="advantage-icon">
              <i :class="advantage.icon"></i>
            </div>
            <h3 class="advantage-title">{{ advantage.title }}</h3>
            <p class="advantage-desc">{{ advantage.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.customers }}</div>
            <div class="stat-label">满意客户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.sales }}</div>
            <div class="stat-label">年销售额（万）</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.years }}</div>
            <div class="stat-label">品牌历史（年）</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.products }}</div>
            <div class="stat-label">产品种类</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const featuredProducts = ref([
  {
    name: '珍藏陈酿白酒',
    desc: '10年窖藏 醇厚绵长',
    price: '688',
    image: 'https://placehold.co/400x400/1A1A1A/D4AF37?text=白酒'
  },
  {
    name: '法国进口红酒',
    desc: '波尔多庄园 AOC级',
    price: '1288',
    image: 'https://placehold.co/400x400/8B0000/D4AF37?text=红酒'
  },
  {
    name: '苏格兰威士忌',
    desc: '18年单一麦芽',
    price: '1688',
    image: 'https://placehold.co/400x400/2C2C2C/D4AF37?text=威士忌'
  },
  {
    name: '精酿啤酒礼盒',
    desc: '德式工艺 12瓶装',
    price: '299',
    image: 'https://placehold.co/400x400/D4A017/1A1A1A?text=啤酒'
  }
])

const advantages = ref([
  {
    icon: 'el-icon-medal',
    title: '原产地直供',
    desc: '与全球知名酒庄直接合作，确保每一瓶都是正品'
  },
  {
    icon: 'el-icon-star-on',
    title: '品质保证',
    desc: '专业品酒师团队严格筛选，只推荐优质佳酿'
  },
  {
    icon: 'el-icon-truck',
    title: '极速发货',
    desc: '现货库存，24小时内发货，快速送达'
  },
  {
    icon: 'el-icon-service',
    title: '售后无忧',
    desc: '7天无理由退换，专业客服团队全程服务'
  }
])

const stats = ref({
  customers: '10000+',
  sales: '500+',
  years: '20',
  products: '200+'
})

const goToProducts = () => {
  router.push('/products')
}

const viewProduct = (product: any) => {
  router.push('/products')
}
</script>

<style scoped lang="scss">
.home-page {
  width: 100%;
}

.hero-banner {
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1A1A1A 0%, #8B0000 100%);
    z-index: 1;
  }
  
  .hero-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://placehold.co/1920x600/1A1A1A/8B0000?text=ZuiMei+Wine+Shop');
    background-size: cover;
    background-position: center;
    opacity: 0.3;
  }
  
  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
    padding: 0 20px;
    
    .hero-title {
      font-size: 64px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #D4AF37;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    
    .hero-subtitle {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 300;
    }
    
    .hero-desc {
      font-size: 20px;
      margin-bottom: 40px;
      opacity: 0.9;
    }
    
    .hero-btn {
      font-size: 18px;
      padding: 15px 40px;
      background-color: #D4AF37;
      border-color: #D4AF37;
      color: #1A1A1A;
      
      &:hover {
        background-color: #C5A028;
        border-color: #C5A028;
      }
    }
  }
}

.featured-products {
  padding: 80px 0;
  background-color: #fff;
  
  .section-title {
    text-align: center;
    font-size: 42px;
    margin-bottom: 10px;
    color: #1A1A1A;
  }
  
  .section-subtitle {
    text-align: center;
    font-size: 18px;
    color: #666;
    margin-bottom: 50px;
  }
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
  }
  
  .product-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 24px rgba(139, 0, 0, 0.15);
    }
    
    .product-image {
      position: relative;
      height: 280px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .product-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(26, 26, 26, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        
        :deep(.el-button) {
          background-color: #8B0000;
          border-color: #8B0000;
          
          &:hover {
            background-color: #6B0000;
            border-color: #6B0000;
          }
        }
      }
      
      &:hover .product-overlay {
        opacity: 1;
      }
    }
    
    .product-info {
      padding: 20px;
      
      .product-name {
        font-size: 20px;
        margin-bottom: 10px;
        color: #1A1A1A;
      }
      
      .product-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
      }
      
      .product-price {
        font-size: 24px;
        font-weight: bold;
        color: #8B0000;
      }
    }
  }
}

.advantages {
  padding: 80px 0;
  background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
  color: #fff;
  
  .section-title {
    text-align: center;
    font-size: 42px;
    margin-bottom: 50px;
    color: #D4AF37;
  }
  
  .advantage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .advantage-card {
    text-align: center;
    padding: 30px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-5px);
    }
    
    .advantage-icon {
      font-size: 48px;
      margin-bottom: 20px;
      color: #D4AF37;
    }
    
    .advantage-title {
      font-size: 22px;
      margin-bottom: 15px;
      color: #D4AF37;
    }
    
    .advantage-desc {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }
  }
}

.stats {
  padding: 80px 0;
  background-color: #8B0000;
  color: #fff;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-number {
      font-size: 56px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #D4AF37;
    }
    
    .stat-label {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.9);
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
  .hero-banner {
    height: 400px;
    
    .hero-content {
      .hero-title {
        font-size: 36px;
      }
      
      .hero-subtitle {
        font-size: 20px;
      }
      
      .hero-desc {
        font-size: 16px;
      }
    }
  }
  
  .featured-products,
  .advantages,
  .stats {
    padding: 40px 0;
  }
  
  .section-title {
    font-size: 32px !important;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .advantage-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .stat-item {
    .stat-number {
      font-size: 36px !important;
    }
    
    .stat-label {
      font-size: 14px !important;
    }
  }
}
</style>
