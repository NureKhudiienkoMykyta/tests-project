import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUserDashboardStatsController } from "../controller/user.controller.js";

const router = new Router();

router.get("/dashboard-stats", authMiddleware, getUserDashboardStatsController);

export default router;
