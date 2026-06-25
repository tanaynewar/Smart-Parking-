import { Jimp } from "jimp";
import QRReader from "qrcode-reader";
import userModel from '../models/userModel.js';
import { sendError, sendSuccess } from '../config/response.js';
import parkingFeeModel from "../models/parkingFeeModel.js";
import { createTransaction } from "../models/transactionModel.js";
import { PAYMENT_STATUS } from "../config/constant.js";

export const scanQRCode = async (req, res) => {

    try {

        const image = await Jimp.read(
            req.file.path
        );

        const qr = new QRReader();

        qr.callback = async (err, value) => {

            if (err) {
                return sendError(res, 400, "QR not detected");
            }

            const qrData = value.result;

           
            const owner = await userModel.findByCarNumber(qrData);

            if (!owner) {
                return sendError(res, 404, "User not found");
            }

            try {

              
                const user = await userModel.findById(owner.id);

                if (!user) {
                    return sendError(res, 404, "User not found");
                }

                
                const fee = await parkingFeeModel.getFeeByVehicleType(user.vehicle_type);
                console.log("Parking Fee:", fee);
                console.log("User:", user);

                if (!fee) {
                    return sendError(res, 404, "Parking fee not configured for this vehicle type");
                }

                const debitAmount = Number(fee.amount);
                const currentBalance = Number(user.wallet_balance);

                const transactionId = Math.floor(Math.random() * 900000000) + 100000000;
                const receiptNo = `RCPT-${Date.now()}`;

                
                if (currentBalance < debitAmount) {

                    await createTransaction(
                        user.id,
                        transactionId,
                        receiptNo,
                        debitAmount,
                        "debit",
                        PAYMENT_STATUS.FAILED,
                        "wallet"
                    );

                    return sendError(res, 400, "Insufficient wallet balance for auto-debit", {
                        owner: user
                    });
                }

                
                const newBalance = currentBalance - debitAmount;
                await userModel.updateWalletBalance(user.id, newBalance);

               
                await createTransaction(
                    user.id,
                    transactionId,
                    receiptNo,
                    debitAmount,
                    "debit",
                    PAYMENT_STATUS.SUCCESS,
                    "wallet"
                );

                
                return sendSuccess(res, 200, "Auto-debit successful", {
                    owner: { ...user, wallet_balance: newBalance },
                    transaction: {
                        transactionId,
                        receiptNo,
                        transactionAmount: debitAmount,
                        transactionType: "debit",
                        paymentStatus: PAYMENT_STATUS.SUCCESS,
                        paymentMethod: "wallet"
                    }
                });

            } catch (innerError) {
                console.log(innerError);
                return sendError(res, 500, innerError.message);
            }

        };

        qr.decode(image.bitmap);

    } catch (error) {

        console.log(error);

        return sendError(res, 500, error.message);

    }

};