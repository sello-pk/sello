export const DEALER_EMPLOYEE_COUNT_OPTIONS = [
  "1-10",
  "11-50",
  "51-100",
  "100+",
];

export const DEALER_PAYMENT_METHOD_OPTIONS = [
  "Cash",
  "Credit Card",
  "Bank Transfer",
  "Cheque",
  "Financing Available",
];

export const DEALER_DOC_MAX_BYTES = 10 * 1024 * 1024;

export const createDealerFormState = (overrides = {}) => ({
  businessName: "",
  ownerFullName: "",
  businessPhone: "",
  whatsappNumber: "",
  email: "",
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
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  password: "",
  confirmPassword: "",
  ...overrides,
});

export const mapUserToDealerForm = (user) =>
  createDealerFormState({
    businessName: user?.dealerInfo?.businessName || "",
    ownerFullName: user?.name || "",
    businessPhone: user?.dealerInfo?.businessPhone || user?.phone || "",
    whatsappNumber: user?.dealerInfo?.whatsappNumber || "",
    email: user?.email || "",
    country: user?.dealerInfo?.country || "",
    state: user?.dealerInfo?.state || "",
    city: user?.dealerInfo?.city || "",
    area: user?.dealerInfo?.area || "",
    vehicleTypes: user?.dealerInfo?.vehicleTypes || "",
    description: user?.dealerInfo?.description || "",
    website: user?.dealerInfo?.website || "",
    establishedYear: user?.dealerInfo?.establishedYear?.toString() || "",
    employeeCount: user?.dealerInfo?.employeeCount || "",
    paymentMethods: Array.isArray(user?.dealerInfo?.paymentMethods)
      ? user.dealerInfo.paymentMethods
      : [],
    facebook: user?.dealerInfo?.socialMedia?.facebook || "",
    instagram: user?.dealerInfo?.socialMedia?.instagram || "",
    twitter: user?.dealerInfo?.socialMedia?.twitter || "",
    linkedin: user?.dealerInfo?.socialMedia?.linkedin || "",
  });

export const buildDealerPayloadFromForm = (formData) => ({
  businessName: formData.businessName?.trim() || "",
  businessPhone: formData.businessPhone?.trim() || "",
  whatsappNumber: formData.whatsappNumber?.trim() || "",
  email: formData.email?.trim() || "",
  country: formData.country || "",
  state: formData.state || "",
  city: formData.city || "",
  area: formData.area?.trim() || "",
  vehicleTypes: formData.vehicleTypes?.trim() || "",
  description: formData.description?.trim() || "",
  website: formData.website?.trim() || "",
  establishedYear: formData.establishedYear || "",
  employeeCount: formData.employeeCount || "",
  paymentMethods: Array.isArray(formData.paymentMethods)
    ? formData.paymentMethods
    : [],
  facebook: formData.facebook?.trim() || "",
  instagram: formData.instagram?.trim() || "",
  twitter: formData.twitter?.trim() || "",
  linkedin: formData.linkedin?.trim() || "",
});

export const validateDealerStepOne = ({
  formData,
  requireAccountFields = false,
  requirePassword = false,
  requireLicenseFile = false,
  licenseFile = null,
}) => {
  const errors = {};

  if (!formData.businessName?.trim()) {
    errors.businessName = "Dealer/Showroom name is required";
  }
  if (requireAccountFields && !formData.ownerFullName?.trim()) {
    errors.ownerFullName = "Owner full name is required";
  }
  if (!formData.businessPhone?.trim()) {
    errors.businessPhone = "Mobile number is required";
  }
  if (!formData.whatsappNumber?.trim()) {
    errors.whatsappNumber = "WhatsApp number is required";
  }
  if (requireAccountFields && !formData.email?.trim()) {
    errors.email = "Email address is required";
  } else if (
    requireAccountFields &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  ) {
    errors.email = "Please enter a valid email address";
  }
  if (!formData.country) errors.country = "Country is required";
  if (!formData.state) errors.state = "State is required";
  if (!formData.city) errors.city = "City is required";
  if (!formData.area?.trim()) errors.area = "Area is required";
  if (!formData.vehicleTypes?.trim()) {
    errors.vehicleTypes = "Type of vehicles is required";
  }
  if (requireLicenseFile && !licenseFile) {
    errors.businessLicenseFile = "Business license / CNIC is required";
  }
  if (requirePassword && !formData.password) {
    errors.password = "Password is required";
  } else if (requirePassword && formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (requirePassword && !formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (
    requirePassword &&
    formData.password !== formData.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};

export const getFirstDealerErrorMessage = (errors) => {
  const fields = Object.keys(errors || {});
  if (fields.length === 0) return null;
  const firstMessage = errors[fields[0]];
  if (fields.length === 1) return firstMessage;
  const moreCount = fields.length - 1;
  return `${firstMessage} (${moreCount} more field${moreCount > 1 ? "s" : ""} need attention)`;
};

export const getSafeDealerErrorMessage = (error, fallbackMessage) => {
  const serverMessage = error?.data?.message;
  if (
    typeof serverMessage === "string" &&
    serverMessage.trim() &&
    !["server error", "internal server error"].includes(
      serverMessage.trim().toLowerCase(),
    )
  ) {
    return serverMessage;
  }
  return fallbackMessage;
};
