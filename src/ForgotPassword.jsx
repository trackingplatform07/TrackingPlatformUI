import React, { useState } from "react";
import "./css/ForgotPassword.css";
import { API_BASE_URL } from "./config";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/Users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setStep(2);
        setMessage("OTP sent to your email");
      } else {
        const errorText = await res.text();
        setError(errorText || "User not found");
      }
    } catch (err) {
      setError("Something went wrong while sending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setMessage("");

    if (!otp) {
      setError("Please enter OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/Users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        },
        body: JSON.stringify({ email, otp })
      });

      if (res.ok) {
        setStep(3);
        setMessage("OTP verified successfully");
      } else {
        const errorText = await res.text();
        setError(errorText || "Invalid OTP");
      }
    } catch (err) {
      setError("Something went wrong while verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    setError("");
    setMessage("");

    if (!newPassword) {
      setError("Please enter new password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/Users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        },
        body: JSON.stringify({ email, newPassword })
      });

      if (res.ok) {
        setMessage("Password reset successful. Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorText = await res.text();
        setError(errorText || "Reset failed");
      }
    } catch (err) {
      setError("Something went wrong while resetting password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-box">
        <h2>Reset Password</h2>
        <p className="sub-text">Recover your account access</p>

        <div className="progress-bar">
          <div
            className={`progress ${
              step === 1 ? "step1" : step === 2 ? "step2" : "step3"
            }`}
          ></div>
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={changePassword} disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/login" className="back-login-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;