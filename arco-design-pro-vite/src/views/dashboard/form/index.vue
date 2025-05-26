<template>
  <div class="container">
    <p class="form-title">下方填写产品详情：</p>
    <rich-text v-model="html" />
    <div class="btn-area">
      <a-button type="primary" @click="handleSubmit">提交</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import RichText from '@/components/rich-text/index.vue';
  import { submitProductUpdate } from '@/api/dashboard';

  const html = ref();

  const handleSubmit = async () => {
    try {
      if (!html.value) {
        Message.error('请输入产品详情');
        return;
      }

      const response: any = await submitProductUpdate({ content: html.value });
      if (response.code === 0) {
        Message.success('提交成功');
      } else {
        Message.error(response.message || '提交失败');
      }
    } catch (error) {
      Message.error('提交失败，请稍后重试');
    } finally {
      html.value = '';
    }
  };
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }

  .form-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-1);
    line-height: 1.5;
  }

  .btn-area {
    margin-top: 20px;
  }
</style>
