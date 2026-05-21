import apiAxios from "../api/httpClient";

export const getPlans = async () => {
  const response = await apiAxios.get("/subscriptions/plans");
  return response.data;
};

export const createSubscription = async (stripePriceId) => {
  const response = await apiAxios.post("/subscriptions/create", {
    stripePriceId,
  });
  return response.data;
};
