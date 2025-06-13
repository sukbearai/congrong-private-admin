<template>
  <div class="pages">
    <!-- 初始场景：用户第一次打开页面时显示 -->
    <div v-if="!hasMessages" class="scene-one">
      <div class="greeting">嗨👌,朋友。</div>
      <div class="scene">
        <ChatTextArea
          ref="chatTextAreaRef"
          v-model="input"
          :is-playing="isLoading"
          @send="onSend"
          @stop="onStop"
          @toggle-model="onToggleModel"
        />
      </div>
    </div>
    <!-- 聊天界面：发送第一条消息后显示 -->
    <div v-if="hasMessages" ref="chatWrapEl" class="scene-two chat-wrap">
      <ChatCard
        ref="chatCardRef"
        :max-height="scrollHeight"
        :data="formattedMessages"
        :virtual-list-props="{
          height: scrollHeight - chatTextAreaHeight, // 去掉底部输入框的高度
        }"
        :scrollbar="true"
      >
        <template #footer>
          <ChatTextArea
            ref="chatTextAreaRef"
            v-model="input"
            :is-playing="isLoading"
            placeholder="你可以继续向我提问～～"
            @send="onSend"
            @stop="onStop"
            @restart="onRestart"
            @toggle-model="onToggleModel"
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
  import { computed, nextTick, onMounted, ref, watch } from 'vue';
  import { useAppStore } from '@/store';
  import { useElementSize } from '@vueuse/core';
  import { useChat } from '@ai-sdk/vue';
  import MarkdownIt from 'markdown-it';
  import userImg from '@/assets/images/user.png';
  import botImg from '@/assets/images/bot.png';
  import ChatCard from './components/ChatCard.vue';
  import ChatTextArea from './components/ChatTextArea.vue';
  import ChatItem from './components/ChatItem.vue';

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
  });

  md.renderer.rules.paragraph_open = () => {
    return '<div class="markdown-wrap">';
  };

  md.renderer.rules.paragraph_close = () => {
    return '</div>';
  };

  const chatWrapEl = ref();
  const chatCardRef = ref();
  const chatTextAreaRef = ref();
  const scrollHeight = ref(0);
  const { height: chatTextAreaHeight } = useElementSize(chatTextAreaRef);
  const model = ref('deepseek-chat');

  const { messages, input, handleSubmit, stop, isLoading, setMessages } =
    useChat({
      api: 'https://shebei.congrongtech.cn/api/ai/dialogue',
      body: computed(() => ({
        model: model.value,
      })),
    });

  const formattedMessages = computed(() => {
    return messages.value.map((message, index) => ({
      ...message,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      icon: message.role === 'user' ? userImg : botImg,
      id: message.id || `message-${index}`,
      // 渲染 Markdown
      renderedContent: md.render(message.content),
      renderedReasoning: message.reasoning
        ? md.render(message.reasoning)
        : null,
    }));
  });

  const hasMessages = computed(() => messages.value.length > 0);

  const getInitialHeight = async () => {
    await nextTick();
    if (chatWrapEl.value) {
      scrollHeight.value = chatWrapEl.value.getBoundingClientRect().height;
    }
  };

  watch(hasMessages, async (newVal) => {
    if (newVal && scrollHeight.value === 0) {
      await getInitialHeight();
    }
  });

  function onSend() {
    if (!input.value?.trim() || isLoading.value) return;
    handleSubmit();
    input.value = '';
  }

  function onStop() {
    stop();
  }

  function onRestart() {
    if (isLoading.value) {
      onStop();
    }
    setMessages([]);
    input.value = '';
    model.value = 'deepseek-chat';
  }

  function onToggleModel(modelName: string) {
    model.value = modelName;
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
