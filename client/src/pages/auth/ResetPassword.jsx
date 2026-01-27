import React, { useState } from "react";
import HeaderLogo from "../../components/utils/HeaderLogo";
import AuthFooter from "../../components/utils/AuthFooter";
import { FiLock } from "react-icons/fi";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useResetPasswordMutation } from "../../redux/services/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Spinner } from "../../components/ui/Loading";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const email = localStorage.getItem("email") || "";

  // Redirect to forgot password if no email is found (only if not in the middle of resetting)
  React.useEffect(() => {
    if (!email && !isResetting) {
      toast.error(
        "Session expired. Please start the password reset process again."
      );
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000); // Delay to allow toast to be seen
    }
  }, [email, navigate, isResetting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email) {
      return toast.error(
        "Email is required. Please start the password reset process again."
      );
    }

    if (!password) {
      return toast.error("Password is required");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setIsResetting(true); // Prevent useEffect from triggering during reset
      await resetPassword({ email, password }).unwrap();
      toast.success("Password reset successfully");

      // Navigate first, then remove email (to prevent useEffect trigger)
      navigate("/reset-success");
      // Remove email after successful navigation
      setTimeout(() => localStorage.removeItem("email"), 100);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to reset password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      console.error("Reset password error", err);
    } finally {
      setIsResetting(false); // Reset the flag
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
            {/* Lock Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <FiLock className="text-4xl text-gray-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
              Reset Password
            </h2>
            <p className="text-gray-500 text-center mb-2">
              Enter your new password
            </p>

            {/* Email Display */}
            {email && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-600 text-center">
                  Account:{" "}
                  <span className="font-medium text-gray-800">{email}</span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(""); // Clear error on type
                    }}
                    className="w-full py-2 px-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(""); // Clear error on type
                    }}
                    className="w-full py-2 px-3 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
              </div>

              {/* Error Message Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Reset Password Button */}
              <button
                type="submit"
                className="w-full h-12 bg-primary-500 text-white font-semibold rounded hover:opacity-90 transition-colors mb-4"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              {/* Back to Login Link */}
              <p className="text-center text-gray-600 text-sm">
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

export default ResetPassword;
