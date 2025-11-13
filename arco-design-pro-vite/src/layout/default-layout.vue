<template>
  <a-layout class="layout" :class="{ mobile: appStore.hideMenu }">
    <div v-if="navbar" class="layout-navbar">
      <NavBar />
    </div>
    <a-layout>
      <a-layout>
        <a-layout-sider
          v-if="renderMenu"
          v-show="!hideMenu"
          class="layout-sider"
          breakpoint="xl"
          :collapsed="collapsed"
          :collapsible="true"
          :width="menuWidth"
          :style="{ paddingTop: navbar ? '60px' : '' }"
          :hide-trigger="true"
          @collapse="setCollapsed"
        >
          <div class="menu-wrapper">
            <Menu />
          </div>
        </a-layout-sider>
        <a-drawer
          v-if="hideMenu"
          :visible="drawerVisible"
          placement="left"
          :footer="false"
          mask-closable
          :closable="false"
          @cancel="drawerCancel"
        >
          <Menu />
        </a-drawer>
        <a-layout class="layout-content" :style="paddingStyle">
          <TabBar v-if="appStore.tabBar" />
          <a-layout-content>
            <PageLayout />
          </a-layout-content>
          <Footer v-if="footer" />
        </a-layout>
      </a-layout>
    </a-layout>
  </a-layout>
  <!-- 悬浮公告广告位 -->
  <Announcement />
  <!-- Chat bot floating entry -->
  <div
    v-if="userStore.aiEnabled === 1"
    ref="chatbotEntryRef"
    class="chatbot-entry"
    role="button"
    aria-label="前往智能客服"
    :class="{ dragging: isDragging }"
    :style="chatbotStyle"
    tabindex="0"
    @pointerdown.stop="startDragging"
    @click="handleEntryClick"
    @keydown.enter.prevent="goChat"
    @keydown.space.prevent="goChat"
  >
    <img :src="chatBotIcon" alt="Chat Bot" />
    <span>中医AI智能助手</span>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    reactive,
    computed,
    watch,
    provide,
    onMounted,
    onUnmounted,
    nextTick,
  } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useAppStore, useUserStore } from '@/store';
  import NavBar from '@/components/navbar/index.vue';
  import Menu from '@/components/menu/index.vue';
  import Footer from '@/components/footer/index.vue';
  import TabBar from '@/components/tab-bar/index.vue';
  import usePermission from '@/hooks/permission';
  import useResponsive from '@/hooks/responsive';
  import Announcement from '@/components/announcement/index.vue';
  import chatBotIcon from '@/assets/images/chat-bot.png';
  import PageLayout from './page-layout.vue';

  const isInit = ref(false);
  const appStore = useAppStore();
  const userStore = useUserStore();
  const router = useRouter();
  const route = useRoute();
  const permission = usePermission();
  useResponsive(true);
  const navbarHeight = `60px`;
  const navbar = computed(() => appStore.navbar);
  const renderMenu = computed(() => appStore.menu && !appStore.topMenu);
  const hideMenu = computed(() => appStore.hideMenu);
  const footer = computed(() => appStore.footer);
  const menuWidth = computed(() => {
    return appStore.menuCollapse ? 48 : appStore.menuWidth;
  });
  const collapsed = computed(() => {
    return appStore.menuCollapse;
  });
  const paddingStyle = computed(() => {
    const paddingLeft =
      renderMenu.value && !hideMenu.value
        ? { paddingLeft: `${menuWidth.value}px` }
        : {};
    const paddingTop = navbar.value ? { paddingTop: navbarHeight } : {};
    return { ...paddingLeft, ...paddingTop };
  });
  const setCollapsed = (val: boolean) => {
    if (!isInit.value) return; // for page initialization menu state problem
    appStore.updateSettings({ menuCollapse: val });
  };
  watch(
    () => userStore.role,
    (roleValue) => {
      if (roleValue && !permission.accessRouter(route))
        router.push({ name: 'notFound' });
    }
  );
  const drawerVisible = ref(false);
  const drawerCancel = () => {
    drawerVisible.value = false;
  };
  provide('toggleDrawerMenu', () => {
    drawerVisible.value = !drawerVisible.value;
  });
  const chatbotEntryRef = ref<HTMLElement | null>(null);
  const chatbotPosition = reactive({ top: 0, left: 0 });
  const pointerId = ref<number | null>(null);
  const hasPosition = ref(false);
  const isDragging = ref(false);
  const hasMoved = ref(false);
  const dragOrigin = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
  };
  const safeMargin = 16;
  const initialBottomOffset = 258;
  const chatbotStyle = computed(() => {
    if (!hasPosition.value) {
      return { right: '24px', bottom: `${initialBottomOffset}px` };
    }
    return {
      top: `${chatbotPosition.top}px`,
      left: `${chatbotPosition.left}px`,
    };
  });
  const clampPosition = (top: number, left: number) => {
    const el = chatbotEntryRef.value;
    if (!el) return { top, left };
    const maxTop = Math.max(
      safeMargin,
      window.innerHeight - el.offsetHeight - safeMargin
    );
    const maxLeft = Math.max(
      safeMargin,
      window.innerWidth - el.offsetWidth - safeMargin
    );
    return {
      top: Math.min(Math.max(top, safeMargin), maxTop),
      left: Math.min(Math.max(left, safeMargin), maxLeft),
    };
  };
  const setInitialPosition = () => {
    const el = chatbotEntryRef.value;
    if (!el) return;
    const { top, left } = clampPosition(
      window.innerHeight - el.offsetHeight - initialBottomOffset,
      window.innerWidth - el.offsetWidth - 24
    );
    chatbotPosition.top = top;
    chatbotPosition.left = left;
    hasPosition.value = true;
  };
  const handleResize = () => {
    if (!hasPosition.value) return;
    const { top, left } = clampPosition(
      chatbotPosition.top,
      chatbotPosition.left
    );
    chatbotPosition.top = top;
    chatbotPosition.left = left;
  };
  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging.value) return;
    const deltaX = event.clientX - dragOrigin.x;
    const deltaY = event.clientY - dragOrigin.y;
    if (!hasMoved.value && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      hasMoved.value = true;
    }
    const nextTop = dragOrigin.top + deltaY;
    const nextLeft = dragOrigin.left + deltaX;
    const { top, left } = clampPosition(nextTop, nextLeft);
    chatbotPosition.top = top;
    chatbotPosition.left = left;
  };
  const stopDragging = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    const el = chatbotEntryRef.value;
    if (pointerId.value !== null && el) {
      try {
        el.releasePointerCapture(pointerId.value);
      } catch {
        // ignore capture release errors on unsupported browsers
      }
    }
    pointerId.value = null;
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', stopDragging);
    document.removeEventListener('pointercancel', stopDragging);
  };
  const startDragging = (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const el = chatbotEntryRef.value;
    if (!el) return;
    if (!hasPosition.value) setInitialPosition();
    isDragging.value = true;
    hasMoved.value = false;
    dragOrigin.x = event.clientX;
    dragOrigin.y = event.clientY;
    dragOrigin.top = chatbotPosition.top;
    dragOrigin.left = chatbotPosition.left;
    pointerId.value = event.pointerId;
    try {
      el.setPointerCapture(event.pointerId);
    } catch {
      // ignore capture errors on unsupported browsers
    }
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', stopDragging);
    document.addEventListener('pointercancel', stopDragging);
  };
  const goChat = () => {
    router.push({ name: 'chat' });
  };
  const handleEntryClick = () => {
    if (hasMoved.value || isDragging.value) {
      hasMoved.value = false;
      return;
    }
    goChat();
  };
  onMounted(() => {
    isInit.value = true;
    nextTick(() => {
      setInitialPosition();
      window.addEventListener('resize', handleResize);
    });
  });
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', stopDragging);
    document.removeEventListener('pointercancel', stopDragging);
  });
</script>

<style scoped lang="less">
  @nav-size-height: 60px;
  @layout-max-width: 1100px;

  .layout {
    width: 100%;
    height: 100%;
  }

  .layout-navbar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: @nav-size-height;
  }

  .layout-sider {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    height: 100%;
    transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
    &::after {
      position: absolute;
      top: 0;
      right: -1px;
      display: block;
      width: 1px;
      height: 100%;
      background-color: var(--color-border);
      content: '';
    }

    > :deep(.arco-layout-sider-children) {
      overflow-y: hidden;
    }
  }

  .menu-wrapper {
    height: 100%;
    overflow: auto;
    overflow-x: hidden;
    :deep(.arco-menu) {
      ::-webkit-scrollbar {
        width: 12px;
        height: 4px;
      }

      ::-webkit-scrollbar-thumb {
        border: 4px solid transparent;
        background-clip: padding-box;
        border-radius: 7px;
        background-color: var(--color-text-4);
      }

      ::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-text-3);
      }
    }
  }

  .layout-content {
    min-height: 100vh;
    overflow-y: hidden;
    background-color: var(--color-fill-2);
    transition: padding 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  }

  .chatbot-entry {
    position: fixed;
    z-index: 120;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 999px;
    background: rgba(31, 115, 241, 0.9);
    box-shadow: 0 10px 24px rgba(31, 115, 241, 0.35);
    color: #fff;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    span {
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
    }

    img {
      width: 40px;
      height: 40px;
      animation: chatbot-float 4s ease-in-out infinite;
    }

    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 14px 32px rgba(31, 115, 241, 0.45);
    }
  }

  .chatbot-entry.dragging {
    cursor: grabbing;
    transition: none;
  }

  @media (max-width: 768px) {
    .chatbot-entry {
      padding: 10px 12px;

      img {
        width: 32px;
        height: 32px;
      }

      span {
        font-size: 12px;
      }
    }
  }

  @keyframes chatbot-float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
