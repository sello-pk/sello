

import React from "react";
import { carCondition } from "../../../assets/images/carDetails/types/bodyTypes"; // Fixed: carCondtion → carCondition
import SpecsUtility from "./SpecsUtility";

const CarCondition = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };

  return (
    <div>
      <SpecsUtility
        groupName="condition"
        specsTypes={carCondition}
        onChange={handleSelect}
      />
    </div>
  );
};

export default CarCondition;
