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
import orderRouter from "./modules/order/order.routes.js";
import sellerOrderRouter from "./modules/order/sellerOrder.routes.js";
import reviewRouter, {
  productReviewRouter,
} from "./modules/review/review.routes.js";
import { env } from "./config/config.js";
import sellerDashboardRouter from "./modules/seller/seller.dashboard.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/seller",sellerRouter);
app.use("/api/v1/seller/dashboard", sellerDashboardRouter);
app.use("/api/v1/seller/products",sellerProductRouter)
app.use("/api/v1/products",buyerRouter)
app.use("/api/v1/cart",cartRouter)
app.use("/api/v1/admin/products",adminProductRouter)
app.use("/api/v1/addresses",addressRouter)
app.use("/api/v1/payments",paymentRouter)
app.use("/api/v1/orders",orderRouter)
app.use("/api/v1/seller/orders",sellerOrderRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/products",productReviewRouter)


app.use(errorMiddleware);

export default app;
