import React, { useMemo } from "react";
import SpecsUtility from "./SpecsUtility";
import {
  getBodyTypesByVehicleType,
  fuelType,
  transmissionType,
  doors,
  numberOfCylinders,
  engineCapacityCC,
  horsePower,
  regionalSpecs,
  ownerType,
  warrantyType,
  carCondition,
  technicalFeatures,
} from "../../../assets/images/carDetails/types/bodyTypes";

const SPEC_CONFIG = {
  bodyTypes: {
    groupName: "bodyTypes",
    getSpecs: (vehicleType) => getBodyTypesByVehicleType(vehicleType || "Car"),
    needsVehicleType: true,
  },
  fuelType: {
    groupName: "fuelType",
    getSpecs: (vehicleType) => {
      if (vehicleType === "Bus" || vehicleType === "Truck" || vehicleType === "Van") {
        return fuelType.filter((f) => f.titleValue === "Diesel" || f.titleValue === "Petrol");
      }
      return fuelType;
    },
    needsVehicleType: true,
  },
  transmissionType: {
    groupName: "transmissionType",
    getSpecs: () => transmissionType,
  },
  doors: {
    groupName: "doors",
    getSpecs: () => doors,
  },
  numberOfCylinders: {
    groupName: "numberofCylinders",
    getSpecs: () => numberOfCylinders,
  },
  engineCapacity: {
    groupName: "engineCapacity",
    getSpecs: () => engineCapacityCC,
  },
  horsepower: {
    groupName: "horsepower",
    getSpecs: () => horsePower,
  },
  regionalSpecs: {
    groupName: "regionalSpecs",
    getSpecs: () => regionalSpecs,
  },
  ownerType: {
    groupName: "ownerType",
    getSpecs: () => ownerType,
  },
  warrantyType: {
    groupName: "warrantyType",
    getSpecs: () => warrantyType,
  },
  condition: {
    groupName: "condition",
    getSpecs: () => carCondition,
  },
  technicalFeatures: {
    groupName: "features",
    getSpecs: () => technicalFeatures,
    multiple: true,
  },
};

/**
 * Consolidated filter spec component. Renders a SpecsUtility for the given specType.
 * @param {string} specType - One of: bodyTypes, fuelType, transmissionType, doors, numberOfCylinders, engineCapacity, horsepower, regionalSpecs, ownerType, warrantyType, condition, technicalFeatures
 * @param {string} [vehicleType] - Required for bodyTypes and fuelType (Car, Bus, Truck, Van)
 * @param {*} value - Controlled value (single value or array for multiple)
 * @param {function} onChange - (value) => void
 */
const FilterSpecs = ({ specType, vehicleType = "Car", value, onChange }) => {
  const config = SPEC_CONFIG[specType];
  if (!config) return null;

  const specsTypes = useMemo(
    () => (config.getSpecs ? config.getSpecs(vehicleType) : []),
    [specType, vehicleType]
  );

  const handleSelect = (nextValue) => {
    if (onChange) {
      onChange(config.multiple ? nextValue : (nextValue || ""));
    }
  };

  if (!specsTypes || specsTypes.length === 0) return null;

  return (
    <div className="min-w-0 max-w-full">
      <SpecsUtility
        groupName={config.groupName}
        specsTypes={specsTypes}
        value={value}
        onChange={handleSelect}
        multiple={config.multiple || false}
      />
    </div>
  );
};

export default FilterSpecs;
