
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {sendError,sendSuccess}from '../config/response.js';

export const forgotPassword = async (req, res) => {
  console.log("Forgot Password API Hit"); 
  try {
    const { email } = req.body;

    const user = await userModel.findByEmail(email);

    if (!user) {
     
      return sendSuccess(res, 200,"", {
        message: "If this email is registered, a reset link has been sent.",
      });
    }

    // const token = crypto.randomBytes(32).toString("hex");
    // const expiry = Date.now() + 15 * 60 * 1000; 

    // await userModel.saveResetToken(email, token, expiry);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const expiry = Date.now() + 10 * 60 * 1000;

      await userModel.saveOTP(email,otp,expiry);

   
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // await transporter.sendMail({
    //   from: `"Smart Parking" <${process.env.GMAIL_USER}>`,
    //   to: email,
    //   subject: "Reset Your Password – Smart Parking",
    //   html: `
    //     <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
    //       <h2 style="color: #111; font-size: 20px; margin-bottom: 8px;">Reset your password</h2>
    //       <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
    //         We received a request to reset your Smart Parking password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
    //       </p>
    //       <a href="${resetLink}"
    //         style="display: inline-block; padding: 12px 28px; background: #185fa5; color: #fff;
    //                text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
    //         Reset Password
    //       </a>
    //       <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; line-height: 1.6;">
    //         If you didn't request a password reset, you can safely ignore this email.<br/>
    //         This link will expire in 15 minutes.
    //       </p>
    //     </div>
    //   `,
    // });
    await transporter.sendMail({
  from: `"Smart Parking" <${process.env.GMAIL_USER}>`,
  to: email,
  subject: "Password Reset OTP",
  html: `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 12px;">
      <h2>Password Reset OTP</h2>

      <p>
        Use the OTP below to reset your password.
      </p>

      <div style="
        font-size:32px;
        font-weight:bold;
        letter-spacing:5px;
        text-align:center;
        margin:20px 0;
      ">
        ${otp}
      </div>

      <p>
        This OTP will expire in 10 minutes.
      </p>
    </div>
  `,
});

    return sendSuccess(res, 200,"", {
      message: "If this email is registered, an OTP has been sent.",
    });

  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Server Error");
  }
};

// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     const user = await userModel.findByResetToken(token);

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid reset token",
//       });
//     }

//     if (Date.now() > Number(user.reset_token_expiry)) {
//       return res.status(400).json({
//         success: false,
//         message: "Reset token has expired",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await userModel.updatePassword(user.id, hashedPassword);

//     return res.status(200).json({
//       success: true,
//       message: "Password reset successfully",
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };
export const resetPassword = async (req, res) => {
  try {

    const {
      email,
      otp,
      password
    } = req.body;

    const user = await userModel.verifyOTP(
      email,
      otp
    );

    if (!user) {
      return sendError(res, 400, "Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await userModel.updatePassword(
      user.id,
      hashedPassword
    );

    await userModel.clearOTP(
      user.id
    );

    return sendSuccess(res, 200,"", {
      message: "Password reset successfully",
    });

  } catch (error) {

    console.error(error);

    return sendError(res, 500, "Internal Server Error");

  }
};
export const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await userModel.verifyOTP(
      email,
      otp
    );

    if (!user) {
      return sendError(res, 400, "Invalid or expired OTP");
    }

    return sendSuccess(res, 200,"", {
      message: "OTP verified successfully",
    });

  } catch (error) {

    console.error(error);

    return sendError(res, 500, "Server Error");

  }
};