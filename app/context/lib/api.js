'use client';

import axios from 'axios';
import { useAuth } from '@clerk/nextjs';

const api = axios.create();

export const useApi = () => {
  const { getToken } = useAuth();

  api.interceptors.request.use(async (config) => {
    const token = await getToken({ template: 'backend' });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};
