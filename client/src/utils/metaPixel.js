/**
 * Safe Meta Pixel (fbq) helpers. No-ops when pixel is blocked or not loaded.
 */

export const trackMetaEvent = (event, data = {}) => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }
  try {
    window.fbq("track", event, data);
  } catch {
    /* ignore */
  }
};

export const trackViewContent = (car) => {
  if (!car) return;
  const id = car._id ?? car.id ?? "";
  trackMetaEvent("ViewContent", {
    content_name: car.title || "",
    content_ids: id ? [String(id)] : [],
    content_type: "product",
    value: Number(car.price ?? car.currentBid ?? 0) || 0,
    currency: "PKR",
  });
};

export const trackSearch = (query) => {
  trackMetaEvent("Search", {
    search_string: query || "",
  });
};

export const trackLead = () => {
  trackMetaEvent("Lead");
};

export const trackContact = () => {
  trackMetaEvent("Contact");
};
