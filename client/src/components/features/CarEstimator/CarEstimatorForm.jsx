import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import { useCarCategories } from "../../../hooks/useCarCategories";
import { capitalize } from "../../../utils/formatters";
import TransmissionSpecs from "../../../components/utils/filter/TransmissionSpecs";
import { useCreateValuationMutation } from "../../../redux/services/api";

const accidentHistories = ["None", "Minor", "Major"];
const paintStatusOptions = [
  { value: "original", label: "Original" },
  { value: "repainted", label: "Repainted" },
  { value: "partially_repainted", label: "Partially Repainted" },
];
const conditionOptions = ["Excellent", "Good", "Fair", "Poor"];
const conditionSelectOptions = conditionOptions.map((option) => ({
  value: option.toLowerCase(),
  label: option,
}));
const tireConditionOptions = ["New", "Good", "Worn"].map((option) => ({
  value: option,
  label: option,
}));
const accidentHistoryOptions = accidentHistories.map((option) => ({
  value: option,
  label: option,
}));

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

const stepMeta = [
  { id: 1, label: "Make" },
  { id: 2, label: "Specs" },
  { id: 3, label: "Condition" },
  { id: 4, label: "Review" },
];

const customTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "#f59e0b",
    primary75: "rgba(245, 158, 11, 0.75)",
    primary50: "rgba(245, 158, 11, 0.5)",
    primary25: "rgba(245, 158, 11, 0.2)",
  },
});

const selectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    minHeight: "48px",
    height: "48px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#f59e0b" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(245,158,11,0.25)" : "none",
    "&:hover": { borderColor: "#f59e0b" },
  }),
  menu: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
  menuPortal: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }),
};

const parseMileageValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "string") return NaN;

  const normalized = value.replace(/,/g, "").trim();
  const numbers = normalized.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return NaN;
  if (normalized.includes("-") && numbers.length >= 2) {
    return Math.round((numbers[0] + numbers[1]) / 2);
  }
  return numbers[0];
};

export default function CarEstimatorForm({ onEstimate }) {
  const [step, setStep] = useState(1);
  const vehicleType = "Car";
  const { makes, models, years, cities, getModelsByMake } =
    useCarCategories(vehicleType);
  const [createValuation, { isLoading: isAnalyzing }] =
    useCreateValuationMutation();

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

  const availableModels = useMemo(() => {
    if (!formData.make) return Array.isArray(models) ? models : [];
    return getModelsByMake?.[formData.make] || [];
  }, [formData.make, getModelsByMake, models]);

  const setField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "make" ? { model: "" } : {}),
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.make && formData.model && formData.year;
    if (step === 2) return formData.mileage && formData.transmission;
    return true;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.make) newErrors.make = "Car make is required";
    if (!formData.model) newErrors.model = "Car model is required";
    if (!formData.year) newErrors.year = "Year is required";
    if (!formData.mileage) newErrors.mileage = "Mileage is required";
    if (!formData.transmission) {
      newErrors.transmission = "Transmission is required";
    }

    const yearNum = parseInt(formData.year, 10);
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > maxYear) {
      newErrors.year = `Year must be between 1990 and ${maxYear}`;
    }

    const mileageNum = parseMileageValue(formData.mileage);
    if (isNaN(mileageNum) || mileageNum < 0) {
      newErrors.mileage = "Mileage must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix required fields before estimating.");
      return;
    }

    try {
      const selectedMakeObj = makes.find((m) => m._id === formData.make);
      const selectedModelObj = availableModels.find(
        (m) => m._id === formData.model,
      );
      const selectedCityObj = cities.find(
        (c) => c._id === formData.registrationCity,
      );

      const valuationData = {
        ...formData,
        make: selectedMakeObj?.name || formData.make,
        model: selectedModelObj?.name || formData.model,
        registrationCity: selectedCityObj?.name || formData.registrationCity,
        mileage: parseMileageValue(formData.mileage),
      };

      const response = await createValuation(valuationData).unwrap();
      const estimation = response.data?.estimation || response.estimation;
      const vehicleData =
        response.data?.vehicleData || response.vehicleData || valuationData;

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
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to analyze car value. Please try again.";
      toast.error(errorMessage);
    }
  };

  const nextStep = () => {
    if (!canProceed()) {
      toast.error("Please complete required fields before continuing.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-8xl mx-auto px-0 pb-8"
      >
        <div className="max-w-8xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-gray-700 mb-4">
              <Brain className="w-5 h-5 text-primary-500" />
              <span className="font-semibold text-sm sm:text-base">
                AI-Powered Estimation
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              {stepMeta.map((s) => (
                <div key={s.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      s.id === step
                        ? "bg-primary-500 text-white"
                        : s.id < step
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {s.id < step ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-600 mt-2">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${(step / stepMeta.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vehicle Basics
                </h2>
                <p className="text-gray-600 text-sm">
                  Select make, model, year, and variant.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onChange={(option) =>
                        setField("make", option?.value || "")
                      }
                      options={makes.map((make) => ({
                        value: make._id,
                        label: capitalize(make.name),
                      }))}
                      placeholder="Select make"
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={
                        availableModels.find(
                          (model) => model._id === formData.model,
                        )
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
                      onChange={(option) =>
                        setField("model", option?.value || "")
                      }
                      options={availableModels.map((model) => ({
                        value: model._id,
                        label: capitalize(model.name),
                      }))}
                      placeholder={
                        formData.make ? "Select model" : "All models"
                      }
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variant / Trim
                    </label>
                    <input
                      type="text"
                      value={formData.variant}
                      onChange={(e) => setField("variant", e.target.value)}
                      placeholder="e.g., VTi Oriel"
                      className="h-12 w-full rounded-xl border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
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
                      onChange={(option) =>
                        setField("year", option?.value || "")
                      }
                      options={years.map((year) => ({
                        value: year.name,
                        label: year.name,
                      }))}
                      placeholder="Select year"
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Specs & Usage
                </h2>
                <p className="text-gray-600 text-sm">
                  Add mileage, transmission, and key technical info.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      onChange={(option) =>
                        setField("mileage", option?.value || "")
                      }
                      options={mileageOptions}
                      placeholder="Select mileage"
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration City
                    </label>
                    <Select
                      value={
                        cities.find(
                          (city) => city._id === formData.registrationCity,
                        )
                          ? {
                              value: formData.registrationCity,
                              label:
                                cities.find(
                                  (city) =>
                                    city._id === formData.registrationCity,
                                )?.name || "",
                            }
                          : null
                      }
                      onChange={(option) =>
                        setField("registrationCity", option?.value || "")
                      }
                      options={cities.map((city) => ({
                        value: city._id,
                        label: city.name,
                      }))}
                      placeholder="Select city"
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine / Fuel Type
                    </label>
                    <Select
                      value={
                        engineTypes.find(
                          (t) => t.value === formData.engineType,
                        ) || null
                      }
                      onChange={(option) =>
                        setField("engineType", option?.value || "")
                      }
                      options={engineTypes}
                      placeholder="Select type"
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engine Capacity
                    </label>
                    <Select
                      value={
                        engineCapacities.find(
                          (c) => c.value === formData.engineCapacity,
                        ) || null
                      }
                      onChange={(option) =>
                        setField("engineCapacity", option?.value || "")
                      }
                      options={engineCapacities}
                      placeholder="Select engine capacity"
                      isClearable
                      isSearchable
                      theme={customTheme}
                      styles={selectStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <TransmissionSpecs
                      value={formData.transmission}
                      onChange={(value) => setField("transmission", value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Condition Details
                </h2>
                <p className="text-gray-600 text-sm">
                  Rate the key areas that affect valuation.
                </p>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engine Condition
                      </label>
                      <Select
                        value={
                          conditionSelectOptions.find(
                            (o) => o.value === formData.engineCondition,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("engineCondition", option?.value || "")
                        }
                        options={conditionSelectOptions}
                        placeholder="Select engine condition"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Condition
                      </label>
                      <Select
                        value={
                          conditionSelectOptions.find(
                            (o) => o.value === formData.bodyCondition,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("bodyCondition", option?.value || "")
                        }
                        options={conditionSelectOptions}
                        placeholder="Select body condition"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interior Condition
                      </label>
                      <Select
                        value={
                          conditionSelectOptions.find(
                            (o) => o.value === formData.interiorCondition,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("interiorCondition", option?.value || "")
                        }
                        options={conditionSelectOptions}
                        placeholder="Select interior condition"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Suspension Condition
                      </label>
                      <Select
                        value={
                          conditionSelectOptions.find(
                            (o) => o.value === formData.suspensionCondition,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("suspensionCondition", option?.value || "")
                        }
                        options={conditionSelectOptions}
                        placeholder="Select suspension condition"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tire Condition
                      </label>
                      <Select
                        value={
                          tireConditionOptions.find(
                            (o) => o.value === formData.tireCondition,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("tireCondition", option?.value || "")
                        }
                        options={tireConditionOptions}
                        placeholder="Select tire condition"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Paint Status
                      </label>
                      <Select
                        value={
                          paintStatusOptions.find(
                            (o) => o.value === formData.paintStatus,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("paintStatus", option?.value || "")
                        }
                        options={paintStatusOptions}
                        placeholder="Select paint status"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accident History
                      </label>
                      <Select
                        value={
                          accidentHistoryOptions.find(
                            (o) => o.value === formData.accidentHistory,
                          ) || null
                        }
                        onChange={(option) =>
                          setField("accidentHistory", option?.value || "")
                        }
                        options={accidentHistoryOptions}
                        placeholder="Select accident history"
                        isClearable
                        isSearchable={false}
                        theme={customTheme}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="pt-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={(e) => setField("additionalNotes", e.target.value)}
                  placeholder="Any details that may affect valuation..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Review & Estimate
                </h2>
                <p className="text-gray-600 text-sm">
                  Review your inputs and generate AI valuation.
                </p>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700">Make:</span>{" "}
                      <span className="font-semibold">
                        {capitalize(
                          makes.find((m) => m._id === formData.make)?.name ||
                            "-",
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Model:</span>{" "}
                      <span className="font-semibold">
                        {capitalize(
                          availableModels.find((m) => m._id === formData.model)
                            ?.name || "-",
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Year:</span>{" "}
                      <span className="font-semibold">
                        {formData.year || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Mileage:</span>{" "}
                      <span className="font-semibold">
                        {formData.mileage || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Transmission:</span>{" "}
                      <span className="font-semibold capitalize">
                        {formData.transmission || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">City:</span>{" "}
                      <span className="font-semibold">
                        {cities.find((c) => c._id === formData.registrationCity)
                          ?.name || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="h-11 px-4 sm:px-6 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium inline-flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="h-11 flex-1 rounded-lg bg-primary-500 text-white hover:opacity-90 font-semibold inline-flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="h-11 flex-1 rounded-lg bg-primary-500 text-white hover:opacity-90 font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Get AI-Powered Valuation
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-800 mb-2 text-sm">
                  Please fix the following:
                </p>
                <ul className="space-y-1 text-sm text-red-700">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
