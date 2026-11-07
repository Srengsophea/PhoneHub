import type { Address } from '@/types';
import api from '@/lib/api';

export async function fetchUserAddresses(): Promise<Address[]> {
  try {
    const res = await api.get('/user/addresses');
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch addresses from backend:', err);
  }
  return [];
}

export async function createAddress(data: Omit<Address, 'id'>): Promise<Address> {
  const res = await api.post('/user/addresses', data);
  return res.data?.data;
}

export async function updateAddress(id: number, data: Partial<Address>): Promise<Address | null> {
  const res = await api.put(`/user/addresses/${id}`, data);
  return res.data?.data ?? null;
}

export async function deleteAddress(id: number): Promise<boolean> {
  await api.delete(`/user/addresses/${id}`);
  return true;
}

export async function setDefaultAddress(id: number): Promise<boolean> {
  await api.post(`/user/addresses/${id}/default`);
  return true;
}
