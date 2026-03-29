import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCreateCarMutation } from "../../../redux/services/api";
import { api } from "../../../redux/services/api";
import { capitalize } from "../../../utils/formatters";
import { getErrorMessage } from "../../../utils/errorHandler";

import ImagesUpload from "../createPost/ImagesUpload";
import Input from "../../utils/filter/Input";
import SearchableSelect from "../../common/SearchableSelect";
import FilterSpecs from "../../utils/filter/FilterSpecs";
import ExteriorColor from "../../utils/filter/ExteriorColor";
import InteriorColor from "../../utils/filter/InteriorColor";
import { useCarCategories } from "../../../hooks/useCarCategories";
import LocationButton from "../../utils/filter/LocationButton";
import {
  isFieldVisible,
  getRequiredFields,
} from "../../../utils/vehicleFieldConfig";

// Helper function to get dynamic labels based on vehicle type
const getVehicleLabel = (vehicleType, fieldType) => {
  const vehicleName = vehicleType || "Vehicle";
  if (fieldType === "make") {
    return `${vehicleName} Make`;
  } else if (fieldType === "model") {
    return `${vehicleName} Model`;
  }
  return `${vehicleName} ${fieldType}`;
};

const parseRangeLikeNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const normalized = String(value).replace(/,/g, "").trim();
  const matches = normalized.match(/\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) return "";

  const numbers = matches.map(Number).filter((n) => Number.isFinite(n));
  if (numbers.length === 0) return "";
  if (numbers.length >= 2 && normalized.includes("-")) {
    return Math.round((numbers[0] + numbers[1]) / 2);
  }
  return numbers[0];
};

const CreatePostForm = ({ initialPrefill = null }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appliedPrefillKeyRef = useRef(null);
  const submitLockRef = useRef(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vehicleType: "Car", // Default to Car
    vehicleTypeCategory: "", // Category ID reference
    listingType: "Regular Listing", // Default to Regular Listing
    make: "",
    model: "",
    variant: "",
    year: "",
    condition: "",
    price: "",
    colorExterior: "",
    colorInterior: "",
    fuelType: "",
    transmission: "",
    mileage: "",
    bodyType: "",
    country: "",
    city: "",
    location: "",
    contactNumber: "",
    whatsappNumber: "",
    geoLocation: "",
    warranty: "",
    ownerType: "",
    batteryRange: "",
    motorPower: "",
    images: [],
  });

  // Makes/models scoped by vehicle type (years still from separate year-only query in hook)
  const {
    makes,
    models,
    years,
    countries,
    cities,
    getCitiesByCountry,
    isLoading: categoriesLoading,
  } = useCarCategories(formData.vehicleType || null);

  const [createCar, { isLoading }] = useCreateCarMutation();

  const resolveModelsBySelectedMake = (selectedMakeName) => {
    if (!Array.isArray(models) || models.length === 0) return [];
    // No make selected → no models (avoid showing every model in the dropdown)
    if (!selectedMakeName || !String(selectedMakeName).trim()) return [];

    const normalizedMake = String(selectedMakeName).trim().toLowerCase();
    const matchedMakeIds = (makes || [])
      .filter(
        (make) =>
          String(make?.name || "")
            .trim()
            .toLowerCase() === normalizedMake,
      )
      .map((make) => String(make?._id || ""));

    if (matchedMakeIds.length === 0) return [];

    return models.filter((model) => {
      const parent =
        typeof model?.parentCategory === "object" &&
        model?.parentCategory !== null
          ? model.parentCategory._id
          : model?.parentCategory;
      return matchedMakeIds.includes(String(parent || ""));
    });
  };

  // Apply prefill (from estimator or inspiration pills) when the form is ready.
  // For inspiration pills, we should not block on `makes` being loaded.
  useEffect(() => {
    if (!initialPrefill) return;

    const prefillKey = JSON.stringify(initialPrefill);
    if (appliedPrefillKeyRef.current === prefillKey) return;

    const hasMakeOrModel =
      Boolean(initialPrefill.make) || Boolean(initialPrefill.model);
    const makeReady = Array.isArray(makes) && makes.length > 0;

    // If prefill wants make/model, we wait until `makes` data exists.
    if (hasMakeOrModel && !makeReady) return;

    appliedPrefillKeyRef.current = prefillKey;
    setFormData((prev) => ({
      ...prev,
      make: (initialPrefill.make && String(initialPrefill.make).trim()) || prev.make,
      model: (initialPrefill.model && String(initialPrefill.model).trim()) || prev.model,
      variant: (initialPrefill.variant && String(initialPrefill.variant).trim()) || prev.variant,
      year: (initialPrefill.year && String(initialPrefill.year).trim()) || prev.year,
      fuelType: (initialPrefill.fuelType && String(initialPrefill.fuelType).trim()) || prev.fuelType,
      transmission: (initialPrefill.transmission && String(initialPrefill.transmission).trim()) || prev.transmission,
      condition: (initialPrefill.condition && String(initialPrefill.condition).trim()) || prev.condition,
      mileage: (initialPrefill.mileage != null && initialPrefill.mileage !== "")
        ? String(initialPrefill.mileage).trim()
        : prev.mileage,
      bodyType: (initialPrefill.bodyType && String(initialPrefill.bodyType).trim()) || prev.bodyType,
    }));
  }, [initialPrefill, makes]);

  // Initialize available models - optimized with useMemo-like logic
  useEffect(() => {
    setAvailableModels(resolveModelsBySelectedMake(formData.make));
  }, [formData.make, makes, models]);

  // Initialize available years - years are now independent
  useEffect(() => {
    setAvailableYears(years);
  }, [years]);

  // Initialize available cities - optimized
  useEffect(() => {
    if (!formData.country || countries.length === 0) {
      setAvailableCities(cities);
      return;
    }

    const selectedCountryObj = countries.find(
      (c) => c.name === formData.country,
    );
    if (selectedCountryObj && getCitiesByCountry[selectedCountryObj._id]) {
      const countryCities = getCitiesByCountry[selectedCountryObj._id];
      setAvailableCities(countryCities.length > 0 ? countryCities : cities);
    } else {
      setAvailableCities(cities);
    }
  }, [formData.country, countries, cities, getCitiesByCountry]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

      // When vehicle type changes, reset dependent fields
      if (field === "vehicleType") {
        setFormData((prev) => ({
          ...prev,
          make: "", // Reset make when vehicle type changes
          model: "", // Reset model when vehicle type changes
        }));
        // Reset available models when vehicle type changes (make/model cleared)
        setAvailableModels([]);
      }

      // When make changes, update available models
      if (field === "make") {
        const makeModels = resolveModelsBySelectedMake(value);
        setAvailableModels(makeModels);
        if (
          formData.model &&
          makeModels.length > 0 &&
          !makeModels.find((m) => m.name === formData.model)
        ) {
          setFormData((prev) => ({ ...prev, model: "" }));
        }
      }

      // When model changes, years are independent - don't filter years
      if (field === "model") {
        // Years are now independent - always show all years
        setAvailableYears(years);
        // No need to reset year since all years are available for all models
      }

      // When country changes, update available cities
      if (field === "country") {
        if (value) {
          const selectedCountryObj = countries.find((c) => c.name === value);
          if (selectedCountryObj) {
            const countryCities =
              getCitiesByCountry[selectedCountryObj._id] || [];
            setAvailableCities(
              countryCities.length > 0 ? countryCities : cities,
            );
            // Reset city if it's not available for the new country
            if (
              formData.city &&
              countryCities.length > 0 &&
              !countryCities.find((c) => c.name === formData.city)
            ) {
              setFormData((prev) => ({ ...prev, city: "" }));
            }
          } else {
            setAvailableCities(cities);
          }
        } else {
          // Show all cities when country is cleared
          setAvailableCities(cities);
        }
      }
  };

  const prepareFormData = () => {
    // geolocation logic
    let parsedGeoLocation = null;
    if (formData.geoLocation) {
      try {
        if (Array.isArray(formData.geoLocation)) {
          parsedGeoLocation = formData.geoLocation;
        } else if (
          typeof formData.geoLocation === "string" &&
          formData.geoLocation.trim()
        ) {
          parsedGeoLocation = JSON.parse(formData.geoLocation);
        }
      } catch {
        parsedGeoLocation = null;
      }

      if (
        parsedGeoLocation &&
        (!Array.isArray(parsedGeoLocation) ||
          parsedGeoLocation.length !== 2 ||
          Number(parsedGeoLocation[0]) === 0 ||
          Number(parsedGeoLocation[1]) === 0 ||
          Number.isNaN(Number(parsedGeoLocation[0])) ||
          Number.isNaN(Number(parsedGeoLocation[1])))
      ) {
        parsedGeoLocation = null;
      }
    }

    if (!parsedGeoLocation) {
      parsedGeoLocation = [73.4948311, 30.8303661]; // [longitude, latitude] for Okara, Pakistan
    }

    const data = new FormData();

    // Only set defaults for fields that are visible for this vehicle type
    const defaults = {
      colorExterior: formData.colorExterior || "N/A",
      colorInterior: formData.colorInterior || "N/A",
      mileage: formData.mileage || "0",
      location: formData.location || "",
      description: formData.description || "",
    };

    // Optimize FormData construction - build in single pass
    // Add images first
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        if (img instanceof File) {
          data.append("images", img);
        }
      });
    }

    // Add all other fields efficiently
    const fieldsToAppend = [
      "title",
      "description",
      "vehicleType",
      "make",
      "model",
      "variant",
      "year",
      "condition",
      "price",
      "colorExterior",
      "colorInterior",
      "fuelType",
      "transmission",
      "mileage",
      "bodyType",
      "country",
      "city",
      "location",
      "contactNumber",
      "whatsappNumber",
      "geoLocation",
      "warranty",
      "ownerType",
      "batteryRange",
      "motorPower",
    ];

    // Add vehicleTypeCategory if provided
    if (formData.vehicleTypeCategory) {
      data.append("vehicleTypeCategory", formData.vehicleTypeCategory);
    }

    fieldsToAppend.forEach((key) => {
      // Special handling for geoLocation - always append (will use default if not provided)
      if (key === "geoLocation") {
        // Always append geoLocation (parsedGeoLocation is guaranteed to have a value - either from form or default)
        data.append(key, JSON.stringify(parsedGeoLocation));
      } else {
        // Check if field should be sent based on visibility
        let shouldSend = true;

        // Don't send fields that aren't visible for this vehicle type
        if (
          key === "fuelType" &&
          !isFieldVisible(formData.vehicleType, "fuelType")
        ) {
          shouldSend = false;
        } else if (
          key === "transmission" &&
          !isFieldVisible(formData.vehicleType, "transmission")
        ) {
          shouldSend = false;
        } else if (
          key === "bodyType" &&
          !isFieldVisible(formData.vehicleType, "bodyType")
        ) {
          shouldSend = false;
        } else if (
          key === "batteryRange" &&
          !isFieldVisible(formData.vehicleType, "batteryRange")
        ) {
          shouldSend = false;
        } else if (
          key === "motorPower" &&
          !isFieldVisible(formData.vehicleType, "motorPower")
        ) {
          shouldSend = false;
        } else if (
          (key === "warranty" || key === "ownerType") &&
          formData.vehicleType !== "Car" &&
          formData.vehicleType !== "Motorcycle"
        ) {
          shouldSend = false;
        } else if (
          (key === "colorExterior" || key === "colorInterior") &&
          formData.vehicleType !== "Car"
        ) {
          shouldSend = false;
        }

        if (shouldSend) {
          const value =
            defaults[key] !== undefined ? defaults[key] : formData[key];
          if (value !== null && value !== undefined && value !== "") {
            data.append(key, String(value));
          }
        }
      }
    });

    return data;
  };

  const handleForceCreate = async () => {
    if (submitLockRef.current || isLoading) return;
    submitLockRef.current = true;
    try {
      const data = prepareFormData();
      // Send force=true param
      const res = await createCar({
        formData: data,
        params: { force: true },
      }).unwrap();

      if (res.message && res.message.includes("upgraded")) {
        toast.success(res.message, { duration: 5000 });
      } else {
        toast.success("Car post created successfully!");
      }

      if (res.data?.user) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser) {
          currentUser.role = res.data.user.role;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        vehicleType: "Car",
        vehicleTypeCategory: "",
        make: "",
        model: "",
        variant: "",
        year: "",
        condition: "",
        price: "",
        colorExterior: "",
        colorInterior: "",
        fuelType: "",
        transmission: "",
        mileage: "",
        bodyType: "",
        country: "",
        city: "",
        location: "",
        contactNumber: "",
        whatsappNumber: "",
        geoLocation: "",
        warranty: "",
        ownerType: "",
        batteryRange: "",
        motorPower: "",
        images: [],
      });
      setAvailableModels([]);
      setAvailableYears([]);
      setAvailableCities([]);
      setShowDuplicateWarning(false);
      setDuplicateInfo(null);

      // Ensure listing pages get fresh data before route change.
      dispatch(api.util.invalidateTags(["Cars"]));
      dispatch(api.util.prefetch("getMyCars", {}, { force: true }));
      navigate(`/my-listings`);
    } catch (err) {
      if (err?.status === 401) {
        toast.error("Please sign in again to continue.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      if (
        err?.data?.message &&
        (err?.status === 400 || err?.status === 503)
      ) {
        toast.error(err.data.message);
        return;
      }
      toast.error(getErrorMessage(err));
    } finally {
      submitLockRef.current = false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || isLoading) return;

    // Early validation - check images first (most common issue)
    if (!formData.images || formData.images.length === 0) {
      toast.error(
        "Add at least one listing photo. You can upload up to 15 images (8MB total)."
      );
      return;
    }

    // Validate required fields dynamically based on vehicle type
    const requiredFields = getRequiredFields(formData.vehicleType);

    const missing = requiredFields.filter((key) => {
      const value = formData[key];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missing.length) {
      const labels = missing.map((key) => capitalize(key.replace(/([A-Z])/g, " $1").trim()));
      toast.error(`Please fill in: ${labels.join(", ")}`);
      return;
    }

    // Validate price
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price (must be greater than 0)");
      return;
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(formData.year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      toast.error(`Year must be between 1900 and ${currentYear + 1}`);
      return;
    }

    // Validate contact number
    if (!/^\+?\d{9,15}$/.test(formData.contactNumber)) {
      toast.error("Invalid contact number. Must be 9-15 digits.");
      return;
    }
    if (formData.whatsappNumber && !/^\+?\d{9,15}$/.test(formData.whatsappNumber)) {
      toast.error("Invalid WhatsApp number. Must be 9-15 digits or leave empty.");
      return;
    }

    submitLockRef.current = true;
    const data = prepareFormData();

    try {
      const res = await createCar(data).unwrap();

      // Show success message (may include upgrade notification)
      if (res.message && res.message.includes("upgraded")) {
        toast.success(res.message, { duration: 5000 });
      } else {
        toast.success("Car post created successfully!");
      }

      // Update user data if role was upgraded
      if (res.data?.user) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser) {
          currentUser.role = res.data.user.role;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      }

      setFormData({
        title: "",
        description: "",
        vehicleType: "Car",
        vehicleTypeCategory: "",
        make: "",
        model: "",
        year: "",
        condition: "",
        price: "",
        colorExterior: "",
        colorInterior: "",
        fuelType: "",
        transmission: "",
        mileage: "",
        bodyType: "",
        country: "",
        city: "",
        location: "",
        contactNumber: "",
        whatsappNumber: "",
        geoLocation: "",
        warranty: "",
        ownerType: "",
        batteryRange: "",
        motorPower: "",
        images: [],
      });
      setAvailableModels([]);
      setAvailableYears([]);
      setAvailableCities([]);

      // Ensure listing pages get fresh data before route change.
      dispatch(api.util.invalidateTags(["Cars"]));
      dispatch(api.util.prefetch("getMyCars", {}, { force: true }));
      navigate(`/my-listings`);
    } catch (err) {
      // Handle duplicate warning (409 Conflict) – let modal handle it
      if (err.status === 409 && err.data?.duplicateWarning) {
        setDuplicateInfo(err.data);
        setShowDuplicateWarning(true);
        return;
      }

      const errorMessage = getErrorMessage(err);

      // Session expired – redirect to login
      if (err?.status === 401) {
        toast.error("Please sign in again to continue.");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Show backend message for validation or image service busy (503)
      if (
        err?.data?.message &&
        (err.status === 400 || err.status === 503)
      ) {
        const msg = err.data.message;
        if (msg.startsWith("Missing:")) {
          toast.error("Please fill in all required fields and try again.");
        } else {
          toast.error(msg);
        }
        return;
      }

      toast.error(errorMessage);
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="py-8 md:py-10"
      encType="multipart/form-data"
    >
      <h2 className="text-center md:text-3xl font-semibold">Create Post</h2>

      {/* Duplicate Warning Modal */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Similar Listing Found
            </h3>
            <p className="text-gray-600 mb-4">
              {duplicateInfo?.message ||
                "It looks like you have already posted a similar listing recently."}
            </p>

            {duplicateInfo?.similarListings?.length > 0 && (
              <div className="mb-4 bg-gray-50 p-3 rounded">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  EXISTING LISTING:
                </p>
                {duplicateInfo.similarListings.map((listing) => (
                  <div key={listing._id} className="text-sm">
                    <span className="font-medium text-gray-900">
                      {listing.title}
                    </span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-primary-600 font-medium">
                      PKR {listing.price?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowDuplicateWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForceCreate}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isLoading ? "Creating..." : "Post Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Type Selection - Top of Form */}
      <div className="mb-6">
        <label className="block mb-3 text-center font-medium">
          Vehicle Type *
        </label>
        <div className="flex justify-center gap-3 flex-wrap">
          {["Car", "Bus", "Truck", "Van", "Bike", "E-bike", "Farm"].map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const newVehicleType = type;
                  handleChange("vehicleType", newVehicleType);
                  // Reset vehicleTypeCategory when vehicleType changes
                  handleChange("vehicleTypeCategory", "");

                  // Clear fields that are not visible for the new vehicle type
                  if (!isFieldVisible(newVehicleType, "bodyType")) {
                    handleChange("bodyType", "");
                    setAvailableModels([]);
                    setAvailableCities([]);
                  }
                  if (!isFieldVisible(newVehicleType, "fuelType")) {
                    handleChange("fuelType", "");
                  }
                  if (!isFieldVisible(newVehicleType, "transmission")) {
                    handleChange("transmission", "");
                  }
                }}
                className={`group relative px-5 py-1.5 rounded font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  formData.vehicleType === type
                    ? "bg-primary-500 text-black shadow-lg shadow-primary-500/25 ring-2 ring-primary-500 ring-offset-2"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:shadow-md hover:bg-primary-50"
                }`}
              >
                {type}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="border-[1px] border-gray-700 rounded-md px-5 py-5 my-4">
        <div className="my-2">
          <ImagesUpload
            onImagesChange={(files) => handleChange("images", files)}
          />
        </div>

        {/* Title - Full Width */}
        <div className="mb-2 pl-2">
          <label className="block mb-1">Title</label>
          <Input
            inputType="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g., 2017 Toyota Fortuner V8"
            required
          />
        </div>

        {/* Make, Model, Year, Variant */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2 pl-2">
          <div>
            <label className="block mb-1">
              {getVehicleLabel(formData.vehicleType, "make")} *
            </label>
            <SearchableSelect
              value={formData.make}
              onChange={(value) => handleChange("make", value)}
              options={makes.map((make) => ({
                value: make.name,
                label: capitalize(make.name),
              }))}
              placeholder={
                !formData.vehicleType
                  ? "Select vehicle type first"
                  : categoriesLoading
                    ? "Loading..."
                    : "Select Make"
              }
              disabled={!formData.vehicleType || categoriesLoading}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">
              {getVehicleLabel(formData.vehicleType, "model")} *
            </label>
            <SearchableSelect
              value={formData.model}
              onChange={(value) => handleChange("model", value)}
              options={availableModels.map((model) => ({
                value: model.name,
                label: capitalize(model.name),
              }))}
              placeholder={
                !formData.vehicleType
                  ? "Select vehicle type first"
                  : !formData.make
                    ? "Select make first"
                    : categoriesLoading
                      ? "Loading..."
                      : availableModels.length === 0
                        ? "No models for this make"
                        : "Select Model"
              }
              disabled={
                !formData.vehicleType ||
                !formData.make ||
                categoriesLoading
              }
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Year *</label>
            <SearchableSelect
              value={formData.year}
              onChange={(value) => handleChange("year", value)}
              options={availableYears.map((year) => ({
                value: year.name,
                label: year.name,
              }))}
              placeholder={
                categoriesLoading
                  ? "Loading..."
                  : availableYears.length === 0
                    ? "No years available (add in admin)"
                    : "Select Year"
              }
              disabled={categoriesLoading}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Variant</label>
            <Input
              inputType="text"
              value={formData.variant}
              onChange={(e) => handleChange("variant", e.target.value)}
              placeholder="e.g., VTi Oriel"
            />
          </div>
        </div>

        {["Bus", "Car"].includes(formData.vehicleType) ? (
          <>
            <div className="mb-2 pl-2">
              <label className="block mb-1">Price (PKR)</label>
              <Input
                inputType="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 pl-2">
              <div>
                <label className="block mb-1">Phone Number</label>
                <Input
                  inputType="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange("contactNumber", e.target.value)}
                  placeholder="e.g., +923134211023"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">
                  WhatsApp Number
                  <button
                    type="button"
                    onClick={() => handleChange("whatsappNumber", formData.contactNumber)}
                    className="ml-2 text-sm font-normal text-primary-500 hover:text-primary-600 hover:underline focus:outline-none"
                  >
                    Same as Phone
                  </button>
                </label>
                <Input
                  inputType="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="Optional, e.g., +923134211023"
                />
              </div>
              <div>
                <label className="block mb-1">Mileage (km)</label>
                <Input
                  inputType="number"
                  value={formData.mileage}
                  onChange={(e) => handleChange("mileage", e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Price - Full Width */}
            <div className="mb-2 pl-2">
              <label className="block mb-1">Price (PKR)</label>
              <Input
                inputType="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>

            {/* Phone Number, WhatsApp Number, Mileage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 pl-2">
              <div>
                <label className="block mb-1">Phone Number</label>
                <Input
                  inputType="tel"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleChange("contactNumber", e.target.value)
                  }
                  placeholder="e.g., +923134211023"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">
                  WhatsApp Number
                  <button
                    type="button"
                    onClick={() => handleChange("whatsappNumber", formData.contactNumber)}
                    className="ml-2 text-sm font-normal text-primary-500 hover:text-primary-600 hover:underline focus:outline-none"
                  >
                    Same as Phone
                  </button>
                </label>
                <Input
                  inputType="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    handleChange("whatsappNumber", e.target.value)
                  }
                  placeholder="Optional, e.g., +923134211023"
                />
              </div>
              <div>
                <label className="block mb-1">Mileage (km)</label>
                <Input
                  inputType="number"
                  value={formData.mileage}
                  onChange={(e) => handleChange("mileage", e.target.value)}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
          </>
        )}

        {/* Country, City, Address in same row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 pl-2">
          <div>
            <label className="block mb-1">Country</label>
            <SearchableSelect
              value={formData.country || ""}
              onChange={(value) => handleChange("country", value)}
              options={countries.map((country) => ({
                value: country.name,
                label: country.name,
              }))}
              placeholder="Select Country"
              disabled={categoriesLoading}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">City</label>
            <SearchableSelect
              value={formData.city}
              onChange={(value) => handleChange("city", value)}
              options={availableCities.map((city) => ({
                value: city.name,
                label: city.name,
              }))}
              placeholder={
                categoriesLoading
                  ? "Loading..."
                  : availableCities.length === 0
                    ? "No cities available"
                    : formData.country
                      ? "Select City"
                      : "Select City (or select Country to filter)"
              }
              disabled={categoriesLoading}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Address</label>
            <Input
              inputType="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Enter address"
            />
          </div>
        </div>

        {/* Condition - Full Width */}
        <div className="mb-2 pl-2">
          <label className="block mb-1">Condition</label>
          <FilterSpecs specType="condition" value={formData.condition} onChange={(val) => handleChange("condition", val)} />
        </div>

        {/* Fuel Type - Full Width */}
        {isFieldVisible(formData.vehicleType, "fuelType") && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Fuel Type</label>
            <FilterSpecs specType="fuelType" vehicleType={formData.vehicleType} value={formData.fuelType} onChange={(val) => handleChange("fuelType", val)} />
          </div>
        )}

        {/* Body Type - Full Width */}
        {isFieldVisible(formData.vehicleType, "bodyType") && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Body Type</label>
            <FilterSpecs specType="bodyTypes" vehicleType={formData.vehicleType} value={formData.bodyType} onChange={(val) => handleChange("bodyType", val)} />
          </div>
        )}

        {/* Transmission - Full Width */}
        {isFieldVisible(formData.vehicleType, "transmission") && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Transmission</label>
            <FilterSpecs specType="transmissionType" value={formData.transmission} onChange={(val) => handleChange("transmission", val)} />
          </div>
        )}

        {/* Exterior Color - Full Width */}
        {formData.vehicleType === "Car" && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Exterior Color</label>
            <ExteriorColor
              value={formData.colorExterior}
              onChange={(val) => handleChange("colorExterior", val)}
            />
          </div>
        )}

        {/* Interior Color - Full Width */}
        {formData.vehicleType === "Car" && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Interior Color</label>
            <InteriorColor
              value={formData.colorInterior}
              onChange={(val) => handleChange("colorInterior", val)}
            />
          </div>
        )}

        {/* Owner Type - Full Width */}
        {formData.vehicleType === "Car" && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Owner Type</label>
            <FilterSpecs specType="ownerType" value={formData.ownerType} onChange={(val) => handleChange("ownerType", val)} />
          </div>
        )}

        {/* Warranty - Full Width */}
        {formData.vehicleType === "Car" && (
          <div className="mb-2 pl-2">
            <label className="block mb-1">Warranty</label>
            <FilterSpecs specType="warrantyType" value={formData.warranty} onChange={(val) => handleChange("warranty", val)} />
          </div>
        )}

        {isFieldVisible(formData.vehicleType, "batteryRange") && (
          <div className="pl-2">
            <label className="block mb-1">Battery Range (km)</label>
            <Input
              inputType="number"
              value={formData.batteryRange}
              onChange={(e) => handleChange("batteryRange", e.target.value)}
              placeholder="e.g., 50"
            />
          </div>
        )}

        {isFieldVisible(formData.vehicleType, "motorPower") && (
          <div className="pl-2">
            <label className="block mb-1">Motor Power (W)</label>
            <Input
              inputType="number"
              value={formData.motorPower}
              onChange={(e) => handleChange("motorPower", e.target.value)}
              placeholder="e.g., 250"
            />
          </div>
        )}

        {/* Location Picker - Like Uber (Before Description) */}
        <div className="mb-2 pl-2">
          <label className="block mb-1">Location *</label>
          <LocationButton
            value={formData.geoLocation}
            onChange={(locationData) => {
              // LocationButton returns { coordinates: {lat, lng}, address, formatted, backendFormat }
              if (locationData?.backendFormat) {
                handleChange("geoLocation", locationData.backendFormat);
              } else if (locationData?.coordinates) {
                // Fallback: Convert to [longitude, latitude] format for backend
                const coords = [
                  locationData.coordinates.lng,
                  locationData.coordinates.lat,
                ];
                handleChange("geoLocation", JSON.stringify(coords));
              }
              // Also update location address if provided
              if (locationData.address) {
                handleChange("location", locationData.address);
              }
            }}
            placeholder="Select location on map or use current location"
          />
        </div>

        <div className="mt-2 mb-2 pl-2">
          <label className="block mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={
              formData.vehicleType === "Car"
                ? "Describe the car..."
                : "Describe the vehicle..."
            }
            rows={3}
            className="w-full p-2 border rounded resize-y"
          />
        </div>

        <div className="p-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-500 text-white px-8 py-2 rounded-lg hover:bg-opacity-90 transition-colors w-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md"
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreatePostForm;
