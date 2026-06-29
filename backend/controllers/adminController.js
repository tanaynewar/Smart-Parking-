import { sendWhatsAppMessage } from '../config/whatsapp.js';
import userModel from '../models/userModel.js';
import {sendError,sendSuccess}from '../config/response.js';

const getAllUsers = async (req, res) => {
    const {
        search = '',
        status = 'all',
        role = 'all',
        sort = 'id-greatest',
        page,
        limit
    } = req.query;

    try {

        const [users, totalUsers, pageNum, lim] =
            await userModel.getUsers(
                search,
                status,
                role,
                sort,
                page,
                limit
            );

        if (!users) {
            return sendSuccess(res, 200,"", {
                success: true,
                message: 'No users were found.'
            });
        }

        return sendSuccess(res, 200,"", {
            success: true,
            message: `${users.length} users found`,
            data: users,
            pagination: {
                totalUsers,
                currentPage: pageNum,
                usersPerPage: lim,
                totalPages: Math.max(
                    Math.ceil(totalUsers / lim),
                    1
                )
            }
        });

    } catch (err) {

        console.log(err);

        return sendError(res, 500, err.message);

    }
};
const approveUser = async (req, res) => {
    try {

        const { id } = req.params;

        await userModel.approveuser(id);

        const user = await userModel.findById(id);

        console.log("Approved User:", user);

        await sendWhatsAppMessage(
            user.phoneNumber,
            ` User Approved

Username: ${user.username}
Email: ${user.email}
Car Number: ${user.car_number}
Phone Number: ${user.phoneNumber}
Status: ${user.status}`
        );

        return sendSuccess(res, 200,"", {
            message: 'user details'
        });

    } catch (error) {

        return sendError(res, 500, error.message);

    }
};
const  rejectUser = async (req,res)=>{
    try {
        const {id} = req.params;
        await userModel.rejectuser(id);
       
        return sendSuccess(res, 200,"", {
            message: 'user rejected'
        });
           
     
        
    } catch (error) {
        return sendError(res, 500, error.message)
        }
    }
    const faceRegister = async (req,res) => {

    const { descriptor } = req.body;

    await userModel.faceRegisterModel(req.user.id, descriptor)

    res.json({
        success: true
    });
}
const verifyFace = async (req, res) => {
    try {
        const { descriptor } = req.body;

        if (!descriptor) {
            return res.status(400).json({
                success: false,
                message: "Face descriptor is required"
            });
        }

        const admin =
            await userModel.getAdminFaceDescriptor(req.user.id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        const storedDescriptor =
            admin.face_descriptor;

        let sum = 0;

        for (
            let i = 0;
            i < descriptor.length;
            i++
        ) {
            sum += Math.pow(
                descriptor[i] -
                    storedDescriptor[i],
                2
            );
        }

        const distance = Math.sqrt(sum);

        const isMatched = distance < 0.6;

        return res.status(200).json({
            success: isMatched,
            distance
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Verification failed"
        });
    }
};

export {getAllUsers,approveUser,rejectUser,faceRegister,verifyFace}