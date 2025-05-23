<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable prefer-promise-reject-errors -->
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import Editor from '@tinymce/tinymce-vue';
  import { uploadImage } from '@/api/file';

  const props = defineProps({
    modelValue: {
      type: String,
      default: () => {
        return '';
      },
    },
  });

  const emits = defineEmits(['update:modelValue']);

  const tinymceId = ref(
    `vue-tinymce-${new Date().getTime()}${(Math.random() * 1000).toFixed(0)}`
  );
  const editorRef: any = ref(null);

  const modelValue = computed({
    get: () => props.modelValue, // 取得v-model值
    set: (newValue) => emits('update:modelValue', newValue), // 更新v-model值
  });

  const conf = {
    selector: `#${tinymceId.value}`,
    language_url: '/tinymce/langs/zh-Hans.js',
    language: 'zh-Hans',
    promotion: false,
    branding: false,
    license_key: 'gpl',
    images_upload_handler: (blobInfo: any) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob());

        uploadImage(formData)
          .then((response) => {
            resolve(response.data.url);
          })
          .catch((error) => {
            reject({ message: 'uploadImage network fail', remove: true });
          });
      }),
  };
</script>

<template>
  <Editor
    :id="tinymceId"
    ref="editorRef"
    v-model="modelValue"
    :init="conf"
    tinymce-script-src="/tinymce/tinymce.min.js"
  />
</template>
