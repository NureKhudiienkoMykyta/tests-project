import { Router } from "express";
import authRouter from "./auth.route.js";
import testRouter from "./test.route.js";
import attemptRoute from "./attempts.route.js"

const router = new Router();

router.use("/auth", authRouter);
router.use("/tests", testRouter);
router.use("/attempts", attemptRoute);

export default router;
