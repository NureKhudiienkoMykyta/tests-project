import { Router } from "express";
import { getStatsController } from "../controller/public.controller.js";

const router = new Router();

router.get("/stats", getStatsController);

export default router;
