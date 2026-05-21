import apiAxios from "../api/httpClient";

export const getUserDashboardStats = async () => {
  const response = await apiAxios.get("/users/dashboard-stats");
  return response.data;
};
