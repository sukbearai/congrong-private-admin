<template>
  <div class="container">
    <!-- <div class="logo">
      <img
        alt="logo"
        src="//p3-armor.byteimg.com/tos-cn-i-49unhts6dw/dfdba5317c0c20ce20e64fac803d52bc.svg~tplv-49unhts6dw-image.image"
      />
      <div class="logo-text">从容茶饮药膳系统</div>
    </div> -->
    <div class="background">
      <LoginBanner />
    </div>
    <div class="content">
      <div class="content-inner">
        <LoginForm />
      </div>
      <div class="footer">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Footer from '@/components/footer/index.vue';
  import LoginBanner from './components/banner.vue';
  import LoginForm from './components/login-form.vue';
</script>

<style lang="less" scoped>
  .container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw; /* 确保占满整个视口宽度 */
    overflow: hidden;
    box-sizing: border-box; /* 确保内边距不会导致溢出 */

    .background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      overflow: hidden; /* 防止背景溢出 */
    }

    .content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      z-index: 1;
      max-width: 90%; /* 确保在小屏幕上不会太宽 */
      width: auto; /* 根据内容自适应宽度 */
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
  // responsive
  @media (max-width: @screen-lg) {
    .container {
      .content {
        padding: 30px;
      }
    }
  }

  @media (max-width: @screen-md) {
    .container {
      .content {
        padding: 25px;
      }
    }
  }

  @media (max-width: @screen-sm) {
    .container {
      .content {
        padding: 20px;
        max-width: 95%;
      }
    }
  }

  /* 横屏模式适配 */
  @media (max-height: 500px) and (orientation: landscape) {
    .container {
      .content {
        padding: 15px;
      }
    }
  }
</style>
