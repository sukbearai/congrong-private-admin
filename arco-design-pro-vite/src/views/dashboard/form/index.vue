<template>
  <div class="container">
    <a-card title="产品信息编辑" :bordered="false">
      <a-form :model="formData" layout="vertical" :auto-label-width="true">
        <a-form-item
          label="产品详情"
          field="content"
          :rules="[{ required: true, message: '请输入产品详情' }]"
        >
          <rich-text v-model="formData.content" />
        </a-form-item>

        <a-form-item
          label="适用体质"
          field="constitutions"
          :rules="[{ required: true, message: '请选择适用体质' }]"
        >
          <a-select
            v-model="formData.constitutions"
            multiple
            placeholder="请选择适用体质"
            allow-clear
            :max-tag-count="3"
            :style="{ width: '100%' }"
          >
            <a-option
              v-for="constitution in constitutionOptions"
              :key="constitution.value"
              :value="constitution.value"
              :label="constitution.label"
            >
              {{ constitution.label }}
            </a-option>
          </a-select>
          <div class="form-item-tip">
            默认已选择全部体质类型，您可以根据需要调整选择
          </div>
        </a-form-item>

        <div class="btn-area">
          <a-space>
            <a-button @click="handleReset">重置</a-button>
            <a-button
              type="primary"
              :loading="submitLoading"
              @click="handleSubmit"
            >
              提交
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import RichText from '@/components/rich-text/index.vue';
  import { submitProductUpdate } from '@/api/dashboard';
  import { useUserStore } from '@/store';

  const router = useRouter();
  const userStore = useUserStore();
  const submitLoading = ref(false);

  // 体质选项
  const constitutionOptions = [
    { value: '阳虚', label: '阳虚' },
    { value: '阴虚', label: '阴虚' },
    { value: '气虚', label: '气虚' },
    { value: '痰湿', label: '痰湿' },
    { value: '湿热', label: '湿热' },
    { value: '血瘀', label: '血瘀' },
    { value: '平和', label: '平和' },
  ];

  // 表单数据
  const formData = reactive({
    content: '',
    constitutions: ['阳虚', '阴虚', '气虚', '痰湿', '湿热', '血瘀', '平和'], // 默认全部选中
  });

  const handleReset = () => {
    formData.content = '';
    formData.constitutions = [
      '阳虚',
      '阴虚',
      '气虚',
      '痰湿',
      '湿热',
      '血瘀',
      '平和',
    ];
  };

  const handleSubmit = async () => {
    try {
      if (!formData.content) {
        Message.error('请输入产品详情');
        return;
      }

      if (!formData.constitutions || formData.constitutions.length === 0) {
        Message.error('请选择适用体质');
        return;
      }

      submitLoading.value = true;

      const response: any = await submitProductUpdate({
        title: '甄选产品',
        content: formData.content,
        constitutions: formData.constitutions.join(','),
        deviceIds: userStore.deviceIds || '', // 使用用户当前绑定的设备IDs
        checkedImg:
          'https://maixiangjk.oss-cn-hangzhou.aliyuncs.com/7a1JpA_HGh-abAekbeV17',
        uncheckedImg:
          'https://maixiangjk.oss-cn-hangzhou.aliyuncs.com/k94qBf-oYk-pVopLDZzU8',
      });

      if (response.code === 0) {
        Message.success('提交成功');
        // 重置表单
        handleReset();
        // 跳转到产品列表页
        setTimeout(() => {
          router.push({ name: 'ProductList' });
        }, 300);
      } else {
        Message.error(response.message || '提交失败');
      }
    } catch (error) {
      Message.error('提交失败，请稍后重试');
    } finally {
      submitLoading.value = false;
    }
  };

  // 组件挂载时获取用户信息
  onMounted(async () => {
    try {
      await userStore.info();
    } catch (error) {
      // 静默处理用户信息获取失败
    }
  });
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .btn-area {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
    text-align: right;
  }

  .form-item-tip {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-3);
    line-height: 1.4;
    margin-left: 10px;
  }

  :deep(.arco-card) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border-2);
    padding: 16px 20px;
  }

  :deep(.arco-card-body) {
    padding: 24px 20px;
  }

  :deep(.arco-form-item) {
    margin-bottom: 24px;
  }

  :deep(.arco-form-item-label) {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 8px;
    font-size: 14px;
  }

  :deep(.arco-select-view-multiple) {
    min-height: 40px;
    padding: 8px 12px;
    border-radius: 6px;
  }

  :deep(.arco-select-view-tag) {
    margin: 2px 4px 2px 0;
    background: var(--color-primary-light-1);
    border: 1px solid var(--color-primary-light-3);
    color: var(--color-primary-6);
    border-radius: 4px;
    font-size: 12px;
  }

  :deep(.arco-select-view-multiple .arco-select-view-suffix) {
    padding-right: 8px;
  }

  :deep(.arco-btn) {
    border-radius: 6px;
    font-weight: 500;
  }

  :deep(.tox-tinymce) {
    width: 100% !important;
  }

  :deep(.tox-editor-container) {
    width: 100% !important;
  }

  :deep(.tox-edit-area) {
    width: 100% !important;
  }

  :deep(.tox-edit-area__iframe) {
    width: 100% !important;
  }
</style>
