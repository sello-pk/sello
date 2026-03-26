import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";
import {
  useGetMeQuery,
  useGetMyAuctionAccessStatusQuery,
  useRequestAuctionAccessMutation,
} from "../../../redux/services/api";
import { Spinner } from "../../ui/Loading";
import DealerForm from "./DealerForm";
import {
  DEALER_DOC_MAX_BYTES,
  buildDealerPayloadFromForm,
  createDealerFormState,
  getFirstDealerErrorMessage,
  validateDealerStepOne,
} from "./dealerFormUtils";

const DEALER_REQUEST_FALLBACK_MESSAGE =
  "We could not submit your dealer request right now. Please review your details and try again.";

const DealerRequestForm = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(createDealerFormState());
  const [dealerFiles, setDealerFiles] = useState({
    businessLicense: null,
  });
  const [errors, setErrors] = useState({});
  const [requestDealerAccess, setRequestDealerAccess] = useState(true);
  const [requestAuctionBidder, setRequestAuctionBidder] = useState(false);
  const [requestAuctionAccess, { isLoading }] =
    useRequestAuctionAccessMutation();
  const { data: user, refetch } = useGetMeQuery();
  const { data: auctionAccessStatus } = useGetMyAuctionAccessStatusQuery(
    undefined,
    { skip: !isOpen },
  );

  const resetForm = () => {
    setFormData(createDealerFormState());
    setDealerFiles({ businessLicense: null });
    setErrors({});
    setCurrentStep(1);
    setRequestDealerAccess(true);
    setRequestAuctionBidder(false);
  };

  const validateCurrentStep = () => {
    const nextErrors = validateDealerStepOne({
      formData,
      requireLicenseFile: true,
      licenseFile: dealerFiles.businessLicense,
    });
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        businessLicenseFile: "Please upload a PDF, JPG, PNG, or WebP file",
      }));
      return;
    }

    if (file.size > DEALER_DOC_MAX_BYTES) {
      setErrors((prev) => ({
        ...prev,
        businessLicenseFile: "File size must be less than 10MB",
      }));
      return;
    }

    if (type === "businessLicense") {
      setDealerFiles({ businessLicense: file });
      setErrors((prev) => ({ ...prev, businessLicenseFile: "" }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const nextErrors = validateCurrentStep();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNext();
      return;
    }

    const nextErrors = validateCurrentStep();
    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        getFirstDealerErrorMessage(nextErrors) ||
          "Please complete all required fields to continue",
      );
      return;
    }

    const requestTypes = [];
    if (requestDealerAccess) requestTypes.push("dealer", "auctionDealer");
    if (requestAuctionBidder) requestTypes.push("auctionBidder");
    if (requestTypes.length === 0) {
      toast.error("Select at least one access type before submitting.");
      return;
    }

    const payload = buildDealerPayloadFromForm(formData);
    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          formDataToSend.append(key, JSON.stringify(value));
        }
        return;
      }
      if (value !== "") {
        formDataToSend.append(key, value);
      }
    });
    formDataToSend.append("businessLicense", dealerFiles.businessLicense);
    formDataToSend.append("requestTypes", JSON.stringify(requestTypes));

    try {
      await requestAuctionAccess(formDataToSend).unwrap();
      toast.success(
        "Request submitted successfully! Pending admin verification.",
      );
      resetForm();
      await refetch();
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || DEALER_REQUEST_FALLBACK_MESSAGE);
    }
  };

  if (!isOpen) return null;

  const isDealer = user?.role === "dealer";
  const isVerifiedDealer = user?.dealerInfo?.verified === true;
  const bidderStatus =
    auctionAccessStatus?.auctionCapabilities?.auctionBidder?.status;

  if (isDealer && isVerifiedDealer && bidderStatus === "approved") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-500 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Dealer Status</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="text-green-600" size={32} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Verified Dealer
              </h4>
              <p className="text-gray-600 mb-4">
                Your dealer account has been verified by our admin team.
              </p>
              {user?.dealerInfo?.businessName ? (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-medium text-gray-900">
                    {user.dealerInfo.businessName}
                  </p>
                </div>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="w-full mt-6 px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isDealer && !isVerifiedDealer && bidderStatus !== "approved") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-500 px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Dealer Status</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="text-yellow-600" size={32} />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Pending Verification
            </h4>
            <p className="text-gray-600 mb-4">
              Your dealer request is pending admin verification. You will be
              notified once your account is verified.
            </p>
            <button
              onClick={onClose}
              className="w-full mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl my-8 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-500 px-6 md:px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Become a Verified Dealer
            </h3>
            <p className="text-primary-100 text-sm mt-1">
              Step {currentStep} of 3 - Get verified and unlock dealer benefits
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="px-6 md:px-8 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
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

        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-300px)] bg-slate-50/50"
        >
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
            <DealerForm
              mode="request"
              step={currentStep}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              files={dealerFiles}
              onFileChange={handleFileChange}
              requestDealerAccess={requestDealerAccess}
              setRequestDealerAccess={setRequestDealerAccess}
              requestAuctionBidder={requestAuctionBidder}
              setRequestAuctionBidder={setRequestAuctionBidder}
              accountName={user?.name || ""}
              accountEmail={user?.email || ""}
            />

            {currentStep === 3 ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary-500 mb-2">
                  What happens next?
                </h4>
                <ul className="text-xs text-primary-500 space-y-1">
                  <li>Your request will be reviewed by our admin team</li>
                  <li>Verification typically takes 1-3 business days</li>
                  <li>You&apos;ll receive an email notification once verified</li>
                  <li>Verified dealers get priority listing placement</li>
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-200 mt-8 sticky bottom-0 bg-white/95 backdrop-blur rounded-t-xl">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={isLoading}
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-500 hover:opacity-90 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner fullScreen={false} />
                  Submitting...
                </>
              ) : currentStep < 3 ? (
                "Next"
              ) : (
                <>
                  <FiCheckCircle size={16} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealerRequestForm;
