import { api } from './api';

const userApi = api['user'];

export interface User {
  id: number;
  username: string | null;
  nama: string | null;
  jabatan: string | null;
  kemandoran: number | null;
  kemandoran_ppro: number | null;
  kemandoran_nama: string | null;
  kemandoran_kode: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserResponse {
  data: User[];
}

export const getUsers = async (): Promise<UserResponse> => {
  const response = await userApi.$get();
  return response.json();
};
