import React, { useState } from "react";
import HeaderLogo from "../../components/utils/HeaderLogo";
import AuthFooter from "../../components/utils/AuthFooter";
import { FiMail } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";
import {
  useVerifyOTPMutation,
  useResendOTPMutation,
} from "../../redux/services/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Spinner from "../../components/Spinner";

const VerifyOTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();
  const navigate = useNavigate();

  const email = localStorage.getItem("email") || "";

  const handleOtpChange = (index, value) => {
    // Handle paste event
    if (value.length > 1) {
      // If pasted content, distribute digits across inputs
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);
      setError("");

      // Focus the next empty input or the last filled one
      const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-${focusIndex}`);
        nextInput?.focus();
      }, 0);
      return;
    }

    // Handle single digit input
    if (value.length > 1) return; // Only allow single digit for typing

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // If current input has value, clear it
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // If current input is empty, go to previous input
        newOtp[index - 1] = "";
        setOtp(newOtp);
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      return toast.error("Please enter all 6 digits");
    }

    try {
      await verifyOTP({ email, otp: otpString }).unwrap();
      toast.success("OTP verified successfully");
      // Don't remove email yet - keep it for reset password
      navigate("/reset-password");
    } catch (err) {
      const errorMessage =
        err?.data?.message || err?.message || "Invalid OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      console.error("OTP verification error", err);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP({ email }).unwrap();
      toast.success("OTP resent successfully");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      // Focus first input
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Please try again.";
      toast.error(errorMessage, { duration: 5000 });
      console.error("Resend OTP error", err);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Orange Header */}
        <HeaderLogo />

        {/* Main Content - White Panel */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
            {/* Mail Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <FiMail className="text-4xl text-gray-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Enter the 6-digit code sent to {email}
            </p>

            <form onSubmit={handleSubmit} className="w-full">
              {/* OTP Input Fields */}
              <div className="mb-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData.getData("text");
                        handleOtpChange(index, pastedData);
                      }}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Verify OTP Button */}
              <button
                type="submit"
                className="w-full h-12 bg-primary-500 text-white font-semibold rounded hover:opacity-90 transition-colors mb-4"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-primary-500 hover:underline font-medium text-sm disabled:opacity-50"
                  disabled={isResending}
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </div>

              {/* Back to Login Link */}
              <p className="text-center text-gray-600 text-sm mt-4">
                <Link
                  to={"/login"}
                  className="text-primary-500 hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOTP;
