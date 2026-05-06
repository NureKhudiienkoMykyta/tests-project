import { Router } from "express";
import authRouter from "./auth.route.js";

const router = new Router();

router.use("/auth", authRouter);

export default router;
