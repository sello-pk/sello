import React from "react";
import { regionalSpecs } from "../../../assets/images/carDetails/types/bodyTypes";
import SpecsUtility from "./SpecsUtility";

const RegionalSpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue); // Send to parent
    }
  };

  return (
    <>
      <SpecsUtility
        groupName={"regionalSpecs"}
        specsTypes={regionalSpecs}
        onChange={handleSelect}
      />
    </>
  );
};

export default RegionalSpecs;
