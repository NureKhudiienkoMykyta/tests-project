import { startAttempt, recordAnswer, finishAttempt, getResultTest, getHistoryAttempts } from "../service/attempt.service.js";
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
    const attemptId = Number(req.params.attemptId);

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      return next(
        ApiError.badRequest("Неправильний формат ідентифікатора спроби"),
      );
    }

    const userId = req.user.id;

    const testResult = await getResultTest(attemptId, userId);

    return res.status(200).json({ data: testResult });
  } catch (error) {
    next(error);
  }
};

export const getHistoryAttemptsController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { page = 1, limit = 20 } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page <= 0) {
      return next(
        ApiError.badRequest("Page повинен бути цілим числом більше 0"),
      );
    }

    if (!Number.isInteger(limit) || limit <= 0 || limit > 50) {
      return next(
        ApiError.badRequest("Limit повинен бути цілим числом від 1 до 50"),
      );
    }

    const tests = await getHistoryAttempts(userId, limit, page);

    return res.status(200).json({ data: tests });
  } catch (error) {
    next(error);
  }
};
