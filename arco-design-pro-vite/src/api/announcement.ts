import axios from 'axios';

// 公告数据结构
export interface AnnouncementItem {
  id: number;
  userId: number;
  title: string;
  content: string;
  wechatUrl: string;
  createdAt: string;
  updatedAt: string;
}

// 创建公告入参
export interface AnnouncementCreateParams {
  userId: number;
  title: string;
  content: string;
  wechatUrl: string;
}

// 编辑公告入参
export interface AnnouncementUpdateParams {
  id: number;
  title: string;
  content: string;
  wechatUrl: string;
}

// 删除公告入参
export interface AnnouncementDeleteParams {
  id: number;
}

// 公告列表查询参数
export interface AnnouncementListParams {
  page?: number;
  pageSize?: number;
}

// 公告列表返回结构
export interface AnnouncementListResponse {
  code: number;
  message: string;
  data: {
    list: AnnouncementItem[];
    total: number;
  };
  timestamp: number;
}

// 创建/编辑/删除返回结构
export interface AnnouncementActionResponse {
  code: number;
  message: string;
  data: any;
  timestamp: number;
}

// 创建公告
export function createAnnouncement(params: AnnouncementCreateParams) {
  return axios.post<AnnouncementActionResponse>(
    '/api/announcement/create',
    params
  );
}

// 查询公告列表
export function getAnnouncementList(params: AnnouncementListParams = {}) {
  return axios.get<AnnouncementListResponse>('/api/announcement/list', {
    params,
  });
}

// 编辑公告
export function updateAnnouncement(params: AnnouncementUpdateParams) {
  return axios.post<AnnouncementActionResponse>(
    '/api/announcement/update',
    params
  );
}

// 删除公告
export function deleteAnnouncement(params: AnnouncementDeleteParams) {
  return axios.post<AnnouncementActionResponse>(
    '/api/announcement/delete',
    params
  );
}
