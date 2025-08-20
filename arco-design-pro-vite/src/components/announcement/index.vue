<template>
  <transition name="fade">
    <div v-if="visible && announcements.length > 0" class="announcement-float">
      <a-carousel
        :style="{
          width: '300px',
          height: '168px',
        }"
        :auto-play="true"
        indicator-type="dot"
        class="announcement-carousel"
      >
        <a-carousel-item
          v-for="item in announcements"
          :key="item.id"
          class="announcement-item"
        >
          <a :href="item.wechatUrl" target="_blank" class="announcement-link">
            <div class="announcement-title">{{ item.title }}</div>
            <div class="announcement-content">{{ item.content }}</div>
          </a>
        </a-carousel-item>
      </a-carousel>
      <span class="close-btn" @click="visible = false">×</span>
    </div>
  </transition>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { getAnnouncementList, AnnouncementItem } from '@/api/announcement';

  const announcements = ref<AnnouncementItem[]>([]);
  const visible = ref(true);

  onMounted(async () => {
    try {
      const res = await getAnnouncementList({ page: 1, pageSize: 10 });
      if (res.data && Array.isArray(res.data.list)) {
        announcements.value = res.data.list;
      }
    } catch (e) {
      // ignore error
    }
  });
</script>

<style scoped lang="less">
  .announcement-float {
    position: fixed;
    right: 32px;
    bottom: 32px;
    z-index: 2000;
    min-width: 320px;
    max-width: 90vw;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.13);
    border-radius: 12px;
    overflow: visible;
    padding: 20px 40px 20px 20px;
    display: flex;
    align-items: center;
    border: 1px solid #f0f0f0;
    .announcement-carousel {
      width: 100%;
      .arco-carousel-item,
      .announcement-item {
        min-height: 60px;
        display: flex;
        align-items: flex-start;
        padding: 0 4px;
      }
      .announcement-link {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        text-decoration: none;
        color: inherit;
      }
      .announcement-title {
        font-weight: 600;
        font-size: 16px;
        color: #222;
        line-height: 1.4;
        margin-bottom: 6px;
        word-break: break-all;
        display: block;
        white-space: pre-line;
      }
      .announcement-content {
        font-size: 14px;
        color: #666;
        word-break: break-all;
        line-height: 20px;
        white-space: pre-line;
        overflow: visible;
        text-overflow: unset;
        max-width: 100%;
      }
    }
    .close-btn {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 20px;
      color: #bbb;
      cursor: pointer;
      transition: color 0.2s;
      background: #fff;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      border: 1px solid #eee;
    }
    .close-btn:hover {
      // color: #f53f3f;
      background: #f7f7f7;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
