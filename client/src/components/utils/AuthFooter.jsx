import React from "react";

const AuthFooter = ({ text }) => {
  return (
    <div className="bg-slate-900 text-white px-4 md:px-6 py-4">
      <p className="text-sm text-gray-300 mb-3">{text}</p>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium mb-1">Jim Bowden</h3>
          <p className="text-sm text-gray-400 mb-1">UAE</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, index) => (
              <svg
                key={index}
                className="w-4 h-4 fill-yellow-400"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 border border-white/30">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 border border-white/30">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthFooter;

