import { getAllCategories } from "../service/category.service.js";

export const getAllCategoriesController = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json({ data: categories });
  } catch (error) {
    next(error);
  }
};
