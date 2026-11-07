import type { Address } from '@/types';
import api from '@/lib/api';

const ADDRESSES_STORAGE_KEY = 'phonehub_user_addresses';

export function getLocalAddresses(): Address[] {
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export function saveLocalAddresses(addresses: Address[]): void {
  try {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  } catch {}
}

export async function fetchUserAddresses(): Promise<Address[]> {
  try {
    const res = await api.get('/user/addresses');
    if (res.data?.data && Array.isArray(res.data.data)) {
      saveLocalAddresses(res.data.data);
      return res.data.data;
    }
  } catch {}
  return getLocalAddresses();
}

export async function createAddress(data: Omit<Address, 'id'>): Promise<Address> {
  let created: Address = {
    ...data,
    id: Date.now(),
  };

  try {
    const res = await api.post('/user/addresses', data);
    if (res.data?.data) {
      created = res.data.data;
    }
  } catch {}

  const current = getLocalAddresses();
  if (created.is_default) {
    current.forEach((a) => (a.is_default = false));
  }
  current.unshift(created);
  saveLocalAddresses(current);
  return created;
}

export async function updateAddress(id: number, data: Partial<Address>): Promise<Address | null> {
  let updated: Address | null = null;
  try {
    const res = await api.put(`/user/addresses/${id}`, data);
    if (res.data?.data) {
      updated = res.data.data;
    }
  } catch {}

  const current = getLocalAddresses();
  const idx = current.findIndex((a) => a.id === id);
  if (idx >= 0) {
    if (data.is_default) {
      current.forEach((a) => (a.is_default = false));
    }
    current[idx] = { ...current[idx], ...data, ...(updated || {}) };
    saveLocalAddresses(current);
    return current[idx];
  }
  return updated;
}

export async function deleteAddress(id: number): Promise<boolean> {
  try {
    await api.delete(`/user/addresses/${id}`);
  } catch {}

  const current = getLocalAddresses();
  const filtered = current.filter((a) => a.id !== id);
  saveLocalAddresses(filtered);
  return true;
}

export async function setDefaultAddress(id: number): Promise<boolean> {
  try {
    await api.post(`/user/addresses/${id}/default`);
  } catch {}

  const current = getLocalAddresses();
  current.forEach((a) => {
    a.is_default = a.id === id;
  });
  saveLocalAddresses(current);
  return true;
}
