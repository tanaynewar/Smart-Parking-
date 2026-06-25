import express from "express";
import {getAllFeesController,updateFeeController} from "../controllers/parkingFeeController.js";



const parkingFeeRouter = express.Router();

parkingFeeRouter.get("/",getAllFeesController);
parkingFeeRouter.put("/",updateFeeController);
export default parkingFeeRouter;