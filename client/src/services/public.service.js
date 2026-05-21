import apiAxios from "../api/httpClient";

export const getPublicStats = async () => {
  const response = await apiAxios.get("/public/stats");
  return response.data;
};
