import React from "react";
import SpecsUtility from "./SpecsUtility";
import { doors } from "../../../assets/images/carDetails/types/bodyTypes";

const DoorsSpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };
  return (
    <div>
      <SpecsUtility
        groupName={"doors"}
        specsTypes={doors}
        onChange={handleSelect}
      />
    </div>
  );
};

export default DoorsSpecs;
