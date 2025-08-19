<template>
  <div class="banner">
    <div
      ref="bannerRef"
      class="banner-inner"
      :class="{ 'bg-error': bgLoadError }"
    >
      <!-- 如果需要轮播功能，可以取消注释以下代码
      <a-carousel class="carousel" animation-name="fade">
        <a-carousel-item v-for="item in carouselItem" :key="item.slogan">
          <div :key="item.slogan" class="carousel-item">
            <div class="carousel-title">{{ item.slogan }}</div>
            <div class="carousel-sub-title">{{ item.subSlogan }}</div>
            <img class="carousel-image" :src="item.image" />
          </div>
        </a-carousel-item>
      </a-carousel>
      -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  // import bannerImage from '@/assets/images/login-banner.png';

  const bannerRef = ref<HTMLElement | null>(null);
  const bgLoadError = ref(false);

  // 检测背景图是否成功加载
  const checkBackgroundImageLoaded = () => {
    if (!bannerRef.value) return;

    const url = getComputedStyle(bannerRef.value).backgroundImage.match(
      /url\(["']?([^"']*)["']?\)/
    )?.[1];

    if (url) {
      const img = new Image();
      img.onload = () => {
        bgLoadError.value = false;
      };
      img.onerror = () => {
        bgLoadError.value = true;
      };
      img.src = url;
    }
  };

  // 监听窗口大小变化
  const handleResize = () => {
    if (bannerRef.value) {
      // 可以在这里添加任何需要根据窗口大小变化的逻辑
    }
  };

  onMounted(() => {
    checkBackgroundImageLoaded();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>

<style lang="less" scoped>
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    &-inner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: url('@/assets/images/bg.png') no-repeat center center / cover;
      background-attachment: fixed; /* 固定背景，滚动时保持位置 */
    }
  }

  @media (max-width: 768px) {
    .banner {
      &-inner {
        background-position: center center;
      }
    }
  }

  @media (max-width: 480px) {
    .banner {
      &-inner {
        /* 在特小屏幕上可能需要调整背景位置 */
        background-position: 35% center;
      }
    }
  }

  .carousel {
    height: 100%;

    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 0 20px;
    }

    &-title {
      color: var(--color-fill-1);
      font-weight: 500;
      font-size: 20px;
      line-height: 28px;
    }

    &-sub-title {
      margin-top: 8px;
      color: var(--color-text-3);
      font-size: 14px;
      line-height: 22px;
    }

    &-image {
      width: 320px;
      margin-top: 30px;
    }
  }
</style>
