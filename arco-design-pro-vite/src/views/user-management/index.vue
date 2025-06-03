<template>
  <div class="container">
    <a-card class="general-card" :title="$t('userManagement.title')">
      <!-- 操作栏 -->
      <template #extra>
        <a-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <icon-plus />
          </template>
          {{ $t('userManagement.createUser') }}
        </a-button>
      </template>

      <!-- 用户列表 -->
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :data="userList"
        :bordered="false"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #columns>
          <a-table-column
            :title="$t('userManagement.table.id')"
            data-index="id"
            :width="80"
          />
          <a-table-column
            :title="$t('userManagement.table.nickname')"
            data-index="nickname"
          />
          <a-table-column
            :title="$t('userManagement.table.phone')"
            data-index="phone"
          />
          <a-table-column
            :title="$t('userManagement.table.password')"
            data-index="password"
            :width="120"
          >
            <template #cell="{ record }">
              {{ record.password ? '••••••••' : '-' }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('userManagement.table.role')"
            data-index="role"
          >
            <template #cell="{ record }">
              <a-tag :color="getRoleColor(record.role)">
                {{ getRoleText(record.role) }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('userManagement.table.deviceCount')"
            data-index="deviceIds"
          >
            <template #cell="{ record }">
              {{ record.deviceIds || '-' }}
            </template>
          </a-table-column>
          <a-table-column
            :title="$t('userManagement.table.actions')"
            :width="150"
          >
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  {{ $t('userManagement.actions.edit') }}
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  status="danger"
                  :disabled="record.id === 1"
                  @click="handleDelete(record)"
                >
                  {{ $t('userManagement.actions.delete') }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 创建用户弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      :title="$t('userManagement.createUser')"
      :width="600"
      @ok="handleCreateUser"
      @cancel="resetCreateForm"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        layout="vertical"
      >
        <a-form-item
          field="nickname"
          :label="$t('userManagement.form.nickname')"
        >
          <a-input
            v-model="createForm.nickname"
            :placeholder="$t('userManagement.form.nicknamePlaceholder')"
            :max-length="50"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="phone" :label="$t('userManagement.form.phone')">
          <a-input
            v-model="createForm.phone"
            :placeholder="$t('userManagement.form.phonePlaceholder')"
            :max-length="11"
          />
        </a-form-item>

        <a-form-item
          field="password"
          :label="$t('userManagement.form.password')"
        >
          <a-input-password
            v-model="createForm.password"
            :placeholder="$t('userManagement.form.passwordPlaceholder')"
            :max-length="50"
          />
        </a-form-item>

        <a-form-item field="role" :label="$t('userManagement.form.role')">
          <a-select
            v-model="createForm.role"
            :placeholder="$t('userManagement.form.rolePlaceholder')"
          >
            <a-option value="user">{{
              $t('userManagement.role.user')
            }}</a-option>
            <a-option value="admin">{{
              $t('userManagement.role.admin')
            }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          field="deviceIds"
          :label="$t('userManagement.form.deviceIds')"
        >
          <a-input
            v-model="createForm.deviceIds"
            :placeholder="$t('userManagement.form.deviceIdsPlaceholder')"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 编辑用户弹窗 -->
    <a-modal
      v-model:visible="showEditModal"
      :title="$t('userManagement.editUser')"
      :width="600"
      @ok="handleUpdateUser"
      @cancel="resetEditForm"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        layout="vertical"
      >
        <a-form-item
          field="nickname"
          :label="$t('userManagement.form.nickname')"
        >
          <a-input
            v-model="editForm.nickname"
            :placeholder="$t('userManagement.form.nicknamePlaceholder')"
            :max-length="50"
            show-word-limit
          />
        </a-form-item>

        <a-form-item field="phone" :label="$t('userManagement.form.phone')">
          <a-input
            v-model="editForm.phone"
            :placeholder="$t('userManagement.form.phonePlaceholder')"
            :max-length="11"
          />
        </a-form-item>

        <a-form-item
          field="password"
          :label="$t('userManagement.form.password')"
        >
          <a-input-password
            v-model="editForm.password"
            :placeholder="$t('userManagement.form.passwordPlaceholder')"
            :max-length="50"
          />
        </a-form-item>

        <a-form-item field="role" :label="$t('userManagement.form.role')">
          <a-select
            v-model="editForm.role"
            :placeholder="$t('userManagement.form.rolePlaceholder')"
          >
            <a-option value="user">{{
              $t('userManagement.role.user')
            }}</a-option>
            <a-option value="admin">{{
              $t('userManagement.role.admin')
            }}</a-option>
          </a-select>
        </a-form-item>

        <a-form-item
          field="deviceIds"
          :label="$t('userManagement.form.deviceIds')"
        >
          <a-input
            v-model="editForm.deviceIds"
            :placeholder="$t('userManagement.form.deviceIdsPlaceholder')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconPlus } from '@arco-design/web-vue/es/icon';
  import {
    getUserList,
    createUser,
    updateUser,
    deleteUser,
    type CreateUserData,
    type UpdateUserData,
    type UserListItem,
  } from '@/api/user';
  // import { useUserStore } from '@/store';

  // const userStore = useUserStore();
  // const { role: userRole } = userStore;

  // 响应式数据
  const loading = ref(false);
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const userList = ref<UserListItem[]>([]);
  const createFormRef = ref();
  const editFormRef = ref();

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  // 创建用户表单
  const createForm = reactive<CreateUserData>({
    nickname: '',
    phone: '',
    password: '',
    role: 'user',
    deviceIds: '',
  });

  // 编辑用户表单
  const editForm = reactive<UpdateUserData>({
    id: 0,
    nickname: '',
    phone: '',
    password: '',
    role: 'user',
    deviceIds: '',
  });

  // 重置创建表单
  const resetCreateForm = () => {
    Object.assign(createForm, {
      nickname: '',
      phone: '',
      password: '',
      role: 'user',
      deviceIds: '',
    });
    createFormRef.value?.resetFields();
  };

  // 表单验证规则
  const createFormRules = {
    nickname: [
      { required: true, message: '门店名称不能为空' },
      { max: 50, message: '门店名称不超过50个字符' },
    ],
    phone: [
      { required: true, message: '联系电话不能为空' },
      { len: 11, message: '请输入11位联系电话' },
      { match: /^1[3-9]\d{9}$/, message: '请输入有效的联系电话' },
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { min: 6, message: '密码至少6位' },
      { max: 50, message: '密码不超过50位' },
    ],
    role: [{ required: true, message: '请选择门店类型' }],
  };

  // 编辑表单验证规则
  const editFormRules = {
    nickname: [
      { required: true, message: '门店名称不能为空' },
      { max: 50, message: '门店名称不超过50个字符' },
    ],
    phone: [
      { required: true, message: '联系电话不能为空' },
      { len: 11, message: '请输入11位联系电话' },
      { match: /^1[3-9]\d{9}$/, message: '请输入有效的联系电话' },
    ],
    password: [
      { required: true, message: '密码不能为空' },
      { min: 6, message: '密码至少6位' },
      { max: 50, message: '密码不超过50位' },
    ],
    role: [{ required: true, message: '请选择门店类型' }],
  };

  // 获取用户列表
  const fetchUserList = async () => {
    try {
      loading.value = true;
      const response = await getUserList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });

      if (response.data) {
        userList.value = response.data.list || [];
        pagination.total = response.data.pagination.total || 0;
      }
    } catch (error) {
      // Message.error('获取门店列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 分页变化
  const onPageChange = (page: number) => {
    pagination.current = page;
    fetchUserList();
  };

  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchUserList();
  };

  // 创建用户
  const handleCreateUser = async () => {
    try {
      const valid = await createFormRef.value?.validate();
      if (valid) {
        showCreateModal.value = true;
        return;
      }

      const response = await createUser(createForm);
      if (response.data) {
        Message.success('门店创建成功');
        showCreateModal.value = false;
        resetCreateForm();
        fetchUserList();
      }
    } catch (error) {
      // Message.error('门店创建失败');
    }
  };

  // 重置编辑表单
  const resetEditForm = () => {
    Object.assign(editForm, {
      id: 0,
      nickname: '',
      phone: '',
      password: '',
      role: 'user',
      deviceIds: '',
    });
    editFormRef.value?.resetFields();
  };

  // 编辑用户
  const handleEdit = (record: UserListItem) => {
    Object.assign(editForm, {
      id: record.id,
      nickname: record.nickname,
      phone: record.phone,
      password: record.password || '',
      role: record.role,
      deviceIds: record.deviceIds,
    });
    showEditModal.value = true;
  };

  // 更新用户
  const handleUpdateUser = async () => {
    try {
      const valid = await editFormRef.value?.validate();
      if (valid) {
        showEditModal.value = true;
        return;
      }

      const response = await updateUser(editForm);
      if (response.data) {
        Message.success('门店更新成功');
        showEditModal.value = false;
        resetEditForm();
        fetchUserList();
      }
    } catch (error) {
      // Message.error('门店更新失败');
    }
  };

  // 删除用户
  const handleDelete = (record: UserListItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除门店"${record.nickname}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          const response = await deleteUser({ id: record.id });
          if (response.data.id) {
            Message.success('门店删除成功');
            fetchUserList();
          }
        } catch (error) {
          // Message.error('门店删除失败');
        }
      },
    });
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

  // 组件挂载时获取数据
  onMounted(() => {
    fetchUserList();
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
