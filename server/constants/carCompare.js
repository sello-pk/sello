// Server comparison definitions. Keep aligned with client/src/constants/carCompare.js.
const group = (title, rows) => ({
  title,
  fields: rows.map(([key, label, unit = "", type = "text", better]) => ({
    key,
    label,
    unit,
    type,
    better,
  })),
});
export const compareGroups = [
  group("Basic information", [
    ["generation", "Generation"],
    ["engineType", "Engine type"],
    ["fuelType", "Fuel type"],
    ["transmission", "Transmission"],
  ]),
  group("Price comparison", [
    ["newPrice", "New car price", "PKR", "number", "lower"],
    ["exFactoryPrice", "Official ex-factory price", "PKR", "number"],
    ["priceEffectiveDate", "Price effective date", "", "date"],
    ["usedMin", "Used market estimate from", "PKR", "number"],
    ["usedMax", "Used market estimate to", "PKR", "number"],
    ["priceUpdated", "Price last updated", "", "date"],
  ]),
  group("Engine and performance", [
    ["engineCapacity", "Engine capacity", "cc", "number"],
    ["cylinders", "Cylinders", "", "number"],
    ["horsepower", "Power", "HP", "number", "higher"],
    ["torque", "Torque", "Nm", "number", "higher"],
    ["drivetrain", "Drivetrain"],
    ["acceleration", "0–100 km/h", "seconds", "number", "lower"],
    ["maxSpeed", "Maximum speed", "km/h", "number"],
  ]),
  group("Fuel average and running cost", [
    ["cityEconomy", "City average", "km/l", "number", "higher"],
    ["highwayEconomy", "Highway average", "km/l", "number", "higher"],
    ["combinedEconomy", "Combined average", "km/l", "number", "higher"],
    ["claimedEconomy", "Manufacturer-claimed average", "km/l", "number"],
    ["realEconomy", "Real-world average", "km/l", "number"],
    ["tankCapacity", "Fuel tank", "litres", "number"],
    ["batteryCapacity", "Battery capacity", "kWh", "number"],
    ["electricRange", "Electric range", "km", "number"],
    [
      "energyConsumption",
      "Energy consumption",
      "kWh/100 km",
      "number",
      "lower",
    ],
    ["chargingTime", "Charging time"],
    ["chargingType", "Charging type"],
    ["electricityCost", "Estimated electricity cost", "PKR/100 km", "number"],
  ]),
  group("Exterior and dimensions", [
    ["length", "Length", "mm", "number"],
    ["width", "Width", "mm", "number"],
    ["height", "Height", "mm", "number"],
    ["wheelbase", "Wheelbase", "mm", "number"],
    ["groundClearance", "Ground clearance", "mm", "number"],
    ["bootSpace", "Boot space", "litres", "number"],
    ["tyreSize", "Tyre size"],
    ["wheelSize", "Wheel size", "inches", "number"],
    ["doors", "Doors", "", "number"],
    ["headlights", "Headlights"],
    ["fogLights", "Fog lights", "", "boolean"],
    ["daytimeRunningLights", "Daytime running lights", "", "boolean"],
    ["powerMirrors", "Power mirrors", "", "boolean"],
  ]),
  group("Interior and comfort", [
    ["seats", "Seating capacity", "", "number"],
    ["acType", "AC type"],
    ...[
      "climateControl",
      "rearAcVents",
      "androidAuto",
      "appleCarPlay",
      "sunroof",
      "powerSeats",
      "keylessEntry",
      "pushStart",
      "cruiseControl",
    ].map((key) => [key, key.replace(/([A-Z])/g, " $1"), "", "boolean"]),
    ["screen", "Infotainment screen", "inches", "number"],
    ["seatMaterial", "Seat material"],
  ]),
  group("Safety features", [
    ["airbags", "Airbags", "", "number"],
    ...[
      "abs",
      "ebd",
      "stabilityControl",
      "tractionControl",
      "hillStartAssist",
      "rearCamera",
      "parkingSensors",
      "isofix",
    ].map((key) => [
      key,
      key
        .replace(/([A-Z])/g, " $1")
        .replace(/^(abs|ebd|isofix)$/, (s) => s.toUpperCase()),
      "",
      "boolean",
    ]),
    ["adas", "ADAS features"],
  ]),
  group("Ownership and maintenance", [
    ["maintenanceCost", "Estimated annual maintenance", "PKR/year", "number"],
    ["partsAvailability", "Parts availability in Pakistan"],
    ["partsCost", "Parts cost category"],
    ["resaleValue", "Resale information"],
    ["depreciation", "Estimated annual depreciation", "%", "number"],
    ["reliability", "Reliability information"],
    ["warranty", "Warranty"],
    ["afterSales", "After-sales service"],
  ]),
];
export const compareFields = compareGroups.flatMap((group) => group.fields);
export const fieldMap = Object.fromEntries(
  compareFields.map((field) => [field.key, field]),
);
export const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";
export function runningCost(
  specs,
  distance,
  fuelPrice,
  tariff,
  mode = "combinedEconomy",
) {
  const value = (key) => specs[key]?.value;
  const electric = /^(electric|ev|bev)$/i.test(value("fuelType") || "");
  const rate = Number(electric ? tariff : fuelPrice);
  const efficiency = Number(value(electric ? "energyConsumption" : mode));
  if (
    !hasValue(distance) ||
    !hasValue(electric ? tariff : fuelPrice) ||
    !Number.isFinite(Number(distance)) ||
    Number(distance) < 0 ||
    !Number.isFinite(rate) ||
    rate < 0 ||
    !Number.isFinite(efficiency) ||
    efficiency <= 0
  )
    return null;
  const monthly = electric
    ? (Number(distance) / 100) * efficiency * rate
    : (Number(distance) / efficiency) * rate;
  return { monthly, annual: monthly * 12, electric };
}
export const defaultCompareContent = [
  {
    title: "Compare cars in Pakistan with your daily needs in mind",
    description:
      "Start with the exact model year and variant. Compare passenger space, safety equipment and running costs against your commute, parking space and family needs. A test drive and an inspection help you assess comfort and condition before buying.",
    image: "/assets/categories/carCat.webp",
    alt: "Car for comparing everyday transport needs",
  },
  {
    title: "Understand new and used car prices in Pakistan",
    description:
      "Check the effective date of a new car price and whether it is an ex-factory amount. Registration, taxes and delivery can affect the total. Used market ranges are estimates influenced by condition, mileage and documentation. Compare equivalent variants before setting your budget.",
    image: "/assets/categories/vanCat.webp",
    alt: "Vehicle to consider when comparing purchase budgets",
  },
  {
    title: "Compare city, highway and combined fuel averages",
    description:
      "Stop-start city driving and steady highway journeys use fuel differently. Select the average that best matches your travel, then enter your monthly distance and fuel price. Keep manufacturer claims separate from real-world measurements, and use electricity consumption for electric vehicles.",
    image: "/assets/categories/ebikeCat.webp",
    alt: "Electric transport illustrating different energy costs",
  },
  {
    title: "Choose car specifications that matter to your family",
    description:
      "Check the safety and comfort equipment of the exact variant. Airbags, child-seat mounting points, luggage space and rear ventilation can matter more to a family than headline power. Review parts availability and service coverage alongside features you will use every day.",
    image: "/assets/categories/carCat.webp",
    alt: "Passenger car for evaluating safety and comfort features",
  },
];
