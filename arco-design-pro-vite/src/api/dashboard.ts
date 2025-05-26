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
