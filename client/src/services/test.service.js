import apiAxios from "../api/httpClient";

export const getTestContinue = async () => {
  const response = await apiAxios.get("/tests/continue");
  return response.data;
};

export const getTestPopular = async (limit) => {
  const response = await apiAxios.get("/tests/popular", {
    params: {
      limit,
    },
  });
  return response.data;
};
