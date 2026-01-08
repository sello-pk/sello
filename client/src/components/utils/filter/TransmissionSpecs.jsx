import React from "react";
import SpecsUtility from "./SpecsUtility";
import { transmissionType } from "../../../assets/images/carDetails/types/bodyTypes";

const TransmissionSpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };
  return (
    <div>
      <SpecsUtility
        groupName={"transmissionType"}
        specsTypes={transmissionType}
        onChange={handleSelect}
      />
    </div>
  );
};

export default TransmissionSpecs;
