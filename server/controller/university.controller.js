import { getAllUniversities } from "../service/university.service.js";

export const getAllUniversitiesController = async (req, res, next) => {
  try {
    const universities = await getAllUniversities();

    return res.status(200).json({ data: universities });
  } catch (error) {
    next(error);
  }
};
