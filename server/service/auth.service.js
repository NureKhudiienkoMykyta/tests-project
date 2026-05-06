import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";

const SALT = 10;

export const registration = async (
  email,
  password,
  firstName,
  lastName,
  universityId,
) => {
  const existedUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existedUser) {
    throw new Error(`Користувач з таким email вже існує`);
  }

  const hashPassword = await bcrypt.hash(password, SALT);

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashPassword,
    },
  });
};
