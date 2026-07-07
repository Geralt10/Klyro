import {Router}from "express";
import { validate } from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { loginController, registerController } from "./auth.controller.js";


const authRouter = Router();


authRouter.post("/register",validate(registerSchema),registerController);

authRouter.post("/login",validate(loginSchema),loginController);

export default authRouter;
