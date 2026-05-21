import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({
    message: "Внутрішня помилка сервера",
  });
};
