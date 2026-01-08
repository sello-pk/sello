import React, { useState } from "react";
import { technicalFeatures } from "../../../assets/images/carDetails/types/bodyTypes";
import SpecsUtility from "./SpecsUtility";

const TechnicalFeaturesSpecs = ({ onChange }) => {
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const handleSelect = (titleValue) => {
    const newFeatures = selectedFeatures.includes(titleValue)
      ? selectedFeatures.filter((f) => f !== titleValue)
      : [...selectedFeatures, titleValue];
    setSelectedFeatures(newFeatures);
    if (onChange) {
      onChange(newFeatures);
    }
  };

  return (
    <div>
      <SpecsUtility
        groupName="features"
        specsTypes={technicalFeatures}
        onChange={handleSelect}
        multiple
      />
    </div>
  );
};

export default TechnicalFeaturesSpecs;
