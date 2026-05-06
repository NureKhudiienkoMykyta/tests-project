import { Router } from "express";
import {
  login,
  logout,
  refresh,
  register,
  verify,
} from "../controller/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = new Router();

router.post("/registration", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/refresh", refresh);
router.get("/verify/:token", verify);

export default router;
