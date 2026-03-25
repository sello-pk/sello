import React, { useState, useMemo, useEffect } from "react";
import {
  useRequestAuctionAccessMutation,
  useGetMeQuery,
  useGetMyAuctionAccessStatusQuery,
} from "../../../redux/services/api";
import toast from "react-hot-toast";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiBriefcase,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiUpload,
  FiChevronDown,
  FiGlobe,
  FiCalendar,
  FiUsers,
  FiTag,
  FiMessageCircle,
} from "react-icons/fi";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Spinner } from "../../ui/Loading";
import { useCarCategories } from "../../../hooks/useCarCategories";

const DEALER_REQUEST_FALLBACK_MESSAGE =
  "We could not submit your dealer request right now. Please review your details and try again.";

const DealerRequestForm = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    businessName: "",
    businessLicense: "",
    businessAddress: "",
    businessPhone: "",
    whatsappNumber: "",
    country: "",
    state: "",
    city: "",
    area: "",
    vehicleTypes: "",

    // Step 2: Business Details
    description: "",
    website: "",
    establishedYear: "",
    employeeCount: "",
    paymentMethods: [],
    services: [],
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [requestDealerAccess, setRequestDealerAccess] = useState(true);
  const [requestAuctionBidder, setRequestAuctionBidder] = useState(false);

  const [requestAuctionAccess, { isLoading }] =
    useRequestAuctionAccessMutation();
  const { data: user, refetch } = useGetMeQuery();
  const { data: auctionAccessStatus } = useGetMyAuctionAccessStatusQuery(
    undefined,
    {
      skip: !isOpen,
    },
  );

  // Fetch categories from admin
  const {
    countries,
    states,
    cities,
    getStatesByCountry,
    getCitiesByState,
    isLoading: categoriesLoading,
  } = useCarCategories();

  // Filter states by selected country
  const availableStates = useMemo(() => {
    if (!formData.country) return [];
    const statesMap = getStatesByCountry || {};
    return statesMap[formData.country] || [];
  }, [formData.country, getStatesByCountry]);

  // Filter cities by selected state
  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    const citiesMap = getCitiesByState || {};
    return citiesMap[formData.state] || [];
  }, [formData.state, getCitiesByState]);

  // Reset state when country changes
  useEffect(() => {
    if (formData.country) {
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
  }, [formData.country]);

  // Reset city when state changes
  useEffect(() => {
    if (formData.state) {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.state]);

  const employeeCountOptions = ["1-10", "11-50", "51-100", "100+"];
  const commonPaymentMethods = [
    "Cash",
    "Credit Card",
    "Bank Transfer",
    "Cheque",
    "Financing Available",
  ];
  const commonServices = [
    "Financing",
    "Trade-in",
    "Warranty",
    "Insurance",
    "Delivery",
    "Test Drive",
  ];

  const removeFromArray = (field, item) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((i) => i !== item),
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    } else if (formData.businessName.trim().length < 3) {
      newErrors.businessName = "Business name must be at least 3 characters";
    }

    if (!formData.businessLicense.trim() && !businessLicenseFile) {
      newErrors.businessLicense = "Business license number or file is required";
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = "Business address is required";
    } else if (formData.businessAddress.trim().length < 10) {
      newErrors.businessAddress = "Please provide a complete address";
    }

    if (!formData.businessPhone.trim()) {
      newErrors.businessPhone = "Business phone number is required";
    } else if (!/^[\d\s\-+()]+$/.test(formData.businessPhone.trim())) {
      newErrors.businessPhone = "Please enter a valid phone number";
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    }

    if (!formData.vehicleTypes.trim()) {
      newErrors.vehicleTypes = "Type of vehicles is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
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
          businessLicenseFile: "Please upload a PDF, JPG, or PNG file",
        }));
        return;
      }
      // Keep dealer document uploads within the UI-supported limit.
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          businessLicenseFile: "File size must be less than 10MB",
        }));
        return;
      }
      setBusinessLicenseFile(file);
      if (errors.businessLicenseFile) {
        setErrors((prev) => ({ ...prev, businessLicenseFile: "" }));
      }
    }
  };

  const getFirstErrorMessage = (errors) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length === 0) return null;

    // Get the first error message
    const firstField = errorFields[0];
    const firstError = errors[firstField];

    // If there are multiple errors, provide helpful context
    if (errorFields.length > 1) {
      const errorCount = errorFields.length - 1;
      return `${firstError} (${errorCount} more field${errorCount > 1 ? "s" : ""} need attention)`;
    }

    return firstError;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      } else {
        const firstError = getFirstErrorMessage(errors);
        toast.error(
          firstError || "Please complete all required fields to continue",
        );
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      handleNext();
      return;
    }

    if (!validateStep1()) {
      const firstError = getFirstErrorMessage(errors);
      toast.error(
        firstError || "Please complete all required fields to continue",
      );
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("businessName", formData.businessName.trim());
      // One multipart part named "businessLicense": prefer file so multer/body stay consistent.
      if (businessLicenseFile) {
        formDataToSend.append("businessLicense", businessLicenseFile);
      } else if (formData.businessLicense.trim()) {
        formDataToSend.append(
          "businessLicense",
          formData.businessLicense.trim(),
        );
      }
      formDataToSend.append("businessAddress", formData.businessAddress.trim());
      formDataToSend.append("businessPhone", formData.businessPhone.trim());

      if (formData.whatsappNumber) {
        formDataToSend.append("whatsappNumber", formData.whatsappNumber.trim());
      }

      // Location fields
      if (formData.country) formDataToSend.append("country", formData.country);
      if (formData.state) formDataToSend.append("state", formData.state);
      if (formData.city) formDataToSend.append("city", formData.city);
      if (formData.area) formDataToSend.append("area", formData.area.trim());
      if (formData.vehicleTypes)
        formDataToSend.append("vehicleTypes", formData.vehicleTypes.trim());

      // Enhanced business details
      if (formData.description)
        formDataToSend.append("description", formData.description.trim());
      if (formData.website)
        formDataToSend.append("website", formData.website.trim());
      if (formData.establishedYear)
        formDataToSend.append("establishedYear", formData.establishedYear);
      if (formData.employeeCount)
        formDataToSend.append("employeeCount", formData.employeeCount);
      if (formData.paymentMethods.length > 0)
        formDataToSend.append(
          "paymentMethods",
          JSON.stringify(formData.paymentMethods),
        );
      if (formData.services.length > 0)
        formDataToSend.append("services", JSON.stringify(formData.services));
      if (formData.facebook)
        formDataToSend.append("facebook", formData.facebook.trim());
      if (formData.instagram)
        formDataToSend.append("instagram", formData.instagram.trim());
      if (formData.twitter)
        formDataToSend.append("twitter", formData.twitter.trim());
      if (formData.linkedin)
        formDataToSend.append("linkedin", formData.linkedin.trim());

      // Use the API mutation - it should handle FormData
      const requestTypes = [];
      if (requestDealerAccess) requestTypes.push("dealer", "auctionDealer");
      if (requestAuctionBidder) requestTypes.push("auctionBidder");
      if (requestTypes.length === 0) {
        toast.error("Select at least one access type before submitting.");
        return;
      }
      formDataToSend.append("requestTypes", JSON.stringify(requestTypes));

      await requestAuctionAccess(formDataToSend).unwrap();
      toast.success(
        "Request submitted successfully! Pending admin verification.",
      );
      setFormData({
        businessName: "",
        businessLicense: "",
        businessAddress: "",
        businessPhone: "",
        whatsappNumber: "",
        country: "",
        state: "",
        city: "",
        area: "",
        vehicleTypes: "",
        description: "",
        website: "",
        establishedYear: "",
        employeeCount: "",
        paymentMethods: [],
        services: [],
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
      });
      setBusinessLicenseFile(null);
      setErrors({});
      setCurrentStep(1);
      refetch();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error?.data?.message || DEALER_REQUEST_FALLBACK_MESSAGE,
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validate URL fields (social media and website)
    if (
      ["website", "facebook", "instagram", "twitter", "linkedin"].includes(
        name,
      ) &&
      value
    ) {
      // Allow partial URLs - will be fixed on backend
    }
  };

  if (!isOpen) return null;

  // Check if user is already a dealer
  const isDealer = user?.role === "dealer";
  const isVerifiedDealer = user?.dealerInfo?.verified === true;
  const bidderStatus =
    auctionAccessStatus?.auctionCapabilities?.auctionBidder?.status;

  // Show status if already a dealer
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
            {isVerifiedDealer ? (
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
                {user?.dealerInfo?.businessName && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-600 mb-1">Business Name</p>
                    <p className="font-medium text-gray-900">
                      {user.dealerInfo.businessName}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
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
                {user?.dealerInfo?.businessName && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-600 mb-1">Business Name</p>
                    <p className="font-medium text-gray-900">
                      {user.dealerInfo.businessName}
                    </p>
                  </div>
                )}
              </div>
            )}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-5xl my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-500 px-6 md:px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Become a Verified Dealer
            </h3>
            <p className="text-primary-100 text-sm mt-1">
              Step {currentStep} of {totalSteps} - Get verified and unlock
              dealer benefits
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Progress Bar */}
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
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? "bg-primary-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Basic Info</span>
            <span>Business Details</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-300px)] bg-slate-50/50"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Basic Information
              </h3>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiBriefcase className="inline mr-2" size={16} />
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business/showroom name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                    errors.businessName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.businessName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessName}
                  </p>
                )}
              </div>

              {/* Business License */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiFileText className="inline mr-2" size={16} />
                  Business License *
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleChange}
                    placeholder="Enter your business license number"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      errors.businessLicense
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.businessLicense && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.businessLicense}
                    </p>
                  )}
                  <div className="text-center text-gray-500 text-sm font-medium">
                    OR
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="license-upload"
                    />
                    <label
                      htmlFor="license-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <FiUpload className="text-gray-400 mb-2" size={24} />
                      <span className="text-sm text-gray-600">
                        {businessLicenseFile
                          ? businessLicenseFile.name
                          : "Click to upload license file"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG (Max 10MB)
                      </span>
                    </label>
                  </div>
                  {businessLicenseFile && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                      <span className="text-sm text-green-800">
                        {businessLicenseFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBusinessLicenseFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  )}
                  {errors.businessLicenseFile && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.businessLicenseFile}
                    </p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  Provide either license number or upload license document (will
                  be verified by admin team)
                </p>
              </div>

              {/* Business Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiMapPin className="inline mr-2" size={16} />
                  Business Address *
                </label>
                <textarea
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="Enter your complete business address"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none ${
                    errors.businessAddress
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.businessAddress && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.businessAddress}
                  </p>
                )}
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" size={16} />
                    Business Phone *
                  </label>
                  <input
                    type="tel"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleChange}
                    placeholder="+923 XX XXX XXXX"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      errors.businessPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.businessPhone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.businessPhone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiPhone className="inline mr-2" size={16} />
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="+923 XX XXX XXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiMapPin className="inline mr-2" size={16} />
                    Country *
                  </label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none ${
                        errors.country ? "border-red-500" : "border-gray-300"
                      } ${categoriesLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Loading countries..."
                          : "Select Country"}
                      </option>
                      {countries.map((country) => (
                        <option key={country._id} value={country._id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <div className="relative">
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      } ${!formData.country || categoriesLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      disabled={!formData.country || categoriesLoading}
                    >
                      <option value="">
                        {!formData.country
                          ? "Select country first"
                          : availableStates.length === 0
                            ? "No states available"
                            : "Select State"}
                      </option>
                      {availableStates.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <div className="relative">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full py-2 px-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      } ${!formData.state || categoriesLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      disabled={!formData.state || categoriesLoading}
                    >
                      <option value="">
                        {!formData.state
                          ? "Select state first"
                          : availableCities.length === 0
                            ? "No cities available"
                            : "Select City"}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city._id} value={city._id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Area and Vehicle Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Area *
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Enter area"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      errors.area ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.area && (
                    <p className="text-red-500 text-xs mt-1">{errors.area}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type of Vehicles *
                  </label>
                  <input
                    type="text"
                    name="vehicleTypes"
                    value={formData.vehicleTypes}
                    onChange={handleChange}
                    placeholder="New, Used, Bikes, SUVs, etc."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${
                      errors.vehicleTypes ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple types with commas
                  </p>
                  {errors.vehicleTypes && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vehicleTypes}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Access request options
                </p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={requestDealerAccess}
                      onChange={(e) => setRequestDealerAccess(e.target.checked)}
                    />
                    <span>Request Dealer + Auction Dealer access</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={requestAuctionBidder}
                      onChange={(e) =>
                        setRequestAuctionBidder(e.target.checked)
                      }
                    />
                    <span>Also request Auction Bidder access</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 2 && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Business Details
              </h3>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiMessageCircle className="inline mr-2" size={16} />
                  Business Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  placeholder="Tell us about your business, services, and what makes you unique..."
                />
              </div>

              {/* Website and Established Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiGlobe className="inline mr-2" size={16} />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FiCalendar className="inline mr-2" size={16} />
                    Established Year
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="2020"
                  />
                </div>
              </div>

              {/* Employee Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FiUsers className="inline mr-2" size={16} />
                  Employee Count
                </label>
                <select
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none relative"
                >
                  <option value="">Select employee count</option>
                  {employeeCountOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Methods Accepted
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.paymentMethods.map((method) => (
                    <span
                      key={method}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {method}
                      <button
                        type="button"
                        onClick={() =>
                          removeFromArray("paymentMethods", method)
                        }
                        className="hover:text-green-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonPaymentMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        if (!formData.paymentMethods.includes(method)) {
                          setFormData((prev) => ({
                            ...prev,
                            paymentMethods: [...prev.paymentMethods, method],
                          }));
                        }
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services Offered
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => removeFromArray("services", service)}
                        className="hover:text-purple-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonServices.map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => {
                        if (!formData.services.includes(service)) {
                          setFormData((prev) => ({
                            ...prev,
                            services: [...prev.services, service],
                          }));
                        }
                      }}
                      className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      + {service}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Review Your Information
              </h3>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Business Name:</span>
                      <p className="font-medium">
                        {formData.businessName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">
                        {formData.businessPhone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-medium">
                        {formData.area || "N/A"}
                        {formData.city &&
                          `, ${cities.find((c) => c._id === formData.city)?.name || formData.city}`}
                        {formData.state &&
                          `, ${states.find((s) => s._id === formData.state)?.name || formData.state}`}
                        {formData.country &&
                          `, ${countries.find((c) => c._id === formData.country)?.name || formData.country}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Vehicle Types:</span>
                      <p className="font-medium">
                        {formData.vehicleTypes || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {(formData.description || formData.website) && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Business Details
                    </h4>
                    <div className="text-sm space-y-2">
                      {formData.description && (
                        <div>
                          <span className="text-gray-600">Description:</span>
                          <p className="font-medium">{formData.description}</p>
                        </div>
                      )}
                      {formData.website && (
                        <div>
                          <span className="text-gray-600">Website:</span>
                          <p className="font-medium">{formData.website}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary-500 mb-2">
                  What happens next?
                </h4>
                <ul className="text-xs text-primary-500 space-y-1">
                  <li>• Your request will be reviewed by our admin team</li>
                  <li>• Verification typically takes 1-3 business days</li>
                  <li>• You'll receive an email notification once verified</li>
                  <li>• Verified dealers get priority listing placement</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-200 mt-8 sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 rounded-t-xl">
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
              className="px-6 py-2 bg-primary-500 hover:opacity-90 text-white rounded-lg font-medium shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Spinner fullScreen={false} />
                  Submitting...
                </>
              ) : currentStep < totalSteps ? (
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
