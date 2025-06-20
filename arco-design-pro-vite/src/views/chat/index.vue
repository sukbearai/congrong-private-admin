<template>
  <div ref="pageEl" class="pages">
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
    <div v-if="hasMessages" class="scene-two chat-wrap">
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
  import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
  // import { useAppStore } from '@/store';
  import { useElementSize, useWindowSize } from '@vueuse/core';
  import { useChat } from '@ai-sdk/vue';
  import MarkdownIt from 'markdown-it';
  import userImg from '@/assets/images/user.png';
  import botImg from '@/assets/images/bot.png';
  import Shiki from '@shikijs/markdown-it';
  import ChatCard from './components/ChatCard.vue';
  import ChatTextArea from './components/ChatTextArea.vue';
  import ChatItem from './components/ChatItem.vue';

  async function initShikiInstance() {
    const md = MarkdownIt();

    md.renderer.rules.paragraph_open = () => {
      return '<div class="markdown-wrap">';
    };
    md.renderer.rules.paragraph_close = () => {
      return '</div>';
    };

    md.use(
      await Shiki({
        themes: {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
      })
    );

    return md;
  }

  const pageEl = ref<HTMLElement>();
  const chatCardRef = ref();
  const chatTextAreaRef = ref();
  const { height: chatTextAreaHeight } = useElementSize(chatTextAreaRef);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  // 减去上下间距就是滚动区域的高度
  const scrollHeight = computed(() => windowHeight.value - 20);
  const model = ref('deepseek-chat');
  const md = ref<MarkdownIt | null>(null);

  const {
    messages,
    input,
    handleSubmit,
    stop,
    isLoading,
    setMessages,
    status,
  } = useChat({
    api: 'https://shebei.congrongtech.cn/api/ai/dialogue',
    body: computed(() => ({
      model: model.value,
    })),
  });

  const formattedMessages = computed(() => {
    const formatted = messages.value.map((message, index) => ({
      ...message,
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      icon: message.role === 'user' ? userImg : botImg,
      id: message.id || `message-${index}`,
      // 渲染 Markdown
      renderedContent: md.value
        ?.render(message.content)
        .replace(/<hr\s*\/?>/gi, ''),
      renderedReasoning: message.reasoning
        ? md.value?.render(message.reasoning).replace(/<hr\s*\/?>/gi, '')
        : null,
    }));

    // 如果正在加载且有消息，添加思考中的临时消息
    if (status.value === 'submitted' && messages.value.length > 0) {
      formatted.push({
        id: 'thinking-temp',
        role: 'assistant' as const,
        content: '模型思考中...',
        renderedContent: null,
        renderedReasoning: null,
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        icon: botImg,
        isTemporary: true, // 标记为临时消息
      } as any);
    }

    return formatted;
  });

  const hasMessages = computed(() => messages.value.length > 0);

  // 兼容移动端vh\vw
  const updatePageSize = async () => {
    if (pageEl.value) {
      pageEl.value.style.width = `${windowWidth.value}px`;
      pageEl.value.style.height = `${windowHeight.value}px`;
    }
  };

  // 监听窗口大小变化
  watch([windowWidth, windowHeight], updatePageSize);

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

  // const appStore = useAppStore();
  onBeforeMount(async () => {
    md.value = await initShikiInstance();
  });

  onMounted(async () => {
    await updatePageSize();
    // eslint-disable-next-line no-unused-expressions
    // window.matchMedia('(prefers-color-scheme: dark)').matches
    //   ? appStore.toggleTheme(true)
    //   : appStore.toggleTheme(false);
  });
</script>

<style>
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border-radius: 3px;
  }

  pre {
    overflow-x: auto !important;
  }
</style>

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
