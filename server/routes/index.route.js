import { Router } from "express";
import authRouter from "./auth.route.js";
import testRouter from "./test.route.js";

const router = new Router();

router.use("/auth", authRouter);
router.use("/tests", testRouter);

export default router;
