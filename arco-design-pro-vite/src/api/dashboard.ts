import axios from 'axios';
import type { TableData } from '@arco-design/web-vue/es/table/interface';

export interface ContentDataRecord {
  x: string;
  y: number;
}

export function queryContentData() {
  return axios.get<ContentDataRecord[]>('/api/content-data');
}

export interface PopularRecord {
  key: number;
  clickNumber: string;
  title: string;
  increases: number;
}

export function queryPopularList(params: { type: string }) {
  return axios.get<TableData[]>('/api/popular/list', { params });
}

export interface ProductUpdateParams {
  content: string;
  title: string;
  checkedImg: string;
  uncheckedImg: string;
  constitutions: string;
  deviceIds: string;
}

export interface ProductUpdateResponse {
  code: number;
  message: string;
  data: any;
  timestamp: number;
}

export function submitProductUpdate(params: ProductUpdateParams) {
  return axios.post<ProductUpdateResponse>(
    '/api/device/product-update',
    params
  );
}

export interface ProductListParams {
  deviceIds?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductListItem {
  id: number;
  title: string;
  content: string;
  constitutions: string;
  deviceIds: string;
  checkedImg: string;
  uncheckedImg: string;
  key: string;
}

export interface ProductListPagination {
  total: number;
}

export interface ProductListResponse {
  list: ProductListItem[];
  pagination: ProductListPagination;
}

export function getProductList(params: ProductListParams = {}) {
  return axios.get<ProductListResponse>('/api/device/product-list', { params });
}

export function deleteProduct(params: { id: number }) {
  return axios.post('/api/device/product-delete', { id: params.id });
}
