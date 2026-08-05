import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import sellerRouter from "./modules/seller/seller.routes.js";
import sellerProductRouter from "./modules/products/routes/sellerProduct.routes.js";
import buyerRouter from "./modules/products/routes/buyerProduct.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import adminProductRouter from "./modules/products/routes/adminProduct.routes.js";
import addressRouter from "./modules/address/address.routes.js";
import paymentRouter from "./modules/payment/payment.routes.js";

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
app.use("/api/v1/seller/products",sellerProductRouter)
app.use("/api/v1/products",buyerRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/admin/products",adminProductRouter)
app.use("/api/v1/addresses",addressRouter)
app.use("/api/v1/payments",paymentRouter)


app.use(errorMiddleware);

export default app;
