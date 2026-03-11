import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { extractCarIdFromSlug } from "../../../utils/urlBuilders";
import {
  useEditCarMutation,
  useGetSingleCarQuery,
  useGetMeQuery,
} from "../../../redux/services/api";
import toast from "react-hot-toast";
import { capitalize } from "../../../utils/formatters";
import { getErrorMessage } from "../../../utils/errorHandler";

import ImagesUpload from "../createPost/ImagesUpload";
import Input from "../../utils/filter/Input";
import SearchableSelect from "../../common/SearchableSelect";
import FilterSpecs from "../../utils/filter/FilterSpecs";
import ExteriorColor from "../../utils/filter/ExteriorColor";
import InteriorColor from "../../utils/filter/InteriorColor";
import { images } from "../../../assets/assets";
import { useCarCategories } from "../../../hooks/useCarCategories";
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

const EditCarForm = () => {
  const { id: routeParam } = useParams();
  const extractedCarId = extractCarIdFromSlug(routeParam);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vehicleType: "Car", // Default vehicle type
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
    city: "",
    location: "",
    contactNumber: "",
    geoLocation: "",
    warranty: "",
    ownerType: "",
    images: [],
    existingImages: [], // URLs of existing images
  });

  // Load car data
  const {
    data: car,
    isLoading: isLoadingCar,
    error: carError,
  } = useGetSingleCarQuery(extractedCarId, {
    skip: !extractedCarId,
  });
  const { data: currentUser } = useGetMeQuery();

  // Filter categories by vehicle type from formData
  const {
    makes,
    models,
    years,
    isLoading: categoriesLoading,
  } = useCarCategories(formData.vehicleType);
  const [selectedMake, setSelectedMake] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [editCar, { isLoading }] = useEditCarMutation();

  const resolveModelsBySelectedMake = (selectedMakeName) => {
    if (!Array.isArray(models) || models.length === 0) return [];
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

  // Populate form when car data loads
  useEffect(() => {
    if (car && car.postedBy) {
      // Check if user owns this car
      const postedById =
        typeof car.postedBy === "object" ? car.postedBy._id : car.postedBy;
      if (
        currentUser &&
        postedById &&
        currentUser._id !== postedById &&
        currentUser.role !== "admin"
      ) {
        toast.error("You don't have permission to edit this car");
        navigate("/my-listings");
        return;
      }

      const geoLoc = car.geoLocation?.coordinates
        ? `[${car.geoLocation.coordinates[0]}, ${car.geoLocation.coordinates[1]}]`
        : "";

      setFormData({
        title: car.title || "",
        description: car.description || "",
        vehicleType: car.vehicleType || "Car", // Include vehicle type
        make: car.make || "",
        model: car.model || "",
        year: car.year?.toString() || "",
        condition: car.condition || "",
        price: car.price?.toString() || "",
        colorExterior: car.colorExterior || "",
        colorInterior: car.colorInterior || "",
        fuelType: car.fuelType || "",
        transmission: car.transmission || "",
        mileage: car.mileage?.toString() || "",
        bodyType: car.bodyType || "",
        city: car.city || "",
        location: car.location || "",
        contactNumber: car.contactNumber || "",
        geoLocation: geoLoc,
        ownerType: car.ownerType || "",
        images: [],
        existingImages: Array.isArray(car.images)
          ? car.images.filter((img) => img)
          : [],
      });

      // Set available models and years based on loaded car
      if (car.make && makes && makes.length > 0) {
        const makeModels = resolveModelsBySelectedMake(car.make);
        if (makeModels.length > 0) {
          setSelectedMake(car.make);
          setAvailableModels(makeModels);

          if (car.model && makeModels.length > 0) {
            const selectedModelObj = makeModels.find(
              (m) => m && m.name === car.model,
            );
            if (
              selectedModelObj &&
              selectedModelObj._id &&
              years &&
              years.length > 0
            ) {
              const modelYears = years.filter((y) => {
                if (!y || !y.parentCategory) return false;
                const parentId =
                  typeof y.parentCategory === "object"
                    ? y.parentCategory?._id || null
                    : y.parentCategory;
                return parentId && parentId === selectedModelObj._id;
              });
              setAvailableYears(modelYears);
            }
          }
        }
      }
    }
  }, [car, makes, models, years, currentUser, navigate]);

  // Initialize available data when car data loads
  useEffect(() => {
    if (car && makes.length > 0) {
      // Set available years - years are now independent
      setAvailableYears(years);
    }
  }, [car, makes, years]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // When vehicle type changes, reset dependent fields
    if (field === "vehicleType") {
      setFormData((prev) => ({
        ...prev,
        make: "",
        model: "",
      }));
      setSelectedMake("");
      setAvailableModels([]);
    }

    if (field === "make") {
      setSelectedMake(value);
      const makeModels = resolveModelsBySelectedMake(value);
      setAvailableModels(makeModels);
      if (
        formData.model &&
        !makeModels.find((m) => m && m.name === formData.model)
      ) {
        setFormData((prev) => ({ ...prev, model: "" }));
      }
    }

    if (field === "model") {
      setAvailableYears(years);
      if (
        formData.year &&
        !years.find((y) => y && y.name === formData.year.toString())
      ) {
        setFormData((prev) => ({ ...prev, year: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields dynamically based on vehicle type
    const requiredFields = getRequiredFields(formData.vehicleType);

    const missing = requiredFields.filter((key) => {
      const value = formData[key];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missing.length) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return;
    }
    if (!/^\+?\d{9,15}$/.test(formData.contactNumber)) {
      toast.error("Invalid contact number. Must be 9-15 digits.");
      return;
    }
    let parsedGeoLocation;
    try {
      parsedGeoLocation = formData.geoLocation
        ? JSON.parse(formData.geoLocation)
        : null;
      if (
        !parsedGeoLocation ||
        !Array.isArray(parsedGeoLocation) ||
        parsedGeoLocation.length !== 2 ||
        parsedGeoLocation[0] === 0 ||
        parsedGeoLocation[1] === 0
      ) {
        toast.error("Invalid geoLocation. Please capture valid coordinates.");
        return;
      }
    } catch {
      toast.error("Invalid geoLocation format. Use [longitude, latitude].");
      return;
    }

    const data = new FormData();
    const defaults = {
      colorExterior: formData.colorExterior || "N/A",
      colorInterior: formData.colorInterior || "N/A",
      mileage: formData.mileage || "0",
      location: formData.location || "",
      description: formData.description || "",
    };

    // Add existing images (URLs) to keep them
    if (formData.existingImages && formData.existingImages.length > 0) {
      formData.existingImages.forEach((imgUrl) => {
        data.append("existingImages[]", imgUrl);
      });
    }

    // Add new image files
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        if (img instanceof File) {
          data.append("images", img);
        }
      });
    }

    // Add other fields (skip removed fields: features, carDoors, horsepower, numberOfCylinders, engineCapacity, regionalSpec)
    const skipKeys = ["images", "existingImages", "features", "carDoors", "horsepower", "numberOfCylinders", "engineCapacity", "regionalSpec"];
    Object.keys(formData).forEach((key) => {
      if (skipKeys.includes(key)) return;
      data.append(
        key,
        defaults[key] !== undefined ? defaults[key] : formData[key],
      );
    });

    try {
      await editCar({ carId: extractedCarId, formData: data }).unwrap();
      toast.success("Car updated successfully!");
      navigate(`/cars/${extractedCarId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 md:px-20 py-12"
      encType="multipart/form-data"
    >
      <h2 className="text-center md:text-3xl font-semibold">Edit Car</h2>
      {isLoadingCar && <p className="text-center">Loading car data...</p>}
      {carError && (
        <p className="text-center text-red-500">Failed to load car data</p>
      )}
      {!isLoadingCar && !car && (
        <p className="text-center text-red-500">Car not found</p>
      )}
      <div className="border-[1px] border-gray-700 rounded-md px-5 py-6 my-5">
        <div className="my-2">
          {/* Display existing images */}
          {formData.existingImages && formData.existingImages.length > 0 && (
            <div className="mb-4">
              <label className="block mb-2">Existing Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.existingImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={imgUrl}
                      alt={`Existing ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          existingImages: prev.existingImages.filter(
                            (_, i) => i !== idx,
                          ),
                        }));
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <label className="block mb-2">Add New Images</label>
          <ImagesUpload
            onImagesChange={(files) => handleChange("images", files)}
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Title</label>
          <Input
            inputType="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g., 2017 Toyota Fortuner V8"
            required
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe the car..."
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="price mt-5 mb-2">
          <label className="block mb-1">Price (PKR)</label>
          <Input
            inputType="number"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="Enter price"
            required
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1">City</label>
          <Input
            inputType="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Enter city"
            required
          />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Contact Number</label>
          <Input
            inputType="tel"
            value={formData.contactNumber}
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            placeholder="e.g., +923134211023"
            required
          />
        </div>

        <div className="flex gap-6 my-2 w-full items-center">
          <div className="w-1/2">
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
          <div className="w-1/2">
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
        </div>

        <div className="flex gap-6 my-2 w-full items-center">
          <div className="w-1/2">
            <label className="block mb-1">Year *</label>
            <SearchableSelect
              value={formData.year}
              onChange={(value) => handleChange("year", value)}
              options={
                availableYears.length > 0
                  ? availableYears.map((year) => ({
                      value: year.name,
                      label: year.name,
                    }))
                  : Array.from(
                      { length: new Date().getFullYear() - 1989 },
                      (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return {
                          value: year,
                          label: year.toString(),
                        };
                      },
                    )
              }
              placeholder="Select Year"
              disabled={categoriesLoading || !formData.model}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-1">Mileage (km)</label>
            <Input
              inputType="number"
              value={formData.mileage}
              onChange={(e) => handleChange("mileage", e.target.value)}
              placeholder="e.g., 50000"
            />
          </div>
        </div>

        {isFieldVisible(formData.vehicleType, "bodyType") && (
          <div>
            <label className="block mb-1">Body Type</label>
            <FilterSpecs specType="bodyTypes" vehicleType={formData.vehicleType} value={formData.bodyType} onChange={(val) => handleChange("bodyType", val)} />
          </div>
        )}

        {isFieldVisible(formData.vehicleType, "fuelType") && (
          <div>
            <label className="block mb-1">Fuel Type</label>
            <FilterSpecs specType="fuelType" vehicleType={formData.vehicleType} value={formData.fuelType} onChange={(val) => handleChange("fuelType", val)} />
          </div>
        )}

        {isFieldVisible(formData.vehicleType, "transmission") && (
          <div>
            <label className="block mb-1">Transmission</label>
            <FilterSpecs specType="transmissionType" value={formData.transmission} onChange={(val) => handleChange("transmission", val)} />
          </div>
        )}

        <div>
          <ExteriorColor
            value={formData.colorExterior}
            onChange={(val) => handleChange("colorExterior", val)}
          />
        </div>

        <div>
          <InteriorColor
            value={formData.colorInterior}
            onChange={(val) => handleChange("colorInterior", val)}
          />
        </div>

        <div>
          <label className="block mb-1">Owner Type</label>
          <FilterSpecs specType="ownerType" value={formData.ownerType} onChange={(val) => handleChange("ownerType", val)} />
        </div>

        <div>
          <label className="block mb-1">Warranty</label>
          <FilterSpecs specType="warrantyType" value={formData.warranty} onChange={(val) => handleChange("warranty", val)} />
        </div>

        <div>
          <label className="block mb-1">Condition</label>
          <FilterSpecs specType="condition" value={formData.condition} onChange={(val) => handleChange("condition", val)} />
        </div>

        <div className="mb-2">
          <label className="block mb-1">Address</label>
          <Input
            inputType="text"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Enter address"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-500 text-white px-4 my-5 py-2 rounded hover:opacity-90 transition-colors w-full text-xl shadow-lg shadow-gray-400 font-semibold disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Car"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditCarForm;
