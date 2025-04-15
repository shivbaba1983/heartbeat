// src/api/axiosInstance.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.marketdata.app', // change this
});

axiosInstance.interceptors.request.use((config) => {
  const token = 'M1B2YzR0TkpFcWV1VXItU2s4a05ZZkMtSEZ5UDV0dnZ0MGdNYzBTLWtWTT0';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
