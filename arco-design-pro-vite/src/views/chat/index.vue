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
  import {
    computed,
    nextTick,
    onBeforeMount,
    onMounted,
    ref,
    watch,
  } from 'vue';
  import { useElementSize, useWindowSize } from '@vueuse/core';
  import { Message } from '@arco-design/web-vue';
  import MarkdownIt from 'markdown-it';
  import userImg from '@/assets/images/user.png';
  import botImg from '@/assets/images/bot.png';
  import Shiki from '@shikijs/markdown-it';
  import { bundledLanguages } from 'shiki';
  import ChatCard from './components/ChatCard.vue';
  import ChatTextArea from './components/ChatTextArea.vue';
  import ChatItem from './components/ChatItem.vue';
  import readStream from './utils/sseFetch';

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
  const abortController = ref<AbortController | null>(null);

  const isWhitespaceOnly = (value?: string | null) => {
    if (typeof value !== 'string') return true;
    return value.trim().length === 0;
  };

  const THINK_OPEN = '<think>';
  const THINK_CLOSE = '</think>';

  const formattedMessages = computed(() => {
    const formatted = messages.value.map((message, index) => {
      const rendered = md.value
        ? md.value.render(message.content)
        : message.content;

      return {
        ...message,
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        icon: message.role === 'user' ? userImg : botImg,
        id: message.id || `message-${index}`,
        renderedContent:
          typeof rendered === 'string'
            ? rendered.replace(/<hr[^>]*>/gi, '')
            : rendered,
      };
    });

    const lastMessage = messages.value[messages.value.length - 1];

    if (
      status.value === 'submitted' &&
      (!lastMessage || lastMessage.role !== 'assistant')
    ) {
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

    let assistantMessage: MessageItem | undefined;
    const ensureAssistantMessage = (): MessageItem => {
      if (!assistantMessage) {
        const placeholder: MessageItem = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
        };
        messages.value.push(placeholder);
        assistantMessage =
          messages.value[messages.value.length - 1] ?? placeholder;
      }
      return assistantMessage as MessageItem;
    };

    const thinkState = { stash: '', inThink: false };

    const calcHoldLength = (value: string, token: string) => {
      const lowerValue = value.toLowerCase();
      const lowerToken = token.toLowerCase();
      const maxHold = Math.min(lowerValue.length, lowerToken.length - 1);

      for (let length = maxHold; length > 0; length -= 1) {
        const suffix = lowerValue.slice(-length);
        if (lowerToken.startsWith(suffix)) {
          return length;
        }
      }

      return 0;
    };

    const consumeAnswerText = (rawText: string) => {
      let text = `${thinkState.stash}${rawText ?? ''}`;
      thinkState.stash = '';

      if (!text) {
        return { visibleText: '', extractedReasoning: '' };
      }

      let visibleText = '';
      let extractedReasoning = '';

      while (text.length) {
        if (!thinkState.inThink) {
          const lowerText = text.toLowerCase();
          const openIndex = lowerText.indexOf(THINK_OPEN);

          if (openIndex === -1) {
            const holdLength = calcHoldLength(text, THINK_OPEN);
            const emitLength = text.length - holdLength;
            if (emitLength > 0) {
              visibleText += text.slice(0, emitLength);
            }
            thinkState.stash = holdLength > 0 ? text.slice(-holdLength) : '';
            break;
          }

          visibleText += text.slice(0, openIndex);
          text = text.slice(openIndex + THINK_OPEN.length);
          thinkState.inThink = true;
        } else {
          const lowerText = text.toLowerCase();
          const closeIndex = lowerText.indexOf(THINK_CLOSE);

          if (closeIndex === -1) {
            const holdLength = calcHoldLength(text, THINK_CLOSE);
            const emitLength = text.length - holdLength;
            if (emitLength > 0) {
              extractedReasoning += text.slice(0, emitLength);
            }
            thinkState.stash = holdLength > 0 ? text.slice(-holdLength) : '';
            break;
          }

          extractedReasoning += text.slice(0, closeIndex);
          text = text.slice(closeIndex + THINK_CLOSE.length);
          thinkState.inThink = false;
        }
      }

      return { visibleText, extractedReasoning };
    };

    const controller = new AbortController();
    abortController.value = controller;

    try {
      const res = await fetch(
        'https://shebei.congrongtech.cn/api/thirdparty/ai-medsci-chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: {},
            query: currentInput,
            response_mode: 'streaming',
            conversation_id: conversationId.value,
            user: '外部用户',
            files: [],
          }),
          signal: controller.signal,
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('Readable stream not available');

      await readStream(
        reader,
        (chunk) => {
          if (chunk.conversation_id) {
            conversationId.value = chunk.conversation_id;
          }

          const answerText =
            typeof chunk.answer === 'string' ? chunk.answer : '';
          const reasoningText =
            typeof chunk.reasoning === 'string' ? chunk.reasoning : '';

          const { visibleText, extractedReasoning } =
            consumeAnswerText(answerText);

          const hasVisibleContent = !isWhitespaceOnly(visibleText);
          const hasReasoningContent =
            !isWhitespaceOnly(reasoningText) ||
            !isWhitespaceOnly(extractedReasoning);

          if (!assistantMessage && !hasVisibleContent && !hasReasoningContent) {
            return;
          }

          const currentAssistant = ensureAssistantMessage();

          if (hasVisibleContent) {
            currentAssistant.content += visibleText;
          }

          if (hasReasoningContent) {
            const additions: string[] = [];

            if (!isWhitespaceOnly(reasoningText)) {
              additions.push(reasoningText);
            }

            if (!isWhitespaceOnly(extractedReasoning)) {
              additions.push(extractedReasoning);
            }

            currentAssistant.reasoning = `${
              currentAssistant.reasoning ?? ''
            }${additions.join('')}`;
          }

          nextTick(() => {
            chatCardRef.value?.scrollToBottom?.();
          });
        },
        controller.signal
      );
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }

      const currentAssistant = ensureAssistantMessage();
      currentAssistant.content = '抱歉，请求出错，请稍后重试。';

      thinkState.stash = '';
      thinkState.inThink = false;

      Message.error({
        content: `网络错误: ${(error as Error).message || '未知错误'}`,
        duration: 5000,
      });
    } finally {
      isLoading.value = false;
      status.value = 'idle';
      abortController.value = null;
      assistantMessage = undefined;
      thinkState.stash = '';
      thinkState.inThink = false;
    }
  };

  const stop = () => {
    const controller = abortController.value;
    if (controller) {
      controller.abort();
      abortController.value = null;
    }
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
    abortController.value = null;
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
