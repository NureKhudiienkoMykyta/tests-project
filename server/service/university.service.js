import { prisma } from "../lib/prisma.js";

export const getAllUniversities = async () => {
  const universities = await prisma.university.findMany();
  return universities;
};
