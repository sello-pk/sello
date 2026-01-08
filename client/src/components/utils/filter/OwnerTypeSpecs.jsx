import React from "react";
import SpecsUtility from "./SpecsUtility";
import { ownerType } from "../../../assets/images/carDetails/types/bodyTypes";

const OwnerTypeSpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };
  return (
    <div>
      <SpecsUtility
        groupName={"ownerType"}
        specsTypes={ownerType}
        onChange={handleSelect}
      />
    </div>
  );
};

export default OwnerTypeSpecs;
