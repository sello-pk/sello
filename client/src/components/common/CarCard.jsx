import React from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { IoIosArrowRoundUp } from "react-icons/io";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
import { Image as LazyImage } from "../ui/Image";
import { IoFlashOutline as Zap } from "react-icons/io5";import {
  useSaveCarMutation,
  useUnsaveCarMutation,
  useGetSavedCarsQuery,
} from "../../redux/services/api";
import { buildCarUrl } from "../../utils/urlBuilders";
import { images } from "../../assets/assets";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errorHandler";
import { trackContact } from "../../utils/metaPixel.js";

const CountdownTimer = ({ targetDate }) => {
  const [time, setTime] = React.useState({ d: 0, h: 0, m: 0, s: 0 });
  React.useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!targetDate) return null;
  const pad = (n) => String(n).padStart(2, "0");
  const isEndingSoon = time.d === 0 && time.h === 0 && time.m < 15;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ml-2 ${isEndingSoon ? "text-red-500 animate-pulse" : "text-amber-600"}`}>
      <Zap className="w-3.5 h-3.5" />
      {time.d > 0 && `${time.d}d `}{pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
};
/**
 * Car listing card used across listing pages. Supports grid (default) and list layout.
 * @param {Object} props.car - Car object
 * @param {string} [props.variant] - "grid" | "list"
 * @param {React.ReactNode} [props.actions] - Optional actions (e.g. Edit / Mark Sold)
 * @param {boolean} [props.showWhatsApp] - Show WhatsApp CTA
 * @param {string} [props.whatsappNumber] - WhatsApp number for link
 * @param {boolean} [props.showContactButtons] - Show phone & WhatsApp icons (default true; set false for "my listings")
 * @param {boolean} [props.showSaveButton] - Show save/heart button (default true)
 * @param {boolean} [props.showViewCta] - Show footer "View" CTA (default true)
 */
const CarCard = ({
  car,
  variant = "grid",
  actions,
  showWhatsApp = false,
  whatsappNumber,
  showContactButtons = true,
  showSaveButton = true,
  showViewCta = true,
}) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [saveCar, { isLoading: isSaving }] = useSaveCarMutation();
  const [unsaveCar, { isLoading: isUnsaving }] = useUnsaveCarMutation();
  const { data: savedCarsData } = useGetSavedCarsQuery(undefined, {
    skip: !token,
  });

  const savedCars = React.useMemo(() => {
    if (!savedCarsData || !Array.isArray(savedCarsData)) return [];
    return savedCarsData.map((c) => c._id || c.id).filter(Boolean);
  }, [savedCarsData]);

  const id = car?._id;
  const rawTitle = car && `${car.make || ""} ${car.model || ""} ${car.year || ""}`.trim();
  const displayTitle = (rawTitle && rawTitle !== "undefined") ? rawTitle : (car?.title || "Car Listing");
  const isAuction = car?.listingType === "auction";
  const displayPrice = isAuction ? (car?.currentBid || car?.price) : car?.price;
  const priceFormatted =
    typeof displayPrice === "number"
      ? displayPrice.toLocaleString()
      : (displayPrice != null && displayPrice !== "" && String(displayPrice)) || "N/A";
  const displayImage = car?.images?.[0] || images?.carPlaceholder || null;
  const displayLocation = car?.city || car?.location || "—";
  const displayMileage = car?.mileage ?? "—";
  const displayFuel = car?.fuelType ?? "—";
  const displayTransmission = car?.transmission ?? "—";
  const displayTag = car?.isSold ? "sold" : isAuction ? "auction" : car?.featured ? "featured" : "for_sale";
  const displayRef = car?._id?.slice(-6)?.toUpperCase() || "";
  const isSaved = id ? savedCars.includes(id) : false;

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!id) return;
    if (!token) {
      toast.error("Please login to save cars");
      navigate("/login");
      return;
    }
    try {
      if (isSaved) {
        await unsaveCar(id).unwrap();
        toast.success("Removed from saved");
      } else {
        await saveCar(id).unwrap();
        toast.success("Saved");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCardClick = () => {
    if (car?._id) navigate(buildCarUrl(car));
  };
  const isClickable = Boolean(car?._id);

  const contactNumber = car?.contactNumber || "";
  const waNumber =
    whatsappNumber ||
    car?.whatsappNumber ||
    car?.contactNumber ||
    car?.postedBy?.dealerInfo?.whatsappNumber ||
    "";
  const listingUrl =
    typeof window !== "undefined" && car?._id
      ? `${window.location.origin}${buildCarUrl(car)}`
      : "";
  const waDigits = waNumber ? waNumber.replace(/\D/g, "") : "";
  const waCode = waDigits.startsWith("92") ? waDigits : `92${waDigits.replace(/^0/, "")}`;
  const whatsappUrl =
    waCode.length > 2
      ? `https://wa.me/${waCode}?text=${encodeURIComponent(
          `Hi, I'm interested in this car: ${displayTitle}. ${listingUrl ? `Link: ${listingUrl}` : ""}`.trim(),
        )}`
      : "";
  const phoneUrl = contactNumber ? `tel:${contactNumber.replace(/\s/g, "")}` : "";
  const callSellerLabel = contactNumber?.trim()
    ? `Call seller at ${contactNumber.trim()}`
    : "Call seller";
  const showPhone = showContactButtons && !car?.isSold && !!phoneUrl;
  const showWhatsAppBtn = showContactButtons && !car?.isSold && !!whatsappUrl;

  const displayTitleShort =
    car && (car.make || car.model)
      ? `${car.make || ""} ${car.model || ""}`.trim()
      : displayTitle;
  const displayYear = car?.year;

  const tagLabel =
    displayTag === "sold"
      ? "SOLD"
      : displayTag === "auction"
        ? "Auction"
        : displayTag === "featured"
          ? "Featured"
          : displayTag === "verified"
            ? "Verified"
            : "For Sale";

  const tagStyles = {
    sold: "bg-[#111827] text-white",
    auction: "bg-amber-900 text-white",
    featured: "bg-neutral-900 text-white",
    verified: "bg-[#15803d] text-white",
    for_sale: "bg-[#111827]/90 text-white",
  };

  const priceLabel = isAuction 
    ? (car?.currentBid > 0 ? "Current Bid" : "Starting Bid") 
    : "Starting from";

  const mileageText =
    displayMileage === "—" || displayMileage == null
      ? "—"
      : typeof displayMileage === "number"
        ? `${displayMileage.toLocaleString()} km`
        : String(displayMileage).endsWith("km")
          ? displayMileage
          : `${displayMileage} km`;

  // List variant: horizontal row — image left, content right
  if (variant === "list") {
    return (
      <div
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? `View details for ${displayTitle}` : undefined}
        onClick={isClickable ? handleCardClick : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick();
                }
              }
            : undefined
        }
        className={`group bg-white rounded-xl overflow-hidden border border-[#e5e7eb] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row min-w-0 w-full max-w-full ${isClickable ? "cursor-pointer" : ""}`}
      >
        <div className="relative w-full aspect-[3/2] sm:w-48 sm:aspect-auto sm:h-36 md:w-56 md:h-40 lg:w-64 lg:h-48 xl:w-72 xl:h-52 flex-shrink-0 overflow-hidden bg-[#f3f4f6]">
          {displayImage ? (
            <LazyImage
              src={displayImage}
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              width="400"
              height="267"
              lazy
              responsive
              cloudinaryOptions={{
                width: 400,
                height: 267,
                quality: 85,
                crop: 'fill',
                format: 'auto',
                responsiveSizes: [200, 300, 400, 600],
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#e5e7eb] text-[#6b7280] text-sm">
              No image
            </div>
          )}
          <span
            className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold uppercase ${tagStyles[displayTag] || tagStyles.for_sale}`}
          >
            {tagLabel}
          </span>
          {showSaveButton && id && (
            <button
              type="button"
              onClick={handleBookmark}
              disabled={isSaving || isUnsaving}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 shadow border border-gray-100 disabled:opacity-50 z-10"
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              {isSaved ? (
                <AiFillHeart className="w-4 h-4 text-primary-500" />
              ) : (
                <AiOutlineHeart className="w-4 h-4 text-gray-500 hover:text-primary-500" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 min-w-0">
          <div>
            <h3 className="text-[#111827] font-bold text-sm sm:text-base lg:text-lg leading-tight line-clamp-1">
              {displayTitleShort}
            </h3>
            {displayYear != null && displayYear !== "" && (
              <p className="text-[#6b7280] text-xs sm:text-sm mt-0.5">{displayYear}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[#6b7280] text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                {images.milesIcon && (
                  <img src={images.milesIcon} alt="" width={16} height={16} className="w-4 h-4 object-contain opacity-80" />
                )}
                {mileageText}
              </span>
              <span className="flex items-center gap-1.5">
                {images.fuelTypeIcon && (
                  <img src={images.fuelTypeIcon} alt="" width={16} height={16} className="w-4 h-4 object-contain opacity-80" />
                )}
                {displayFuel}
              </span>
              <span className="flex items-center gap-1.5">
                {images.transmissionIcon && (
                  <img src={images.transmissionIcon} alt="" width={16} height={16} className="w-4 h-4 object-contain opacity-80" />
                )}
                {displayTransmission}
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#e5e7eb]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 truncate">{priceLabel}</p>
                {isAuction && <CountdownTimer targetDate={car?.auctionEndTime} />}
              </div>
              <p className="text-base sm:text-lg font-bold text-primary-500 truncate">PKR {priceFormatted}</p>
            </div>
            {(showPhone || showWhatsAppBtn || showViewCta) && (
              <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap min-w-0">
                <div className="flex items-center gap-2">
                  {showPhone && (
                    <a
                      href={phoneUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      title={callSellerLabel}
                      aria-label={callSellerLabel}
                    >
                      <FaPhone className="w-4 h-4" aria-hidden />
                    </a>
                  )}
                  {showWhatsAppBtn && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        trackContact();
                        e.stopPropagation();
                      }}
                      className="p-2.5 rounded-lg bg-[#25D366] text-white hover:opacity-90 transition-colors"
                      title="WhatsApp"
                      aria-label="WhatsApp"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {showViewCta && (
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-primary-500 text-white text-xs sm:text-sm font-semibold hover:bg-primary-600 transition-colors shrink-0">
                    <span className="sr-only">{`View ${displayTitle}`}</span>
                    <span aria-hidden>VIEW</span>
                    <IoIosArrowRoundUp className="w-3 h-3 sm:w-4 sm:h-4 rotate-[43deg]" aria-hidden />
                  </span>
                )}
              </div>
            )}
          </div>
          {actions && (
            <div className="mt-3 pt-3 border-t border-[#e5e7eb]" onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `View listing: ${displayTitle}, ${priceLabel} PKR ${priceFormatted}` : undefined}
      onClick={isClickable ? handleCardClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      className={`group bg-white rounded-xl overflow-hidden border border-[#e5e7eb] shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col min-w-0 w-full max-w-full ${isClickable ? "cursor-pointer" : ""}`}
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-[#f3f4f6]">
        {displayImage ? (
          <LazyImage
            src={displayImage}
            alt={displayTitle}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            width="400"
            height="267"
            lazy
            responsive
            cloudinaryOptions={{
              width: 400,
              height: 267,
              quality: 85,
              crop: 'fill',
              format: 'auto',
              responsiveSizes: [200, 300, 400, 600],
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#e5e7eb] text-[#6b7280] text-sm">
            No image
          </div>
        )}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, transparent 70%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 sm:px-3 sm:py-2 flex items-end justify-between">
          <div className="flex items-center gap-1">
            <p className="text-white font-bold text-sm sm:text-base lg:text-lg tracking-tight drop-shadow-lg truncate">
              PKR {priceFormatted}
            </p>
            {isAuction && <CountdownTimer targetDate={car?.auctionEndTime} />}
          </div>
        </div>
        <span
          className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow-md ${tagStyles[displayTag] || tagStyles.for_sale}`}
        >
          {tagLabel}
        </span>
        {showSaveButton && id && (
          <button
            type="button"
            onClick={handleBookmark}
            disabled={isSaving || isUnsaving}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-full bg-white/95 shadow-lg hover:bg-white hover:scale-105 disabled:opacity-50 z-10 transition-transform duration-200"
            aria-label={isSaved ? "Unsave" : "Save"}
          >
            {isSaved ? (
              <AiFillHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-500" />
            ) : (
              <AiOutlineHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 hover:text-primary-500 transition-colors" />
            )}
          </button>
        )}
      </div>

      <div className="p-2.5 sm:p-3 lg:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 min-w-0">
          <h3 className="text-[#111827] font-bold text-xs sm:text-sm md:text-base leading-tight line-clamp-2 flex-1 min-w-0">
            {displayTitle}
          </h3>
          <p className="text-xs text-gray-500 shrink-0 ml-1 mt-0.5">{priceLabel}</p>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[#6b7280] text-xs">
          {images.location && (
            <img
              src={images.location}
              alt=""
              width={14}
              height={14}
              className="w-3.5 h-3.5 flex-shrink-0 opacity-80"
            />
          )}
          <span className="truncate">{displayLocation}</span>
        </div>
        <div className="border-t border-[#e5e7eb] my-1.5 sm:my-2" />
        <div className="flex flex-wrap items-center justify-between gap-1 text-[#6b7280] text-xs">
          <span className="flex items-center gap-2 min-w-0">
            {images.milesIcon && (
              <img
                src={images.milesIcon}
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5 flex-shrink-0 object-contain opacity-80"
              />
            )}
            <span className="truncate">
              {displayMileage === "—" || displayMileage == null
                ? "—"
                : typeof displayMileage === "number"
                  ? `${displayMileage.toLocaleString()} km`
                  : String(displayMileage).endsWith("km")
                    ? displayMileage
                    : `${displayMileage} km`}
            </span>
          </span>
          <span className="flex items-center gap-2 min-w-0">
            {images.fuelTypeIcon && (
              <img
                src={images.fuelTypeIcon}
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5 flex-shrink-0 object-contain opacity-80"
              />
            )}
            <span className="truncate">{displayFuel}</span>
          </span>
          <span className="flex items-center gap-2 min-w-0">
            {images.transmissionIcon && (
              <img
                src={images.transmissionIcon}
                alt=""
                width={14}
                height={14}
                className="w-3.5 h-3.5 flex-shrink-0 object-contain opacity-80"
              />
            )}
            <span className="truncate">{displayTransmission}</span>
          </span>
        </div>

        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 flex items-center justify-between gap-1 border-t border-[#e5e7eb]">
          <div className="flex items-center gap-1">
            {showPhone && (
              <a
                href={phoneUrl}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                title={callSellerLabel}
                aria-label={callSellerLabel}
              >
                <FaPhone className="w-3.5 h-3.5" aria-hidden />
              </a>
            )}
            {showWhatsAppBtn && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  trackContact();
                  e.stopPropagation();
                }}
                className="p-1.5 rounded-lg bg-[#25D366] text-white hover:opacity-90 transition-colors"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {showViewCta && (
            <span className="inline-flex items-center gap-0.5 text-neutral-900 font-semibold text-xs underline-offset-2 group-hover:underline shrink-0">
              <span>View</span>
              <IoIosArrowRoundUp className="w-3 h-3 rotate-[43deg]" aria-hidden />
            </span>
          )}
        </div>
        {actions && (
          <div className="mt-3 pt-3 border-t border-[#e5e7eb]" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarCard;
