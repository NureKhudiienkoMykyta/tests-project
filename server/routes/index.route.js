import { Router } from "express";
import authRouter from "./auth.route.js";
import testRouter from "./test.route.js";
import attemptRoute from "./attempts.route.js";
import subscriptionsRoute from "./subscriptions.route.js";

const router = new Router();

router.use("/auth", authRouter);
router.use("/tests", testRouter);
router.use("/attempts", attemptRoute);
router.use("/subscriptions", subscriptionsRoute);

export default router;
