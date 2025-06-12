<template>
  <div class="pages">
    <!-- 初始场景：用户第一次打开页面时显示 -->
    <div v-if="!hasMessages" class="scene-one">
      <div class="greeting">嗨👌,朋友。</div>
      <div class="scene">
        <ChatTextArea
          v-model="prompt"
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
        :data="messagesHistory"
        :virtual-list-props="{ height: height - 92.39 }"
      >
        <template #footer>
          <ChatTextArea
            v-model="prompt"
            :is-playing="isPlaying"
            placeholder="你可以继续向我提问任何问题～～"
            @send="onSend"
            @stop="onStop"
          />
        </template>
        <template #item="{ item }">
          <div>
            {{ JSON.stringify(item, null, 2) }}
          </div>
        </template>
      </ChatCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { useAppStore } from '@/store';
  import { useToggle, useElementSize } from '@vueuse/core';
  import ChatCard from './components/ChatCard.vue';
  import ChatTextArea from './components/ChatTextArea.vue';

  const chatWrapEl = ref();
  const chatCardRef = ref();
  const prompt = ref();
  const { height } = useElementSize(chatWrapEl);
  const [isPlaying, toggle] = useToggle(false);
  const messagesHistory = ref<
    {
      time: string;
      icon: string;
      name: string;
      content: string;
      isMe: boolean;
    }[]
  >([]);

  const hasMessages = computed(() => messagesHistory.value.length > 0);

  function sendMessage(msg: string, isMe = true) {
    return new Promise((resolve) => {
      setTimeout(() => {
        messagesHistory.value.push({
          time: '',
          icon: isMe ? '/assets/daxiong.jpg' : '/assets/duola.jpg',
          name: isMe ? 'user' : 'assistant',
          content: msg,
          isMe,
        });

        // 发送完消息滚动到底部
        if (chatCardRef.value && chatCardRef.value.virtualListRef) {
          chatCardRef.value.virtualListRef.scrollToBottom();
        }

        resolve(true);
      }, 500);
    });
  }

  function onSend() {
    if (!prompt.value?.trim()) return;
    sendMessage(prompt.value, true);
    prompt.value = '';
    toggle();
  }

  function onStop() {
    toggle();
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
