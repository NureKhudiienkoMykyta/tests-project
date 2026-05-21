import { getUserDashboardStats } from "../service/user.service.js";

export const getUserDashboardStatsController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await getUserDashboardStats(userId);

    return res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
};
