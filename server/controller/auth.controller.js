import {
  activateAccount,
  loginAccount,
  logoutAccount,
  refreshTokenAccount,
  registration,
  resendActivationMail,
} from "../service/auth.service.js";
import { ApiError } from "../utils/ApiError.js";
import {
  isNotEmpty,
  validateEmail,
  validatePassword,
} from "../utils/validate.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, universityId } = req.body;

    if (
      !isNotEmpty(email) ||
      !isNotEmpty(password) ||
      !isNotEmpty(firstName) ||
      !isNotEmpty(lastName)
    ) {
      return next(
        ApiError.badRequest("Усі обов'язкові поля мають бути заповнені"),
      );
    }

    if (!validateEmail(email)) {
      return next(ApiError.unprocessableEntity("Невірний формат пошти"));
    }

    if (!validatePassword(password)) {
      return next(
        ApiError.unprocessableEntity(
          "Пароль має містити від 8 до 16 символів (літери, цифри, підкреслення)",
        ),
      );
    }

    const result = await registration(
      email,
      password,
      firstName,
      lastName,
      universityId,
    );

    return res.status(201).json({
      message: "Користувача зареєстровано. Перевірте пошту для підтвердження.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isNotEmpty(email) || !isNotEmpty(password)) {
      return next(ApiError.badRequest("Пошта та пароль мають бути заповнені"));
    }

    if (!validateEmail(email)) {
      return next(ApiError.unprocessableEntity("Невірний формат пошти"));
    }

    if (!validatePassword(password)) {
      return next(
        ApiError.unprocessableEntity(
          "Пароль має містити від 8 до 16 символів (літери, цифри, підкреслення)",
        ),
      );
    }

    const userData = await loginAccount(email, password);

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("refreshToken", userData.refreshToken, cookieOptions);

    return res.status(200).json({
      accessToken: userData.accessToken,
      user: userData.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const userData = await refreshTokenAccount(refreshToken);

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("refreshToken", userData.refreshToken, cookieOptions);

    return res.status(200).json({
      accessToken: userData.accessToken,
      user: userData.user,
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const { token } = req.params;

    await activateAccount(token);

    return res.redirect(`${process.env.CLIENT_URL}/login?activated=true`);
  } catch (error) {
    console.error("Помилка активації пошти:", error.message);
    return res.redirect(
      `${process.env.CLIENT_URL}/login?activated=false&reason=invalid_token`,
    );
  }
};

export const resendVerify = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return next(
        ApiError.unprocessableEntity("Невірний формат пошти або поле пусте"),
      );
    }

    const result = await resendActivationMail(email);

    return res.status(200).json({
      success: true,
      message: "Нове посилання для активації надіслано на вашу пошту.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await logoutAccount(refreshToken);
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Вихід виконано успішно" });
  } catch (error) {
    next(error);
  }
};
