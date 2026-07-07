import {Router}from "express";
import { validate } from "../../middlewares/validate.js";
import { registerSchema } from "./auth.validation.js";
import { registerController } from "./auth.controller.js";


const authRouter = Router();


authRouter.post("/register",validate(registerSchema),registerController);

export default authRouter;
