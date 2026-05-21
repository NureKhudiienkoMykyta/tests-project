import { create } from "zustand";
import {
  loginService,
  logoutService,
  refreshService,
  registerService,
  resendVerifyService,
} from "../services/auth.service";

export const useAuthStore = create((set, get) => ({
  user: null,
  error: null,
  isLoading: true,
  isSubmitting: false,
  accessToken: null,

  setAuth: (user, accessToken) => {
    set({ user, accessToken });
  },

  clearAuth: () => {
    set({ user: null, accessToken: null });
  },

  isPremium: () => {
    const user = get().user;
    return !!(user && user.subscription);
  },

  login: async (payload) => {
    try {
      set({ isSubmitting: true, error: null });
      const data = await loginService(payload);

      set({
        user: data.user,
        accessToken: data.accessToken,
        isSubmitting: false,
      });
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || "Помилка при вході";
      set({ error: errMsg, isSubmitting: false });
      return { success: false, error: errMsg };
    }
  },

  register: async (payload) => {
    try {
      set({ isSubmitting: true, error: null });

      const data = await registerService(payload);

      set({ isSubmitting: false });
      return { success: true, message: data.message };
    } catch (error) {
      const errMsg = error.response?.data?.message || "Помилка при реєстрації";
      set({ error: errMsg, isSubmitting: false });
      return { success: false, error: errMsg };
    }
  },

  logout: async () => {
    try {
      set({ isSubmitting: true });

      await logoutService();
    } catch (err) {
      console.error("Помилка під час логауту на сервері:", err);
    } finally {
      set({ user: null, accessToken: null, isSubmitting: false, error: null });
    }
  },

  resendVerify: async (email) => {
    try {
      set({ isSubmitting: true, error: null });
      const data = await resendVerifyService(email);

      set({ isSubmitting: false });
      return { success: data.success };
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Помилка при відправки листа підтвердження";
      set({ error: errMsg, isSubmitting: false });
      return { success: false, error: errMsg };
    }
  },

  refreshSession: async () => {
    try {
      set({ isLoading: true });
      const data = await refreshService();

      const { accessToken, user } = data;
      set({ user, accessToken, isLoading: false, error: null });
      return accessToken;
    } catch {
      set({ user: null, accessToken: null, isLoading: false });
      return null;
    }
  },
}));
