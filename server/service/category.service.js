import { prisma } from "../lib/prisma.js";

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};
