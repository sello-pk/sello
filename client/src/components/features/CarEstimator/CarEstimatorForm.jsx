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
import Input from "../../../components/utils/filter/Input";
import ExteriorColor from "../../../components/utils/filter/ExteriorColor";
import FuelSpecs from "../../../components/utils/filter/FuelSpecs";
import TransmissionSpecs from "../../../components/utils/filter/TransmissionSpecs";
import EngineCapacitySpecs from "../../../components/utils/filter/EngineCapacitySpecs";
import { useCreateValuationMutation } from "../../../redux/services/api";
import toast from "react-hot-toast";

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

// Dynamic engine types
const engineTypes = [
  { value: "naturally_aspirated", label: "Naturally Aspirated" },
  { value: "turbo", label: "Turbo" },
  { value: "supercharged", label: "Supercharged" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

// Dynamic fuel types
const fuelTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "cng", label: "CNG" },
  { value: "petrol+cng", label: "Petrol + CNG" },
];

// Dynamic transmission types
const transmissions = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "semi-automatic", label: "Semi-Automatic" },
  { value: "cvt", label: "CVT" },
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
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`py-1 px-2 rounded text-xs font-medium transition-all ${
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
    fuelType: "",
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
  const [createValuation, { isLoading: isAnalyzing }] = useCreateValuationMutation();

  const isFormValid =
    formData.make &&
    formData.model &&
    formData.year &&
    formData.mileage &&
    formData.fuelType &&
    formData.transmission;

  const calculateMockEstimation = () => {
    // Base value calculation in PKR (mocked)
    let baseValue = 2000000; // Base value 20 lakh PKR

    // Adjust based on year
    const yearNum = parseInt(formData.year);
    const currentYear = new Date().getFullYear();
    const yearDepreciation = (currentYear - yearNum) * 50000; // 50k per year
    baseValue -= yearDepreciation;

    // Adjust based on mileage
    const mileageNum = parseInt(formData.mileage);
    const mileageDepreciation = Math.floor(mileageNum / 1000) * 5000; // 5k per 1000 km
    baseValue -= mileageDepreciation;

    // Adjust based on condition
    const conditionMultipliers = {
      excellent: 1.2,
      good: 1.0,
      fair: 0.8,
      poor: 0.6,
    };

    // Use engine condition if available, otherwise skip condition multiplier
    if (formData.engineCondition) {
      baseValue *=
        conditionMultipliers[formData.engineCondition.toLowerCase()] || 1.0;
    }

    // Adjust based on fuel type
    const fuelMultipliers = {
      electric: 1.3,
      hybrid: 1.2,
      diesel: 1.0,
      petrol: 0.9,
      cng: 0.8,
      "petrol+cng": 0.85,
    };
    baseValue *= fuelMultipliers[formData.fuelType.toLowerCase()] || 1.0;

    // Add value for additional features
    const featureValues = {
      sunroof: 100000, // 1 lakh PKR
      leatherSeats: 150000, // 1.5 lakh PKR
      navigation: 80000, // 80k PKR
      bluetooth: 20000, // 20k PKR
      cruiseControl: 50000, // 50k PKR
    };

    Object.keys(formData.additionalFeatures).forEach((feature) => {
      if (formData.additionalFeatures[feature]) {
        baseValue += featureValues[feature] || 0;
      }
    });

    // Ensure minimum value
    baseValue = Math.max(baseValue, 200000); // 2 lakh minimum

    // Create range (±20%)
    const min = Math.floor(baseValue * 0.8);
    const max = Math.floor(baseValue * 1.2);

    return {
      min,
      max,
      formData,
      summary: `Based on the ${formData.engineCondition || "good"} condition of your ${formData.year} ${formData.make} ${formData.model}, with ${formData.mileage} km mileage, the estimated value reflects current market trends in Pakistan.`,
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
    if (!formData.fuelType) newErrors.fuelType = "Fuel type is required";
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
        const selectedMakeObj = makes.find(m => m._id === formData.make);
        const selectedModelObj = availableModels.find(m => m._id === formData.model);
        const selectedCityObj = cities.find(c => c._id === formData.registrationCity);

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
        const vehicleData = result.data?.vehicleData || result.vehicleData || valuationData;

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
          formData: vehicleData
        });
        toast.success("Analysis complete!");
      } catch (error) {
        console.error("Valuation Error:", error);
        const errorMessage = error?.data?.message || error?.message || "Failed to analyze car value. Please try again.";
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
        className="w-full max-w-full mx-auto px-4 sm:px-0 lg:px-0 space-y-6"
      >
        {/* Car Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make <span className="text-red-500">*</span>
              </label>
              <select
                name="make"
                value={formData.make}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select make</option>
                {makes.map((make) => (
                  <option key={make._id} value={make._id}>
                    {make.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select your car manufacturer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                disabled={!formData.make}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {formData.make ? "Select model" : "Select make first"}
                </option>
                {availableModels.map((model) => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the exact model
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select year</option>
                {years.map((year) => (
                  <option key={year._id} value={year.name}>
                    {year.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Manufacturing year</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage (KM) <span className="text-red-500">*</span>
              </label>
              <Input
                inputType="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g., 50000"
                min="0"
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
              <select
                name="registrationCity"
                value={formData.registrationCity}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Affects regional pricing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine Type
              </label>
              <select
                name="engineType"
                value={formData.engineType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select</option>
                {engineTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Engine aspiration type
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paint Status
              </label>
              <select
                name="paintStatus"
                value={formData.paintStatus}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select</option>
                <option value="original">Original</option>
                <option value="repainted">Repainted</option>
                <option value="partially_repainted">Partially Repainted</option>
              </select>
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
                Accident History
              </label>

              <div className="flex gap-2 flex-wrap">
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
                    className={`py-1 px-2 rounded text-xs font-medium transition-all ${
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

            <div className="lg:col-span-4">
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

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <FuelSpecs
                value={formData.fuelType}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, fuelType: value }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">Select fuel type</p>
            </div>

            <div className="lg:col-span-2 pl-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine Capacity
              </label>
              <EngineCapacitySpecs
                value={formData.engineCapacity}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, engineCapacity: value }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">Engine displacement</p>
            </div>

            <div className="lg:col-span-4">
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

            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="w-full h-12 bg-primary-500 hover:bg-opacity-90 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing with Real-Time Market Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Get AI-Powered Valuation
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-sm text-gray-500 mt-3">
            <Info className="w-4 h-4 inline mr-1" />
            Powered by real-time data from Sello & local dealerships
          </p>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <p className="font-medium mb-2">
                Please fix the following errors:
              </p>
              <ul className="mt-2 space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-start gap-2">
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
