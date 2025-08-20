<template>
  <div class="screen-adapter">
    <!-- Banner组件现在负责渲染全屏背景 -->
    <LoginBanner />

    <!-- 登录内容区 - 使用等比例缩放确保在所有设备上保持设计稿的视觉比例 -->
    <div ref="containerRef" class="container">
      <div class="content">
        <div class="content-inner">
          <LoginForm />
        </div>
        <div class="footer">
          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import Footer from '@/components/footer/index.vue';
  import LoginBanner from './components/banner.vue';
  import LoginForm from './components/login-form.vue';

  // 设计稿尺寸
  const DESIGN_WIDTH = 1920;
  const DESIGN_HEIGHT = 1080;

  // Reference for the container element that we'll scale
  const containerRef = ref<HTMLElement | null>(null);

  // 更新页面缩放
  const updatePageScale = () => {
    if (!containerRef.value) return;

    // 获取当前视口尺寸
    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = document.documentElement.clientHeight;

    // 计算缩放比例（取较小值保证两边都能完全展示）
    const scaleX = screenWidth / DESIGN_WIDTH;
    const scaleY = screenHeight / DESIGN_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    // 应用缩放
    containerRef.value.style.transform = `scale(${scale})`;

    // 计算水平和垂直居中偏移
    const offsetX = (screenWidth - DESIGN_WIDTH * scale) / 2;
    const offsetY = (screenHeight - DESIGN_HEIGHT * scale) / 2;

    // 应用偏移确保居中
    containerRef.value.style.marginLeft = `${offsetX}px`;
    containerRef.value.style.marginTop = `${offsetY}px`;
  };

  // 设置窗口调整大小监听
  onMounted(() => {
    // 初始缩放设置
    updatePageScale();

    // 添加窗口调整大小事件监听器
    window.addEventListener('resize', () => {
      updatePageScale();
    });
  });

  // 清理事件监听器
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updatePageScale);
  });
</script>

<style lang="less" scoped>
  .screen-adapter {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .container {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px; /* 设计稿宽度 */
    height: 1080px; /* 设计稿高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    transform-origin: 0 0; /* 从左上角开始缩放 */
    overflow: visible;
    z-index: 1;

    /* 移除了.background类，因为现在使用screen-adapter的伪元素作为背景 */

    .content {
      position: absolute;
      top: 58%;
      right: 0%;
      margin-right: -80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      z-index: 1;
      width: auto; /* 根据内容自适应宽度 */
      transform: translate(-50%, -50%); /* 居中定位 */
    }

    .footer {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 100%;
    }
  }

  .logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 1;
    display: inline-flex;
    align-items: center;

    &-text {
      margin-right: 4px;
      margin-left: 4px;
      color: var(--color-fill-1);
      font-size: 20px;
    }
  }
</style>

<style lang="less" scoped>
  /* 
   * 注意：由于我们使用了等比例缩放的大屏适配方式，
   * 这些媒体查询主要作为备用，确保在极端情况下内容仍然可见
   */
  @media (max-width: @screen-sm) {
    .container {
      .content {
        padding: 30px;
      }
    }
  }

  /* 在非常小的屏幕上减少内边距 */
  @media (max-width: 480px) {
    .container {
      .content {
        padding: 20px;
      }
    }
  }
</style>
