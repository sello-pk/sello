import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { FaBicycle } from "react-icons/fa6";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import { categoriesBlogsImages } from "../../assets/assets";

const EBikeCategoryPage = () => {
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

  const vehicleType = "E-bike";

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
      `/listings/e-bike${newParams.toString() ? "?" + newParams.toString() : ""}`,
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
      `/listings/e-bike${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white shadow-none"
        style={{
          backgroundImage: `url("/assets/categories/ebikeCat.svg")`,
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
              <div
                className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl shadow-none"
                style={{ boxShadow: "none", border: "none" }}
              >
                <FaBicycle className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1
              className="text-5xl md:text-6xl font-bold mb-4 text-white"
              style={{ textShadow: "none" }}
            >
              E-Bikes
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Electric bikes and scooters
            </p>

            {/* Stats */}
            {total > 0 && (
              <div
                className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border-0"
                style={{ border: "none" }}
              >
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
              style={{
                boxShadow: "none !important",
                border: "none !important",
                outline: "none !important",
              }}
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
                <p className="mt-4 text-gray-600">Loading e-bike listings...</p>
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
                style={{
                  boxShadow: "none !important",
                  border: "none !important",
                  outline: "none !important",
                }}
              >
                <FaBicycle className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No E-Bike Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No e-bike listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post an E-Bike Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    E-Bike Listings ({total})
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

      {/* Blogs Section - Custom for E-Bikes */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest E-Bike Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, battery care guides, and latest news about
            electric bikes
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="blogs space-y-8">
          {/* Blogs 01 */}
          <div className="blog1 w-full flex flex-col md:flex-row gap-4  transition-all duration-300 overflow-hidden">
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.ebikeCatBlog}
                alt="How to Choose Right E-Bike for Commercial Use in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Buying Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Choose Right E-Bike for Commercial Use in Pakistan – 2026
                Guide
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  E-Bikes are popping up everywhere in Pakistan, especially for
                  delivery work, courier services, and eco-friendly city travel.
                  They're cheap to run, don't guzzle fuel, and are a lot easier
                  to maintain than old-school motorcycles.
                </p>

                <p className="mb-4">
                  With the market growing fast in Karachi, Lahore, Islamabad,
                  and other cities, picking the right E-Bike matters. It's not
                  just about the price or the look—you need something that
                  actually works for your business.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Know What You Need
                    </h3>
                    <p className="mb-3">
                      First, figure out what you'll use the E-Bike for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Delivery?</strong> Then you want decent cargo
                        space, a strong battery, and something that won't break
                        down after a few months.
                      </li>
                      <li>
                        <strong>Courier work?</strong> Speed and efficiency
                        matter, plus it should handle a bit of weight.
                      </li>
                      <li>
                        <strong>General business use?</strong> Think about how
                        your brand looks, whether you need to move the bike
                        around easily, and how much you'll spend on maintenance.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Pick the Right E-Bike Type
                    </h3>
                    <p className="mb-3">Here's what's out there:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Lightweight Delivery E-Bikes:</strong> Perfect
                        for small businesses or inner-city jobs.
                      </li>
                      <li>
                        <strong>Heavy-Duty Cargo E-Bikes:</strong> These are
                        built for tougher courier and delivery work.
                      </li>
                      <li>
                        <strong>Passenger E-Bikes:</strong> Starting to catch on
                        for ride-hailing or short city trips.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Check the Battery and Mechanics
                    </h3>
                    <p className="mb-3">
                      Even if you're looking at a used E-Bike, don't skip the
                      inspection:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Look at the battery—how's its health, how fast does it
                        charge?
                      </li>
                      <li>Check the brakes, suspension, and tires.</li>
                      <li>Test the motor and see how it handles.</li>
                      <li>
                        Make sure any cargo boxes or extra seats aren't loose.
                      </li>
                      <li>
                        Ask about the battery's age and expected lifespan.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Don't Forget Paperwork
                    </h3>
                    <p className="mb-3">
                      You need the right documents for a smooth handover:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Original registration or smart card</li>
                      <li>Token tax receipts</li>
                      <li>Seller's CNIC</li>
                      <li>Transfer letter</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare and Negotiate
                    </h3>
                    <p className="mb-3">
                      Prices change a lot depending on the brand, battery, and
                      condition:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Look at a few different listings on Sello.pk.</li>
                      <li>
                        Negotiate, especially if the battery isn't new or if it
                        needs some work.
                      </li>
                      <li>
                        Take your time and don't rush—wait for the deal that
                        feels right.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Handle Payment and Ownership Right Way
                    </h3>
                    <p className="mb-3">
                      Use bank transfers so you have a record.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Do the official ownership transfer at the excise office.
                      </li>
                      <li>Keep all your receipts and confirmations.</li>
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
                  <span className="text-xs text-gray-500">16 min read</span>
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
          <div
            className="blog2 w-full flex flex-col md:flex-row-reverse gap-4 bg-white rounded-lg shadow-none border-0 outline-none transition-all duration-300 overflow-hidden"
            style={{ boxShadow: "none", border: "none", outline: "none" }}
          >
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.ebikeCatBlog2}
                alt="Tips for Buying Used Commercial E-Bikes in Pakistan"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Complete Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                Tips for Buying Used Commercial E-Bikes in Pakistan
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Looking to save some cash on a commercial E-Bike for your
                  business? Going for a used one makes sense, but you've got to
                  be smart about it. Here's how to make sure you get a solid
                  bike (and a fair deal) on Sello.pk.
                </p>

                <p className="mb-4">
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  helps by listing verified E-Bikes, showing you all the specs,
                  and letting you talk to sellers securely. Here's what you need
                  to do:
                </p>

                <div
                  className={`space-y-4 ${!isExpanded2 ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      1. Check the Battery and Motor
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Start with the battery. How many cycles has it gone
                        through? Does it still hold a charge? Plug it in and see
                        if it charges properly.
                      </li>
                      <li>
                        Test the motor and see how it handles. Listen for weird
                        noises or grinding sounds.
                      </li>
                      <li>
                        Check the brakes, suspension, and tires. If something
                        feels loose or worn out, factor that in.
                      </li>
                      <li>
                        Take a close look at the chain and gears. Make sure they
                        move smoothly, without jerks or rust.
                      </li>
                      <li>
                        Ask about the battery's age and expected lifespan.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      2. Look at Mileage and Condition
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Mileage matters, but so does how well the bike's been
                        treated. A new battery on an old frame isn't always a
                        bargain.
                      </li>
                      <li>
                        Check if the bike can handle the loads your business
                        needs. For delivery or cargo, this is make-or-break.
                      </li>
                      <li>
                        Look for dents, rust, or worn-out tires. They tell you
                        how the bike's been treated.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      3. Sort Out the Paperwork
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        You need the original registration or smart card. No
                        exceptions.
                      </li>
                      <li>
                        Ask for token tax receipts, seller's CNIC, and a signed
                        transfer letter.
                      </li>
                      <li>
                        Sello.pk usually makes paperwork easier, but always
                        double-check everything yourself.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      4. Shop Around
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Don't buy the first E-Bike you see. Browse a few
                        listings on Sello.pk.
                      </li>
                      <li>
                        Compare battery types, motor power, and general
                        condition.
                      </li>
                      <li>
                        Check the going rates so you know what's fair before you
                        make an offer.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      5. Negotiate the Deal
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Use the facts from your inspection to your advantage
                        when talking price.
                      </li>
                      <li>
                        Stay polite, but don't back down if the deal feels off.
                      </li>
                      <li>
                        And don't be afraid to walk away. There are always more
                        E-Bikes out there.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      6. Pay and Transfer Ownership Safely
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Always pay through bank or another traceable method.
                        Cash deals are risky.
                      </li>
                      <li>
                        Do the transfer at the excise office. Get all the
                        receipts and confirmations.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Wrapping Up
                    </h3>
                    <p className="mb-3">
                      With Sello.pk, buying a used commercial E-Bike gets a
                      whole lot simpler. Verified listings, real specs, and
                      secure messaging mean you can focus on finding the right
                      E-Bike for your delivery, courier, or passenger
                      business—without the usual headaches.
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
                  <span className="text-xs text-gray-500">14 min read</span>
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

export default EBikeCategoryPage;
