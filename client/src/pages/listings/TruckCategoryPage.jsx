import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { FaTruck } from "react-icons/fa6";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import {
  truckCatBlog,
  truckCatBlog2,
  categoriesBlogsImages,
} from "../../assets/assets";

const TruckCategoryPage = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [filters, setFilters] = useState(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  const vehicleType = "Truck";

  const queryParams = {
    page,
    limit: 12,
    vehicleType,
    ...filters,
  };

  const { data, isLoading, error } = useGetFilteredCarsQuery(queryParams);

  const cars = data?.cars || [];
  const total = data?.total || 0;
  const pages = data?.pages || 0;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    window.history.pushState(
      {},
      {},
      `/listings/truck${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    if (newPage > 1) {
      newParams.set("page", newPage.toString());
    }
    window.history.pushState(
      {},
      {},
      `/listings/truck${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white shadow-none"
        style={{
          backgroundImage: `url("/assets/categories/truckCat.svg")`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 bg-black/15 shadow-none">
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 mb-8 text-white/90 hover:text-white transition transform hover:scale-105"
          >
            <HiOutlineArrowLeft /> Back to All Vehicles
          </Link>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl shadow-none" style={{ boxShadow: "none", border: "none" }}>
                <FaTruck className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: "none" }}>
              Trucks
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Trucks and heavy-duty vehicles
            </p>

            {/* Stats */}
            {total > 0 && (
              <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-0" style={{ border: "none" }}>
                <span className="text-white font-semibold">
                  {total} {total === 1 ? "Listing" : "Listings"} Available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8 shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-lg shadow-none border-0 outline-none p-6 sticky top-4"
              style={{ boxShadow: "none !important", border: "none !important", outline: "none !important" }}
            >
              <h2 className="text-xl font-semibold mb-4">Advanced Filters</h2>
              <CategoryFilterForm
                vehicleType={vehicleType}
                onFilter={handleFilterChange}
              />
            </div>
          </div>

          {/* Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading truck listings...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">
                  Error loading listings. Please try again.
                </p>
              </div>
            ) : cars.length === 0 ? (
              <div
                className="text-center py-12 bg-white rounded-lg shadow-none border-0 outline-none"
                style={{ boxShadow: "none !important", border: "none !important", outline: "none !important" }}
              >
                <FaTruck className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Truck Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No truck listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a Truck Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Truck Listings ({total})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 shadow-none">
                  {cars.map((car) => (
                    <CarCard key={car._id} car={car} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-4 py-2 rounded-lg transition ${
                          page === p
                            ? "bg-primary-500 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Blogs Section - Custom for Trucks */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Truck Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, maintenance guides, and latest news about
            trucks
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="blogs space-y-8">
          {/* Blogs 01 */}
          <div className="blog1 w-full flex flex-col md:flex-row gap-4  transition-all duration-300 overflow-hidden">
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.truckCatBlog}
                alt="How to Buy Right Truck in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Buying Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Buy Right Truck in Pakistan – 2026 Guide
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Let's face it—buying a truck in Pakistan is a big deal. For
                  most businesses in Pakistan, it's not just another expense;
                  it's an investment. Maybe you're hauling goods, running a
                  logistics gig, or working construction. With so many choices
                  out there, it's easy to get lost.
                </p>

                <p className="mb-4">
                  That's why{" "}
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  matters. They take away the usual headaches by showing you
                  verified trucks, honest prices, and letting you talk to
                  sellers directly without any dodgy middlemen. What you see is
                  what you get.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Know What You Need
                    </h3>
                    <p className="mb-3">
                      First, figure out what you actually want the truck for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        If you're hauling goods, focus on payload and fuel
                        savings.
                      </li>
                      <li>
                        For construction or heavy work, check out engine power,
                        toughness, and suspension.
                      </li>
                      <li>
                        Delivery or logistics? You'll want something that's easy
                        on fuel, fits city roads, and isn't a pain to drive.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Choose the Right Type
                    </h3>
                    <p className="mb-3">
                      Not all trucks are built the same. Here's the quick
                      lowdown:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Mini Trucks (like Suzuki Carry, FAW mini): great for
                        small businesses and city driving.
                      </li>
                      <li>
                        Medium Trucks (Isuzu, Toyota Dyna): handle mid-sized
                        loads, perfect for logistics.
                      </li>
                      <li>
                        Heavy-Duty Trucks (Hino, Mitsubishi Fuso): these are the
                        beasts—built for long runs and tough jobs.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Inspect the Truck—Seriously, Don't Skip This
                    </h3>
                    <p className="mb-3">
                      Whether it's brand-new or secondhand, check it in person:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Open the hood. Listen for weird noises or leaks.</li>
                      <li>
                        Test the brakes, suspension—make sure it feels right.
                      </li>
                      <li>Look over the tires, body, and frame for damage.</li>
                      <li>
                        Picture your usual loads—can this truck handle it?
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Check the Paperwork
                    </h3>
                    <p className="mb-3">
                      Fake or missing documents are a nightmare—don't risk it:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Registration and smart card</li>
                      <li>Token tax slips</li>
                      <li>Seller's CNIC</li>
                      <li>Official transfer letter</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare Prices, Then Negotiate
                    </h3>
                    <p className="mb-3">
                      Prices jump around a lot depending on year, brand, and
                      condition:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Line up a few similar trucks on Sello.pk and see how
                        they stack up.
                      </li>
                      <li>
                        Count in the cost for repairs or maintenance before you
                        talk numbers.
                      </li>
                      <li>
                        Take your time. Don't let anyone pressure you into a
                        quick deal.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Pay and Transfer Ownership Right Way
                    </h3>
                    <p className="mb-3">
                      Don't mess around when money's involved:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Go with bank transfers—so there's always a record.
                      </li>
                      <li>Finish the deal at the excise office.</li>
                      <li>
                        Get everything in writing. Don't just rely on a
                        handshake.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Sello Expert
                      </p>
                      <p className="text-xs text-gray-500">Jan 18, 2026</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">20 min read</span>
                </div>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 font-medium text-sm transition-colors"
                >
                  {isExpanded ? "Show Less" : "Learn More"}
                  <HiOutlineArrowLeft
                    className={`transform ${isExpanded ? "rotate-0" : "rotate-180"} transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Blogs 02 */}
          <div className="blog2 w-full flex flex-col md:flex-row-reverse gap-4 bg-white rounded-lg shadow-none border-0 outline-none transition-all duration-300 overflow-hidden" style={{ boxShadow: "none", border: "none", outline: "none" }}>
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.truckCatBlog2}
                alt="Tips for Buying Used Trucks in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Complete Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                Complete Guide to Buying Trucks in Pakistan – 2026
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Buying a used truck is one of the smartest ways to save money
                  if you run a business in Pakistan. Maybe you're after a mini
                  truck for city jobs, or you need something bigger that can
                  handle heavy loads. Either way, if you know what you're doing,
                  you'll land a solid deal and skip the nasty surprises.
                </p>

                <p className="mb-4">
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  helps out by listing verified trucks, detailed specs, and a
                  safe way to connect with sellers. Let's cut through the noise
                  and get you the right truck, without the usual headaches.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded2 ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What You Need
                    </h3>
                    <p className="mb-3">
                      Before you scroll through listings, get clear on the
                      basics:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        What will you use the truck for? Deliveries? Long hauls?
                        Construction?
                      </li>
                      <li>
                        How much weight will you be moving? You'll need light,
                        medium, or heavy-duty depending on your cargo.
                      </li>
                      <li>
                        What type of truck fits? Mini, medium, or heavy-duty?
                      </li>
                      <li>
                        Diesel, petrol, or CNG? Your fuel choice affects running
                        costs.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Pick the Right Truck Type
                    </h3>
                    <p className="mb-3">
                      Different jobs need different trucks:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Mini trucks (Suzuki Carry, FAW): Perfect for city
                        deliveries and tight spaces.
                      </li>
                      <li>
                        Medium trucks (Isuzu, Toyota Dyna): Great for mid-sized
                        loads.
                      </li>
                      <li>
                        Heavy-duty (Hino, Mitsubishi Fuso): Built for big
                        payloads and long hauls.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Inspect Before You Buy
                    </h3>
                    <p className="mb-3">
                      Even if a truck looks great in photos, don't skip the
                      inspection. Check:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Engine and transmission—no leaks, smooth shifting.
                      </li>
                      <li>Brakes and suspension—safety first.</li>
                      <li>
                        Tires and body—look for rust, worn treads, or damage.
                      </li>
                      <li>Cargo area—can it handle your loads?</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Double-Check the Paperwork
                    </h3>
                    <p className="mb-3">
                      No shortcuts here. Make sure you get:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The original registration or smart card</li>
                      <li>Token tax payment receipts</li>
                      <li>Seller's CNIC copy</li>
                      <li>Real transfer letter</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare Prices and Negotiate
                    </h3>
                    <p className="mb-3">
                      Truck prices depend on model, year, condition, and
                      payload. So:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Check out several listings on Sello.pk to see price
                        range.
                      </li>
                      <li>
                        If you spot minor issues, use them to negotiate a better
                        deal.
                      </li>
                      <li>
                        Don't rush—this is a big investment, so take your time.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Pay Safely and Transfer Ownership
                    </h3>
                    <p className="mb-3">
                      Use bank transfers so there's a record.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Do the transfer at your local excise office.</li>
                      <li>Always get receipts and confirmations.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      A Few Extra Tips
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Always inspect before you buy.</li>
                      <li>Pick the right fuel type for your budget.</li>
                      <li>Ask about past accidents or major repairs.</li>
                      <li>Double-check the mileage and engine health.</li>
                      <li>Negotiate based on facts, not just gut feeling.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Wrapping Up
                    </h3>
                    <p className="mb-3">
                      Buying a truck in Pakistan doesn't have to be complicated
                      or risky. Stick to these steps, use Sello.pk's verified
                      listings and smart filters, and you'll find the truck that
                      actually fits your business.
                    </p>
                  </div>
                </div>

                {!isExpanded2 && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Sello Expert
                      </p>
                      <p className="text-xs text-gray-500">Jan 18, 2026</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">25 min read</span>
                </div>

                <button
                  onClick={() => setIsExpanded2(!isExpanded2)}
                  className="mt-4 inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 font-medium text-sm transition-colors"
                >
                  {isExpanded2 ? "Show Less" : "Learn More"}
                  <HiOutlineArrowLeft
                    className={`transform ${isExpanded2 ? "rotate-0" : "rotate-180"} transition-transform`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
          >
            View All Blogs
            <HiOutlineArrowLeft className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TruckCategoryPage;
