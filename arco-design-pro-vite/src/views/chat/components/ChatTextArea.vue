<template>
  <div class="chat-textarea">
    <div class="tabs-area"
      ><a-tag
        :color="isTagChecked ? '#3c7eff59' : ''"
        bordered
        checkable
        @click="onToggle"
      >
        DeepSeek-R1
      </a-tag></div
    >
    <a-textarea
      :model-value="modelValue"
      :placeholder="placeholder"
      :allow-clear="allowClear"
      v-bind="$attrs"
      @update:model-value="$emit('update:modelValue', $event)"
      @keydown="handleKeydown"
    >
      <template #suffix>
        <div class="tool-area">
          <a-space>
            <icon-loop
              :size="20"
              style="cursor: pointer"
              @click="$emit('restart')"
            />
            <icon-up-circle
              v-if="!isPlaying"
              :size="20"
              style="cursor: pointer"
              @click="$emit('send')"
            />

            <icon-pause-circle-fill
              v-if="isPlaying"
              :size="20"
              style="cursor: pointer"
              @click="$emit('stop')"
            />
          </a-space>
        </div>
      </template>
    </a-textarea>
  </div>
</template>

<script lang="ts" setup>
  import { useToggle } from '@vueuse/core';

  interface Props {
    modelValue?: string;
    placeholder?: string;
    allowClear?: boolean;
    isPlaying?: boolean;
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void;
    (e: 'send'): void;
    (e: 'stop'): void;
    (e: 'restart'): void;
    (e: 'toggle-model', model: string): void;
  }

  withDefaults(defineProps<Props>(), {
    placeholder: '今天，我能为你做什么呢？',
    allowClear: true,
    isPlaying: false,
  });

  const emit = defineEmits<Emits>();

  const [isTagChecked, isTagToggle] = useToggle();

  function onToggle() {
    isTagToggle();
    // 这里可以添加切换模型的逻辑
    if (isTagChecked.value) {
      // eslint-disable-next-line vue/custom-event-name-casing
      emit('toggle-model', 'deepseek-reasoner');
    } else {
      // eslint-disable-next-line vue/custom-event-name-casing
      emit('toggle-model', 'deepseek-chat');
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    if (isMobile()) {
      return;
    }

    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Shift+Enter: 换行，不阻止默认行为
      } else {
        event.preventDefault();
        emit('send');
      }
    }
  };
</script>

<style lang="less" scoped>
  .tool-area {
    padding: 0px 12px 10px 12px;
    display: flex;
    justify-content: flex-end;
  }

  .tabs-area {
    margin-bottom: 10px;
    padding: 10px 12px 0;
    display: flex;
    justify-content: flex-end;
  }
</style>
