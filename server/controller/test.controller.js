import { ApiError } from "../utils/ApiError.js";
import { createTest, deleteTest } from "../service/test.service.js";

export const createTestController = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(ApiError.unauthorized());
    }

    const test = await createTest(userId, req.body);

    return res.status(201).json({ data: test });
  } catch (error) {
    next(error);
  }
};

export const deleteTestController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const testId = req.params.id;

    const test = await deleteTest(userId, testId);

    return res.status(200).json({ data: test });
  } catch (error) {
    next(error);
  }
};
