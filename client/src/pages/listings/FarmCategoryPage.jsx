import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { FaTractor } from "react-icons/fa6";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import { categoriesBlogsImages } from "../../assets/assets";

const FarmCategoryPage = () => {
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

  const vehicleType = "Farm";

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
      `/listings/farm${newParams.toString() ? "?" + newParams.toString() : ""}`,
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
      `/listings/farm${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white shadow-none"
        style={{
          backgroundImage: `url("/assets/categories/farmCat.svg")`,
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
                <FaTractor className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: "none" }}>
              Farm
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Farm vehicles and agricultural equipment
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
                <p className="mt-4 text-gray-600">
                  Loading farm vehicle listings...
                </p>
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
                <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Farm Vehicle Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No farm vehicle listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a Farm Vehicle Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Farm Vehicle Listings ({total})
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

      {/* Blogs Section - Custom for Farm Vehicles */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Farm Vehicle Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, maintenance guides, and latest news about farm
            vehicles and agricultural equipment
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="blogs space-y-8">
          {/* Blogs 01 */}
          <div className="blog1 w-full flex flex-col md:flex-row gap-4  transition-all duration-300 overflow-hidden">
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.farmCatBlog}
                alt="How to Pick Right Farm Vehicle in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Complete Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Pick Right Farm Vehicle in Pakistan – 2026 Guide
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Thinking about upgrading your farm vehicle in Pakistan? You're
                  not alone. Whether you run a small operation or a sprawling
                  farm, having the right wheels makes a huge difference. From
                  tractors to utility trucks, there's a lot out there—and,
                  honestly, it's easy to get lost in the options.
                </p>

                <p className="mb-4">
                  That's where{" "}
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  steps in. The site brings together only verified listings,
                  loads of specs, and a platform where you can talk to sellers
                  and buy with confidence. No guesswork. No risks you can't see
                  coming.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What You Need
                    </h3>
                    <p className="mb-3">
                      Start simple. What do you actually need the vehicle for?
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Tractors</strong> get your heavy work
                        done—plowing, planting, pulling.
                      </li>
                      <li>
                        <strong>Farm trucks?</strong> They're for moving crops,
                        livestock, or gear from one end of your land to the
                        other.
                      </li>
                      <li>
                        <strong>Utility vehicles</strong> handle the smaller
                        stuff—quick trips, irrigation jobs, or all those
                        mixed-use tasks that pop up on busy farms.
                      </li>
                      <li>
                        If you know what you need, it's a lot easier to sort
                        through listings on Sello.pk and not waste time.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Pick Your Vehicle Type
                    </h3>
                    <p className="mb-3">Here's what most people look for:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Compact tractors</strong>—great for small or
                        medium farms
                      </li>
                      <li>
                        <strong>Heavy-duty tractors</strong>—built for big
                        fields and serious plowing
                      </li>
                      <li>
                        <strong>Farm utility vehicles</strong>—perfect for
                        hauling goods or equipment around
                      </li>
                      <li>
                        Don't get distracted by shiny features you'll never use.
                        Focus on what fits your farm.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Check the Vehicle's Condition
                    </h3>
                    <p className="mb-3">
                      New or used, you need to make sure the machine's up for
                      the job. Look at:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The engine and how it runs</li>
                      <li>Transmission—does it shift smooth?</li>
                      <li>
                        Tires and suspension (Pakistan's fields aren't exactly
                        gentle)
                      </li>
                      <li>Hydraulic systems—especially if it's a tractor</li>
                      <li>Compatibility with attachments or cargo</li>
                      <li>
                        Even though Sello.pk gives you lots of photos and
                        details, nothing beats seeing it in person before you
                        buy.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Make Sure Paperwork's in Order
                    </h3>
                    <p className="mb-3">Don't skip this part. You need:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Original registration or smart card</li>
                      <li>Token tax receipts</li>
                      <li>Seller's CNIC</li>
                      <li>Transfer letter</li>
                      <li>
                        Sello.pk's verified listings help you avoid sellers who
                        try to hide missing documents.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare Prices and Negotiate
                    </h3>
                    <p className="mb-3">
                      Prices jump around a lot—model, year, horsepower, and
                      attachments all matter. Here's what to do:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Look at a bunch of listings on Sello.pk</li>
                      <li>
                        Use the vehicle's condition or extra attachments to
                        drive the price down
                      </li>
                      <li>
                        Don't rush. Take your time and find the deal that
                        actually works for you.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Pay Securely and Transfer Ownership
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Stick to bank transfers—cash is risky, and you want a
                        record.
                      </li>
                      <li>
                        Do the ownership transfer at your local excise office.
                      </li>
                      <li>Hold onto your receipts and confirmations.</li>
                      <li>
                        Sello.pk makes it easy to connect with sellers without
                        worrying about scams.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      In the End
                    </h3>
                    <p className="mb-3">
                      Buying a farm vehicle in Pakistan isn't as complicated as
                      it seems. With Sello.pk, you get verified listings, clear
                      specs, and a secure way to talk to sellers. Whether you
                      need a tractor, a truck, or a utility vehicle, you'll make
                      a smart, safe choice—and get back to what matters: running
                      your farm.
                    </p>
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
                  <span className="text-xs text-gray-500">18 min read</span>
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
                src={categoriesBlogsImages.farmCatBlog2}
                alt="How to Choose Right Tractor in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Tractor Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Choose Right Tractor in Pakistan – 2026 Guide
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Thinking about buying a tractor in Pakistan? This 2026 guide
                  breaks down what you need to know, whether you're running a
                  small family plot or managing a big farm. With{" "}
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>
                  , you get verified listings, in-depth specs, and a safe way to
                  connect with sellers—so you can buy with confidence.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded2 ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Introduction
                    </h3>
                    <p className="mb-3">
                      Tractors keep modern farming in Pakistan running. You need
                      them for just about everything—plowing, sowing,
                      irrigating, harvesting, and getting your goods to market.
                    </p>
                    <p className="mb-3">
                      But with so many choices across Punjab, Sindh, Khyber
                      Pakhtunkhwa, and Balochistan, picking the right one can
                      feel like a headache. That's where Sello.pk steps in. They
                      sort out the mess with verified listings, clear specs, and
                      a safe way to talk to sellers. It makes the whole process
                      a lot less stressful.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What Your Farm Needs
                    </h3>
                    <p className="mb-3">
                      Start simple—think about what your farm actually requires.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Small Farms:</strong> Go for a compact tractor.
                        They're built for lighter jobs and tight spaces.
                      </li>
                      <li>
                        <strong>Medium Farms:</strong> You'll want something
                        with more horsepower. These tractors handle a bit of
                        everything.
                      </li>
                      <li>
                        <strong>Large Farms:</strong> Time for the heavy
                        hitters. You need a big, tough tractor that can plow,
                        haul, and irrigate all day.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Pick the Right Type
                    </h3>
                    <p className="mb-3">Here's how it usually breaks down:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Compact Tractors:</strong> Great for small plots
                        and orchards.
                      </li>
                      <li>
                        <strong>Utility Tractors:</strong> These suit medium
                        farms and handle hauling and plowing without breaking a
                        sweat.
                      </li>
                      <li>
                        <strong>Heavy-Duty Tractors:</strong> If you're running
                        a large operation, you need one of these for big, tough
                        jobs.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Check the Tractor's Condition
                    </h3>
                    <p className="mb-3">
                      Even a used tractor can be a solid buy if you look
                      closely.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Check the engine and transmission. Make sure that tires,
                        suspension, and hydraulics are in good shape.
                      </li>
                      <li>
                        Don't forget the attachments—plows, seeders, all that
                        stuff.
                      </li>
                      <li>
                        Also, look at cargo capacity and how much fuel it burns.
                      </li>
                      <li>
                        Sello.pk gives you plenty of photos and specs, but it's
                        always smart to see the tractor in person if you can.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Make Sure Paperwork's in Order
                    </h3>
                    <p className="mb-3">Don't skip the legal stuff.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        You need original registration or smart card, token tax
                        receipts, seller's CNIC, and a transfer letter.
                      </li>
                      <li>
                        Sello.pk's verified listings help cut down the risk of
                        missing documents, but double-check everything before
                        you pay.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare Prices and Negotiate
                    </h3>
                    <p className="mb-3">
                      Take your time—don't just jump at the first offer.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check out several listings on Sello.pk.</li>
                      <li>
                        Use the tractor's condition, attachments, and horsepower
                        as reasons to negotiate the price.
                      </li>
                      <li>
                        If something doesn't feel right, walk away. There's
                        always another deal.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Pay Safely and Transfer Ownership
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Stick with bank transfers so there's a record of your
                        payment.
                      </li>
                      <li>
                        Finish the ownership transfer at your local excise
                        office, and keep all receipts and confirmations.
                      </li>
                      <li>
                        Sello.pk makes it easy to talk to sellers without
                        worrying about safety.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Conclusion
                    </h3>
                    <p className="mb-3">
                      Buying a tractor in Pakistan doesn't have to be
                      complicated. With Sello.pk's verified listings, detailed
                      specs, and safe communication, finding the right machine
                      for your farm is straightforward.
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
                  <span className="text-xs text-gray-500">16 min read</span>
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

export default FarmCategoryPage;
