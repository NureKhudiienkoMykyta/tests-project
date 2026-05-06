import { validateAccessToken } from "../service/token.service.js";
import { ApiError } from "../utils/ApiError.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.unauthorized());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.unauthorized());
    }

    const userData = validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.unauthorized());
    }

    req.user = userData;
    next();
  } catch (error) {
    return next(ApiError.unauthorized());
  }
};
