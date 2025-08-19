<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="container">
    <a-card class="general-card" title="产品列表">
      <template #extra>
        <a-button type="primary" @click="goToCreate">
          <template #icon>
            <icon-plus />
          </template>
          添加产品内容
        </a-button>
      </template>

      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :data="productList"
        :bordered="false"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #columns>
          <a-table-column title="设备ID" data-index="deviceIds" />
          <a-table-column title="适用体质" data-index="constitutions">
            <template #cell="{ record }">
              <a-space wrap>
                <a-tag
                  v-for="item in record.constitutions?.split(',')"
                  :key="item"
                  color="blue"
                >
                  {{ item }}
                </a-tag>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="viewDetail(record)">
                  查看
                </a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button
                  type="text"
                  status="danger"
                  size="small"
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 产品详情弹窗 -->
    <a-modal
      v-model:visible="showDetailModal"
      title="产品详情"
      :width="800"
      @cancel="showDetailModal = false"
    >
      <template v-if="currentProduct">
        <h3>{{ currentProduct.title }}</h3>
        <a-divider />
        <div class="detail-item">
          <span class="label">适用体质：</span>
          <a-space wrap>
            <a-tag
              v-for="item in currentProduct.constitutions.split(',')"
              :key="item"
              color="blue"
            >
              {{ item }}
            </a-tag>
          </a-space>
        </div>
        <div class="detail-item">
          <span class="label">产品详情：</span>
          <div class="content-preview" v-html="currentProduct.content"></div>
        </div>
        <div class="detail-item">
          <span class="label">设备ID：</span>
          <span>{{ currentProduct.deviceIds }}</span>
        </div>
      </template>
      <template #footer>
        <a-button @click="showDetailModal = false">关闭</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message, Modal } from '@arco-design/web-vue';
  import { IconPlus } from '@arco-design/web-vue/es/icon';
  import {
    getProductList,
    deleteProduct,
    type ProductListItem,
  } from '@/api/dashboard';
  import { useUserStore } from '@/store';

  const userStore = useUserStore();
  const { deviceIds } = userStore;

  const router = useRouter();
  const loading = ref(false);
  const productList = ref<ProductListItem[]>([]);
  const showDetailModal = ref(false);
  const currentProduct = ref<ProductListItem | null>(null);

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  // 获取产品列表
  const fetchProductList = async () => {
    try {
      loading.value = true;
      const response = await getProductList({
        deviceIds,
        page: pagination.current,
        pageSize: pagination.pageSize,
      });

      if (response.data) {
        productList.value =
          response.data.list.filter((item) => !!item.content) || [];
        pagination.total = response.data.pagination.total || 0;
      }
    } catch (error) {
      Message.error('获取产品列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 分页变化
  const onPageChange = (page: number) => {
    pagination.current = page;
    fetchProductList();
  };

  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchProductList();
  };

  // 跳转到创建页面
  const goToCreate = () => {
    router.push({ name: 'Workplace' });
  };

  // 编辑产品
  const handleEdit = (record: ProductListItem) => {
    router.push({
      name: 'Workplace',
      query: {
        id: record.id,
        editMode: 'true',
      },
    });
  };

  // 查看详情
  const viewDetail = (record: ProductListItem) => {
    currentProduct.value = record;
    showDetailModal.value = true;
  };

  // 删除产品
  const handleDelete = (record: ProductListItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除本条产品内容吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          const res = await deleteProduct({ id: record.id });
          if (res.data.id) {
            Message.success('产品删除成功');
            setTimeout(() => {
              fetchProductList();
            }, 300);
          }
        } catch (error) {
          Message.error('产品删除失败');
        }
      },
    });
  };

  // 组件挂载时获取数据
  onMounted(() => {
    fetchProductList();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 20px;
  }

  .general-card {
    min-height: 395px;
  }

  .detail-item {
    margin-bottom: 16px;
  }

  .label {
    font-weight: 500;
    margin-right: 8px;
  }

  .content-preview {
    margin-top: 8px;
    padding: 16px;
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    background-color: var(--color-fill-2);
    max-height: 300px;
    overflow-y: auto;
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

  :deep(.arco-tag) {
    margin: 2px;
  }
</style>
