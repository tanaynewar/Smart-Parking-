import Tesseract from "tesseract.js";
import sharp from "sharp";
import userModel from "../models/userModel.js";
import {sendError,sendSuccess}from '../config/response.js';

export const scanNumberPlate = async (req, res) => {

    try {

        const imagePath = req.file.path;
        const processedImage = `uploads/processed-${Date.now()}.jpg`;

        await sharp(imagePath)
            .grayscale()
            .sharpen({ sigma: 10 })
            .normalize()
            .toFile(processedImage);

        const result = await Tesseract.recognize(processedImage, "eng");

        const extractedText = result.data.text.toUpperCase();

       
        const match = extractedText.match(
            /[A-Z]{2}[0-9]{1,2}\s?[A-Z]{1,3}\s?[0-9]{4}/
        );

        
        const plateNumber = match
            ? match[0].replace(/\s/g, "")
            : extractedText.replace(/\s+/g, " ").trim();

        if (!plateNumber) {
            return sendError(res, 400, "Could not read the number plate. Please try a clearer image.");
        }

        
        const owner = await userModel.findByCarNumber(plateNumber);

        if (!owner) {
            return sendError(res, 404, `No registered user found for plate: ${plateNumber}`);
        }

        return sendSuccess(res, 200,"", {
            plateNumber,
            owner: {
                id: owner.id,
                username: owner.username,
                email: owner.email,
                phoneNumber: owner.phoneNumber,
                car_number: owner.car_number,
                status: owner.status,
                role: owner.role,
            }
        });

    } catch (error) {

        console.log(error);

        return sendError(res, 500, "OCR Failed");
    }
};