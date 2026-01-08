// import React from "react";
// import SpecsUtility from "./SpecsUtility";
// import { engineCapacityCC } from "../../../assets/images/carDetails/types/bodyTypes";

// const EngineCapacitySpecs = (onChange) => {
//   const handleSelect = (titleValue) => {
//     if (onChange) {
//       onChange(titleValue);
//     }
//   };

//   return (
//     <div>
//       <SpecsUtility
//         specsTypes={engineCapacityCC}
//         groupName={"engineCapacity"}
//         onChange={handleSelect}
//       />
//     </div>
//   );
// };

// export default EngineCapacitySpecs;

import React from "react";
import { engineCapacityCC } from "../../../assets/images/carDetails/types/bodyTypes";
import SpecsUtility from "./SpecsUtility";

const EngineCapacitySpecs = ({ onChange }) => {
  const handleSelect = (titleValue) => {
    const value = titleValue || "";
    if (onChange) {
      onChange(value); // prevent crash if no handler passed
    }
  };

  return (
    <div>
      <SpecsUtility
        groupName="engineCapacity"
        specsTypes={engineCapacityCC}
        onChange={handleSelect}
      />
    </div>
  );
};

export default EngineCapacitySpecs;
