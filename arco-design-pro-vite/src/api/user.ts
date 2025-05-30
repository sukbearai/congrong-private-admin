import axios from 'axios';
import type { RouteRecordNormalized } from 'vue-router';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginRes {
  token: string;
}

// 创建用户接口
export interface CreateUserData {
  nickname: string;
  phone: string;
  password?: string;
  role: string;
  deviceIds: string;
}

export interface CreateUserRes {
  id: number;
  nickname: string;
  phone: string;
  role: string;
  password: any;
  deviceIds: string;
}

// 用户列表接口
export interface ListUserParams {
  page?: number;
  pageSize?: number;
}

export interface UserListItem {
  id: number;
  nickname: string;
  phone: string;
  password?: string;
  role: string;
  deviceIds: string;
}

export interface UserListPagination {
  total: number;
}

export interface ListUserRes {
  list: UserListItem[];
  pagination: UserListPagination;
}

export function login(data: LoginData) {
  return axios.post<LoginRes>('/api/user/login', data);
}

export function logout() {
  return axios.post<LoginRes>('/api/user/logout');
}

export function getUserInfo() {
  return axios.get<UserState>('/api/user/info');
}

export function getMenuList() {
  return axios.post<RouteRecordNormalized[]>('/api/user/menu');
}

// 创建用户
export function createUser(data: CreateUserData) {
  return axios.post<CreateUserRes>('/api/user/create', data);
}

// 获取用户列表
export function getUserList(params: ListUserParams = {}) {
  return axios.get<ListUserRes>('/api/user/list', { params });
}

// 更新用户接口
export interface UpdateUserData {
  id: number;
  nickname: string;
  phone: string;
  password?: string;
  role: string;
  deviceIds: string;
}

export interface UpdateUserRes {
  id: number;
  nickname: string;
  phone: string;
  role: string;
  password: any;
  deviceIds: string;
}

// 删除用户接口
export interface DeleteUserData {
  id: number;
}

export interface DeleteUserRes {
  id: number;
}

// 更新用户
export function updateUser(data: UpdateUserData) {
  return axios.post<UpdateUserRes>('/api/user/update', data);
}

// 删除用户
export function deleteUser(data: DeleteUserData) {
  return axios.post<DeleteUserRes>('/api/user/delete', data);
}
