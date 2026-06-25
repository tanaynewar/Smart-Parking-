import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../css/resetpass.css";

const ResetPasswordPage = () => {
  const { backendUrl } = useContext(AppContext);

  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        {
          email,
          otp,
          password,
        }
      );

      if (data.success) {
        localStorage.removeItem("resetEmail");

        setMessage(
          "Password reset successfully"
        );

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">

        <h2>Reset Password</h2>

        <form onSubmit={handleResetPassword}>

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        {message && (
          <p className="reset-message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;