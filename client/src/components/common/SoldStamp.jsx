import React from "react";

const SoldStamp = ({ className = "" }) => {
  return (
    <div className={`absolute top-4 left-4 z-20 ${className}`}>
      <div className="relative">
        {/* Stamp Container */}
        <div className="relative w-24 h-24 transform -rotate-12 hover:rotate-0 transition-transform duration-300">
          {/* Outer Circle with Stamp Effect */}
          <div className="absolute inset-0 rounded-full border-4 border-red-600 bg-red-50 shadow-2xl">
            {/* Inner Circle */}
            <div className="absolute inset-1 rounded-full border-2 border-red-700 bg-red-100">
              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-red-800 font-bold text-xl leading-none transform scale-110">
                  SOLD
                </div>
                {/* Stamp Texture Effect */}
                <div className="absolute inset-0 rounded-full opacity-30">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-red-200 to-transparent"></div>
                </div>
                {/* Stamp Imperfections */}
                <div className="absolute top-1 left-2 w-1 h-1 bg-red-900 rounded-full opacity-40"></div>
                <div className="absolute bottom-3 right-2 w-1.5 h-1.5 bg-red-900 rounded-full opacity-30"></div>
                <div className="absolute top-3 right-4 w-1 h-1 bg-red-900 rounded-full opacity-50"></div>
                <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-red-900 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
          {/* Stamp Shadow */}
          <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-red-900 rounded-full opacity-20 blur-md transform translate-x-1 translate-y-1"></div>
          {/* Additional Shadow for Depth */}
          <div className="absolute -bottom-0.5 -right-0.5 w-24 h-24 bg-red-800 rounded-full opacity-30 blur-sm transform translate-x-0.5 translate-y-0.5"></div>
        </div>

        {/* Ink Splatter Effects */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-red-600 rounded-full opacity-40 transform translate-x-1 translate-y-1"></div>
        <div className="absolute bottom-2 right-0 w-1.5 h-1.5 bg-red-700 rounded-full opacity-30 transform translate-x-2"></div>
        <div className="absolute top-3 right-1 w-1 h-1 bg-red-600 rounded-full opacity-50"></div>
        <div className="absolute bottom-1 left-1 w-1 h-1 bg-red-800 rounded-full opacity-40"></div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-red-400 opacity-0 hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
      </div>
    </div>
  );
};

export default SoldStamp;
