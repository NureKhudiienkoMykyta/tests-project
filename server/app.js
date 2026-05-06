import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.route.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(errorMiddleware);

// ROUTES
app.use("/api", router);

export default app;
