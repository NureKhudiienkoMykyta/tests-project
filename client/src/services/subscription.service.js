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

export const openPortal = async () => {
  const response = await apiAxios.post("/subscriptions/customer-portal");
  return response.data;
};

export const canselSubsscription = async (subscriptionId) => {
  const response = await apiAxios.post(
    "/subscriptions/cancel",
    {},
    {
      params: {
        subscriptionId: subscriptionId,
      },
    },
  );
  return response.data;
};

export const getHistory = async () => {
  const response = await apiAxios.get("/subscriptions/history");
  return response.data;
};

export const getMySubscription = async () => {
  const response = await apiAxios.get("/subscriptions/me");
  return response.data;
};
