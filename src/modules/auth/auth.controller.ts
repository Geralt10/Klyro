import { Request,Response } from "express";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { userRegister } from "./auth.services.js";

export const registerController = asyncHandler(
    async(req:Request,res:Response)=>{
        const result = await userRegister(req.body);

        return res.status(201).json(
            new ApiResponse(
                201,
                "user registered successfully",
                result
            )
        )
    }
)

