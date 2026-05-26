import apiAxios from "../api/httpClient";

export const getAllCategories = async () => {
  const response = await apiAxios.get("/category/");
  return response.data;
};
