<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="chat-item" :class="{ 'is-user': item.role === 'user' }">
    <div class="chat-header">
      <img :src="item.icon" alt="avatar" class="avatar" />
      <span class="time">{{ item.time }}</span>
    </div>
    <div class="chat-content">
      <!-- 如果是 AI 回复且有 reasoning，显示思考过程 -->
      <div
        v-if="item.role === 'assistant' && item.renderedReasoning?.trim()"
        class="reasoning-section"
      >
        <details class="reasoning-details" open>
          <summary class="reasoning-summary">💭 思考过程</summary>
          <div class="reasoning-content" v-html="item.renderedReasoning"></div>
        </details>
      </div>
      <!-- 主要回复内容 -->
      <div
        v-if="item.renderedContent && item.renderedContent.trim()"
        class="message-content"
        v-html="item.renderedContent"
      ></div>
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
      renderedReasoning?: string | null;
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
    .reasoning-section {
      margin-bottom: 8px;
      max-width: 80%;
    }

    .reasoning-details {
      border: 1px solid var(--color-border-2);
      border-radius: 8px;
      background: var(--color-fill-1);

      .reasoning-summary {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 13px;
        color: var(--color-text-2);
        user-select: none;
        border-radius: 8px;

        &:hover {
          background: var(--color-fill-2);
        }
      }

      .reasoning-content {
        padding: 12px;
        border-top: 1px solid var(--color-border-2);
        font-size: 13px;
        color: var(--color-text-2);
        line-height: 1.5;
        background: var(--color-bg-1);
      }
    }

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

      .chat-content {
        .reasoning-section {
          max-width: 90%;
        }

        .message-content {
          max-width: 90%;
          padding: 10px 12px;
          font-size: 13px;
        }
      }
    }

    .avatar {
      width: 28px;
      height: 28px;
    }
  }
</style>
