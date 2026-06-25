import express from "express";
import upload from "../middleware/upload.js";
import { scanNumberPlate } from "../controllers/ocrController.js";

const router = express.Router();

router.post( "/scan", upload.single("image"),scanNumberPlate);

export default router;