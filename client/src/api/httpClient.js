import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

export const BASE_URL = import.meta.env.VITE_API_URL;

const apiAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Глобальні змінні для керування чергою рефрешу
let isRefreshing = false;
let failedQueue = [];

// Функція для обробки черги: якщо токен успішно оновлено — резолвимо запити, якщо ні — відхиляємо
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

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

    // Перевіряємо, чи це помилка 401 і чи запит ще не повторювався
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 🌟 КЛЮЧОВИЙ МОМЕНТ: Якщо рефреш СЕСІЇ ВЖЕ ЙДЕ (наприклад, викликаний StrictMode або багато разів перевантажив)
      if (isRefreshing) {
        // Ми не шлемо новий запит на сервер, а створюємо Promise,
        // який чекає, поки перший запит отримає новий токен
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiAxios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Якщо це перший запит, який зустрів 401, запускаємо процес оновлення
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await useAuthStore.getState().refreshSession();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Пропускаємо всі накопичені в черзі запити з новим токеном
          processQueue(null, newAccessToken);

          return apiAxios(originalRequest);
        }
      } catch (refreshError) {
        // Якщо рефреш завалився (наприклад, прострочена сесія), відхиляємо всю чергу
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        // Обов'язково скидаємо прапорець в кінці
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiAxios;
