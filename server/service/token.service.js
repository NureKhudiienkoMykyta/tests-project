import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const generateAccessToken = (payload) => {
  const accesToken = jwt.sign(payload, process.env.JWT_ACCES_KEY, {
    expiresIn: "1h",
  });

  return accesToken;
};

export const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    expiresIn: "30d",
  });

  return refreshToken;
};

export const saveRefreshToken = async (userId, refreshToken) => {
  const existingToken = await prisma.refreshToken.findFirst({
    where: {
      user_id: userId,
    },
  });

  if (existingToken) {
    await prisma.refreshToken.update({
      where: {
        id: existingToken.id,
      },
      data: {
        refresh_token: refreshToken,
      },
    });
  } else {
    await prisma.refreshToken.create({
      data: {
        user_id: userId,
        refresh_token: refreshToken,
      },
    });
  }
};

export const removeRefreshToken = async (refreshToken) => {
  const token = await prisma.refreshToken.deleteMany({
    where: {
      refresh_token: refreshToken,
    },
  });

  return token;
};

export const findRefreshToken = async (userId, refreshToken) => {
  const token = await prisma.refreshToken.findFirst({
    where: {
      user_id: userId,
      refresh_token: refreshToken,
    },
  });

  return token;
};

export const validateRefreshToken = (refreshToken) => {
  try {
    const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    return userData;
  } catch (error) {
    return null;
  }
};

export const validateAccessToken = (accessToken) => {
  try {
    const userData = jwt.verify(accessToken, process.env.JWT_ACCES_KEY);
    return userData;
  } catch (error) {
    return null;
  }
};
