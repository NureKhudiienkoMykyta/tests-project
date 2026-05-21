import axios from "axios";
import apiAxios, { BASE_URL } from "../api/httpClient";

export const loginService = async (payload) => {
  const response = await apiAxios.post("/auth/login", payload);
  return response.data;
};

export const registerService = async (payload) => {
  const response = await apiAxios.post("/auth/registration", payload);
  return response.data;
};

export const logoutService = async () => {
  const response = await apiAxios.post("/auth/logout");
  return response.data;
};

export const refreshService = async () => {
  const response = await axios.get(`${BASE_URL}/auth/refresh`, {
    withCredentials: true,
  });

  return response.data;
};

export const resendVerifyService = async (email) => {
  const response = await apiAxios.post("/auth/resend-verify", { email });
  return response.data;
};
