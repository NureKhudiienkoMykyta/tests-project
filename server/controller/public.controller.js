import { getPublicStats } from "../service/public.service.js";

export const getStatsController = async (req, res, next) => {
  try {
    const stats = await getPublicStats();
    return res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
};
