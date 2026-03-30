import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { extractCarIdFromSlug } from "../../../utils/urlBuilders";
import {
  useEditCarMutation,
  useGetSingleCarQuery,
  useGetMeQuery,
  useGetMyAuctionSubmissionByCarQuery,
  useUpdateMyAuctionSubmissionByCarMutation,
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
import { useCarCategories } from "../../../hooks/useCarCategories";
import {
  isFieldVisible,
  getRequiredFields,
} from "../../../utils/vehicleFieldConfig";

const MAX_AUCTION_INSPECTION_REPORT_BYTES = 10 * 1024 * 1024; // 10MB

const splitList = (value) =>
  String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatGeoLocation = (geoLocation) => {
  if (!geoLocation?.coordinates?.length) return "";
  return JSON.stringify({
    type: "Point",
    coordinates: geoLocation.coordinates,
  });
};

const getVehicleLabel = (vehicleType, fieldType) => {
  const vehicleName = vehicleType || "Vehicle";
  if (fieldType === "make") {
    return `${vehicleName} Make`;
  } else if (fieldType === "model") {
    return `${vehicleName} Model`;
  }
  return `${vehicleName} ${fieldType}`;
};

const EditCarForm = () => {
  const { id: routeParam } = useParams();
  const extractedCarId = extractCarIdFromSlug(routeParam);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuction = location.pathname.includes("edit-auction-car");
  const { data: currentUser } = useGetMeQuery();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    vehicleType: "Car",
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
    whatsappNumber: "",
    geoLocation: "",
    warranty: "",
    ownerType: "",
    images: [],
    existingImages: [],
    // Auction specific
    startingBid: "",
    reservePrice: "",
    buyNowPrice: "",
    existingDamageImageUrls: [],
    damageImages: [],
    existingDocumentUrls: [],
    documents: [],
    existingInspectionReportPdfUrl: "",
    inspectionReportFile: null,
    featuresText: "",
    videoUrlsText: "",
    auctionTitle: "",
    auctionStatus: "",
    submissionStatus: "",
    isNewImageCover: false,
  });

  // Load car data correctly depending on mode
  const {
    data: regularCar,
    isLoading: isLoadingRegularCar,
    error: regularCarError,
  } = useGetSingleCarQuery(extractedCarId, {
    skip: !extractedCarId || isAuction,
  });

  const {
    data: auctionData,
    isLoading: isLoadingSubmission,
    error: submissionError,
  } = useGetMyAuctionSubmissionByCarQuery(extractedCarId, {
    skip: !extractedCarId || !isAuction,
  });

  const [editCar, { isLoading: isSavingRegular }] = useEditCarMutation();
  const [updateAuctionSubmission, { isLoading: isSavingAuction }] =
    useUpdateMyAuctionSubmissionByCarMutation();

  const isLoadingCar = isAuction ? isLoadingSubmission : isLoadingRegularCar;
  const carError = isAuction ? submissionError : regularCarError;
  const isLoading = isAuction ? isSavingAuction : isSavingRegular;

  const activeCar = isAuction ? (auctionData?.car || auctionData?.auctionCar?.car) : regularCar;
  const activeAuction = isAuction ? auctionData?.auctionCar : null;

  // Filter categories by vehicle type from formData
  const {
    makes,
    models,
    years,
    isLoading: categoriesLoading,
  } = useCarCategories(isAuction ? "Car" : formData.vehicleType);

  const [selectedMake, setSelectedMake] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

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

  const yearOptions = useMemo(() => {
    if (Array.isArray(availableYears) && availableYears.length > 0) {
      return availableYears.map((year) => ({
        value: year.name,
        label: year.name,
      }));
    }
    return Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: String(year), label: String(year) };
    });
  }, [availableYears]);

  // Populate form when data loads
  useEffect(() => {
    if (activeCar) {
      if (!isAuction && activeCar.postedBy) {
        // Verification for regular edits
        const postedById =
          typeof activeCar.postedBy === "object" ? activeCar.postedBy._id : activeCar.postedBy;
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
      }

      const geoLoc = isAuction 
        ? formatGeoLocation(activeCar.geoLocation) 
        : (activeCar.geoLocation?.coordinates
          ? `[${activeCar.geoLocation.coordinates[0]}, ${activeCar.geoLocation.coordinates[1]}]`
          : "");

      setFormData({
        title: activeCar.title || "",
        description: activeCar.description || "",
        vehicleType: isAuction ? "Car" : (activeCar.vehicleType || "Car"),
        make: activeCar.make || "",
        model: activeCar.model || "",
        year: activeCar.year?.toString() || "",
        condition: activeCar.condition || (isAuction ? "Used" : ""),
        price: activeCar.price?.toString() || "",
        colorExterior: activeCar.colorExterior || "",
        colorInterior: activeCar.colorInterior || "",
        fuelType: activeCar.fuelType || "",
        transmission: activeCar.transmission || "",
        mileage: activeCar.mileage?.toString() || "",
        bodyType: activeCar.bodyType || "",
        city: activeCar.city || "",
        location: activeCar.location || "",
        contactNumber: activeCar.contactNumber || "",
        whatsappNumber: activeCar.whatsappNumber || "",
        geoLocation: geoLoc,
        warranty: activeCar.warranty || "",
        ownerType: activeCar.ownerType || "",
        existingImages: Array.isArray(activeCar.images) ? activeCar.images.filter(Boolean) : [],
        images: [],
        
        // Auction fields fallback safely if not in auction mode
        startingBid: activeAuction?.startingBid?.toString() || "",
        reservePrice:
          activeAuction?.reservePrice !== null && activeAuction?.reservePrice !== undefined
            ? String(activeAuction.reservePrice)
            : "",
        existingDamageImageUrls: Array.isArray(activeAuction?.damageImageUrls)
          ? activeAuction.damageImageUrls.filter(Boolean)
          : [],
        damageImages: [],
        existingDocumentUrls: Array.isArray(activeAuction?.documentUrls)
          ? activeAuction.documentUrls.filter(Boolean)
          : [],
        documents: [],
        existingInspectionReportPdfUrl: activeAuction?.inspectionReportPdfUrl || "",
        inspectionReportFile: null,
        featuresText: Array.isArray(activeCar.features) ? activeCar.features.join(", ") : "",
        videoUrlsText: Array.isArray(activeAuction?.videoUrls)
          ? activeAuction.videoUrls.join("\n")
          : "",
        auctionTitle: activeAuction?.auction?.title || "",
        auctionStatus: activeAuction?.auction?.status || "",
        submissionStatus: activeAuction?.status || "",
      });

      if (activeCar.make && makes && makes.length > 0) {
        const makeModels = resolveModelsBySelectedMake(activeCar.make);
        if (makeModels.length > 0) {
          setSelectedMake(activeCar.make);
          setAvailableModels(makeModels);

          if (activeCar.model && makeModels.length > 0 && !isAuction) {
            const selectedModelObj = makeModels.find((m) => m && m.name === activeCar.model);
            if (selectedModelObj && selectedModelObj._id && years && years.length > 0) {
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
  }, [activeCar, activeAuction, makes, models, years, currentUser, navigate, isAuction]);

  useEffect(() => {
    if (activeCar && makes.length > 0) {
      setAvailableYears(years);
    }
  }, [activeCar, makes, years]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "vehicleType" && !isAuction) {
      setFormData((prev) => ({ ...prev, make: "", model: "" }));
      setSelectedMake("");
      setAvailableModels([]);
    }

    if (field === "make") {
      setSelectedMake(value);
      const makeModels = resolveModelsBySelectedMake(value);
      setAvailableModels(makeModels);
      if (formData.model && !makeModels.find((m) => m && m.name === formData.model)) {
        setFormData((prev) => ({ ...prev, model: "" }));
      }
    }

    if (field === "model" && !isAuction) {
      setAvailableYears(years);
      if (formData.year && !years.find((y) => y && y.name === formData.year.toString())) {
        setFormData((prev) => ({ ...prev, year: "" }));
      }
    }
  };

  const handleRegularSubmit = async () => {
    const requiredFields = getRequiredFields(formData.vehicleType);
    const missing = requiredFields.filter((key) => {
      const value = formData[key];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missing.length) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return false;
    }

    let parsedGeoLocation;
    try {
      parsedGeoLocation = formData.geoLocation ? JSON.parse(formData.geoLocation) : null;
      if (
        !parsedGeoLocation ||
        !Array.isArray(parsedGeoLocation) ||
        parsedGeoLocation.length !== 2 ||
        parsedGeoLocation[0] === 0 ||
        parsedGeoLocation[1] === 0
      ) {
        toast.error("Invalid geoLocation. Please capture valid coordinates.");
        return false;
      }
    } catch {
      toast.error("Invalid geoLocation format. Use [longitude, latitude].");
      return false;
    }

    const data = new FormData();
    const defaults = {
      colorExterior: formData.colorExterior || "N/A",
      colorInterior: formData.colorInterior || "N/A",
      mileage: formData.mileage || "0",
      location: formData.location || "",
      description: formData.description || "",
    };

    if (formData.existingImages && formData.existingImages.length > 0) {
      formData.existingImages.forEach((imgUrl) => data.append("existingImages[]", imgUrl));
    }
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((img) => {
        if (img instanceof File) data.append("images", img);
      });
    }

    const skipKeys = ["images", "existingImages", "features", "carDoors", "horsepower", "numberOfCylinders", "engineCapacity", "regionalSpec"];
    Object.keys(formData).forEach((key) => {
      if (skipKeys.includes(key)) return;
      data.append(key, defaults[key] !== undefined ? defaults[key] : formData[key]);
    });

    data.append("newImagesFirst", formData.isNewImageCover ? "true" : "false");

    try {
      await editCar({ carId: extractedCarId, formData: data }).unwrap();
      toast.success("Car updated successfully!");
      navigate(`/cars/${extractedCarId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    return true;
  };

  const handleAuctionSubmit = async () => {
    if (!formData.title || !formData.make || !formData.model || !formData.year) {
      toast.error("Title, make, model, and year are required.");
      return false;
    }
    if (!formData.city || !formData.contactNumber || !formData.startingBid) {
      toast.error("City, contact number, and starting bid are required.");
      return false;
    }
    if (formData.inspectionReportFile && formData.inspectionReportFile.size > MAX_AUCTION_INSPECTION_REPORT_BYTES) {
      toast.error("Inspection report is too large. Keep it under 10MB.");
      return false;
    }

    const payload = new FormData();
    payload.append("newImagesFirst", formData.isNewImageCover ? "true" : "false");
    
    formData.existingImages.forEach((url) => payload.append("existingImages[]", url));
    formData.images.forEach((file) => { if (file instanceof File) payload.append("images", file); });
    formData.existingDamageImageUrls.forEach((url) => payload.append("existingDamageImageUrls[]", url));
    formData.damageImages.forEach((file) => { if (file instanceof File) payload.append("damageImages", file); });
    formData.existingDocumentUrls.forEach((url) => payload.append("existingDocumentUrls[]", url));
    formData.documents.forEach((file) => { if (file instanceof File) payload.append("documents", file); });
    if (formData.inspectionReportFile instanceof File) {
      payload.append("inspectionReport", formData.inspectionReportFile);
    }

    [
      ["title", formData.title],
      ["description", formData.description],
      ["make", formData.make],
      ["model", formData.model],
      ["year", formData.year],
      ["condition", formData.condition],
      ["startingBid", formData.startingBid],
      ["reservePrice", formData.reservePrice],
      ["price", formData.price],
      ["mileage", formData.mileage],
      ["fuelType", formData.fuelType],
      ["transmission", formData.transmission],
      ["bodyType", formData.bodyType],
      ["colorExterior", formData.colorExterior],
      ["colorInterior", formData.colorInterior],
      ["city", formData.city],
      ["location", formData.location],
      ["contactNumber", formData.contactNumber],
      ["whatsappNumber", formData.whatsappNumber],
      ["geoLocation", formData.geoLocation],
      ["warranty", formData.warranty],
      ["ownerType", formData.ownerType],
      ["features", JSON.stringify(splitList(formData.featuresText))],
      ["videoUrls", JSON.stringify(splitList(formData.videoUrlsText))],
    ].forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload.append(key, value);
      }
    });

    try {
      await updateAuctionSubmission({
        carId: extractedCarId,
        formData: payload,
      }).unwrap();
      toast.success("Auction listing updated successfully");
      navigate(currentUser?.role === "dealer" ? "/dealer/dashboard" : "/my-listings");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\+?\d{9,15}$/.test(formData.contactNumber)) {
      toast.error("Invalid contact number. Must be 9-15 digits.");
      return;
    }
    if (formData.whatsappNumber && !/^\+?\d{9,15}$/.test(formData.whatsappNumber)) {
      toast.error("Invalid WhatsApp number. Must be 9-15 digits or leave empty.");
      return;
    }

    if (isAuction) {
      await handleAuctionSubmit();
    } else {
      await handleRegularSubmit();
    }
  };

  if (isLoadingCar) {
    return <p className="py-12 text-center">Loading Data...</p>;
  }

  if (carError || !activeCar) {
    return <p className="py-12 text-center text-red-500">Failed to load or not found.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full py-12" encType="multipart/form-data">
      <h2 className="text-center md:text-3xl font-semibold">
        {isAuction ? "Edit Auction Listing" : "Edit Car"}
      </h2>
      
      <div className="border-[1px] border-gray-700 rounded-md px-5 py-6 my-5 space-y-5">
        
        {isAuction && activeAuction && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Auction</p>
            <p className="font-semibold text-lg">{formData.auctionTitle}</p>
            <p className="text-sm text-gray-600 mt-1">
              Auction status: {formData.auctionStatus || "N/A"} | Submission status: {formData.submissionStatus || "N/A"}
            </p>
          </div>
        )}

        {/* IMAGES */}
        <div className="my-2">
          <label className="block mb-2">Images</label>
          {formData.existingImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.existingImages.map((imgUrl, idx) => (
                <div key={idx} className="relative">
                  <img src={imgUrl} alt={`Existing ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  {idx === 0 && !formData.isNewImageCover ? (
                    <div className="absolute top-0 left-0 bg-primary-500 text-white text-[8px] px-1 rounded-br font-bold">
                      COVER
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...formData.existingImages];
                        const target = next.splice(idx, 1)[0];
                        next.unshift(target);
                        setFormData(prev => ({ ...prev, existingImages: next, isNewImageCover: false }));
                      }}
                      className="absolute top-0 left-0 bg-black/40 text-white text-[8px] px-1 rounded-br hover:bg-black/60 transition-colors"
                    >
                      Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleChange("existingImages", formData.existingImages.filter((_, i) => i !== idx))}
                    className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}

            </div>
          )}
          <ImagesUpload 
            onImagesChange={(files) => {
              handleChange("images", files);
              // If there's a new file and it's the only image or we want to allow it as cover
              // Logic: ImagesUpload reorders so files[0] is the cover of NEW images.
              // We'll let the user explicitly decide if NEW is cover vs OLD.
              // Actually, if they haven't set an OLD one as cover explicitly, we can default to OLD[0].
            }} 
            // We can add a way to tell ImagesUpload to be the ABSOLUTE cover
          />
          {formData.images.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isNewImageCover" 
                checked={formData.isNewImageCover}
                onChange={(e) => handleChange("isNewImageCover", e.target.checked)}
                className="w-4 h-4 text-primary-500 rounded border-gray-300"
              />
              <label htmlFor="isNewImageCover" className="text-sm text-gray-700 font-medium">
                Set newly uploaded photo as cover image
              </label>
            </div>
          )}
        </div>

        {/* BASIC FIELDS */}
        <div className={`grid ${isAuction ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
          <div>
            <label className="block mb-1">Title</label>
            <Input inputType="text" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Title" required />
          </div>
          
          <div>
            <label className="block mb-1">{isAuction ? "Price / Buy Now Value (PKR)" : "Price (PKR)"}</label>
            <Input inputType="number" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="Enter price" required />
          </div>

          {isAuction && (
            <>
              <div>
                <label className="block mb-1">Starting Bid (PKR)</label>
                <Input inputType="number" value={formData.startingBid} onChange={(e) => handleChange("startingBid", e.target.value)} required />
              </div>
              <div>
                <label className="block mb-1">Reserve Price (PKR)</label>
                <Input inputType="number" value={formData.reservePrice} onChange={(e) => handleChange("reservePrice", e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Describe the vehicle" className="w-full p-2 border rounded" rows={4} />
        </div>

        {/* MAKE, MODEL, YEAR */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">{getVehicleLabel(formData.vehicleType, "make")} *</label>
            <SearchableSelect
              value={formData.make}
              onChange={(value) => handleChange("make", value)}
              options={makes.map((make) => ({ value: make.name, label: capitalize(make.name) }))}
              placeholder={(!formData.vehicleType && !isAuction) ? "Select vehicle type first" : categoriesLoading ? "Loading..." : "Select Make"}
              disabled={(!formData.vehicleType && !isAuction) || categoriesLoading}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">{getVehicleLabel(formData.vehicleType, "model")} *</label>
            <SearchableSelect
              value={formData.model}
              onChange={(value) => handleChange("model", value)}
              options={availableModels.map((model) => ({ value: model.name, label: capitalize(model.name) }))}
              placeholder={(!formData.vehicleType && !isAuction) ? "Select type" : !formData.make ? "Select make" : categoriesLoading ? "Loading" : "Select Model"}
              disabled={(!formData.vehicleType && !isAuction) || !formData.make || categoriesLoading}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Year *</label>
            <SearchableSelect
              value={formData.year}
              onChange={(value) => handleChange("year", value)}
              options={yearOptions}
              placeholder="Select Year"
              disabled={categoriesLoading || (!formData.model && !isAuction)}
              isLoading={categoriesLoading}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Mileage (km)</label>
            <Input inputType="number" value={formData.mileage} onChange={(e) => handleChange("mileage", e.target.value)} placeholder="Mileage" />
          </div>
        </div>

        {/* SPECS */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Condition</label>
            <FilterSpecs specType="condition" value={formData.condition} onChange={(val) => handleChange("condition", val)} />
          </div>
          
          {(isAuction || isFieldVisible(formData.vehicleType, "bodyType")) && (
            <div>
              <label className="block mb-1">Body Type</label>
              <FilterSpecs specType="bodyTypes" vehicleType={isAuction ? "Car" : formData.vehicleType} value={formData.bodyType} onChange={(val) => handleChange("bodyType", val)} />
            </div>
          )}

          {(isAuction || isFieldVisible(formData.vehicleType, "fuelType")) && (
            <div>
              <label className="block mb-1">Fuel Type</label>
              <FilterSpecs specType="fuelType" vehicleType={isAuction ? "Car" : formData.vehicleType} value={formData.fuelType} onChange={(val) => handleChange("fuelType", val)} />
            </div>
          )}

          {(isAuction || isFieldVisible(formData.vehicleType, "transmission")) && (
            <div>
              <label className="block mb-1">Transmission</label>
              <FilterSpecs specType="transmissionType" value={formData.transmission} onChange={(val) => handleChange("transmission", val)} />
            </div>
          )}
        </div>

        <ExteriorColor value={formData.colorExterior} onChange={(val) => handleChange("colorExterior", val)} />
        <InteriorColor value={formData.colorInterior} onChange={(val) => handleChange("colorInterior", val)} />

        {/* CONTACT & LOCATION */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">City</label>
            <Input inputType="text" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Location</label>
            <Input inputType="text" value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Phone Number</label>
            <Input inputType="tel" value={formData.contactNumber} onChange={(e) => handleChange("contactNumber", e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">
              WhatsApp 
              <button type="button" onClick={() => handleChange("whatsappNumber", formData.contactNumber)} className="ml-2 text-primary-500 hover:underline text-sm font-normal">
                Same as Phone
              </button>
            </label>
            <Input inputType="tel" value={formData.whatsappNumber} onChange={(e) => handleChange("whatsappNumber", e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Owner Type</label>
            <FilterSpecs specType="ownerType" value={formData.ownerType} onChange={(val) => handleChange("ownerType", val)} />
          </div>
          <div>
            <label className="block mb-1">Warranty</label>
            <FilterSpecs specType="warrantyType" value={formData.warranty} onChange={(val) => handleChange("warranty", val)} />
          </div>
        </div>

        {/* AUCTION ONLY FIELDS */}
        {isAuction && (
          <>
            <div>
              <label className="block mb-1">Features</label>
              <textarea value={formData.featuresText} onChange={(e) => handleChange("featuresText", e.target.value)} placeholder="Comma or line separated features" className="w-full p-2 border rounded" rows={3} />
            </div>

            <div>
              <label className="block mb-1">Video URLs</label>
              <textarea value={formData.videoUrlsText} onChange={(e) => handleChange("videoUrlsText", e.target.value)} placeholder="One URL per line" className="w-full p-2 border rounded" rows={3} />
            </div>

            <div className="rounded-lg border border-gray-200 p-4 space-y-4">
              <div>
                <label className="block mb-2">Inspection Report (PDF)</label>
                {formData.existingInspectionReportPdfUrl && (
                  <a href={formData.existingInspectionReportPdfUrl} target="_blank" rel="noreferrer" className="text-primary-500 underline text-sm">
                    View current inspection report
                  </a>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > MAX_AUCTION_INSPECTION_REPORT_BYTES) {
                      toast.error("Inspection report is too large for the live server. Keep it under 4MB.");
                      e.target.value = "";
                      return;
                    }
                    handleChange("inspectionReportFile", file);
                  }}
                  className="w-full text-sm mt-1"
                />
              </div>

              <div>
                <label className="block mb-2">Damage Images</label>
                {formData.existingDamageImageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.existingDamageImageUrls.map((imgUrl, index) => (
                      <div key={imgUrl + index} className="relative">
                        <img src={imgUrl} alt={`Damage ${index + 1}`} className="w-20 h-20 object-cover rounded border" />
                        <button type="button" onClick={() => handleChange("existingDamageImageUrls", formData.existingDamageImageUrls.filter((_, i) => i !== index))} className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">x</button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" multiple accept="image/*" onChange={(e) => handleChange("damageImages", Array.from(e.target.files || []))} className="w-full text-sm" />
              </div>

              <div>
                <label className="block mb-2">Documents</label>
                {formData.existingDocumentUrls.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formData.existingDocumentUrls.map((docUrl, index) => (
                      <div key={docUrl + index} className="flex items-center justify-between gap-3 border rounded px-3 py-2">
                        <a href={docUrl} target="_blank" rel="noreferrer" className="text-primary-500 underline text-sm truncate">Existing document {index + 1}</a>
                        <button type="button" onClick={() => handleChange("existingDocumentUrls", formData.existingDocumentUrls.filter((_, i) => i !== index))} className="text-red-500 text-sm">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                <input type="file" multiple accept=".pdf,image/*" onChange={(e) => handleChange("documents", Array.from(e.target.files || []))} className="w-full text-sm" />
              </div>
            </div>
          </>
        )}

        <div>
          <button type="submit" disabled={isLoading} className="bg-primary-500 text-white px-4 my-5 py-2 rounded hover:opacity-90 transition-colors w-full text-xl shadow-lg shadow-gray-400 font-semibold disabled:opacity-50">
            {isLoading ? "Updating..." : (isAuction ? "Update Auction Listing" : "Update Car")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditCarForm;
