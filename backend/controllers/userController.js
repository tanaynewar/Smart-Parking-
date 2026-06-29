
import userModel from "../models/userModel.js";
import {sendError,sendSuccess}from '../config/response.js';

export const getUserData = async (req,res)=>{

    try {
        const {id} = req.user;
        const user = await userModel.findById(id);

        if(!user){
            return sendError(res, 404, 'user not found ');
        }
        sendSuccess(res, 200,"", {
            userData: {
                id: user.id,
                name: user.username,
                role: user.role,
                phoneNumber: user.phoneNumber,
                email: user.email,
                car_number: user.car_number,
                status: user.status,
        qr_code: user.qr_code,
        vehicle_type: user.vehicle_type,
        face_registered: user.face_registered
            }
        })
        
    } catch (error) {
        sendError(res, 500, error.message);
    }
}
export const getAllUsersController = async (req,res) => {

    try {

        const users =
            await userModel.getAllUsers();

        return sendSuccess(res, 200,"", { users });

    } catch(error) {
        console.log(error);

        return sendError(res, 500, {
            message: "Server Error"
        });
    }
};