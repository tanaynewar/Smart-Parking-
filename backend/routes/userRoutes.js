import { Router } from "express";
import {getUserData,getAllUsersController} from '../controllers/userController.js'
import userAuth from "../middleware/userAuth.js";
const userRouter = Router()
userRouter.get('/data', userAuth,getUserData)
userRouter.get("/all-users",getAllUsersController);
export default userRouter