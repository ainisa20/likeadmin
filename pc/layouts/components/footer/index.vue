<template>
    <footer class="layout-footer text-center py-[30px]" :style="footerStyle">
        <div class="footer-links">
            <!-- <NuxtLink> 关于我们 </NuxtLink>
            ｜ -->
            <NuxtLink :to="`/policy/${PolicyAgreementEnum.SERVICE}`">
                用户协议
            </NuxtLink>
            ｜
            <NuxtLink :to="`/policy/${PolicyAgreementEnum.PRIVACY}`">
                隐私政策
            </NuxtLink>
            ｜
            <NuxtLink to="/user/info"> 会员中心 </NuxtLink>
        </div>
        <div class="mt-4 footer-copyright">
            <a
                class="mx-1 hover:underline"
                :href="item.value"
                target="_blank"
                v-for="item in appStore.getCopyrightConfig"
                :key="item.key"
            >
                {{ item.key }}
            </a>
        </div>
    </footer>
</template>
<script lang="ts" setup>
import { useAppStore } from '@/stores/app'
import { PolicyAgreementEnum } from '@/enums/appEnums'
import { computed, onMounted } from 'vue'

const appStore = useAppStore()

// 获取主题配置
const themeConfig = computed(() => appStore.getThemeConfig)

// 生成Footer配色方案
const footerStyle = computed(() => {
    const primaryColor = themeConfig.value.primaryColor || '#4153ff'
    const footerStyle = themeConfig.value.footerStyle || 'theme'
    
    // 调试日志
    if (typeof window !== 'undefined') {
        console.log('[Footer] Theme config:', themeConfig.value)
        console.log('[Footer] Footer style:', footerStyle)
    }
    
    // 根据配置选择不同的Footer样式
    switch (footerStyle) {
        case 'theme':
            // 主题色风格：使用主题色的柔和版本
            return {
                '--footer-bg': softenThemeColor(primaryColor),
                '--footer-text': '#ffffff',
                '--footer-link': 'rgba(255, 255, 255, 0.8)',
                '--footer-link-hover': '#ffffff',
                '--footer-border': 'rgba(255, 255, 255, 0.1)',
            }
            
        case 'dark':
            // 深色风格：深灰背景+白色文字
            return {
                '--footer-bg': '#1a1a1a',
                '--footer-text': '#e0e0e0',
                '--footer-link': '#a0a0a0',
                '--footer-link-hover': '#ffffff',
                '--footer-border': 'rgba(255, 255, 255, 0.05)',
            }
            
        case 'gray':
            // 灰色风格：浅灰背景+深色文字
            return {
                '--footer-bg': '#fafafa',
                '--footer-text': '#666666',
                '--footer-link': '#999999',
                '--footer-link-hover': '#333333',
                '--footer-border': 'rgba(0, 0, 0, 0.06)',
            }
            
        case 'white':
            // 纯白风格：白色背景+深色文字
            return {
                '--footer-bg': '#ffffff',
                '--footer-text': '#333333',
                '--footer-link': '#666666',
                '--footer-link-hover': '#000000',
                '--footer-border': '#e0e0e0',
            }
            
        default:
            // 默认使用主题色风格
            return {
                '--footer-bg': softenThemeColor(primaryColor),
                '--footer-text': '#ffffff',
                '--footer-link': 'rgba(255, 255, 255, 0.8)',
                '--footer-link-hover': '#ffffff',
                '--footer-border': 'rgba(255, 255, 255, 0.1)',
            }
    }
})

// 辅助函数：柔化主题色（降低饱和度，轻微降低亮度）
const softenThemeColor = (color: string): string => {
    const hex = color.replace('#', '')
    let r = parseInt(hex.substr(0, 2), 16)
    let g = parseInt(hex.substr(2, 2), 16)
    let b = parseInt(hex.substr(4, 2), 16)
    
    // 转换到HSL
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
        h = s = 0
    } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
            case g: h = ((b - r) / d + 2) / 6; break
            case b: h = ((r - g) / d + 4) / 6; break
        }
    }

    // 降低饱和度到40%（让颜色更淡雅）
    s *= 0.4
    
    // 稍微降低亮度到88%（保持一定的色彩感）
    l *= 0.88

    // 转换回RGB
    let r2, g2, b2
    if (s === 0) {
        r2 = g2 = b2 = l
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r2 = hue2rgb(p, q, h + 1/3)
        g2 = hue2rgb(p, q, h)
        b2 = hue2rgb(p, q, h - 1/3)
    }

    return `#${Math.round(r2 * 255).toString(16).padStart(2, '0')}${Math.round(g2 * 255).toString(16).padStart(2, '0')}${Math.round(b2 * 255).toString(16).padStart(2, '0')}`
}

onMounted(() => {
    if (typeof window !== 'undefined') {
        console.log('[Footer] Component mounted')
        console.log('[Footer] Theme config:', themeConfig.value)
        console.log('[Footer] Computed style:', footerStyle.value)
    }
})
</script>

<style lang="scss" scoped>
.layout-footer {
    // 使用CSS变量，如果变量不存在则使用默认值
    background-color: var(--footer-bg, #222222);
    color: var(--footer-text, #bebebe);
    border-top: 1px solid var(--footer-border, rgba(255, 255, 255, 0.1));
    transition: background-color 0.3s ease, color 0.3s ease;
    
    .footer-links {
        color: var(--footer-text, #bebebe);
        
        a {
            color: var(--footer-link, rgba(255, 255, 255, 0.8));
            text-decoration: none;
            transition: color 0.3s ease, opacity 0.3s ease;
            
            &:hover {
                color: var(--footer-link-hover, #ffffff);
                opacity: 0.9;
            }
        }
    }
    
    .footer-copyright {
        color: var(--footer-link, rgba(255, 255, 255, 0.8));
        
        a {
            color: var(--footer-link, rgba(255, 255, 255, 0.8));
            text-decoration: none;
            transition: color 0.3s ease;
            
            &:hover {
                color: var(--footer-link-hover, #ffffff);
                text-decoration: underline;
            }
        }
    }
}

// 添加微妙的渐变效果，让Footer更有质感
.layout-footer {
    position: relative;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
    }
}

// 响应式调整
@media (max-width: 768px) {
    .layout-footer {
        padding: 20px 0;
        
        .footer-links {
            font-size: 14px;
        }
        
        .footer-copyright {
            font-size: 12px;
        }
    }
}
</style>
