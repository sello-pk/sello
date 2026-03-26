import React, { useMemo, useState } from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { useCarCategories } from "../../../hooks/useCarCategories";
import {
  DEALER_EMPLOYEE_COUNT_OPTIONS,
  DEALER_PAYMENT_METHOD_OPTIONS,
} from "./dealerFormUtils";

const DealerForm = ({
  step = 1,
  mode = "request",
  formData,
  setFormData,
  errors = {},
  setErrors,
  files = {},
  onFileChange,
  requestDealerAccess,
  setRequestDealerAccess,
  requestAuctionBidder,
  setRequestAuctionBidder,
  accountName = "",
  accountEmail = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    countries,
    states,
    cities,
    getStatesByCountry,
    getCitiesByState,
    isLoading: categoriesLoading,
  } = useCarCategories();

  const availableStates = useMemo(() => {
    if (!formData.country) return [];
    return getStatesByCountry?.[formData.country] || [];
  }, [formData.country, getStatesByCountry]);

  const availableCities = useMemo(() => {
    if (!formData.state) return [];
    return getCitiesByState?.[formData.state] || [];
  }, [formData.state, getCitiesByState]);

  const locationLabel = useMemo(() => {
    const parts = [];
    if (formData.area) parts.push(formData.area);
    if (formData.city) {
      parts.push(
        cities.find((item) => item._id === formData.city)?.name || formData.city,
      );
    }
    if (formData.state) {
      parts.push(
        states.find((item) => item._id === formData.state)?.name || formData.state,
      );
    }
    if (formData.country) {
      parts.push(
        countries.find((item) => item._id === formData.country)?.name ||
          formData.country,
      );
    }
    return parts.join(", ");
  }, [cities, countries, formData.area, formData.city, formData.country, formData.state, states]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "country") {
        return { ...prev, country: value, state: "", city: "" };
      }
      if (name === "state") {
        return { ...prev, state: value, city: "" };
      }
      return { ...prev, [name]: value };
    });
    if (errors[name]) {
      setErrors?.((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addPaymentMethod = (method) => {
    if (formData.paymentMethods.includes(method)) return;
    setFormData((prev) => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, method],
    }));
  };

  const removePaymentMethod = (method) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((item) => item !== method),
    }));
  };

  const renderInput = ({
    label,
    name,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
    readOnly = false,
    value = formData[name] || "",
    helperText = "",
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleFieldChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          errors[name] ? "border-red-500" : "border-gray-300"
        } ${disabled || readOnly ? "bg-gray-50" : ""}`}
      />
      {helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
      {errors[name] ? (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      ) : null}
    </div>
  );

  if (step === 1) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput({
            label: "Dealer/Showroom Name",
            name: "businessName",
            required: true,
            placeholder: "Enter dealer/showroom name",
          })}
          {mode === "signup"
            ? renderInput({
                label: "Owner Full Name",
                name: "ownerFullName",
                required: true,
                placeholder: "Enter owner full name",
              })
            : renderInput({
                label: "Owner Full Name",
                name: "ownerFullName",
                value: accountName || formData.ownerFullName,
                readOnly: true,
              })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput({
            label: "Mobile Number",
            name: "businessPhone",
            type: "tel",
            required: true,
            placeholder: "+923 XX XXX XXXX",
          })}
          {renderInput({
            label: "WhatsApp Number",
            name: "whatsappNumber",
            type: "tel",
            required: true,
            placeholder: "+923 XX XXX XXXX",
          })}
        </div>

        {mode === "signup"
          ? renderInput({
              label: "Email Address",
              name: "email",
              type: "email",
              required: true,
              placeholder: "Enter your email address",
            })
          : renderInput({
              label: "Email Address",
              name: "email",
              type: "email",
              value: accountEmail || formData.email,
              readOnly: true,
            })}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleFieldChange}
                className={`w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none ${
                  errors.country ? "border-red-500" : "border-gray-300"
                }`}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading countries..." : "Select Country"}
                </option>
                {countries.map((country) => (
                  <option key={country._id} value={country._id}>
                    {country.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.country ? (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <div className="relative">
              <select
                name="state"
                value={formData.state}
                onChange={handleFieldChange}
                disabled={!formData.country || categoriesLoading}
                className={`w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none ${
                  errors.state ? "border-red-500" : "border-gray-300"
                } ${!formData.country ? "bg-gray-100" : ""}`}
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
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.state ? (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <div className="relative">
              <select
                name="city"
                value={formData.city}
                onChange={handleFieldChange}
                disabled={!formData.state || categoriesLoading}
                className={`w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none ${
                  errors.city ? "border-red-500" : "border-gray-300"
                } ${!formData.state ? "bg-gray-100" : ""}`}
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
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.city ? (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput({
            label: "Area",
            name: "area",
            required: true,
            placeholder: "Enter area",
          })}
          {renderInput({
            label: "Type of Vehicles",
            name: "vehicleTypes",
            required: true,
            placeholder: "New, Used, Bikes, SUVs, etc.",
            helperText: "Separate multiple types with commas",
          })}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business License / CNIC *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => onFileChange?.(e, "businessLicense")}
              className="hidden"
              id={`dealer-license-upload-${mode}`}
            />
            <label
              htmlFor={`dealer-license-upload-${mode}`}
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FaUpload className="text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-600">
                {files.businessLicense
                  ? files.businessLicense.name
                  : "Click to upload or drag and drop"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG, WebP (Max 10MB)
              </span>
            </label>
          </div>
          {errors.businessLicenseFile ? (
            <p className="text-red-500 text-xs mt-1">
              {errors.businessLicenseFile}
            </p>
          ) : null}
        </div>

        {mode !== "update" && setRequestAuctionBidder ? (
          <div className="p-3 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Access request options
            </p>
            <div className="space-y-2 text-sm">
              {setRequestDealerAccess ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={requestDealerAccess}
                    onChange={(e) => setRequestDealerAccess(e.target.checked)}
                  />
                  <span>Request Dealer + Auction Dealer access</span>
                </label>
              ) : null}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={requestAuctionBidder}
                  onChange={(e) => setRequestAuctionBidder(e.target.checked)}
                />
                <span>Also request Auction Bidder approval</span>
              </label>
            </div>
          </div>
        ) : null}

        {mode === "signup" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleFieldChange}
                  className={`w-full py-2 px-3 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFieldChange}
                  className={`w-full py-2 px-3 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Business Details
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFieldChange}
            rows={4}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Tell us about your business..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput({
            label: "Website",
            name: "website",
            type: "url",
            placeholder: "https://www.example.com",
          })}
          {renderInput({
            label: "Established Year",
            name: "establishedYear",
            type: "number",
            placeholder: "2020",
          })}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee Count
          </label>
          <select
            name="employeeCount"
            value={formData.employeeCount}
            onChange={handleFieldChange}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select employee count</option>
            {DEALER_EMPLOYEE_COUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  onClick={() => removePaymentMethod(method)}
                  className="hover:text-green-600"
                >
                  <FaTimes size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {DEALER_PAYMENT_METHOD_OPTIONS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => addPaymentMethod(method)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                + {method}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput({
            label: "Facebook URL",
            name: "facebook",
            type: "url",
            placeholder: "https://facebook.com/...",
          })}
          {renderInput({
            label: "Instagram URL",
            name: "instagram",
            type: "url",
            placeholder: "https://instagram.com/...",
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput({
            label: "Twitter URL",
            name: "twitter",
            type: "url",
            placeholder: "https://twitter.com/...",
          })}
          {renderInput({
            label: "LinkedIn URL",
            name: "linkedin",
            type: "url",
            placeholder: "https://linkedin.com/...",
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Review Your Information
      </h3>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Basic Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Business Name:</span>
              <p className="font-medium">{formData.businessName || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600">Owner:</span>
              <p className="font-medium">
                {formData.ownerFullName || accountName || "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{formData.email || accountEmail || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium">{formData.businessPhone || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <p className="font-medium">{locationLabel || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-600">Vehicle Types:</span>
              <p className="font-medium">{formData.vehicleTypes || "N/A"}</p>
            </div>
          </div>
        </div>

        {(formData.description || formData.website) && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Business Details</h4>
            <div className="text-sm space-y-2">
              {formData.description ? (
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="font-medium">{formData.description}</p>
                </div>
              ) : null}
              {formData.website ? (
                <div>
                  <span className="text-gray-600">Website:</span>
                  <p className="font-medium">{formData.website}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerForm;
