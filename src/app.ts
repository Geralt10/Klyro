import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import sellerRouter from "./modules/seller/seller.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/seller",sellerRouter);


app.use(errorMiddleware);

export default app;