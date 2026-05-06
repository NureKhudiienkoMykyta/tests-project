import { Router } from "express";
import {
  login,
  logout,
  refresh,
  registration,
  verify,
} from "../controller/auth.controller.js";

const router = new Router();

router.post("/registration", registration);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refresh);
router.get("/verify/:token", verify);

export default router;
