import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createTestController,
  deleteTestController,
} from "../controller/test.controller.js";

const router = new Router();

// router.get("/"); // ОТРИМАННЯ ВСІХ ТЕСТІВ З ПОШУКОМ ТА ФІЛЬТРАЦІЄЮ ЗА КАТЕГОРІЄЮ ТА ЗВО
// router.get("/my", authMiddleware); // ОТРИМАННЯ МОЇХ ТЕСТІВ, ЯКІ Я СТВОРИВ
router.post("/", authMiddleware, createTestController); // СТВОРЕННЯ ТЕСТУ З ПИТАННЯМИ ТА ВАРІАНТАМИ ВІДПОВІДІ ТА ТИПОМ ДОСТУПУ(ПУБЛІЧНИЙ, ЗА ДОМЕНОМ, ЗА ПОШТАМИ)
// router.get("/:id"); // ОТРИМАННЯ ДЕТАЛЬНОЇ ІНФОРМАЦІЇ ПРО ТЕСТ
router.delete("/:id", authMiddleware, deleteTestController); // ВИДАЛЕННЯ ТЕСТУ

export default router;
