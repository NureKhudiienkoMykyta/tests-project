import { ApiError } from "../utils/ApiError.js";
import {
  createTest,
  deleteTest,
  getContinueTests,
  getMyTests,
  getPopularTests,
  getTestForEdit,
  getTestInformationById,
  getTests,
  updateTest,
} from "../service/test.service.js";

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

export const getTestInformationByIdController = async (req, res, next) => {
  try {
    const testId = Number(req.params.id);

    if (!Number.isInteger(testId) || testId <= 0) {
      return next(
        ApiError.badRequest("Неправильний формат ідентифікатора тесту"),
      );
    }

    const testData = await getTestInformationById(testId);

    return res.status(200).json({ data: testData });
  } catch (error) {
    next(error);
  }
};

export const getTestsController = async (req, res, next) => {
  try {
    let {
      search,
      categoryId,
      universityId,
      sortBy,
      page = 1,
      limit = 20,
    } = req.query;

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

    if (categoryId !== undefined) {
      categoryId = Number(categoryId);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return next(
          ApiError.badRequest("categoryId повинен бути цілим числом"),
        );
      }
    }

    if (universityId !== undefined) {
      universityId = Number(universityId);

      if (!Number.isInteger(universityId) || universityId <= 0) {
        return next(
          ApiError.badRequest("universityId повинен бути цілим числом"),
        );
      }
    }

    const allowedSortValues = ["newest", "oldest"];

    if (sortBy && !allowedSortValues.includes(sortBy)) {
      return next(ApiError.badRequest("Некоректне значення sortBy"));
    }

    if (search && typeof search !== "string") {
      return next(ApiError.badRequest("search повинен бути рядком"));
    }

    const tests = await getTests(
      page,
      limit,
      search,
      categoryId,
      universityId,
      sortBy,
    );

    return res.status(200).json({ data: tests });
  } catch (error) {
    next(error);
  }
};

export const getMyTestsControoler = async (req, res, next) => {
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

    const tests = await getMyTests(userId, page, limit);

    return res.status(200).json({ data: tests });
  } catch (error) {
    next(error);
  }
};

export const getContinueTestsController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const attempts = await getContinueTests(userId);
    return res.status(200).json({ data: attempts });
  } catch (error) {
    next(error);
  }
};

export const getPopularTestsController = async (req, res, next) => {
  try {
    let { limit = 20 } = req.query;

    limit = Number(limit);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 30) {
      return next(
        ApiError.badRequest("Limit повинен бути цілим числом від 1 до 30"),
      );
    }

    const popularTests = await getPopularTests(limit);
    return res.status(200).json({ data: popularTests });
  } catch (error) {
    next(error);
  }
};

export const getTestForEditController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const testId = Number(req.params.id);

    if (!Number.isInteger(testId) || testId <= 0) {
      return next(
        ApiError.badRequest("Неправильний формат ідентифікатора тесту"),
      );
    }

    const testData = await getTestForEdit(userId, testId);

    return res.status(200).json({ data: testData });
  } catch (error) {
    next(error);
  }
};

export const updateTestController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const testId = req.params.id;

    const updatedTest = await updateTest(userId, testId, req.body);

    return res.status(200).json({ data: updatedTest });
  } catch (error) {
    next(error);
  }
};
