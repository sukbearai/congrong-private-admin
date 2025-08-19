<template>
  <div class="container">
    <a-card class="general-card" :title="$t('userProfile.title')">
      <a-form
        ref="formRef"
        :model="userForm"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item field="nickname" :label="$t('userProfile.form.nickname')">
          <a-input
            v-model="userForm.nickname"
            :placeholder="$t('userProfile.form.nicknamePlaceholder')"
            :max-length="50"
            show-word-limit
            disabled
          />
        </a-form-item>

        <a-form-item field="phone" :label="$t('userProfile.form.phone')">
          <a-input
            v-model="userForm.phone"
            :placeholder="$t('userProfile.form.phonePlaceholder')"
            :max-length="11"
            disabled
          />
        </a-form-item>

        <a-form-item field="password" :label="$t('userProfile.form.password')">
          <a-input-password
            v-model="userForm.password"
            :placeholder="$t('userProfile.form.passwordPlaceholder')"
            :max-length="50"
          />
          <!-- <template #help>
            {{ $t('userProfile.form.passwordHelp') }}
          </template> -->
        </a-form-item>

        <!-- 角色信息（只读） -->
        <a-form-item field="role" :label="$t('userProfile.form.role')">
          <a-tag :color="getRoleColor(userForm.role)">
            {{ getRoleText(userForm.role) }}
          </a-tag>
        </a-form-item>

        <a-form-item
          field="deviceIds"
          :label="$t('userProfile.form.deviceIds')"
        >
          <a-input
            v-model="userForm.deviceIds"
            :placeholder="$t('userProfile.form.deviceIdsPlaceholder')"
            disabled
          />
        </a-form-item>

        <a-space>
          <a-button type="primary" :loading="loading" @click="handleSubmit">
            {{ $t('userProfile.form.submit') }}
          </a-button>
          <!-- <a-button @click="resetForm">
            {{ $t('userProfile.form.reset') }}
          </a-button> -->
        </a-space>
      </a-form>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useUserStore } from '@/store';
  import { updateUser, type UpdateUserData } from '@/api/user';

  // 获取用户状态
  const userStore = useUserStore();
  const formRef = ref();
  const loading = ref(false);

  // 用户表单
  const userForm = reactive<UpdateUserData>({
    id: userStore.id,
    nickname: userStore.nickname,
    phone: userStore.phone,
    password: '',
    role: userStore.role,
    deviceIds: userStore.deviceIds,
  });

  // 原始用户信息，用于重置表单
  const originalUserInfo = {
    id: userStore.id,
    nickname: userStore.nickname,
    phone: userStore.phone,
    password: '',
    role: userStore.role,
    deviceIds: userStore.deviceIds,
  };

  // 表单验证规则
  const formRules = {
    nickname: [
      { required: true, message: '姓名不能为空' },
      { max: 50, message: '姓名不超过50个字符' },
    ],
    phone: [
      { required: true, message: '联系电话不能为空' },
      { len: 11, message: '请输入11位联系电话' },
      { match: /^1[3-9]\d{9}$/, message: '请输入有效的联系电话' },
    ],
    password: [
      // 不设置 required，因为密码可以为空表示不修改
      {
        validator: (value: string, callback: (error?: string) => void) => {
          if (value && value.length > 0) {
            if (value.length < 6) {
              callback('密码至少6位');
            } else if (value.length > 50) {
              callback('密码不超过50位');
            } else {
              callback();
            }
          } else {
            // 空密码是允许的，表示不修改
            callback();
          }
        },
        trigger: ['blur', 'change'],
      },
    ],
  };

  // 获取角色颜色
  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      admin: 'red',
      user: 'blue',
    };
    return colorMap[role] || 'gray';
  };

  // 获取角色文本
  const getRoleText = (role: string) => {
    const textMap: Record<string, string> = {
      admin: '旗舰门店',
      user: '普通门店',
    };
    return textMap[role] || role;
  };

  // 重置表单
  //   const resetForm = () => {
  //     Object.assign(userForm, originalUserInfo);
  //     formRef.value?.resetFields();
  //   };

  // 提交表单
  const handleSubmit = async () => {
    if (loading.value) return; // 防止重复提交

    try {
      // 验证表单
      let validationPassed = false;

      try {
        // 使用 Promise 方式验证表单
        const errors = await formRef.value.validate();
        validationPassed = !errors;
      } catch (validationError) {
        // 验证失败
        return;
      }

      if (!validationPassed) {
        return; // 验证失败，不继续执行
      }

      loading.value = true;
      // 如果密码为空，不更新密码
      const updateData = { ...userForm };
      if (!updateData.password) {
        delete updateData.password;
      }

      // 调用更新用户接口
      const response = await updateUser(updateData);
      if (response.data) {
        Message.success('个人信息更新成功');
        // 更新 Store 中的用户信息
        userStore.setInfo({
          nickname: response.data.nickname,
          phone: response.data.phone,
          role: response.data.role,
          deviceIds: response.data.deviceIds,
        });

        // 更新原始信息
        Object.assign(originalUserInfo, {
          nickname: response.data.nickname,
          phone: response.data.phone,
          role: response.data.role,
          deviceIds: response.data.deviceIds,
          password: '',
        });

        // 清空密码字段
        userForm.password = '';
      }
    } catch (error) {
      Message.error('更新失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  // 页面加载时从 Store 中获取最新用户信息
  onMounted(() => {
    // 如果需要从服务器获取最新数据，可以调用 userStore.info();
    Object.assign(userForm, {
      id: userStore.id,
      nickname: userStore.nickname,
      phone: userStore.phone,
      password: '',
      role: userStore.role,
      deviceIds: userStore.deviceIds,
    });

    Object.assign(originalUserInfo, {
      id: userStore.id,
      nickname: userStore.nickname,
      phone: userStore.phone,
      password: '',
      role: userStore.role,
      deviceIds: userStore.deviceIds,
    });
  });
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }

  .general-card {
    min-height: 395px;
  }
</style>
