<template>
  <section class="layout-default min-w-[1200px]">
    <LayoutHeader />
    <div class="main-contain">
      <LayoutMain class="flex-1 min-h-0 flex">
        <slot v-if="userStore.isLogin || !$route.meta.auth" />
        <ToLogin class="h-full" v-else />
      </LayoutMain>
      <LayoutFooter />
    </div>

    <ClientOnly>
      <DifyChat v-if="difyStore.config.enabled" />
    </ClientOnly>

    <Account />
  </section>
</template>
<script lang="ts" setup>
import LayoutHeader from "./components/header/index.vue";
import LayoutMain from "./components/main/index.vue";
import LayoutFooter from "./components/footer/index.vue";
import Account from "./components/account/index.vue";
import { useUserStore } from "~~/stores/user";
import ToLogin from "./components/account/to-login.vue";
import DifyChat from "@/components/DifyChat/index.vue";
import { useDifyStore } from "@/stores/dify";

const userStore = useUserStore();
const difyStore = useDifyStore();

onMounted(async () => {
  await difyStore.initConfig();
});
</script>
<style lang="scss" scoped>
.main-contain {
  min-height: calc(100vh - var(--header-height));
  @apply flex flex-col;
}
</style>
