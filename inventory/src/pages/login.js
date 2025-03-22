import React, { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router for navigation

const Login = () => {
  const navigate = useNavigate(); // Initialize navigate function from React Router
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Styles
  const containerStyle = {
    display: "flex",
    height: "100vh",
    width: "100%",
    fontFamily: "Arial, sans-serif",
    position: "relative",
  };
  const leftStyle = {
    backgroundColor: "#1f1f1f",
    color: "#fff",
    width: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    borderRadius: "0 35px 35px 0",
  };
  const logoStyle = {
    backgroundColor: "#fff",
    color: "#000",
    padding: "15px 60px",
    borderRadius: "50px",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
  };
  const taglineStyle = {
    color: "#ccc",
    fontSize: "14px",
  };
  const rightStyle = {
    backgroundColor: "#fff",
    width: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    padding: "50px",
  };
  const headingStyle = {
    fontSize: "24px",
    color: "#1f1f1f",
    marginBottom: "5px",
  };
  const subHeadingStyle = {
    color: "#777",
    marginBottom: "30px",
  };
  const formStyle = {
    width: "100%",
    maxWidth: "300px",
  };
  const formGroupStyle = {
    marginBottom: "20px",
  };
  const labelStyle = {
    display: "block",
    color: "#555",
    marginBottom: "5px",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    outline: "none",
  };
  const optionsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    fontSize: "14px",
  };
  const linkStyle = {
    color: "#4b3ca8",
    textDecoration: "none",
  };
  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#6c63ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  };
  const otpModalStyle = {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  };
  const otpBoxStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.25)",
  };
  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   if (!email || !password) {
  //     alert("Please enter both email and password.");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post("http://localhost:5000/api/send-otp", {
  //       email,
  //       password,
  //     });

  //     if (response.data.success) {
  //       setShowOtpModal(true);
  //       alert("OTP sent to your email.");
  //     } else {
  //       alert(response.data.message || "Failed to send OTP.");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     alert("Error sending OTP.");
  //   }
  // };
  
    useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!email) {
      alert("Please enter your email.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/send-otp", {
        email,
      });
  
      if (response.data.success) {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
  
        setShowOtpModal(true);
        alert("OTP sent to your email.");
      } else {
        alert(response.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending OTP.");
    }
  };  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/verify-otp", {
        email,
        otp,
      });
      if (response.data.success) {
        alert("Login successful!");
        setShowOtpModal(false);
        // Handle Remember Me here
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        window.location.href = "/dashboard";
      } else {
        alert(response.data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error(error);
      alert("Error verifying OTP.");
    }
  };
  return (
    <div style={containerStyle}>
      {showOtpModal && (
        <div style={otpModalStyle}>
          <div style={otpBoxStyle}>
            <h2>Enter OTP</h2>
            <p style={{ marginBottom: "20px", color: "#777" }}>
              We have sent an OTP to your email.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              />
              <button type="submit" style={buttonStyle}>
                Verify OTP
              </button>
            </form>
          </div>
        </div>
      )}
      <div style={leftStyle}>
        <div style={{ textAlign: "center" }}>
          <div style={logoStyle}>Arinya</div>
          <p style={taglineStyle}>Embrace the change with real experience</p>
        </div>
      </div>
      <div style={rightStyle}>
        <h2 style={headingStyle}>Welcome back,</h2>
        <p style={subHeadingStyle}>Please enter your details.</p>
        <form style={formStyle} onSubmit={handleLogin}>
          <div style={formGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* <div style={formGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div> */}

          <div style={optionsStyle}>
            <div>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" style={{ marginLeft: "5px" }}>
                Remember me
              </label>
            </div>
            <a href="/" style={linkStyle}>
              Forgot Password?
            </a>
          </div>
          <button type="submit" style={buttonStyle}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;