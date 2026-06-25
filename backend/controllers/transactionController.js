import { createTransaction,getAllTransactions,getTransactionById,getTransactionByTransactionId,getUserTransactions,updatePaymentStatus,deleteTransaction,getWalletSummary,getReceiptData} from "../models/transactionModel.js";
import { PAYMENT_STATUS } from "../config/constant.js";
import {sendError,sendSuccess}from '../config/response.js';
import userModel from "../models/userModel.js";


export const createTransactionController = async (req, res) => {
    try {

        const {
            userId,
            transactionId,
            transactionAmount,
            transactionType,
            paymentStatus,
            paymentMethod,
            paymentType
        } = req.body;

        if (!userId || !transactionId  || !transactionAmount || !transactionType) {
            return sendError(res, 400, "All fields are required");
        }
        // Check wallet balance before debit transaction
if (transactionType === "debit") {

    const walletData =
        await getWalletSummary(userId);

    const walletBalance =
        Number(walletData.walletBalance || 0);

    const amount =
        Number(transactionAmount);

    if (walletBalance <= 0) {

        return sendError(
            res,
            400,
            "Insufficient wallet balance. Transaction cancelled."
        );
    }

    if (amount > walletBalance) {

        return sendError(
            res,
            400,
            "Insufficient wallet balance. Transaction cancelled."
        );
    }
}
if (transactionType === "credit") {
    return sendError(
        res,
        403,
        "Credit transactions can only be created through wallet recharge"
    );
}

 await userModel.debitMoneyFromWallet(userId,transactionAmount)

        const receiptNo = `RCP-${Date.now()}`;
       
        const result = await createTransaction(
    userId,
    transactionId,
    receiptNo,
    transactionAmount,
    transactionType,
    paymentStatus,
    "wallet",
    null
);

        return sendSuccess(res, 201, "",{
            message: "Transaction created successfully",
            receiptNo,
            result
        });

    } catch (error) {

         console.log("Transaction Error:", error);

    return sendError(res, 500, error.message);
    }
};


export const getAllTransactionsController = async (req, res) => {
    try {

        const {
            search,
            status,
            type,
            sort,
            page,
            limit
        } = req.query;

        console.log({
            search,
            status,
            type,
            sort,
            page,
            limit
        });

        const transactions =
            await getAllTransactions(
                search,
                status,
                type,
                sort,
                page,
                limit
            );

        return sendSuccess(
            res,
            200,
            "",
            transactions 
        );

    } catch (error) {

        console.log(error);

        return sendError(
            res,
            500,
            error.message
        );
    }
};


// ── UPDATED: reads page and limit from query params ──
export const getUserTransactionsController = async (req,res) => {
    try {

        const { userId } = req.params;
        const { page, limit } = req.query;

        const result =
            await getUserTransactions(userId, page, limit);

        return sendSuccess(res, 200,"", result);

    } catch (error) {

        console.log(error);

        return sendError(res, 500, {
            message: "Server Error"
        });
    }
};

export const updatePaymentStatusController = async (req,res) => {
    try {

        const { transactionId } = req.params;
        const { paymentStatus } = req.body;

        const result =
            await updatePaymentStatus(
                transactionId,
                paymentStatus
            );
            if (
    !Object.values(PAYMENT_STATUS)
        .includes(paymentStatus)
) {
    return sendError(res, 400, "Invalid payment status");
}

        return sendSuccess(res, 200,"", {
            message: "Payment status updated",
            result
        });

    } catch (error) {

        console.log(error);

        return sendError(res, 500, {
            success: false,
            message: "Server Error"
        });
    }
};
export const deleteTransactionController = async (
    req,
    res
) => {
    try {

        const { transactionId } = req.params;

        const transaction = await getTransactionByTransactionId(transactionId);

        if (!transaction) {
            return sendError(res, 404, "Transaction not found");
        }
    
        if (transaction.payment_status === PAYMENT_STATUS.SUCCESS) {

            const user = await userModel.findById(transaction.user_id);

            if (!user) {
                return sendError(res, 404, "User not found");
            }

            const currentBalance = Number(user.wallet_balance);
            const amount = Number(transaction.transaction_amount);

            let newBalance;

            if (transaction.transaction_type === "credit") {
                newBalance = currentBalance - amount;
            } else if (transaction.transaction_type === "debit") {
                newBalance = currentBalance + amount;
            }

            if (newBalance < 0) {
                return sendError(res, 400, "Cannot delete: reversal would result in negative wallet balance");
            }

            await userModel.updateWalletBalance(user.id, newBalance);
        }

        const result =
            await deleteTransaction(transactionId);

        return sendSuccess(res, 200,"", {
            message: "Transaction deleted",
            result
        });

    } catch (error) {

        console.log(error);

        return sendError(res, 500, {
            message: "Server Error"
        });
    }
};

export const getWallet = async (
    req,
    res
) => {

    try {

        const userId = req.user.id;

        const walletData =
            await getWalletSummary(
                userId
            );

        return sendSuccess(res, 200, "",{ wallet: walletData });

    } catch (error) {

        console.log(error);

        return sendError(res, 500, error.message);

    }

};
export const getReceiptController = async (
    req,
    res
) => {
    try {

        const { receiptNo } = req.params;

        const receipt =
            await getReceiptData(receiptNo);

        if (!receipt) {
            return sendError(res, 404, "Receipt not found");
        }

        return sendSuccess(res, 200,"", { receipt });

    } catch (error) {

        console.log(error);

        return sendError(res, 500, "Server Error");
    }
};
export const addMoneyController = async (
    req,
    res
) => {

  try {
 
        const { userId, amount, paymentType } = req.body;
 
        if (!userId || !amount || Number(amount) <= 0 || !paymentType) {
            return sendError(res, 400, "userId, amount and paymentType are required");
        }
 
        const validPaymentTypes = ["upi", "cash", "net_banking", "card"];
        if (!validPaymentTypes.includes(paymentType)) {
            return sendError(res, 400, "Invalid payment type");
        }
 
        // Add money to the selected user's wallet
        await userModel.addMoneyToWallet(userId, Number(amount));
 
        const transactionId = Date.now();
        const receiptNo = `RCP-${Date.now()}`;
 
        await createTransaction(
            userId,
            transactionId,
            receiptNo,
            Number(amount),
            "credit",
            PAYMENT_STATUS.SUCCESS,
            "wallet",
            paymentType
        );
 
        return sendSuccess(res, 200, "Money added successfully");
 
    } catch (error) {
        console.log(error);
        return sendError(res, 500, error.message);
    }

};