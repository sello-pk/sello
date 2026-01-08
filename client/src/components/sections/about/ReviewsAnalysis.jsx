import React from "react";

const stats = [
  {
    label: "Avg. Rating",
    value: "5.0",
    sub: "Based on verified reviews",
  },
  {
    label: "Happy Customers",
    value: "10k+",
    sub: "Across Pakistan",
  },
  {
    label: "Cars Sold",
    value: "25k+",
    sub: "Via Sello marketplace",
  },
  {
    label: "Response Time",
    value: "< 10 min",
    sub: "For new inquiries",
  },
];

const ReviewsAnalysis = () => {
  return (
    <div className="bg-gray-50 relative overflow-hidden">
      <div className="relative bg-white px-3 sm:px-4 md:px-6 lg:px-8 py-16 md:py-20 w-full rounded-tl-[60px] md:rounded-tl-[80px] shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary-500 font-bold text-xs md:text-sm uppercase tracking-widest px-4 py-2 bg-primary-100 rounded-full">
                Review Insights
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Trusted by Car Buyers & Sellers
            </h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"></div>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              A quick snapshot of what customers consistently highlight about
              their experience on Sello.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((item, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 to-transparent rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <p className="text-sm md:text-base font-bold text-primary-500 tracking-wide uppercase">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl md:text-4xl font-extrabold text-gray-900">
                    {item.value}
                  </p>
                  <p className="mt-2 text-gray-600 font-medium">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsAnalysis;
