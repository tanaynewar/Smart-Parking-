import multer from "multer";
import {sendError,sendSuccess}from '../config/response.js';

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(
            null,
            Date.now() + "-" + file.originalname
        );
    }
});

const upload = multer({
    storage
});

export default upload;