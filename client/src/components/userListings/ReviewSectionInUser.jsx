import React from "react";
import { customersReviews } from "../../assets/images/carDetails/types/bodyTypes";
import { images } from "../../assets/assets";

const ReviewSectionInUser = () => {
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-[#F5F5F5]">
      <div className="reviews h-auto md:h-[60vh] w-full rounded-tr-[60px] rounded-bl-[60px] bg-primary md:py-0 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-7 gap-4 md:gap-0">
          <h3 className="text-2xl md:text-4xl font-semibold text-black">
            What our customers say
          </h3>
          <p className="text-sm md:text-base text-gray-800">
            Rated 4.7 / 5 based on 28,370 reviews Showing our 4 & 5 stars
            reviews
          </p>
        </div>

        {/* Reviews */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 justify-center mt-10 px-4 md:px-0">
          {customersReviews.map((rev) => {
            return (
              <div
                className="bg-white w-full md:w-[37%] rounded-lg p-5 shadow-sm"
                key={rev.id}
              >
                <div className="flex items-center justify-between">
                  <h6 className="font-semibold">Great Work</h6>
                  <img src={images.comma} alt="commma" className="w-5 md:w-6" />
                </div>
                <div className="mt-5">
                  <p className="text-sm md:text-base">{rev.review}</p>
                  <div className="flex items-center gap-5 my-5">
                    <img
                      src={rev.image}
                      alt="customer"
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
                    />
                    <div>
                      <h6 className="font-semibold">{rev.customerName}</h6>
                      <p className="text-gray-600 text-sm">
                        {rev.customerRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewSectionInUser;
