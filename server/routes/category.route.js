import { Router } from "express";
import { getAllCategoriesController } from "../controller/category.controller.js";

const router = new Router();

router.get("/", getAllCategoriesController);

export default router;
