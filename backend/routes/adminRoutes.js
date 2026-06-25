import express from 'express';
import {getAllUsers,approveUser,rejectUser} from '../controllers/adminController.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import userAuth from '../middleware/userAuth.js';


const adminRouter = express.Router();

adminRouter.get('/users',userAuth,roleMiddleware,getAllUsers);
adminRouter.put('/approve/:id',userAuth,roleMiddleware,approveUser);
adminRouter.put('/reject/:id',userAuth,roleMiddleware,rejectUser);
export default adminRouter;
