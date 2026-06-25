import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import { text } from 'express';
import transporter from '../config/nodemailer.js';
import QRCode from "qrcode";
import {sendError,sendSuccess}from '../config/response.js';

export const register = async (req,res)=>{
    const {car_number,username,email,password,phoneNumber,vehicle_type} = req.body;

    if(!car_number||!username|| !email || !password || !phoneNumber || !vehicle_type){
        return sendError(res, 400, "missing Details");
    }
    try{
        const existingUser = await userModel.findByEmail(email)
        if(existingUser){
            return sendError(res, 400, "user already exists");
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const user_id = await userModel.create(car_number,username,email,hashedPassword,phoneNumber,vehicle_type);
        
        const qrData = car_number;

        const qrCode = await QRCode.toDataURL(qrData)

        await userModel.saveQRCode(
    user_id,
    qrCode
);
        //  const token = jwt.sign({id: user_id}, process.env.JWT_SECRET,{ expiresIn: '7d'});

        //  res.cookie('token',token,{
        //     httpOnly:true,
        //      secure: process.env.NODE_ENV === 'production',
        //     sameSite: process.env.NODE_ENV === 'production' ?
        //     'none' : 'strict',
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        //  });
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Welcome to my Parking Lot ,Hope You Have a Great Experience",
            text: `Welcome To The Parking Lot Hope You Have A Great Experience today . Your Account Has Been Created With email id: ${email}`,
        }
        await transporter.sendMail(mailOptions);




        return sendSuccess(res, 200,"", { message: "User registered successfully" });


    }catch (error){
        console.error(error);
        return sendError(res, 500, error.message);
    }

}
export const login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return sendError(res, 400, 'Email and password are required')
    }
    try{
        const user = await userModel.findByEmail(email);
        if(!user){
            return sendError(res, 400, 'invalid email')
        }
        if (user.status!=='approved'){
            return sendError(res, 400, 'user not approved')
        }
        const isMatch = await bcrypt.compare(password,user.password);


        if(!isMatch){
            return sendError(res, 400, 'invalid password')

        }
         const token = jwt.sign({id: user.id,role:user.role}, process.env.JWT_SECRET,{ expiresIn: '7d'});

        res.cookie('token',token,{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ?
            'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000

        });
        return sendSuccess(res, 200,"", { message: "Login successful" });

    }catch (error) {
        return sendError(res, 500, error.message);
    }
}
export const logout = async (req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ?
            'none' : 'strict',
        })
        return sendSuccess(res, 200,"", { message: "logged Out" });
    } catch (error) {
        return sendError(res, 500, error.message);
    }
    
}
export const isAuthenticated = async(req,res) => {
    try {
        return sendSuccess(res, 200,"", { success: true });
    } catch (error) {
         return sendError(res, 500, { success: false, message: error });
    }
}
export const getProfileController = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;

        const user =
            await userModel.getUserById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const updateProfileController = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;

        const {
            username,
            email,
            phone,
            car_number,
            vehicle_type

        } = req.body;

        if (
            !username ||
            !email ||
            !phone ||
            !car_number ||
            !vehicle_type
        ) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        const user =
            await userModel.getUserById(userId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        await userModel.updateProfile(
            userId,
            username,
            email,
            phone,
            car_number,
            vehicle_type 
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};