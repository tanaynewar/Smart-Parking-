import express from "express";
import upload from "../middleware/upload.js";
import { scanQRCode } from "../controllers/qrController.js";

const qrRouter = express.Router();

qrRouter.post(
    "/scan",
    upload.single("image"),
    scanQRCode
);

export default qrRouter;