export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);

    this.status = status;
    this.errors = errors;
  }

  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Не авторизований") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Доступ заборонений") {
    return new ApiError(403, message);
  }

  static notFound(message = "Ресурс не знайдено") {
    return new ApiError(404, message);
  }

  static conflict(message = "Конфлікт даних") {
    return new ApiError(409, message);
  }

  static unprocessableEntity(message = "Помилка валідації", errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = "Занадто багато запитів") {
    return new ApiError(429, message);
  }

  static internal(message = "Внутрішня помилка сервера") {
    return new ApiError(500, message);
  }
}
