import apiAxios from "../api/httpClient";

export const startTestAttempt = async (testId) => {
  const response = await apiAxios.post(`/attempts/${testId}/start`);
  return response.data;
};

export const saveAttemptAnswer = async (attemptId, answerData) => {
  const response = await apiAxios.post(
    `/attempts/${attemptId}/answer`,
    answerData,
  );
  return response.data;
};

export const finishTestAttempt = async (attemptId) => {
  const response = await apiAxios.post(`/attempts/${attemptId}/finish`);
  return response.data;
};

export const getResultTestAttempt = async (attemptId) => {
  const response = await apiAxios.get(`/attempts/${attemptId}/result`);
  return response.data;
};

export const getHistoryAttempts = async (params) => {
  const response = await apiAxios.get("/attempts/", {
    params,
  });
  return response.data;
};
