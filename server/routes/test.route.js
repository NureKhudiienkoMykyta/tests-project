import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createTestController,
  deleteTestController,
  getMyTestsControoler,
  getTestInformationByIdController,
  getTestsController,
} from "../controller/test.controller.js";

const router = new Router();

router.get("/", getTestsController); // ОТРИМАННЯ ВСІХ ТЕСТІВ З ПОШУКОМ ТА ФІЛЬТРАЦІЄЮ ЗА КАТЕГОРІЄЮ ТА ЗВО
router.get("/my", authMiddleware, getMyTestsControoler); // ОТРИМАННЯ МОЇХ ТЕСТІВ, ЯКІ Я СТВОРИВ
router.post("/", authMiddleware, createTestController); // СТВОРЕННЯ ТЕСТУ З ПИТАННЯМИ ТА ВАРІАНТАМИ ВІДПОВІДІ ТА ТИПОМ ДОСТУПУ(ПУБЛІЧНИЙ, ЗА ДОМЕНОМ, ЗА ПОШТАМИ)
router.get("/:id", getTestInformationByIdController); // ОТРИМАННЯ ДЕТАЛЬНОЇ ІНФОРМАЦІЇ ПРО ТЕСТ
router.delete("/:id", authMiddleware, deleteTestController); // ВИДАЛЕННЯ ТЕСТУ

export default router;
