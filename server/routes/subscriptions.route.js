import { Router, raw } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  cancelSubscriptionController,
  createSessionController,
  getMyActiveSubscriptionController,
  getPlansController,
  getSubscriptionHistoryController,
  handleWebhooksController,
  openPortalController,
} from "../controller/subscriptions.controller.js";

const router = new Router();

router.post("/create", authMiddleware, createSessionController); // Створення сесії оплати
router.post("/cancel", authMiddleware, cancelSubscriptionController); // Скасування автоподовження
router.post("/customer-portal", authMiddleware, openPortalController); // Посилання на Stripe Portal
router.get("/plans", getPlansController); // Отримання списку тарифів з БД
router.get("/me", authMiddleware, getMyActiveSubscriptionController); // Поточний статус преміуму для перевірки лімітів
router.get("/history", authMiddleware, getSubscriptionHistoryController); // Історія платежів

router.post(
  "/webhooks",
  raw({ type: "application/json" }),
  handleWebhooksController,
); // WebHook

export default router;
