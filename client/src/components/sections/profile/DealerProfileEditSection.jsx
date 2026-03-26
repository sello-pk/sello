import React from "react";
import { FaTimes, FaUpload } from "react-icons/fa";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import toast from "react-hot-toast";
import DealerForm from "../../features/profile/DealerForm";
import {
  DEALER_DOC_MAX_BYTES,
  buildDealerPayloadFromForm,
  getSafeDealerErrorMessage,
  mapUserToDealerForm,
} from "../../features/profile/dealerFormUtils";
import { useCarCategories } from "../../../hooks/useCarCategories";

const DEALER_PROFILE_FALLBACK_MESSAGE =
  "Update failed. Please check your inputs and try again.";

const DealerProfileEditSection = ({
  user,
  dealerFormData,
  setDealerFormData,
  dealerFiles,
  setDealerFiles,
  isEditingDealer,
  setIsEditingDealer,
  updateDealerProfile,
  isUpdatingDealer,
  refetch,
}) => {
  const isVerifiedDealer = user?.dealerInfo?.verified === true;
  const { countries, states, cities } = useCarCategories();

  const countryLabel =
    countries.find((item) => item._id === user?.dealerInfo?.country)?.name ||
    user?.dealerInfo?.country ||
    "Not set";
  const stateLabel =
    states.find((item) => item._id === user?.dealerInfo?.state)?.name ||
    user?.dealerInfo?.state ||
    "Not set";
  const cityLabel =
    cities.find((item) => item._id === user?.dealerInfo?.city)?.name ||
    user?.dealerInfo?.city ||
    "Not set";

  const resetDealerEditor = () => {
    setDealerFormData(mapUserToDealerForm(user));
    setDealerFiles({
      avatar: null,
      businessLicense: null,
      showroomImages: [],
    });
  };

  const handleFileChange = (e, type) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (type === "avatar") {
      setDealerFiles((prev) => ({ ...prev, avatar: files[0] }));
      return;
    }

    if (type === "businessLicense") {
      if (files[0].size > DEALER_DOC_MAX_BYTES) {
        toast.error("License file size must be less than 10MB");
        return;
      }
      setDealerFiles((prev) => ({ ...prev, businessLicense: files[0] }));
      return;
    }

    if (type === "showroomImages") {
      const oversized = Array.from(files).find(
        (file) => file.size > DEALER_DOC_MAX_BYTES,
      );
      if (oversized) {
        toast.error("Each showroom image must be less than 10MB");
        return;
      }
      setDealerFiles((prev) => ({
        ...prev,
        showroomImages: [
          ...(prev.showroomImages || []),
          ...Array.from(files),
        ].slice(0, 10),
      }));
    }
  };

  const removeShowroomImage = (index) => {
    setDealerFiles((prev) => ({
      ...prev,
      showroomImages: prev.showroomImages.filter((_, current) => current !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const payload = buildDealerPayloadFromForm(dealerFormData);
      const formDataToSend = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
          return;
        }
        if (value !== "") {
          formDataToSend.append(key, value);
        }
      });

      if (dealerFiles.avatar) {
        formDataToSend.append("avatar", dealerFiles.avatar);
      }
      if (dealerFiles.businessLicense) {
        formDataToSend.append("businessLicense", dealerFiles.businessLicense);
      }
      if (dealerFiles.showroomImages?.length) {
        dealerFiles.showroomImages.forEach((file) => {
          formDataToSend.append("showroomImages", file);
        });
      }

      await updateDealerProfile(formDataToSend).unwrap();
      toast.success("Dealer profile updated successfully!");
      setIsEditingDealer(false);
      await refetch();
    } catch (error) {
      toast.error(
        getSafeDealerErrorMessage(error, DEALER_PROFILE_FALLBACK_MESSAGE),
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Dealer Business Profile
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your business information, documents, and settings
          </p>
        </div>
        {!isEditingDealer ? (
          <button
            onClick={() => setIsEditingDealer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            <FiEdit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditingDealer(false);
                resetDealerEditor();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiX size={18} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdatingDealer}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              <FiSave size={18} />
              {isUpdatingDealer ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {isEditingDealer ? (
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Image
            </h4>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={
                    dealerFiles.avatar
                      ? URL.createObjectURL(dealerFiles.avatar)
                      : user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.name || "User",
                        )}`
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                <label className="absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2 cursor-pointer hover:opacity-90 transition-colors">
                  <FaUpload size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "avatar")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <DealerForm
              mode="update"
              step={1}
              formData={dealerFormData}
              setFormData={setDealerFormData}
              errors={{}}
              setErrors={() => {}}
              files={dealerFiles}
              onFileChange={handleFileChange}
              accountName={user?.name || ""}
              accountEmail={user?.email || ""}
            />
          </div>

          <div className="border-b border-gray-200 pb-6">
            <DealerForm
              mode="update"
              step={2}
              formData={dealerFormData}
              setFormData={setDealerFormData}
              errors={{}}
              setErrors={() => {}}
              files={dealerFiles}
              onFileChange={handleFileChange}
              accountName={user?.name || ""}
              accountEmail={user?.email || ""}
            />
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Showroom Images
            </h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, "showroomImages")}
                className="hidden"
                id="showroom-upload"
              />
              <label
                htmlFor="showroom-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FaUpload className="text-gray-400 mb-2" size={24} />
                <span className="text-sm text-gray-600">
                  Click to upload showroom images
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  JPG, PNG (Max 10MB each, up to 10 images)
                </span>
              </label>
            </div>
            {(dealerFiles.showroomImages.length > 0 ||
              user?.dealerInfo?.showroomImages?.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {user?.dealerInfo?.showroomImages?.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img}
                      alt={`Showroom ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
                {dealerFiles.showroomImages.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeShowroomImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Current Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Business Name</p>
                <p className="font-semibold text-gray-900 inline-flex items-center gap-2">
                  {user?.dealerInfo?.businessName || "Not set"}
                  {isVerifiedDealer ? (
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm"
                      title="Verified dealer"
                      aria-label="Verified dealer"
                    >
                      <RiVerifiedBadgeFill size={11} />
                    </span>
                  ) : null}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Owner Full Name</p>
                <p className="font-semibold text-gray-900">
                  {user?.name || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">
                  {user?.email || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mobile</p>
                <p className="font-semibold text-gray-900">
                  {user?.dealerInfo?.businessPhone || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WhatsApp</p>
                <p className="font-semibold text-gray-900">
                  {user?.dealerInfo?.whatsappNumber || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Country</p>
                <p className="font-semibold text-gray-900">{countryLabel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">State</p>
                <p className="font-semibold text-gray-900">{stateLabel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-semibold text-gray-900">{cityLabel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Area</p>
                <p className="font-semibold text-gray-900">
                  {user?.dealerInfo?.area || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle Types</p>
                <p className="font-semibold text-gray-900">
                  {user?.dealerInfo?.vehicleTypes || "Not set"}
                </p>
              </div>
              {user?.dealerInfo?.description ? (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-semibold text-gray-900">
                    {user.dealerInfo.description}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerProfileEditSection;
