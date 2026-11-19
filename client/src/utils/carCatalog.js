export const CATALOG_LIMIT = 3;
export const CATALOG_STORAGE = "sello_model_compare_v1";

export function tokenFor(slot) {
  if (slot?.variant?._id) return `v-${slot.variant._id}`;
  return slot?.model?._id ? `m-${slot.model._id}` : null;
}

export function parseCatalogSelection(value) {
  if (typeof value !== "string" || value.length > 80) return null;
  const tokens = value.toLowerCase().split(",");
  return tokens.length >= 2 && tokens.length <= CATALOG_LIMIT &&
    tokens.every((token) => /^[mv]-[a-f0-9]{24}$/.test(token)) &&
    new Set(tokens).size === tokens.length ? tokens : null;
}

export function catalogResultUrl(tokens) {
  return `/compare/result?${new URLSearchParams({ vehicles: tokens.join(",") })}`;
}

export const withMake = (make) => ({ make, model: null, variant: null });
export const withModel = (slot, model) => ({ ...slot, model, variant: null });
export const versionLabel = (variant) => [variant.name, variant.generation, variant.year].filter(Boolean).join(" · ");
export const catalogueTitle = (entry) => [entry.make.name, entry.model.name, entry.variant && versionLabel(entry.variant)].filter(Boolean).join(" ");

export function modelCompareLink(car) {
  if (!car?.make || !car.model || (car.vehicleType && car.vehicleType !== "Car")) return "/compare";
  return `/compare?${new URLSearchParams({ make: car.make, model: car.model, variant: car.variant || "", year: car.year || "" })}`;
}

export function readCatalogSelection(storage) {
  try { return parseCatalogSelection(storage.getItem(CATALOG_STORAGE)) || []; }
  catch { return []; }
}

const fields = {
  "Engine and transmission": { engineType: "Engine type", engineCapacityCc: "Engine capacity (cc)", cylinders: "Cylinders", valvesPerCylinder: "Valves per cylinder", horsepowerHp: "Power (hp)", torqueNm: "Torque (Nm)", transmission: "Transmission", gears: "Gears", drivetrain: "Drivetrain", fuelType: "Fuel type", fuelDelivery: "Fuel delivery", cooling: "Cooling system" },
  "Fuel economy and performance": { cityKmPerL: "City economy (km/L)", highwayKmPerL: "Highway economy (km/L)", combinedKmPerL: "Combined economy (km/L)", topSpeedKmh: "Top speed (km/h)", accelerationSeconds: "0–100 km/h (s)", fuelTankL: "Fuel tank (L)" },
  "Dimensions and capacity": { lengthMm: "Length (mm)", widthMm: "Width (mm)", heightMm: "Height (mm)", wheelbaseMm: "Wheelbase (mm)", clearanceMm: "Ground clearance (mm)", weightKg: "Kerb weight (kg)", bootL: "Boot (L)", seats: "Seats", doors: "Doors" },
  "Hybrid and electric": { hybridType: "Hybrid type", motorPowerKw: "Motor power (kW)", combinedPowerKw: "Combined power (kW)", batteryChemistry: "Battery chemistry", batteryKwh: "Battery (kWh)", rangeKm: "Electric range (km)", chargingTimeHours: "Charging time (h)", chargingType: "Charging type", consumptionKwhPer100Km: "Energy use (kWh/100 km)" },
};
const features = {
  Exterior: ["ledHeadlights", "drl", "fogLamps", "alloyWheels", "roofRails", "sunroof", "panoramicRoof"],
  Comfort: ["powerSeats", "heatedSeats", "ventilatedSeats", "climateControl", "airConditioning", "rearAcVents", "keylessEntry", "pushStart", "centralLocking", "powerWindows"],
  Infotainment: ["touchscreen", "bluetooth", "usb", "appleCarPlay", "androidAuto", "navigation", "wirelessCharging", "digitalCluster"],
  Safety: ["abs", "airbags", "stabilityControl", "tractionControl", "hillStartAssist", "hillDescentControl", "parkingSensors", "rearCamera", "surroundCamera", "blindSpotMonitoring", "laneDepartureWarning", "adaptiveCruiseControl", "collisionWarning", "isofix", "immobilizer"],
};
const displayKey = (key) => ({ abs: "ABS", drl: "Daytime running lights", isofix: "ISOFIX", usb: "USB", surroundCamera: "360° camera" }[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (character) => character.toUpperCase()));
const availability = { standard: "Standard", optional: "Optional", unavailable: "Not available", notApplicable: "Not applicable" };
const rows = (entries, object, read) => Object.entries(object).map(([key, label]) => [label, entries.map((entry) => read(entry, key))]);
export function catalogGroups(entries) {
  const specifications = (entry, key) => entry.variant?.specifications?.[key] ?? null;
  const knownSpecKeys = new Set(Object.values(fields).flatMap(Object.keys));
  const knownFeatureKeys = new Set(Object.values(features).flat());
  const extras = (property, known) => [...new Set(entries.flatMap((entry) => Object.keys(entry.variant?.[property] || {})))].filter((key) => !known.has(key)).sort();
  const featureValue = (entry, key) => availability[entry.variant?.features?.[key]] || null;
  return [
    ["General information", [
      ["Make", entries.map((entry) => entry.make.name)], ["Model", entries.map((entry) => entry.model.name)],
      ["Version", entries.map((entry) => entry.variant?.name)], ["Model year", entries.map((entry) => entry.variant?.year)],
      ["Generation", entries.map((entry) => entry.variant?.generation)],
      ...rows(entries, { bodyType: "Body type", assembly: "Assembly", warranty: "Warranty" }, specifications),
    ]],
    ...Object.entries(fields).map(([label, keys]) => [label, rows(entries, keys, specifications)]),
    ...Object.entries(features).map(([label, keys]) => [label, keys.map((key) => [displayKey(key), entries.map((entry) => featureValue(entry, key))])]),
    ["Other specifications", extras("specifications", new Set([...knownSpecKeys, "bodyType", "assembly", "warranty"])).map((key) => [displayKey(key), entries.map((entry) => specifications(entry, key))])],
    ["Other features", extras("features", knownFeatureKeys).map((key) => [displayKey(key), entries.map((entry) => featureValue(entry, key))])],
  ].map(([label, group]) => [label, group.filter(([, values]) => values.some((value) => value != null && value !== ""))]).filter(([, group]) => group.length);
}
