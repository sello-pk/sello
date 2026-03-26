import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUpload } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useRegisterUserMutation } from "../../redux/services/api";
import { Spinner } from "../../components/ui/Loading";
import SEO from "../../components/common/SEO";
import DealerForm from "../../components/features/profile/DealerForm";
import {
  DEALER_DOC_MAX_BYTES,
  buildDealerPayloadFromForm,
  createDealerFormState,
  getFirstDealerErrorMessage,
  getSafeDealerErrorMessage,
  validateDealerStepOne,
} from "../../components/features/profile/dealerFormUtils";

const DEALER_SIGNUP_FALLBACK_MESSAGE =
  "We could not complete dealer registration right now. Please try again.";

const DealerSignup = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(createDealerFormState());
  const [errors, setErrors] = useState({});
  const [dealerFiles, setDealerFiles] = useState({
    avatar: null,
    businessLicense: null,
  });
  const [requestAuctionBidder, setRequestAuctionBidder] = useState(false);
  const [registerUser] = useRegisterUserMutation();
  const navigate = useNavigate();

  const validateCurrentStep = () => {
    const nextErrors = validateDealerStepOne({
      formData,
      requireAccountFields: true,
      requirePassword: true,
      requireLicenseFile: true,
      licenseFile: dealerFiles.businessLicense,
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") {
      setDealerFiles((prev) => ({ ...prev, avatar: file }));
      return;
    }

    if (file.size > DEALER_DOC_MAX_BYTES) {
      setErrors((prev) => ({
        ...prev,
        businessLicenseFile: "File size must be less than 10MB",
      }));
      return;
    }

    setDealerFiles((prev) => ({ ...prev, businessLicense: file }));
    setErrors((prev) => ({ ...prev, businessLicenseFile: "" }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const nextErrors = validateDealerStepOne({
        formData,
        requireAccountFields: true,
        requirePassword: true,
        requireLicenseFile: true,
        licenseFile: dealerFiles.businessLicense,
      });
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        toast.error(
          getFirstDealerErrorMessage(nextErrors) ||
            "Please complete all required fields to continue",
        );
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const submitForm = async (avatarFile) => {
    const registrationData = new FormData();
    const dealerPayload = buildDealerPayloadFromForm(formData);

    registrationData.append("name", formData.ownerFullName.trim());
    registrationData.append("email", formData.email.trim());
    registrationData.append("password", formData.password);
    registrationData.append("role", "dealer");
    registrationData.append("avatar", avatarFile);
    registrationData.append("businessLicense", dealerFiles.businessLicense);

    Object.entries(dealerPayload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          registrationData.append(key, JSON.stringify(value));
        }
        return;
      }
      if (value !== "") {
        registrationData.append(key, value);
      }
    });

    // Keep legacy aliases stable for the current backend register contract.
    registrationData.append("dealerName", dealerPayload.businessName);
    registrationData.append("mobileNumber", dealerPayload.businessPhone);
    registrationData.append("cnicFile", dealerFiles.businessLicense);

    const requestTypes = ["dealer", "auctionDealer"];
    if (requestAuctionBidder) requestTypes.push("auctionBidder");
    registrationData.append(
      "auctionRequestTypes",
      JSON.stringify(requestTypes),
    );

    try {
      setLoading(true);
      await registerUser(registrationData).unwrap();
      toast.success(
        "Dealer registration submitted successfully! Pending admin verification.",
      );
      navigate("/login");
    } catch (err) {
      toast.error(getSafeDealerErrorMessage(err, DEALER_SIGNUP_FALLBACK_MESSAGE));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNext();
      return;
    }

    if (!validateCurrentStep()) {
      toast.error(
        getFirstDealerErrorMessage(
          validateDealerStepOne({
            formData,
            requireAccountFields: true,
            requirePassword: true,
            requireLicenseFile: true,
            licenseFile: dealerFiles.businessLicense,
          }),
        ) || "Please complete all required fields to continue",
      );
      return;
    }

    if (dealerFiles.avatar) {
      await submitForm(dealerFiles.avatar);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFA602";
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formData.businessName.charAt(0).toUpperCase(), 100, 100);
    canvas.toBlob(async (blob) => {
      const generatedAvatar = new File([blob], "avatar.png", {
        type: "image/png",
      });
      await submitForm(generatedAvatar);
    }, "image/png");
  };

  return (
    <>
      <SEO
        title="Dealer Signup | Sello.pk"
        description="Register as a car dealer on Sello.pk. Start selling cars to thousands of buyers across Pakistan with our trusted platform."
        canonical="https://sello.pk/dealer-signup"
      />
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Dealer Registration
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep} of 3
              </p>
            </div>
            {onBack ? (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </button>
            ) : null}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 ? (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? "bg-primary-500" : "bg-gray-300"
                      }`}
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Basic Info</span>
              <span>Business Details</span>
              <span>Review & Submit</span>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              encType="multipart/form-data"
            >
              {currentStep === 1 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "avatar")}
                      className="hidden"
                      id="dealer-signup-avatar-upload"
                    />
                    <label
                      htmlFor="dealer-signup-avatar-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <FaUpload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-600">
                        {dealerFiles.avatar
                          ? dealerFiles.avatar.name
                          : "Click to upload profile image (optional)"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPG, PNG, WebP
                      </span>
                    </label>
                  </div>
                </div>
              ) : null}

              <DealerForm
                mode="signup"
                step={currentStep}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
                files={dealerFiles}
                onFileChange={handleFileChange}
                requestAuctionBidder={requestAuctionBidder}
                setRequestAuctionBidder={setRequestAuctionBidder}
              />

              {currentStep === 3 ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      I accept the{" "}
                      <Link
                        to="/privacy-policy"
                        className="text-primary-500 hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/terms-conditon"
                        className="text-primary-500 hover:underline font-medium"
                      >
                        Terms & Conditions
                      </Link>
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner fullScreen={false} />
                      Submitting...
                    </span>
                  ) : currentStep < 3 ? (
                    "Next"
                  ) : (
                    "Register Now"
                  )}
                </button>
              </div>

              <p className="text-center text-gray-600 text-sm mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-500 hover:underline font-medium"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default DealerSignup;
