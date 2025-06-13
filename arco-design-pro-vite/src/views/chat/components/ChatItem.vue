<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="chat-item" :class="{ 'is-user': item.role === 'user' }">
    <div class="chat-header">
      <img :src="item.icon" alt="avatar" class="avatar" />
      <span class="time">{{ item.time }}</span>
    </div>
    <div class="chat-content">
      <div class="message-content" v-html="item.renderedContent"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  interface ChatItemProps {
    item: {
      id: string;
      role: 'user' | 'assistant';
      content: string;
      renderedContent: string;
      time: string;
      icon: string;
    };
  }

  defineProps<ChatItemProps>();
</script>

<style lang="less" scoped>
  .chat-item {
    padding: 16px;
    margin-bottom: 12px;

    &.is-user {
      .chat-header {
        flex-direction: row-reverse;
        gap: 8px;
      }

      .chat-content {
        display: flex;
        justify-content: flex-end;

        .message-content {
          background: var(--color-primary-light-2);
          color: var(--color-white);
        }
      }
    }
  }

  .chat-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .time {
    font-size: 12px;
    color: var(--color-text-3);
  }

  .chat-content {
    .message-content {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 12px;
      background: var(--color-fill-2);
      display: block;
      width: fit-content;
      word-wrap: break-word;
      word-break: break-word;
      line-height: 1.6;
      color: var(--color-text-1);
      font-size: 14px;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .chat-item {
      padding: 12px 8px;

      .message-content {
        max-width: 90%;
        padding: 10px 12px;
        font-size: 13px;
      }
    }

    .avatar {
      width: 28px;
      height: 28px;
    }
  }
</style>
