import express from "express";
import cors from "cors";
import "dotenv/config";
import morgan from 'morgan'
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import transactionRouter from "./routes/transactionRoutes.js";
import ocrRouter from "./routes/ocrRoutes.js";
import qrRouter from "./routes/qrRoute.js";
import parkingFeeRouter from "./routes/parkingFeeRoutes.js";

const app = express();
const port = process.env.PORT || 4000

app.use(morgan('dev'))
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:process.env.FRONTEND_URL,credentials:true}))
app.get('/',(req,res)=> res.send("API working"));
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/admin',adminRouter)
app.use('/api/transactions', transactionRouter)
app.use('/api/ocr', ocrRouter)
app.use("/api/qr", qrRouter);
app.use("/api/fees",parkingFeeRouter);

app.listen(port,"0.0.0.0",()=> console.log(`Server started on PORT:${port}`));
