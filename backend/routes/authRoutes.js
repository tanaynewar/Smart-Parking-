import express from'express'
import { login, logout, register,isAuthenticated,getProfileController,updateProfileController } from '../controllers/authcontroller.js';
import {forgotPassword,resetPassword,verifyOTP } from '../controllers/forgotpasscontroller.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();
authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.get('/is-auth',userAuth,isAuthenticated);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/profile",userAuth,getProfileController);
authRouter.put("/profile",userAuth,updateProfileController);
export default authRouter;