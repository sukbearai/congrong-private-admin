<template>
  <div class="banner">
    <div class="banner-inner">
      <!-- <a-carousel class="carousel" animation-name="fade">
        <a-carousel-item v-for="item in carouselItem" :key="item.slogan">
          <div :key="item.slogan" class="carousel-item">
            <div class="carousel-title">{{ item.slogan }}</div>
            <div class="carousel-sub-title">{{ item.subSlogan }}</div>
            <img class="carousel-image" :src="item.image" />
          </div>
        </a-carousel-item>
      </a-carousel> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  // import { computed } from 'vue';
  // import bannerImage from '@/assets/images/login-banner.png';

  // const carouselItem = computed(() => [
  //   {
  //     slogan: 'AI中医问诊',
  //     subSlogan:
  //       '致力于中医标准化、国际化，赋能中医药大健康产业，让基层也能享受到高品质中医服务',
  //     image: bannerImage,
  //   },
  // ]);
</script>

<style lang="less" scoped>
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;

    &-inner {
      flex: 1;
      height: 100%;
      background: url('@/assets/images/bg.png') no-repeat center 0 / 100% 100%;
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
