import { Router } from "express";
import { getAllUniversitiesController } from "../controller/university.controller.js";

const router = new Router();

router.get("/", getAllUniversitiesController);

export default router;
