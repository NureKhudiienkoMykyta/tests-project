import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  answerAttemptController,
  finishAttemptController,
  getResultsAttemptController,
  startAttemptController,
} from "../controller/attempts.controller.js";

const router = new Router();

router.post("/testId/start", authMiddleware, startAttemptController); // почати спробу
router.post("/:attemptId/answer", authMiddleware, answerAttemptController); // відповісти на питання
router.post("/:attemptId/finish", authMiddleware, finishAttemptController); // закінчити спробу
router.get("/:attemptId/result", authMiddleware, getResultsAttemptController); // отримати результати тесту якщо full  то з питаннями якщо ONLY_SCORE то тільки кількість питань

export default router;
