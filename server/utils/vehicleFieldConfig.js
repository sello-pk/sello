/**
 * Backend validation configuration for vehicle fields based on vehicle type
 * This mirrors the frontend configuration to ensure consistent validation
 */

export const VEHICLE_FIELD_CONFIG = {
  Car: {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "fuelType",
      "transmission",
      "city",
      "contactNumber",
      "warranty",
      "ownerType",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "colorExterior",
      "colorInterior",
      "mileage",
      "location",
      "whatsappNumber",
      "geoLocation", // Made optional - will use default if not provided
    ],
  },
  Bus: {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "fuelType",
      "city",
      "contactNumber",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "colorExterior",
      "colorInterior",
      "mileage",
      "features",
      "location",
      "whatsappNumber",
      "geoLocation",
    ],
  },
  Truck: {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "fuelType",
      "city",
      "contactNumber",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "colorExterior",
      "colorInterior",
      "mileage",
      "features",
      "location",
      "whatsappNumber",
      "geoLocation",
    ],
  },
  Van: {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "fuelType",
      "city",
      "contactNumber",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "colorExterior",
      "colorInterior",
      "mileage",
      "features",
      "location",
      "whatsappNumber",
      "geoLocation",
    ],
  },
  Bike: {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "city",
      "contactNumber",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "colorExterior",
      "colorInterior",
      "mileage",
      "features",
      "location",
      "whatsappNumber",
      "geoLocation",
    ],
  },
  "E-bike": {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "city",
      "contactNumber",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "colorExterior",
      "colorInterior",
      "mileage",
      "features",
      "location",
      "whatsappNumber",
      "batteryRange",
      "motorPower",
      "fuelType", // E-bikes are electric, but some might want to specify
      "transmission", // E-bikes may have gears
      "regionalSpec",
      "geoLocation",
    ],
  },
  Farm: {
    required: [
      "title",
      "make",
      "model",
      "year",
      "condition",
      "price",
      "city",
      "contactNumber",
    ],
    optional: [
      "description",
      "variant",
      "country",
      "state",
      "bodyType",
      "mileage",
      "location",
      "whatsappNumber",
      "fuelType",
      "geoLocation",
    ],
  },
};

/**
 * Get required fields for a vehicle type
 */
export const getRequiredFields = (vehicleType) => {
  return (
    VEHICLE_FIELD_CONFIG[vehicleType]?.required ||
    VEHICLE_FIELD_CONFIG.Car.required
  );
};

/**
 * Get optional fields for a vehicle type
 */
export const getOptionalFields = (vehicleType) => {
  return (
    VEHICLE_FIELD_CONFIG[vehicleType]?.optional ||
    VEHICLE_FIELD_CONFIG.Car.optional
  );
};

/**
 * Validate required fields for a vehicle type
 */
export const validateRequiredFields = (vehicleType, data) => {
  const requiredFields = getRequiredFields(vehicleType);
  const missing = [];
  requiredFields.forEach((key) => {
    const value = data[key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missing.push(key);
    }
  });
  return { isValid: missing.length === 0, missing };
};
