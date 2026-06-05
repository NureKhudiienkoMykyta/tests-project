import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

export const BASE_URL = import.meta.env.VITE_API_URL;

const apiAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

apiAxios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await useAuthStore.getState().refreshSession();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return apiAxios(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiAxios;
