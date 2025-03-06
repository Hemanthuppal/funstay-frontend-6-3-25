


import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import logo from '../../Images/logofun.png';
import glogo from '../../Images/Google_Icon.webp';

const Login = () => {
    return (
        <div className="main-container">
            <div className="row w-100 align-items-center justify-content-center">
                {/* Desktop Logo Section (Hidden in Mobile & Tablet) */}
                <div className="col-lg-6 text-center logo-section d-none d-lg-flex">
                    <img src={logo} alt="FUNSTAY Logo" className="logo-img" />
                </div>

                {/* Login Form */}
                <div className="col-lg-4 col-md-6">
                    <div className="card login-card">
                        {/* Mobile & Tablet Logo (Hidden in Desktop) */}
                        <div className="text-center mobile-logo d-lg-none">
                            <img src={logo} alt="FUNSTAY Logo" className="logo-img" />
                        </div>

                        <h2 className="text-center mb-3 heading">WELCOME BACK</h2>
                        <p className="text-center mb-3 sub-text">Welcome back! Please enter your details.</p>

                        <form>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control inputs" placeholder="Enter your email" />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-control inputs" placeholder="********" />
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <input type="checkbox" id="rememberMe" />
                                    <label className="ms-2" htmlFor="rememberMe">Remember me</label>
                                </div>
                                <a href="#" className="forgot-password">Forgot password?</a>
                            </div>

                            <button type="submit" className="btn btn-danger w-100 mb-3 inputs">Login</button>

                            <button className="btn btn-light w-100 d-flex align-items-center justify-content-center mb-3 google-btn">
                                <img src={glogo} alt="Google Logo" className="google-logo me-2" />
                                Log in with Google
                            </button>

                            <p className="text-center sub-text-signup">
                                Don’t have an account? <a href="#" className="signup-link">Sign up for free</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
