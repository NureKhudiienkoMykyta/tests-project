import {
  createSession,
  cancelSubscription,
  openCustomerPortal,
  getPlans,
  getMyActiveSubscription,
  getSubscriptionHistory,
  handleWebhook,
} from "../service/subscriptions.service.js";
import { ApiError } from "../utils/ApiError.js";

export const createSessionController = async (req, res, next) => {
  try {
    const { stripePriceId } = req.body;

    if (!stripePriceId) {
      next(ApiError.badRequest("stripePriceId обов'язковий."));
    }

    const userId = req.user.id;

    const data = await createSession(userId, stripePriceId);

    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscriptionController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { subscriptionId } = req.query;

    if (!subscriptionId || subscriptionId.trim() === "") {
      throw ApiError.badRequest("Параметр subscriptionId є обов'язковим.");
    }

    const data = await cancelSubscription(userId, subscriptionId);

    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const openPortalController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await openCustomerPortal(userId);
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getPlansController = async (req, res, next) => {
  try {
    const data = await getPlans();
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getMyActiveSubscriptionController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await getMyActiveSubscription(userId);
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionHistoryController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await getSubscriptionHistory(userId);
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const handleWebhooksController = async (req, res, next) => {
  try {
    const signature = req.headers["stripe-signature"];
    const rawBody = req.rawBody;

    if (!rawBody) {
      return next(
        ApiError.badRequest(
          "Не вдалося отримати сирий буфер запиту (rawBody).",
        ),
      );
    }

    const result = await handleWebhook(rawBody, signature);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
