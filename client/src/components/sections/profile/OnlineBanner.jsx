// import React from "react";
// import { profileAssets } from "../../../assets/profilePageAssets/profileAssets";

// const OnlineBanner = () => {
//   return (
//     <div className="w-full md:h-[78vh] flex items-center justify-center">
//       <div className="banner md:h-[90%] bg-[#F5F5F5] w-[90%] rounded-tl-[60px] rounded-br-[60px] p-8 flex items-center gap-14">
//         <div className="image h-full w-[45%]">
//           <img
//             src={profileAssets.carImage}
//             alt="car"
//             className="h-full w-full object-cover rounded-tl-[60px] rounded-br-[60px]"
//           />
//         </div>
//         <div className="content h-full w-[50%]">
//           <h2 className="text-4xl font-semibold my-8">
//             Online, in-person, <br />
//             everywhere
//           </h2>
//           <p className="text-gray-800 py-8 text-lg">
//             Choose from thousands of vehicles from multple brands and buy online
//             with click & Drive, or visit us at one of our dealerships today.
//           </p>
//           <button className="border-[1px] border-black px-8 py-3 rounded-lg hover:bg-black hover:text-white ease-in-out duration-300 transition-all ">
//             Get Started
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OnlineBanner;

import React from "react";
import { profileAssets } from "../../../assets/profilePageAssets/profileAssets";

const OnlineBanner = () => {
  return (
    <div className="w-full md:h-[78vh] flex items-center justify-center px-4">
      <div className="banner md:h-[90%] bg-[#F5F5F5] w-full md:w-[90%] rounded-tl-[60px] rounded-br-[60px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-14">
        {/* Image */}
        <div className="image w-full md:w-[45%] h-64 md:h-full">
          <img
            src={profileAssets.carImage}
            alt="car"
            className="h-full w-full object-cover rounded-tl-[40px] md:rounded-tl-[60px] rounded-br-[40px] md:rounded-br-[60px]"
          />
        </div>

        {/* Content */}
        <div className="content w-full md:w-[50%] text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-semibold my-4 md:my-8">
            Online, in-person, <br className="hidden md:block" />
            everywhere
          </h2>
          <p className="text-gray-800 py-4 md:py-8 text-base md:text-lg">
            Choose from thousands of vehicles from multiple brands and buy
            online with Click & Drive, or visit us at one of our dealerships
            today.
          </p>
          <button className="border border-black px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-black hover:text-white ease-in-out duration-300 transition-all">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineBanner;
