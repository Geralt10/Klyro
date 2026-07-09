import {Router}from "express";
import { validate } from "../../middlewares/validate.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resendVerificationSchema, resetPasswordSchema } from "./auth.validation.js";
import { changePasswordController, forgotPasswordController, getMeController, loginController, logout, refresh, registerController, resendVerificationController, resetPasswordController, verifyEmailController } from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";


const authRouter = Router();


authRouter.post("/register",validate(registerSchema),registerController);

authRouter.post("/login",validate(loginSchema),loginController);

authRouter.post("/refresh",refresh);

authRouter.post("/logout",logout);

authRouter.get("/me",authenticate,getMeController);

authRouter.get("/verify-email",verifyEmailController);

authRouter.post("/resend-verification",validate(resendVerificationSchema),resendVerificationController);

authRouter.post("/reset-password",validate(resetPasswordSchema),resetPasswordController);

authRouter.patch("/change-password",authenticate,validate(changePasswordSchema),changePasswordController);

export default authRouter;
