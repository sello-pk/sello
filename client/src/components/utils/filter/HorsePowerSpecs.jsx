import React from "react";
import { horsePower } from "../../../assets/images/carDetails/types/bodyTypes";
import SpecsUtility from "./SpecsUtility";

const HorsePowerSpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    // Allow clearing (null) and keep the full label for backend/UI consistency
    const value = titleValue || "";
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div>
      <SpecsUtility
        groupName="horsepower"
        specsTypes={horsePower}
        onChange={handleSelect}
      />
    </div>
  );
};

export default HorsePowerSpecs;
