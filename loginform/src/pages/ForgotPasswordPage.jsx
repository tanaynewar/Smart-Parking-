import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../css/forgotpass.css";

const ForgotPasswordPage = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${backendUrl}/api/auth/forgot-password`,
        { email }
      );

      if (data.success) {
        localStorage.setItem("resetEmail", email);

        setMessage("OTP sent successfully");

        setTimeout(() => {
          navigate("/reset-password");
        }, 1000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <h2>Forgot Password</h2>

        <form onSubmit={handleSendOTP}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {message && (
          <p className="forgot-message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;