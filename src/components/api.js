// src/api.js
import axios from 'axios';
import { API_BASE_URL } from '../config';
import router from '../router'; 

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ====== 요청 인터셉터: 매 요청마다 access 토큰 자동 첨부 ======
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access_token');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// 동시 요청 대비용
let isRefreshing = false;
let pendingRequests = [];

const onRefreshed = (newToken) => {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
};

// ====== 응답 인터셉터: 401이면 refresh 토큰으로 재발급 ======
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 아니면 그대로 에러
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refresh = localStorage.getItem('refresh_token');

    if (!refresh) {
      // refresh도 없으면 로그인부터
      router.push('/login');
      return Promise.reject(error);
    }

    // 이미 다른 요청이 refresh 중일 때는 끝날 때까지 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    // 여기서 실제 refresh 요청
    isRefreshing = true;

    try {
      const res = await axios.post(`${API_BASE_URL}accounts/token/refresh/`, {
        refresh,
      });

      const newAccess = res.data.access;
      localStorage.setItem('access_token', newAccess);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

      onRefreshed(newAccess);
      isRefreshing = false;

      // 원래 요청 재시도
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
      
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshed(null);

      // refresh 실패 → 완전 로그아웃 처리
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/login');

      return Promise.reject(refreshError);
    }
  }
);

export default api;
