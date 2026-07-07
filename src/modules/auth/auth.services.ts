import { userModel } from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { RegisterUserInput } from "./auth.validation.js";

export const userRegister = async({
    name,
    email,
    password,
}:RegisterUserInput)=>{
    const userExist = await userModel.findOne({email});

    if(userExist){
        throw new ApiError(409,"email already exists");
    }
    
    const user = await userModel.create({
        name,
        email,
        password
    })

    return user

}

