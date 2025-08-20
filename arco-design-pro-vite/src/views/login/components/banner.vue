<template>
  <div class="banner">
    <div class="banner-background">
      <!-- 这里使用多分辨率背景图方案 -->
      <picture>
        <!-- 超宽屏 (21:9) -->
        <source
          media="(min-aspect-ratio: 21/9)"
          srcset="@/assets/images/bg.jpg"
        />
        <!-- 宽屏 (16:9) -->
        <source
          media="(min-aspect-ratio: 16/9)"
          srcset="@/assets/images/bg.jpg"
        />
        <!-- 标准屏 (4:3) -->
        <source
          media="(min-aspect-ratio: 4/3)"
          srcset="@/assets/images/bg.jpg"
        />
        <!-- 竖屏设备 (<4:3) -->
        <source
          media="(max-aspect-ratio: 4/3)"
          srcset="@/assets/images/bg.jpg"
        />
        <!-- 默认图像 -->
        <img class="banner-bg-img" src="@/assets/images/bg.jpg" alt="背景图" />
      </picture>

      <!-- 背景蒙层效果 -->
      <div class="banner-overlay"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  // 不需要特殊逻辑，只渲染背景图
</script>

<style lang="less" scoped>
  .banner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    &-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }

    &-bg-img {
      width: 100%;
      height: 100%;
      object-fit: contain; /* 确保图片覆盖整个容器 */
      object-position: center center;
    }

    &-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.2); /* 轻微的暗色蒙层 */
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
