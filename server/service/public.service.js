import { prisma } from "../lib/prisma.js";

export const getPublicStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalTest = await prisma.test.count();
  const totalAttempts = await prisma.testAttempt.count();

  return {
    totalUsers,
    totalTest,
    totalAttempts,
  };
};
