<template>
  <div class="chat-item" :class="{ 'is-me': item.role === 'user' }">
    <div class="chat-avatar">
      <img :src="item.icon" :alt="item.role" />
    </div>
    <div class="chat-content">
      <div class="chat-header">
        <span class="chat-time">{{ item.time }}</span>
      </div>
      <div class="chat-message">
        <div class="message-bubble">
          <div v-for="part in item.parts" :key="part.id">
            <div v-if="part.type === 'text'">{{ part.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  interface ChatItemProps {
    item: {
      id?: string;
      role: 'user' | 'assistant';
      parts: Array<{
        id: string;
        type: 'text';
        text: string;
      }>;
      time?: string;
      icon?: string;
    };
  }

  defineProps<ChatItemProps>();
</script>

<style lang="less" scoped>
  .chat-item {
    display: flex;
    margin-bottom: 16px;
    padding: 0 16px;
    align-items: flex-start;

    &.is-me {
      flex-direction: row-reverse;

      .chat-content {
        align-items: flex-end;
      }

      .chat-header {
        flex-direction: row-reverse;
      }

      .message-bubble {
        background-color: var(--color-primary-light-1);
        color: var(--color-text-1);
      }
    }
  }

  .chat-avatar {
    flex-shrink: 0;
    margin: 0 12px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .chat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .chat-header {
    display: flex;
    // align-items: center;
    margin-bottom: 4px;
    gap: 8px;
  }

  .chat-time {
    font-size: 12px;
    color: var(--color-text-3);
  }

  .chat-message {
    display: flex;
  }

  .message-bubble {
    padding: 12px 16px;
    border-radius: 18px;
    background-color: var(--color-fill-2);
    color: var(--color-text-1);
    line-height: 1.5;
    word-wrap: break-word;
    max-width: 100%;
    box-sizing: border-box;
  }
</style>
