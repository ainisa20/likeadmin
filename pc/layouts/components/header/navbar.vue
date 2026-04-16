<template>
    <nav>
        <Menu
            class="navbar"
            :menu="menu"
            :default-active="activeMenu"
            mode="horizontal"
            :ellipsis="false"
        >
            <template #item="{ item }">
                <MenuItem
                    v-if="!item.component"
                    :menu-item="item"
                    :route-path="item.path"
                />
                <div v-else>
                    <template v-if="item.component == 'information'">
                        <Information :menu-item="item" />
                    </template>
                    <template v-if="item.component == 'mobile'">
                        <Mobile :menu-item="item" />
                    </template>
                    <template v-if="item.component == 'admin'">
                        <Admin :menu-item="item" />
                    </template>
                </div>
            </template>
        </Menu>
    </nav>
</template>
<script lang="ts" setup>
import Menu from '../menu/index.vue'
import MenuItem from '../menu/menu-item.vue'
import Admin from './admin.vue'
import Information from './information.vue'
import Mobile from './mobile.vue'
const route = useRoute()
const activeMenu = computed<string>(() => route.path)
const { menu } = useMenu()
</script>

<style lang="scss" scoped>
.navbar {
    --el-menu-item-font-size: var(--el-font-size-large);
    --el-menu-bg-color: var(--header-bg, var(--el-color-primary));
    --el-menu-active-color: var(--header-text, var(--color-white));
    --el-menu-text-color: var(--header-text, var(--color-white));
    --el-menu-item-hover-fill: var(--header-bg, var(--el-color-primary));
    --el-menu-hover-text-color: var(--header-text, var(--color-white));
    --el-menu-hover-bg-color: var(--header-bg, var(--el-color-primary));
    
    // 确保菜单项文字颜色正确
    --el-menu-text-color: var(--header-text, var(--color-white));
    
    :deep() {
        & > .el-sub-menu {
            .el-sub-menu__title:hover {
                background-color: var(--el-menu-bg-color);
            }
        }
        
        // 确保菜单项使用正确的颜色
        .el-menu-item {
            color: var(--header-text, var(--color-white)) !important;
            
            &:hover {
                color: var(--header-text, var(--color-white)) !important;
                background-color: var(--header-bg, var(--el-color-primary)) !important;
            }
            
            &.is-active {
                color: var(--header-text, var(--color-white)) !important;
                background-color: var(--header-bg, var(--el-color-primary)) !important;
                border-bottom-color: currentColor;
            }
        }
        
        // 子菜单标题颜色
        .el-sub-menu__title {
            color: var(--header-text, var(--color-white)) !important;
            
            &:hover {
                color: var(--header-text, var(--color-white)) !important;
                background-color: var(--header-bg, var(--el-color-primary)) !important;
            }
        }
        
        // 下拉菜单样式
        .el-menu--popup {
            background-color: #fff !important;
            border: 1px solid var(--el-border-color-light);
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
            
            .el-menu-item {
                color: #333 !important;
                background-color: #fff !important;
                
                &:hover {
                    background-color: var(--el-bg-color-page) !important;
                    color: var(--el-color-primary) !important;
                }
                
                &.is-active {
                    background-color: var(--el-bg-color-page) !important;
                    color: var(--el-color-primary) !important;
                }
            }
        }
    }
}
</style>
