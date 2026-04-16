<template>
  <div class="products-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <h1 class="page-title">产品中心</h1>
        <p class="page-subtitle">臻选佳酿 品味非凡</p>
      </div>
    </section>

    <!-- 筛选区域 -->
    <section class="filters">
      <div class="container">
        <div class="filter-bar">
          <div class="filter-group">
            <span class="filter-label">酒类：</span>
            <el-radio-group v-model="selectedCategory" @change="filterProducts">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="白酒">白酒</el-radio-button>
              <el-radio-button label="红酒">红酒</el-radio-button>
              <el-radio-button label="威士忌">威士忌</el-radio-button>
              <el-radio-button label="啤酒">啤酒</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="filter-group">
            <span class="filter-label">价格：</span>
            <el-select v-model="selectedPrice" placeholder="选择价格区间" @change="filterProducts" style="width: 200px;">
              <el-option label="全部" value="all"></el-option>
              <el-option label="0-300元" value="0-300"></el-option>
              <el-option label="300-800元" value="300-800"></el-option>
              <el-option label="800-1500元" value="800-1500"></el-option>
              <el-option label="1500元以上" value="1500-9999"></el-option>
            </el-select>
          </div>
        </div>
      </div>
    </section>

    <!-- 产品列表 -->
    <section class="product-list">
      <div class="container">
        <div class="products-grid">
          <div
            v-for="(product, index) in filteredProducts"
            :key="index"
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge" v-if="product.badge">
                {{ product.badge }}
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-category">{{ product.category }}</p>
              <p class="product-desc">{{ product.desc }}</p>
              <div class="product-footer">
                <p class="product-price">¥{{ product.price }}</p>
                <el-button type="primary" size="small" @click="buyProduct(product)">
                  立即购买
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center" style="margin-top: 50px;" v-if="filteredProducts.length === 0">
          <el-empty description="暂无相关产品"></el-empty>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const selectedCategory = ref('all')
const selectedPrice = ref('all')

const products = ref([
  {
    name: '珍藏陈酿白酒',
    category: '白酒',
    desc: '10年窖藏 醇厚绵长 回味悠长',
    price: '688',
    image: 'https://placehold.co/400x400/1A1A1A/D4AF37?text=白酒1',
    badge: '热销'
  },
  {
    name: '浓香型精品白酒',
    category: '白酒',
    desc: '传统工艺 口感协调',
    price: '398',
    image: 'https://placehold.co/400x400/1A1A1A/D4AF37?text=白酒2',
    badge: ''
  },
  {
    name: '酱香型大师酒',
    category: '白酒',
    desc: '大师酿造 酱香突出',
    price: '1288',
    image: 'https://placehold.co/400x400/1A1A1A/D4AF37?text=白酒3',
    badge: '推荐'
  },
  {
    name: '法国波尔多红酒',
    category: '红酒',
    desc: 'AOC级 法式浪漫',
    price: '1288',
    image: 'https://placehold.co/400x400/8B0000/D4AF37?text=红酒1',
    badge: '推荐'
  },
  {
    name: '意大利托斯卡纳',
    category: '红酒',
    desc: 'DOCG级 经典基安蒂',
    price: '888',
    image: 'https://placehold.co/400x400/8B0000/D4AF37?text=红酒2',
    badge: ''
  },
  {
    name: '澳洲巴罗莎谷',
    category: '红酒',
    desc: '西拉子 果香浓郁',
    price: '588',
    image: 'https://placehold.co/400x400/8B0000/D4AF37?text=红酒3',
    badge: ''
  },
  {
    name: '苏格兰单一麦芽',
    category: '威士忌',
    desc: '18年陈酿 泥煤烟熏',
    price: '1688',
    image: 'https://placehold.co/400x400/2C2C2C/D4AF37?text=威士忌1',
    badge: '精品'
  },
  {
    name: '日本山崎',
    category: '威士忌',
    desc: '12年 东方韵味',
    price: '2888',
    image: 'https://placehold.co/400x400/2C2C2C/D4AF37?text=威士忌2',
    badge: '限量'
  },
  {
    name: '爱尔兰威士忌',
    category: '威士忌',
    desc: '三重蒸馏 口感柔顺',
    price: '788',
    image: 'https://placehold.co/400x400/2C2C2C/D4AF37?text=威士忌3',
    badge: ''
  },
  {
    name: '德式精酿啤酒',
    category: '啤酒',
    desc: '500ml×12瓶 传统酿造',
    price: '299',
    image: 'https://placehold.co/400x400/D4A017/1A1A1A?text=啤酒1',
    badge: '热销'
  },
  {
    name: '比利时修道院',
    category: '啤酒',
    desc: '330ml×6瓶 双料艾尔',
    price: '368',
    image: 'https://placehold.co/400x400/D4A017/1A1A1A?text=啤酒2',
    badge: ''
  },
  {
    name: '美式精酿IPA',
    category: '啤酒',
    desc: '355ml×6瓶 酒花香气',
    price: '188',
    image: 'https://placehold.co/400x400/D4A017/1A1A1A?text=啤酒3',
    badge: ''
  }
])

const filteredProducts = computed(() => {
  let result = products.value

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  // 价格筛选
  if (selectedPrice.value !== 'all') {
    const [min, max] = selectedPrice.value.split('-').map(Number)
    result = result.filter(p => {
      const price = Number(p.price)
      return price >= min && price <= max
    })
  }

  return result
})

const filterProducts = () => {
  // 触发 computed 重新计算
}

const buyProduct = (product: any) => {
  ElMessage.success(`已将 "${product.name}" 加入购物车！`)
}
</script>

<style scoped lang="scss">
.products-page {
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

.filters {
  padding: 30px 0;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .filter-label {
      font-size: 16px;
      color: #1A1A1A;
      font-weight: 500;
    }
  }
}

.product-list {
  padding: 60px 0;
  background-color: #fff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
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
    background-color: #f5f5f5;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.1);
    }
    
    .product-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      padding: 5px 12px;
      background-color: #8B0000;
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
      font-weight: 500;
    }
  }
  
  .product-info {
    padding: 20px;
    
    .product-name {
      font-size: 20px;
      margin-bottom: 8px;
      color: #1A1A1A;
      font-weight: 600;
    }
    
    .product-category {
      font-size: 14px;
      color: #8B0000;
      margin-bottom: 10px;
      display: inline-block;
      padding: 3px 10px;
      background-color: rgba(139, 0, 0, 0.1);
      border-radius: 4px;
    }
    
    .product-desc {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
      min-height: 42px;
    }
    
    .product-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid #f0f0f0;
      
      .product-price {
        font-size: 24px;
        font-weight: bold;
        color: #8B0000;
      }
      
      :deep(.el-button) {
        background-color: #8B0000;
        border-color: #8B0000;
        
        &:hover {
          background-color: #6B0000;
          border-color: #6B0000;
        }
      }
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
  
  .filters {
    .filter-bar {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .filter-group {
      width: 100%;
      
      .filter-label {
        flex-shrink: 0;
      }
    }
  }
  
  .product-list {
    padding: 30px 0;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>
