import { Router } from "express";
import authRouter from "./auth.route.js";
import testRouter from "./test.route.js";
import attemptRoute from "./attempts.route.js";
import subscriptionsRoute from "./subscriptions.route.js";
import universityRoute from "./university.route.js";
import publicRoute from "./public.route.js";
import userRoute from "./user.route.js";
import categoryRoute from "./category.route.js";

const router = new Router();

router.use("/auth", authRouter);
router.use("/tests", testRouter);
router.use("/attempts", attemptRoute);
router.use("/subscriptions", subscriptionsRoute);
router.use("/university", universityRoute);
router.use("/category", categoryRoute);
router.use("/public", publicRoute);
router.use("/users", userRoute);

export default router;
