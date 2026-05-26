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

export const getTestsLibrary = async (params) => {
  const response = await apiAxios.get("/tests/", {
    params,
  });
  return response.data;
};

export const getMyTests = async (params) => {
  const response = await apiAxios.get("/tests/my", {
    params,
  });
  return response.data;
};

export const getDetailInfoTest = async (testId) => {
  const response = await apiAxios.get(`/tests/${testId}`);
  return response.data;
};

export const createTest = async (payload) => {
  const response = await apiAxios.post(`/tests/`, payload);
  return response.data;
};

export const deleteTest = async (testId) => {
  const response = await apiAxios.delete(`/tests/${testId}`);
  return response.data;
};

export const getTestForEdit = async (testId) => {
  const response = await apiAxios.get(`/tests/${testId}/edit`);
  return response.data;
};

export const editTest = async (testId, payload) => {
  const response = await apiAxios.put(`/tests/${testId}`, payload);
  return response.data;
};
