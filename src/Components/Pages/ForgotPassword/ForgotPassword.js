import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa"; 
import "./ForgotPassword.css";
import { baseURL } from "../../Apiservices/Api";

const Forgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/send-otp`, { email });
      setOtpSent(true);
      setMessage(response.data.message);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP.");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };


  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!otp || !password || !confirmPassword) {
      setMessage("All fields are required.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseURL}/update-password`, {
        email,
        otp,
        newpassword: password,
        confirmpassword: confirmPassword,
      });

      setMessage(response.data.message);
      setTimeout(() => setMessage(""), 3000);
      navigate("/"); 
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update password.");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="forgot-container">
      <div className="forgot-image-side">
        <div className="forgot-logo-container">
          <img
            className="forgot-logo"
            src="https://media.licdn.com/dms/image/v2/C560BAQH-6AaMW4Bayg/company-logo_200_200/company-logo_200_200/0/1630671617216/funstay_experientialtravel_logo?e=2147483647&v=beta&t=LZ5v7JeyUIx3ruq9SQs2mC6givIiu1wPpoAZe3m3-9w"
            alt="Funstay Logo"
          />
        </div>
      </div>
      <div className="forgot-reset-side">
        <h1>Welcome Back</h1>
        {message && <p className="forgot-message">{message}</p>} 

        <form onSubmit={handleUpdatePassword}>
          <div className="forgot-input-group">
            <label>Email</label>
            <div className="email-input-wrapper">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
              />
              <button type="button" className="send-otp-btn" onClick={handleSendOtp} disabled={loading || otpSent}>
                <FaArrowRight />
              </button>
            </div>
          </div>

          {otpSent && (
            <>
              <div className="forgot-input-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="forgot-input-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="forgot-input-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <button className="forgot-btn" type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Forgot;