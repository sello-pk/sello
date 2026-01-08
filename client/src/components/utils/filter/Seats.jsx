import React from "react";
import { numberOfSeats } from "../../../assets/images/carDetails/types/bodyTypes";
import SpecsUtility from "./SpecsUtility";

const Seats = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    if (onChange) {
      onChange(titleValue);
    }
  };
  return (
    <div>
      <SpecsUtility
        groupName={"numberOfSeats"}
        specsTypes={numberOfSeats}
        onChange={handleSelect}
      />
    </div>
  );
};

export default Seats;
