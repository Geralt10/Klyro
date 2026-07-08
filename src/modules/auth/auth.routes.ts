import {Router}from "express";
import { validate } from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { getMeController, loginController, logout, refresh, registerController, verifyEmailController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";


const authRouter = Router();


authRouter.post("/register",validate(registerSchema),registerController);

authRouter.post("/login",validate(loginSchema),loginController);

authRouter.post("/refresh",refresh);

authRouter.post("/logout",logout);

authRouter.get("/me",authenticate,getMeController);

authRouter.get("/verify-email",verifyEmailController);

export default authRouter;
