import { startAttempt, recordAnswer, finishAttempt } from "../service/attempt.service.js";
import { ApiError } from "../utils/ApiError.js";

export const startAttemptController = async (req, res, next) => {
  try {
    const testId = Number(req.params.testId);

    if (!Number.isInteger(testId) || testId <= 0) {
      return next(
        ApiError.badRequest("Неправильний формат ідентифікатора тесту"),
      );
    }

    const userId = req.user.id;
    const testAttempt = await startAttempt(testId, userId);

    return res.status(201).json({ data: testAttempt });
  } catch (error) {
    next(error);
  }
};

export const answerAttemptController = async (req, res, next) => {
  try {
    const attemptId = Number(req.params.attemptId);

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      return next(
        ApiError.badRequest("Неправильний формат ідентифікатора спроби"),
      );
    }

    const userId = req.user.id;
    const payload = req.body;

    if (!payload.questionId) {
      return next(ApiError.badRequest("questionId є обов'язковим"));
    }

    const answer = await recordAnswer(attemptId, userId, payload);

    return res.status(201).json({ data: answer });
  } catch (error) {
    next(error);
  }
};

export const finishAttemptController = async (req, res, next) => {
  try {
    const attemptId = Number(req.params.attemptId);

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      return next(
        ApiError.badRequest("Неправильний формат ідентифікатора спроби"),
      );
    }

    const userId = req.user.id;

    const testResult = await finishAttempt(attemptId, userId);

    return res.status(200).json({ data: testResult });
  } catch (error) {
    next(error);
  }
};

export const getResultsAttemptController = async (req, res, next) => {
  try {
    // TODO: Реалізувати логіку отримання результатів спроби
  } catch (error) {
    next(error);
  }
};
