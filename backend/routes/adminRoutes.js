import express from 'express';
import {getAllUsers,approveUser,rejectUser,faceRegister,verifyFace} from '../controllers/adminController.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import userAuth from '../middleware/userAuth.js';


const adminRouter = express.Router();

adminRouter.get('/users',userAuth,roleMiddleware,getAllUsers);
adminRouter.put('/approve/:id',userAuth,roleMiddleware,approveUser);
adminRouter.put('/reject/:id',userAuth,roleMiddleware,rejectUser);
adminRouter.post('/register-face',userAuth,roleMiddleware,faceRegister);
adminRouter.post("/verify-face",userAuth,roleMiddleware,verifyFace);

export default adminRouter;
