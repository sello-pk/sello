import { formatPrice } from "./formatters.js";

export const MAX_COMPARE_CARS = 4;
export const COMPARE_LIMIT_MESSAGE = "You can compare up to 4 cars at a time. Remove a car to add another.";
export const COMPARE_STORAGE_KEY = "sello_car_compare_v1";
export const listingId = (value) => typeof value === "string" && /^[a-f0-9]{24}$/i.test(value) ? value.toLowerCase() : null;

export function cleanCompareIds(values) {
  return Array.isArray(values) ? [...new Set(values.map(listingId).filter(Boolean))].slice(0, MAX_COMPARE_CARS) : [];
}

export function readCompareStorage(storage) {
  let value;
  try {
    value = storage.getItem(COMPARE_STORAGE_KEY);
  } catch {
    return { ids: [], storageUnavailable: true };
  }
  try { return { ids: cleanCompareIds(JSON.parse(value)), storageUnavailable: false }; }
  catch { return { ids: [], storageUnavailable: false }; }
}

export function parseCompareSearch(search) {
  const params = new URLSearchParams(search);
  if (!params.has("ids")) return null;
  if (params.get("ids") === "" && params.getAll("ids").length === 1) return { ids: [], error: false };
  const inputs = params.get("ids").split(",");
  if (params.getAll("ids").length !== 1 || inputs.length > MAX_COMPARE_CARS || inputs.some((id) => !listingId(id))) {
    return { error: true, ids: [] };
  }
  const ids = cleanCompareIds(inputs);
  return { ids, error: ids.length !== inputs.length };
}

export function isComparableCar(car) {
  return Boolean(listingId(car?._id) &&
    (!car.vehicleType || car.vehicleType === "Car") &&
    (!car.listingType || car.listingType === "normal") &&
    !car.isSold && (!car.status || car.status === "active") && car.isApproved !== false);
}

const text = (value) => {
  if (typeof value !== "string") return null;
  const clean = value.trim().replace(/\s+/g, " ");
  return clean && !/^(?:n\/?a|unknown|not provided|[-–—])$/i.test(clean) ? clean : null;
};

export const specNumber = (value, unit = "", minimum = 0) => {
  const suffix = unit ? new RegExp(`\\s*${unit}$`, "i") : null;
  const source = typeof value === "string" ? value.trim().replace(suffix || /$^/, "").trim() : value;
  if (typeof source !== "number" && !(typeof source === "string" && /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(source))) return null;
  const number = Number(typeof source === "string" ? source.replaceAll(",", "") : source);
  return Number.isFinite(number) && number >= minimum ? number : null;
};

const numeric = (field, unit, minimum = 0) => (car) => specNumber(car[field], unit, minimum);
const string = (field) => (car) => text(car[field]);
const feature = (...aliases) => (car) => {
  const features = Array.isArray(car.features) ? car.features : [];
  const tokens = features.map((value) => text(value)?.toLowerCase());
  if (aliases.some((alias) => tokens.includes(alias))) return "Available";
  if (aliases.some((alias) => tokens.includes(`no ${alias}`) || tokens.includes(`without ${alias}`))) return "Unavailable";
  return null;
};
const location = (car) => text(car.city) || text(car.location);
const status = (car) => text(car.status);
const updated = (car) => {
  const date = typeof car.updatedAt === "string" ? new Date(car.updatedAt) : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null;
};
const withUnit = (unit) => (value) => `${formatPrice(value)} ${unit}`;
const basic = [
  ["Make", string("make")], ["Model", string("model")], ["Variant", string("variant")],
  ["Model year", numeric("year", "", 1), String], ["Condition", string("condition")],
  ["Asking price", numeric("price", "", 1), (value) => `PKR ${formatPrice(value)}`],
  ["Mileage", numeric("mileage", "km"), withUnit("km")], ["Body type", string("bodyType")],
  ["Exterior color", string("colorExterior")], ["Location", location],
];
export const comparisonGroups = [
  ["Basic information", basic],
  ["Engine and performance", [
    ["Engine capacity", numeric("engineCapacity", "cc", 1), withUnit("cc")],
    ["Fuel type", string("fuelType")], ["Transmission", string("transmission")],
    ["Horsepower", numeric("horsepower", "hp", 1), withUnit("hp")],
    ["Cylinders", numeric("numberOfCylinders", "", 1), String],
  ]],
  ["Capacity", [["Doors", numeric("carDoors", "", 1), String]]],
  ["Comfort and convenience", [
    ["Air conditioning", feature("air conditioning", "air conditioner", "a/c", "ac")],
    ["Power steering", feature("power steering")], ["Power windows", feature("power windows")],
    ["Central locking", feature("central locking")], ["Keyless entry", feature("keyless entry")],
    ["Push start", feature("push start", "push button start")], ["Rear camera", feature("rear camera", "reverse camera")],
    ["Parking sensors", feature("parking sensors")], ["Infotainment", feature("infotainment")],
    ["Navigation", feature("navigation", "navigation system")], ["Sunroof", feature("sunroof")],
  ]],
  ["Safety", [
    ["ABS", feature("abs", "anti-lock braking system")], ["Airbags", feature("airbags", "air bags", "airbag")],
    ["Stability control", feature("stability control", "electronic stability control", "esc")],
    ["Traction control", feature("traction control")], ["Hill assist", feature("hill assist", "hill start assist")],
    ["ISOFIX", feature("isofix")], ["Immobilizer", feature("immobilizer", "immobiliser")],
  ]],
  ["Ownership and listing", [
    ["Seller type", string("ownerType")], ["Regional specification", string("regionalSpec")],
    ["Warranty", string("warranty")], ["Listing status", status], ["Last updated", updated],
  ]],
];

export function hasDifference(values) {
  const known = values.filter((value) => value !== null && value !== undefined);
  return new Set(known.map((value) => typeof value === "string" ? value.toLowerCase() : value)).size > 1;
}

export function getHighlights(cars) {
  return [
    ["Lowest asking price", numeric("price", "", 1), Math.min],
    ["Newest model year", numeric("year", "", 1), Math.max],
    ["Lowest mileage", numeric("mileage", "km"), Math.min],
  ].flatMap(([label, read, best]) => {
    const values = cars.map(read);
    const known = values.filter((value) => value !== null);
    if (!hasDifference(known)) return [];
    const winner = best(...known);
    return cars.flatMap((car, index) => values[index] === winner ? [{ id: car._id, label }] : []);
  });
}
