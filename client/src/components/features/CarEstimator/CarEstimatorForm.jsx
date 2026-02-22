import React, { useState } from "react";
import {
  Car,
  Settings,
  Paintbrush,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
  MapPin,
  Palette,
} from "lucide-react";
import { useCarCategories } from "../../../hooks/useCarCategories";
import { capitalize } from "../../../utils/formatters";
import Input from "../../../components/utils/filter/Input";
import ExteriorColor from "../../../components/utils/filter/ExteriorColor";
import TransmissionSpecs from "../../../components/utils/filter/TransmissionSpecs";
import EngineCapacitySpecs from "../../../components/utils/filter/EngineCapacitySpecs";
import { useCreateValuationMutation } from "../../../redux/services/api";
import toast from "react-hot-toast";
import Select from "react-select";

// Remove hardcoded data - will use dynamic data from admin panel
const accidentHistories = ["None", "Minor", "Major"];
const exteriorColors = [
  { name: "White", color: "#FFFFFF" },
  { name: "Silver", color: "#C0C0C0" },
  { name: "Black", color: "#000000" },
  { name: "Gray", color: "#808080" },
  { name: "Blue", color: "#0000FF" },
  { name: "Red", color: "#FF0000" },
  { name: "Green", color: "#008000" },
  { name: "Gold", color: "#FFD700" },
];

// Dynamic condition options
const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

// Combined engine and fuel types (matching HeroFilter)
const engineTypes = [
  { value: "5_speed_manual", label: "5 Speed Manual" },
  { value: "6_speed_manual", label: "6 Speed Manual" },
  { value: "4_speed_auto", label: "4 Speed Auto" },
  { value: "5_speed_auto", label: "5 Speed Auto" },
  { value: "6_speed_auto", label: "6 Speed Auto" },
  { value: "7_plus_speed_auto", label: "7+ Speed Auto" },
  { value: "cvt", label: "CVT" },
  { value: "dct", label: "DCT" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
];

// Dynamic transmission types
const transmissions = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "semi-automatic", label: "Semi-Automatic" },
  { value: "cvt", label: "CVT" },
];

// Custom theme for React Select to override default blue colors
const customTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "#3b82f6",
    primary75: "rgba(59, 130, 246, 0.75)",
    primary50: "rgba(59, 130, 246, 0.5)",
    primary25: "rgba(59, 130, 246, 0.25)",
  },
});

// Mileage options (matching HeroFilter)
const mileageOptions = [
  { value: "", label: "Select mileage" },
  { value: "< 5,000", label: "< 5,000" },
  { value: "5,000 - 10,000", label: "5,000 - 10,000" },
  { value: "10,000 - 20,000", label: "10,000 - 20,000" },
  { value: "20,000 - 30,000", label: "20,000 - 30,000" },
  { value: "30,000 - 40,000", label: "30,000 - 40,000" },
  { value: "40,000 - 50,000", label: "40,000 - 50,000" },
  { value: "50,000 - 60,000", label: "50,000 - 60,000" },
  { value: "60,000 - 75,000", label: "60,000 - 75,000" },
  { value: "75,000 - 100,000", label: "75,000 - 100,000" },
  { value: "100,000 - 125,000", label: "100,000 - 125,000" },
  { value: "125,000 - 150,000", label: "125,000 - 150,000" },
  { value: "150,000+", label: "150,000+" },
];

const FormSection = ({ title, subtitle, icon: Icon, color, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const ConditionSelector = ({ value, onChange, options }) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`py-2 px-4 rounded text-sm font-medium transition-all ${
            value === option
              ? "bg-primary-500 text-white border-primary-500"
              : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          } border`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default function CarEstimatorForm({ onEstimate }) {
  const vehicleType = "Car"; // Car estimator is for cars only

  // Use dynamic data from admin panel
  const {
    makes,
    years,
    cities,
    getModelsByMake,
    getCitiesByCountry,
    getCitiesByState,
  } = useCarCategories(vehicleType);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    variant: "",
    year: "",
    mileage: "",
    registrationCity: "",
    exteriorColor: "",
    engineCondition: "",
    engineType: "",
    engineCapacity: "",
    transmission: "",
    bodyCondition: "",
    paintStatus: "",
    tireCondition: "",
    suspensionCondition: "",
    interiorCondition: "",
    accidentHistory: "",
    additionalNotes: "",
    additionalFeatures: {
      sunroof: false,
      leatherSeats: false,
      navigation: false,
      bluetooth: false,
      cruiseControl: false,
    },
  });

  const [errors, setErrors] = useState({});
  const [createValuation, { isLoading: isAnalyzing }] =
    useCreateValuationMutation();

  const isFormValid =
    formData.make &&
    formData.model &&
    formData.year &&
    formData.mileage &&
    formData.transmission;

  const calculateMockEstimation = () => {
    // This function now calls the real backend API
    // Mock calculation removed - using real AI-powered backend valuation
    return {
      min: 0,
      max: 0,
      formData,
      summary: "Getting real-time market valuation...",
    };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        additionalFeatures: {
          ...prev.additionalFeatures,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Handle dynamic field dependencies
    if (name === "make") {
      setSelectedMake(value);
      setFormData((prev) => ({ ...prev, model: "" })); // Reset model when make changes
    }
    if (name === "country") {
      setSelectedCountry(value);
      setSelectedState("");
      setFormData((prev) => ({ ...prev, state: "", city: "" })); // Reset state and city
    }
    if (name === "state") {
      setSelectedState(value);
      setFormData((prev) => ({ ...prev, city: "" })); // Reset city when state changes
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.make) newErrors.make = "Car make is required";
    if (!formData.model) newErrors.model = "Car model is required";
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    if (!formData.transmission)
      newErrors.transmission = "Transmission is required";

    // Validate year range
    const yearNum = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1; // Allow next year's models

    // Check if year is a valid number
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > maxYear) {
      if (isNaN(yearNum)) {
        newErrors.year = "Please select a valid year";
      } else {
        newErrors.year = `Year must be between 1990 and ${maxYear}`;
      }
    }

    // Validate mileage
    const mileageNum = parseInt(formData.mileage);
    if (mileageNum < 0) {
      newErrors.mileage = "Mileage must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Get actual make and model names from the selected IDs
        const selectedMakeObj = makes.find((m) => m._id === formData.make);
        const selectedModelObj = availableModels.find(
          (m) => m._id === formData.model,
        );
        const selectedCityObj = cities.find(
          (c) => c._id === formData.registrationCity,
        );

        // Prepare data with actual names instead of IDs for backend processing
        const valuationData = {
          ...formData,
          make: selectedMakeObj?.name || formData.make,
          model: selectedModelObj?.name || formData.model,
          registrationCity: selectedCityObj?.name || formData.registrationCity,
        };

        const result = await createValuation(valuationData).unwrap();

        // Handle both possible response structures
        const estimation = result.data?.estimation || result.estimation;
        const vehicleData =
          result.data?.vehicleData || result.vehicleData || valuationData;

        if (!estimation) {
          throw new Error("Invalid response structure from server");
        }

        onEstimate({
          min: estimation.minPrice,
          max: estimation.maxPrice,
          average: estimation.averagePrice,
          confidence: estimation.confidenceScore,
          summary: estimation.analysisSummary,
          isAIPowered: estimation.isAIPowered || false,
          formData: vehicleData,
        });
        toast.success("Analysis complete!");
      } catch (error) {
        console.error("Valuation Error:", error);
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to analyze car value. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  const availableModels = selectedMake
    ? getModelsByMake[selectedMake] || []
    : [];

  // Dynamic engine capacities based on selected make/model (for now, use static options)
  const engineCapacities = [
    { value: "660cc", label: "660cc" },
    { value: "800cc", label: "800cc" },
    { value: "1000cc", label: "1000cc" },
    { value: "1300cc", label: "1300cc" },
    { value: "1500cc", label: "1500cc" },
    { value: "1600cc", label: "1600cc" },
    { value: "1800cc", label: "1800cc" },
    { value: "2000cc", label: "2000cc" },
    { value: "2500cc", label: "2500cc" },
    { value: "3000cc", label: "3000cc" },
    { value: "3500cc", label: "3500cc" },
    { value: "4000cc+", label: "4000cc+" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        {/* Car Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  makes.find((make) => make._id === formData.make)
                    ? {
                        value: formData.make,
                        label: capitalize(
                          makes.find((make) => make._id === formData.make)
                            ?.name,
                        ),
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "make",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={makes.map((make) => ({
                  value: make._id,
                  label: capitalize(make.name),
                }))}
                placeholder="Select make"
                isClearable
                isSearchable
                theme={customTheme}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">
                Select your car manufacturer
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  availableModels.find((model) => model._id === formData.model)
                    ? {
                        value: formData.model,
                        label: capitalize(
                          availableModels.find(
                            (model) => model._id === formData.model,
                          )?.name,
                        ),
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "model",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={availableModels.map((model) => ({
                  value: model._id,
                  label: capitalize(model.name),
                }))}
                placeholder={
                  formData.make ? "Select model" : "Select make first"
                }
                isDisabled={!formData.make}
                isClearable
                isSearchable
                theme={customTheme}
                noOptionsMessage={() =>
                  formData.make ? "No models available" : "Select make first"
                }
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">
                Choose the exact model
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  years.find((year) => year.name === formData.year)
                    ? { value: formData.year, label: formData.year }
                    : null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "year",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={years.map((year) => ({
                  value: year.name,
                  label: year.name,
                }))}
                placeholder="Select year"
                isClearable
                isSearchable
                theme={customTheme}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">Manufacturing year</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage <span className="text-red-500">*</span>
              </label>
              <Select
                value={
                  mileageOptions.find(
                    (option) => option.value === formData.mileage,
                  ) || null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "mileage",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={mileageOptions}
                placeholder="Select mileage"
                isClearable
                isSearchable
                theme={customTheme}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">
                Total kilometers driven
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant/Trim
              </label>
              <Input
                inputType="text"
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                placeholder="e.g., XLi, VTi, Sport"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trim level affects price
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration City
              </label>
              <Select
                value={
                  cities.find((city) => city._id === formData.registrationCity)
                    ? {
                        value: formData.registrationCity,
                        label: cities.find(
                          (city) => city._id === formData.registrationCity,
                        )?.name,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "registrationCity",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={cities.map((city) => ({
                  value: city._id,
                  label: city.name,
                }))}
                placeholder="Select city"
                isClearable
                isSearchable
                theme={customTheme}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">
                Affects regional pricing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine/Fuel Type
              </label>
              <Select
                value={
                  engineTypes.find((type) => type.value === formData.engineType)
                    ? {
                        value: formData.engineType,
                        label: engineTypes.find(
                          (type) => type.value === formData.engineType,
                        )?.label,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "engineType",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={engineTypes}
                placeholder="Select"
                isClearable
                isSearchable
                theme={customTheme}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">
                Select engine aspiration or fuel type
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paint Status
              </label>
              <Select
                value={
                  formData.paintStatus
                    ? {
                        value: formData.paintStatus,
                        label:
                          formData.paintStatus === "original"
                            ? "Original"
                            : formData.paintStatus === "repainted"
                              ? "Repainted"
                              : "Partially Repainted",
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "paintStatus",
                      value: selectedOption ? selectedOption.value : "",
                    },
                  })
                }
                options={[
                  { value: "original", label: "Original" },
                  { value: "repainted", label: "Repainted" },
                  {
                    value: "partially_repainted",
                    label: "Partially Repainted",
                  },
                ]}
                placeholder="Select"
                isClearable
                isSearchable={false}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    height: "36px",
                    minHeight: "36px",
                    fontSize: "14px",
                    borderColor: state.isFocused
                      ? "#3b82f6 !important"
                      : "#d1d5db",
                    "&:hover": {
                      borderColor: "#9ca3af",
                    },
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5) !important"
                      : "none",
                  }),
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    zIndex: 9999,
                  }),
                }}
                menuPortalTarget={document.body}
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify if the paint is original or repainted
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine Condition
              </label>
              <ConditionSelector
                value={formData.engineCondition}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, engineCondition: v }))
                }
                options={conditions.map((c) => c.label)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Rate engine performance and maintenance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Condition
              </label>
              <ConditionSelector
                value={formData.bodyCondition}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, bodyCondition: v }))
                }
                options={conditions.map((c) => c.label)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the overall condition of the car body
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interior Condition
              </label>
              <ConditionSelector
                value={formData.interiorCondition}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, interiorCondition: v }))
                }
                options={conditions.map((c) => c.label)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Check the condition of seats, dashboard, and interior panels
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suspension Condition
              </label>
              <ConditionSelector
                value={formData.suspensionCondition}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, suspensionCondition: v }))
                }
                options={conditions.map((c) => c.label)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Rate your suspension system for comfort and performance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tire Condition
              </label>
              <ConditionSelector
                value={formData.tireCondition}
                onChange={(v) =>
                  setFormData((prev) => ({ ...prev, tireCondition: v }))
                }
                options={["New", "Good", "Worn"]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Check the current condition of your tires
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accident History
              </label>

              <div className="flex gap-3 flex-wrap">
                {accidentHistories.map((history) => (
                  <button
                    key={history}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        accidentHistory: history,
                      }))
                    }
                    className={`py-2 px-4 rounded text-sm font-medium transition-all ${
                      formData.accidentHistory === history
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    } border`}
                  >
                    {history}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Major accidents reduce value by 15-30%, Minor by 5-10%
              </p>
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exterior Color
              </label>
              <ExteriorColor
                value={formData.exteriorColor}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, exteriorColor: value }))
                }
              />
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission <span className="text-red-500">*</span>
              </label>
              <TransmissionSpecs
                value={formData.transmission}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, transmission: value }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">Gearbox type</p>
            </div>

            <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Enter any additional information about your car that might affect its value..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid || isAnalyzing}
            className="w-full h-12 sm:h-14 bg-primary-500 hover:bg-opacity-90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">
                  Analyzing with Real-Time Market Data...
                </span>
                <span className="sm:hidden">Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">
                  Get AI-Powered Valuation
                </span>
                <span className="sm:hidden">Get Valuation</span>
                <ArrowRight className="w-5 h-5 hidden sm:inline" />
              </>
            )}
          </button>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 px-4">
            <Info className="w-4 h-4 inline mr-1" />
            <span className="hidden sm:inline">
              Powered by real-time data from Sello & local dealerships
            </span>
            <span className="sm:hidden">Real-time market data analysis</span>
          </p>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 sm:mx-0">
            <div className="text-red-800">
              <p className="font-medium mb-2 text-sm sm:text-base">
                Please fix the following errors:
              </p>
              <ul className="mt-2 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
