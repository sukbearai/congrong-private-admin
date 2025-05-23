<template>
  <div class="container">
    <rich-text v-model="html" />
    <div class="btn-area">
      <a-button type="primary" @click="handleSubmit">提交</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import RichText from '@/components/rich-text/index.vue';

  const html = ref();

  const handleSubmit = () => {
    window.console.log(html.value);
  };
</script>

<style scoped>
  .container {
    padding: 20px 20px 20px 20px;
  }

  .btn-area {
    margin-top: 20px;
  }
</style>
