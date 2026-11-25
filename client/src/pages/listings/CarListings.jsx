import { corePageSeo } from "../../utils/corePageSeo.js";
import React from "react";
import { ShieldCheck, SlidersHorizontal, MapPin } from "lucide-react";
import GetAllCarsSection from "../../components/sections/listings/GetAllCarsSection";
import NeedInspiration from "../../components/sections/listings/NeedInspiration";
import BlogSection from "../../components/sections/home/BlogSection";
import ExploreBrands from "../../components/sections/listings/ExploreBrands";
import PartnerOffersSection from "../../components/sections/listings/PartnerOffersSection";
import SEO from "../../components/common/SEO";
import { AdSenseSlot } from "../../components/ads";
import { FaCheck } from "react-icons/fa6";

import { images } from "../../assets/assets.js";
import Faqs from "../../components/utils/Faqs.jsx";

const content = [
  {
    id: 1,
    image: images.CarsforSaleinPakistan,
    h2: "Cars for Sale in Pakistan",
    p: "Explore used cars for sale across Pakistan on SELLO. Look at brands, models and price ranges. If you are buying a car or upgrading, you can browse listings and talk to sellers to find options that fit your needs.",
    options: [
      "Browse new. Used cars from popular brands and models.",
      "Filter listings by price, location and vehicle details.",
      " Contact sellers directly to learn more and arrange your step.",
    ],
  },
  {
    id: 2,
    image: images.ElectricBikesforSaleinPakistan,
    h2: "Bikes & Electric Bikes for Sale in Pakistan",
    p: "If you are looking for a bike, a used one or an electric ride, SELLO has options all over Pakistan. You can look through motorcycles, compare what is there and get in touch with the people selling them. Whether it is for travel or a tight budget, you can find a ride that fits.",
    options: [
      "Look through used motorcycles from brands and models people know.",
      "Find bikes and scooters for getting around every day.",
      "Narrow listings by price and city, then reach out to sellers yourself.",
    ],
  },
  {
    id: 3,
    image: images.CommercialVehiclesforSaleinPakistan,
    h2: "Commercial Vehicles for Sale in Pakistan",
    p: "Find trucks, vans, buses and other commercial vehicles for sale across Pakistan on SELLO. Explore listings for business, transportation and logistics needs. Compare options and connect with sellers to find vehicles that suit your requirements.",
    options: [
      "Browse used trucks, vans and buses.",
      "Explore commercial vehicles from brands and models.",
      "Filter listings by price and city and contact sellers directly.",
    ],
  },
  {
    id: 4,
    image: images.TractorsforSaleinPakistan,
    h2: "Tractors & Agricultural Vehicles for Sale in Pakistan",
    p: "Discover used tractors and agricultural vehicles for sale in Pakistan on SELLO. Look at farming machinery and equipment, compare the options that're available and talk directly with sellers to find the vehicles that match your farming needs.",
    options: [
      "Browse new. Used tractors from popular brands and models.",
      "Explore agricultural. Farming equipment across Pakistan.",
      "Filter listings by price and city, then contact sellers directly.",
    ],
  },
];

const faqs = [
  {
    q: "Where can I find vehicles for sale in Pakistan?",
    a: "If you are looking for vehicles for sale in Pakistan, SELLO is the place to go. On SELLO, you can explore a range of cars, bikes, electric bikes, trucks, vans, buses and tractors.",
  },
  {
    q: "Can I find used cars on SELLO?",
    a: "Yes, SELLO offers listings for both used cars. On SELLO, you can browse brands, models and price ranges throughout Pakistan.",
  },
  {
    q: "Can I buy bikes and electric bikes online in Pakistan?",
    a: "Yes, you can buy bikes and electric bikes online. On SELLO, you will find used motorcycles and electric bikes listed by sellers across Pakistan.",
  },
  {
    q: "Does SELLO offer vehicles for sale?",
    a: "Yes, SELLO has vehicles for sale. On SELLO, you can explore trucks, vans, buses and other commercial vehicles from sellers over Pakistan.",
  },
  {
    q: "Can I find tractors and agricultural vehicles on SELLO?",
    a: "Yes, SELLO features tractors and agricultural vehicles. On SELLO, you can find farming vehicles and equipment that buyers can discover across Pakistan.",
  },
];

const CarListings = () => {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden">
      <SEO {...corePageSeo.listings} />

      <header className="relative min-h-[320px] overflow-hidden bg-[#050B20] md:h-[350px] md:min-h-0">
        {/* Decorative hero background: fill the header, never render at intrinsic size */}
        <div className="absolute inset-0">
          <img
            src={images.PakistanCarListingsBanner}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            width="1584"
            height="396"
          />
        </div>

        <div className="overlay absolute inset-0 bg-[#050B20]/50"></div>

        <div className="relative z-10 flex min-h-[320px] w-full max-w-8xl items-center mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 md:min-h-0">
          <div className="flex w-full flex-col items-center justify-center gap-3 sm:gap-4 max-w-full">
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">
              Sello listings
            </p>

            <h1 className="text-lg sm:text-xl lg:text-2xl md:text-2xl font-semibold text-white leading-snug tracking-tight text-balance pt-2.5">
              Find the Best Cars for Sale in Pakistan with{" "}
              <span className="text-primary-500">Verified Listings</span> &
              Great Details
            </h1>

            <p className="text-xs sm:text-xl text-gray-100 max-w-3xl text-pretty leading-relaxed">
              Filter by make, model, city, and price — then contact sellers
              directly.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                Verified listings
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                <SlidersHorizontal className="h-5 w-5 text-sky-400 shrink-0" />
                Smart filters
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                <MapPin className="h-5 w-5 text-white shrink-0" />
                Cities nationwide
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 xl:px-8">
        <GetAllCarsSection />
        <AdSenseSlot slot="listingFeed" />
        <NeedInspiration />
        {/* Content Posts */}
        <section className="max-full mx-auto py-8 md:py-16 flex flex-col gap-8">
          {content.map((cnt, i) => {
            // even index (1st, 3rd...) => image left, odd index (2nd, 4th...) => image right
            const isReversed = i % 2 !== 0;

            return (
              <div
                key={cnt.id}
                className={`flex flex-col ${
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
        </section>
        <BlogSection />
        <ExploreBrands />
        <PartnerOffersSection />
        <Faqs faqs={faqs} />
      </div>
    </div>
  );
};

export default CarListings;
