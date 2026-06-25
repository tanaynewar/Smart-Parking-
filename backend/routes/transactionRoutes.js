import express from 'express';
import { deleteTransactionController, getAllTransactionsController, getUserTransactionsController,createTransactionController,updatePaymentStatusController,getWallet,getReceiptController,addMoneyController} from '../controllers/transactionController.js';
import userAuth from '../middleware/userAuth.js';


const transactionRouter = express.Router();
transactionRouter.post("/create",createTransactionController);
transactionRouter.get("/all",getAllTransactionsController);
transactionRouter.get("/user/:userId",getUserTransactionsController);
transactionRouter.delete("/delete/:transactionId",deleteTransactionController);
transactionRouter.put( "/status/:transactionId",updatePaymentStatusController);
transactionRouter.get("/wallet",userAuth, getWallet);
transactionRouter.get("/receipt/:receiptNo",userAuth,getReceiptController);
transactionRouter.post("/wallet/add-money",userAuth,addMoneyController);
export default transactionRouter;       