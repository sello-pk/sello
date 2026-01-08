import React from "react";
import SpecsUtility from "./SpecsUtility";
import { numberOfCylinders } from "../../../assets/images/carDetails/types/bodyTypes";

const CylindersSpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };
  return (
    <div>
      <SpecsUtility
        groupName={"numberofCylinders"}
        specsTypes={numberOfCylinders}
        onChange={handleSelect}
      />
    </div>
  );
};

export default CylindersSpecs;
