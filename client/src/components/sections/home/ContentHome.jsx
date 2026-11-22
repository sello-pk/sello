import React from "react";
import { FaCheck } from "react-icons/fa6";
import { images } from "../../../assets/assets";

// Content
const content = [
  {
    id: 1,
    image: images.selloVideo,
    h2: "A Smarter Way to Sell Your Car in Pakistan",
    p: "In Pakistan if you are looking to put your car for sale or reach out to the buyers that are actively in the market for a used car, we connect you with true buying prospects from across the nation. We have designed our platform to get a fair price for your car quickly and in a transparent way.",
    options: [
      "Post your car for sale in Karachi, Islamabad, Lahore, Okara and outlying areas.",
      "Reach out to a large audience of car buyers which includes both new and used cars for sale in Pakistan.",
      "Get quick inspections at great prices and also have transparent and reliable valuations.",
    ],
  },
  {
    id: 2,
    image: images.selloVideo,
    h2: "Buy and Sell Cars in Pakistan",
    p: "Looking for an used car in Pakistan? SELLO has you covered. Check out listings from known brands and get in touch with buyers or sellers all over the country.",
    options: [
      "Browse new. Used cars from many brands, models and price ranges across Pakistan.",
      "Find cars in cities and talk to sellers directly about the car you want.",
      "Have a car to sell? Put it on SELLO. Reach people who are searching for vehicles online.",
    ],
  },
  {
    id: 3,
    image: images.selloVideo,
    h2: "Bikes & Electric Bikes Marketplace",
    p: "Find motorcycles and electric bikes for sale across Pakistan on SELLO. Explore. Connect with sellers nationwide.",
    options: [
      "Browse used motorcycles from popular brands, models and price ranges across Pakistan and compare options.",
      "Discover bikes for daily commuting, with options to suit different needs and budgets across Pakistan.",
      "Discover bikes for daily commuting, with options to suit different needs and budgets across Pakistan.",
    ],
  },
];

const ContentHome = () => {
  return (
    <div className="max-w-8xl mx-auto py-8 md:py-16 flex flex-col gap-8">
      {content.map((cnt, i) => {
        // even index (1st, 3rd...) => image left, odd index (2nd, 4th...) => image right
        const isReversed = i % 2 !== 0;

        return (
          <div
            key={cnt.id}
            className={`mx-3 sm:mx-4 md:mx-6 lg:mx-8 flex flex-col ${
              isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
            } lg:items-stretch gap-6 bg-gradient-to-b from-primary-50 to-white shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-xl`}
          >
            <div className="video relative w-full lg:w-[40%] aspect-[16/10] lg:aspect-auto lg:min-h-[22rem] overflow-hidden">
              <img
                src={cnt.image}
                alt={cnt.h2}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="content w-full lg:w-[60%] py-2 px-4 sm:px-5 lg:px-6 flex flex-col justify-center">
              <h2 className="md:text-4xl text-3xl font-semibold max-w-4xl pb-5">
                {cnt.h2}
              </h2>
              <p className="py-4 text-gray-600">{cnt.p}</p>
              <ul>
                {cnt.options.map((list, index) => (
                  <li key={index} className="flex items-center gap-2 my-2">
                    <FaCheck className="md:w-7 w-5 md:h-7 h-5 shrink-0 rounded-full bg-white text-green-400 p-1 shadow-md" />
                    {list}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContentHome;
