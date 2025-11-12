<template>
  <div ref="pageEl" class="pages">
    <!-- 初始场景：用户第一次打开页面时显示 -->
    <div v-if="!hasMessages" class="scene-one">
      <div class="greeting">中医大师AI</div>
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
  import { useElementSize, useWindowSize } from '@vueuse/core';
  import { Message } from '@arco-design/web-vue';
  import MarkdownIt from 'markdown-it';
  import userImg from '@/assets/images/user.png';
  import botImg from '@/assets/images/bot.png';
  import Shiki from '@shikijs/markdown-it';
  import { bundledLanguages } from 'shiki';
  import { aiMedsciChat } from '@/api/ai-chat';
  import ChatCard from './components/ChatCard.vue';
  import ChatTextArea from './components/ChatTextArea.vue';
  import ChatItem from './components/ChatItem.vue';

  interface MessageItem {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
  }

  async function initShikiInstance() {
    const md = MarkdownIt();

    md.renderer.rules.paragraph_open = () => {
      return '<div class="markdown-wrap">';
    };
    md.renderer.rules.paragraph_close = () => {
      return '</div>';
    };

    try {
      const shiki = await Shiki({
        themes: {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
        transformers: [
          {
            name: 'fallback-language-text',
            preprocess(code, options) {
              try {
                // 如果语言不存在，使用 text 作为默认语言
                if (
                  !options.lang ||
                  !Object.keys(bundledLanguages).includes(options.lang)
                ) {
                  options.lang = 'text';
                }
              } catch (error) {
                // eslint-disable-next-line no-console
                console.warn(
                  'Language check failed, using text as fallback:',
                  error
                );
                options.lang = 'text';
              }
              return code;
            },
          },
        ],
      });

      md.use(shiki);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to initialize Shiki, using plain MarkdownIt:',
        error
      );
      // 如果 Shiki 初始化失败，使用纯 MarkdownIt
    }

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

  const messages = ref<MessageItem[]>([]);
  const input = ref('');
  const isLoading = ref(false);
  const conversationId = ref('');
  const status = ref<'idle' | 'submitted'>('idle');

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
    }));

    // 如果正在加载且有消息，添加思考中的临时消息
    if (status.value === 'submitted' && messages.value.length > 0) {
      formatted.push({
        id: 'thinking-temp',
        role: 'assistant' as const,
        content: '模型思考中...',
        renderedContent: null,
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

  const sendMessage = async () => {
    if (!input.value?.trim() || isLoading.value) return;

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.value,
    };

    messages.value.push(userMessage);
    const currentInput = input.value;
    input.value = '';
    isLoading.value = true;
    status.value = 'submitted';

    try {
      const response = await aiMedsciChat({
        inputs: {},
        query: currentInput,
        response_mode: 'blocking',
        conversation_id: conversationId.value,
        user: '外部用户',
        files: [],
      });

      const { data } = response;

      if (data.conversation_id && !conversationId.value) {
        conversationId.value = data.conversation_id;
      }

      if (data.answer) {
        // 使用正则替换移除<...>标签包裹的内容
        const answer = data.answer
          .replace(/<[^>]*>\n[^<]*<\/[^>]*>/gs, '')
          .trim();

        const assistantMessage: MessageItem = {
          id: data.message_id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: answer,
        };
        messages.value.push(assistantMessage);
      } else {
        const emptyMessage: MessageItem = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '抱歉，我无法处理您的请求。',
        };
        messages.value.push(emptyMessage);
      }
    } catch (error) {
      Message.error({
        content: `网络错误: ${(error as Error).message || '未知错误'}`,
        duration: 5000,
      });
    } finally {
      isLoading.value = false;
      status.value = 'idle';
    }
  };

  const stop = () => {
    isLoading.value = false;
    status.value = 'idle';
  };

  const setMessages = (newMessages: MessageItem[]) => {
    messages.value = newMessages;
  };

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
    sendMessage();
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
    conversationId.value = ''; // 重置会话ID
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
