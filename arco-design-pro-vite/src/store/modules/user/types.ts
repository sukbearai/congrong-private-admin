export type RoleType = '' | '*' | 'admin' | 'user';
export interface UserState {
  id: number;
  nickname: string;
  phone: string;
  password: string;
  role: string;
  deviceIds: string[];
  [key: string]: any;
}
