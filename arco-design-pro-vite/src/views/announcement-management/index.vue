<template>
  <div class="container">
    <a-card class="general-card" title="公告管理">
      <template #extra>
        <a-button type="primary" @click="showCreateModal = true">
          <template #icon>
            <icon-plus />
          </template>
          新建公告
        </a-button>
      </template>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :data="announcementList"
        :bordered="false"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #columns>
          <a-table-column title="ID" data-index="id" :width="80" />
          <a-table-column title="标题" data-index="title" />
          <a-table-column title="内容" data-index="content" />
          <a-table-column title="微信链接" data-index="wechatUrl" />
          <a-table-column title="创建时间" :width="160">
            <template #cell="{ record }">
              {{ dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column title="更新时间" :width="160">
            <template #cell="{ record }">
              {{ dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="150">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleEdit(record)"
                  >编辑</a-button
                >
                <a-button
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleDelete(record)"
                  >删除</a-button
                >
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>
    <!-- 新建公告弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      title="新建公告"
      width="600"
      @ok="handleCreateAnnouncement"
      @cancel="resetCreateForm"
    >
      <a-form
        ref="createFormRef"
        :model="createForm"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item field="title" label="标题">
          <a-input
            v-model="createForm.title"
            placeholder="请输入公告标题"
            :max-length="50"
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="content" label="内容">
          <a-textarea
            v-model="createForm.content"
            placeholder="请输入公告内容"
            :max-length="100"
            show-word-limit
            auto-size
          />
        </a-form-item>
        <a-form-item field="wechatUrl" label="微信链接">
          <a-input
            v-model="createForm.wechatUrl"
            placeholder="请输入微信链接"
            :max-length="150"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 编辑公告弹窗 -->
    <a-modal
      v-model:visible="showEditModal"
      title="编辑公告"
      width="600"
      @ok="handleUpdateAnnouncement"
      @cancel="resetEditForm"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="formRules"
        layout="vertical"
      >
        <a-form-item field="title" label="标题">
          <a-input
            v-model="editForm.title"
            placeholder="请输入公告标题"
            :max-length="50"
            show-word-limit
          />
        </a-form-item>
        <a-form-item field="content" label="内容">
          <a-textarea
            v-model="editForm.content"
            placeholder="请输入公告内容"
            :max-length="100"
            show-word-limit
            auto-size
          />
        </a-form-item>
        <a-form-item field="wechatUrl" label="微信链接">
          <a-input
            v-model="editForm.wechatUrl"
            placeholder="请输入微信链接"
            :max-length="150"
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
  import dayjs from 'dayjs';
  import {
    getAnnouncementList,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    type AnnouncementItem,
    type AnnouncementCreateParams,
    type AnnouncementUpdateParams,
  } from '@/api/announcement';

  const loading = ref(false);
  const showCreateModal = ref(false);
  const showEditModal = ref(false);
  const announcementList = ref<AnnouncementItem[]>([]);
  const createFormRef = ref();
  const editFormRef = ref();

  const pagination = reactive({
    current: 1,
    pageSize: 100,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  const createForm = reactive<AnnouncementCreateParams>({
    userId: 1, // 实际项目应从store获取当前用户id
    title: '',
    content: '',
    wechatUrl: '',
  });

  const editForm = reactive<AnnouncementUpdateParams>({
    id: 0,
    title: '',
    content: '',
    wechatUrl: '',
  });

  const formRules = {
    title: [
      { required: true, message: '标题不能为空' },
      { max: 100, message: '标题不超过100个字符' },
    ],
    content: [
      { required: true, message: '内容不能为空' },
      { max: 500, message: '内容不超过500个字符' },
    ],
    wechatUrl: [
      { required: true, message: '微信链接不能为空' },
      { max: 200, message: '微信链接不超过200个字符' },
    ],
  };

  const resetCreateForm = () => {
    Object.assign(createForm, {
      userId: 1,
      title: '',
      content: '',
      wechatUrl: '',
    });
    createFormRef.value?.resetFields();
  };

  const resetEditForm = () => {
    Object.assign(editForm, {
      id: 0,
      title: '',
      content: '',
      wechatUrl: '',
    });
    editFormRef.value?.resetFields();
  };

  const fetchAnnouncementList = async () => {
    try {
      loading.value = true;
      const response = await getAnnouncementList({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      // 修复 response 多一层 data 的问题
      const resData = response.data;
      if (resData && resData.list) {
        announcementList.value =
          resData.list.map((item) => {
            item.createdAt = dayjs(item.createdAt).format(
              'YYYY-MM-DD HH:mm:ss'
            );
            item.updatedAt = dayjs(item.updatedAt).format(
              'YYYY-MM-DD HH:mm:ss'
            );
            return item;
          }) || [];
        pagination.total = resData.total || 0;
      }
    } catch (e) {
      // 可以根据需要添加错误提示
    } finally {
      loading.value = false;
    }
  };

  const onPageChange = (page: number) => {
    pagination.current = page;
    fetchAnnouncementList();
  };

  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchAnnouncementList();
  };

  const handleCreateAnnouncement = async () => {
    try {
      const valid = await createFormRef.value?.validate();

      if (valid) {
        showCreateModal.value = true;
        return;
      }
      const response = await createAnnouncement(createForm);
      if (response.data) {
        Message.success('公告创建成功');
        showCreateModal.value = false;
        resetCreateForm();
        fetchAnnouncementList();
      }
    } catch (e) {
      // 可以根据需要添加错误提示
    }
  };

  const handleEdit = (record: AnnouncementItem) => {
    Object.assign(editForm, {
      id: record.id,
      title: record.title,
      content: record.content,
      wechatUrl: record.wechatUrl,
    });
    showEditModal.value = true;
  };

  const handleUpdateAnnouncement = async () => {
    try {
      const valid = await editFormRef.value?.validate();
      if (valid) {
        showEditModal.value = true;
        return;
      }
      const response = await updateAnnouncement(editForm);
      if (response.data) {
        Message.success('公告更新成功');
        showEditModal.value = false;
        resetEditForm();
        fetchAnnouncementList();
      }
    } catch (e) {
      // 可以根据需要添加错误提示
    }
  };

  const handleDelete = (record: AnnouncementItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除公告"${record.title}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          const response = await deleteAnnouncement({ id: record.id });
          if (response.data) {
            Message.success('公告删除成功');
          }
        } catch (e) {
          // 可以根据需要添加错误提示
        } finally {
          // 无论成功失败都刷新列表，防止数据不同步
          fetchAnnouncementList();
        }
      },
    });
  };

  onMounted(() => {
    fetchAnnouncementList();
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
