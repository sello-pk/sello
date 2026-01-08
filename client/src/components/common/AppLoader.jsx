import React from 'react';

/**
 * Professional App-Level Loader
 * Only used for initial application load/reload
 * Clean and minimal design similar to PakWheels/Dubizzle
 */
const AppLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Spinning Loader Circle with Sello inside */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          {/* Sello text inside the circle */}
          <h1 className="text-xl font-bold text-gray-900 relative z-10">Sello</h1>
        </div>
        
        {/* Loading Text */}
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
};

export default AppLoader;

