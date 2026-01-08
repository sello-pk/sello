import React from "react";
import SpecsUtility from "./SpecsUtility";
import { warrantyType } from "../../../assets/images/carDetails/types/bodyTypes";

const WarrantyType = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };
  return (
    <div>
      <SpecsUtility
        groupName={"warrantyType"}
        specsTypes={warrantyType}
        onChange={handleSelect}
      />
    </div>
  );
};

export default WarrantyType;
