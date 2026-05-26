import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendActivationMail } from "./mail.service.js";
import { ApiError } from "../utils/ApiError.js";
import {
  findRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  removeRefreshToken,
  saveRefreshToken,
  validateRefreshToken,
} from "./token.service.js";

const SALT = 10;

export const registration = async (
  email,
  password,
  firstName,
  lastName,
  universityId = null,
) => {
  const existedUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existedUser) {
    throw ApiError.badRequest(`Користувач з таким email вже існує`);
  }

  const hashPassword = await bcrypt.hash(password, SALT);

  const verifyToken = uuidv4();

  const user = await prisma.user.create({
    data: {
      email: email,
      password_hash: hashPassword,
      first_name: firstName,
      last_name: lastName,
      university_id: universityId,
      email_verify_token: verifyToken,
    },
  });

  await sendActivationMail(email, verifyToken);

  return {
    userId: user.id,
    email: user.email,
    status: "PENDING_ACTIVATION",
  };
};

export const activateAccount = async (activateToken) => {
  const existedUser = await prisma.user.findFirst({
    where: {
      email_verify_token: activateToken,
    },
  });

  if (!existedUser) {
    throw ApiError.badRequest("Некоректне посилання активації");
  }

  await prisma.user.update({
    where: {
      id: existedUser.id,
    },
    data: {
      is_activated: true,
      email_verify_token: null,
    },
  });
};

export const resendActivationMail = async (email) => {
  if (!email) {
    throw ApiError.badRequest("Email є обов'язковим полем");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.notFound("Користувача з таким email не знайдено");
  }

  if (user.is_activated) {
    throw ApiError.badRequest(
      "Цей аккаунт вже успішно активовано. Спробуйте увійти.",
    );
  }

  const newVerifyToken = uuidv4();

  await prisma.user.update({
    where: { id: user.id },
    data: { email_verify_token: newVerifyToken },
  });

  await sendActivationMail(user.email, newVerifyToken);

  return {
    email: user.email,
    status: "ACTIVATION_LETTER_RESENT",
  };
};

export const loginAccount = async (email, password) => {
  const existedUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      university: true,
    },
  });

  if (!existedUser) {
    throw ApiError.notFound(`Невірна пошта або пароль`);
  }

  if (!existedUser.is_activated) {
    throw ApiError.badRequest("Аккаунт не активований. Перевірте пошту.");
  }

  const isMatchPassword = await bcrypt.compare(
    password,
    existedUser.password_hash,
  );

  if (!isMatchPassword) {
    throw ApiError.badRequest("Невірна пошта або пароль");
  }

  // ТУТ ДОДАТИ ОТРИМАННЯ ПІДПИСКИ КОРИСТУВАЧА, ЯКЩО ВОНА Є ТО ДОДАЙЄМО ДО USERDATA,
  // ЯКЩО НЕМАЄ ТО FALSE - ЦЕ ДЛЯ ТОГО ЩОБ НА КЛІЄНТІ ВІДОБРАЗИТИ ЗНАЧОК ТЕ ЩО ПІДПИСКА Є.

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: existedUser.id,
      status: {
        in: ["ACTIVE"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const subscriptionData = activeSubscription
    ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        currentPeriodEnd: activeSubscription.current_period_end,
        cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      }
    : false;

  const accessToken = generateAccessToken({
    id: existedUser.id,
    role: existedUser.role,
  });

  const refreshToken = generateRefreshToken({
    id: existedUser.id,
    role: existedUser.role,
  });

  await saveRefreshToken(existedUser.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: existedUser.id,
      firstName: existedUser.first_name,
      lastName: existedUser.last_name,
      role: existedUser.role,
      email: existedUser.email,
      university: existedUser.university,
      subscription: subscriptionData,
      is_activated: existedUser.is_activated,
    },
  };
};

export const logoutAccount = async (refreshToken) => {
  const token = await removeRefreshToken(refreshToken);
  return token;
};

export const refreshTokenAccount = async (refreshToken) => {
  if (!refreshToken) {
    throw ApiError.unauthorized();
  }

  const userData = validateRefreshToken(refreshToken);
  if (!userData) {
    throw ApiError.unauthorized();
  }

  const tokenFromDb = await findRefreshToken(userData.id, refreshToken);

  if (!userData || !tokenFromDb) {
    throw ApiError.unauthorized();
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userData.id,
    },
  });

  // ТУТ ДОДАТИ ОТРИМАННЯ ПІДПИСКИ КОРИСТУВАЧА, ЯКЩО ВОНА Є ТО ДОДАЙЄМО ДО USERDATA,
  // ЯКЩО НЕМАЄ ТО FALSE - ЦЕ ДЛЯ ТОГО ЩОБ НА КЛІЄНТІ ВІДОБРАЗИТИ ЗНАЧОК ТЕ ЩО ПІДПИСКА Є.

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      status: {
        in: ["ACTIVE"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const subscriptionData = activeSubscription
    ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        currentPeriodEnd: activeSubscription.current_period_end,
        cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      }
    : false;

  const accessToken = generateAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshTokenData = generateRefreshToken({
    id: user.id,
    role: user.role,
  });

  await saveRefreshToken(user.id, refreshTokenData);

  return {
    accessToken,
    refreshToken: refreshTokenData,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      email: user.email,
      university: user.university,
      subscription: subscriptionData,
      is_activated: user.is_activated,
    },
  };
};
