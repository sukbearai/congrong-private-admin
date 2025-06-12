<template>
  <a-textarea
    :model-value="modelValue"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
    @keyup.enter="$emit('send')"
  >
    <template #suffix>
      <div class="tool-area">
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
      </div>
    </template>
  </a-textarea>
</template>

<script lang="ts" setup>
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
  }

  withDefaults(defineProps<Props>(), {
    placeholder: '今天，我能为你做什么呢？',
    allowClear: true,
    isPlaying: false,
  });

  defineEmits<Emits>();
</script>

<style lang="less" scoped>
  .tool-area {
    padding: 0px 12px 10px 12px;
    display: flex;
    justify-content: flex-end;
  }
</style>
