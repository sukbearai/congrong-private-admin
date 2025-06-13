<template>
  <div class="pages">
    <!-- 初始场景：用户第一次打开页面时显示 -->
    <div v-if="!hasMessages" class="scene-one">
      <div class="greeting">嗨👌,朋友。</div>
      <div class="scene">
        <ChatTextArea
          v-model="input"
          :is-playing="isPlaying"
          @send="onSend"
          @stop="onStop"
        />
      </div>
    </div>
    <!-- 聊天界面：发送第一条消息后显示 -->
    <div v-if="hasMessages" ref="chatWrapEl" class="scene-two chat-wrap">
      <ChatCard
        ref="chatCardRef"
        :max-height="height"
        :data="formattedMessages"
        :virtual-list-props="{
          height: height - 92.39, // 去掉底部输入框的高度
        }"
        :scrollbar="true"
      >
        <template #footer>
          <ChatTextArea
            v-model="input"
            :is-playing="isLoading"
            placeholder="你可以继续向我提问～～"
            @send="onSend"
            @stop="onStop"
          />
        </template>
        <template #item="{ item }">
          <ChatItem :item="item" />
        </template>
      </ChatCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useAppStore } from '@/store';
  import { useToggle, useElementSize } from '@vueuse/core';
  import { useChat } from '@ai-sdk/vue';
  import ChatCard from './components/ChatCard.vue';
  import ChatTextArea from './components/ChatTextArea.vue';
  import ChatItem from './components/ChatItem.vue';

  const chatWrapEl = ref();
  const chatCardRef = ref();
  const { height } = useElementSize(chatWrapEl);
  const [isPlaying, toggle] = useToggle(false);

  const { messages, input, handleSubmit, stop, isLoading } = useChat({
    api: 'https://shebei.congrongtech.cn/api/ai/dialogue',
  });

  const formattedMessages = computed(() => {
    return messages.value.map((message, index) => ({
      ...message,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      icon: message.role === 'user' ? '/imgs/user.png' : '/imgs/bot.png',
      id: message.id || `message-${index}`,
    }));
  });

  const hasMessages = computed(() => messages.value.length > 0);

  function onSend() {
    if (!input.value?.trim() || isLoading.value) return;
    handleSubmit();
    input.value = '';
    toggle();
  }

  function onStop() {
    toggle();
    stop();
  }

  const appStore = useAppStore();
  onMounted(() => {
    // eslint-disable-next-line no-unused-expressions
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? appStore.toggleTheme(true)
      : appStore.toggleTheme(false);
  });
</script>

<style lang="less" scoped>
  :deep(.arco-textarea-wrapper) {
    border-radius: 24px;
  }

  :deep(.arco-textarea) {
    padding: 10px 12px 3px;
  }

  :deep(.chat-list-virtual-list) {
    padding-bottom: 10px;
    // 自动底部
    display: flex;
    flex-direction: column-reverse;
  }

  :deep(.fix-h-collapse) {
    // 修复数值为1时的滚动条
    flex-grow: 0.99;
  }
</style>

<style lang="less" scoped>
  .pages {
    padding: 10px;
    font-size: 16px;
    color: var(--color-text-1);
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .greeting {
    text-align: center;
    margin: 40px 0;
    font-size: 24px;
  }

  .chat-wrap {
    flex: 1;
  }
</style>
