import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { FaMotorcycle } from "react-icons/fa6";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import { categoriesBlogsImages } from "../../assets/assets";

const BikeCategoryPage = () => {
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

  const vehicleType = "Bike";

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
      `/listings/bike${newParams.toString() ? "?" + newParams.toString() : ""}`,
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
      `/listings/bike${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white shadow-none"
        style={{
          backgroundImage: `url("/assets/categories/bikeCat.svg")`,
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
                <FaMotorcycle className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: "none" }}>
              Bikes
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Motorcycles and bikes
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
                <p className="mt-4 text-gray-600">Loading bike listings...</p>
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
                <FaMotorcycle className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Bike Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No bike listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a Bike Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Bike Listings ({total})
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

      {/* Blogs Section - Custom for Bikes */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Bike Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, maintenance guides, and latest news about
            bikes
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="blogs space-y-8">
          {/* Blogs 01 */}
          <div className="blog1 w-full flex flex-col md:flex-row gap-4  transition-all duration-300 overflow-hidden">
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.bikeCatBlog}
                alt="How to Buy Right Commercial Motorcycle in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Buying Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Buy Right Commercial Motorcycle in Pakistan – 2026 Guide
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Looking for the right commercial motorcycle in Pakistan?
                  You're not alone. Whether you want something for deliveries,
                  ride-hailing, or your business, picking the right bike makes a
                  real difference—especially in busy cities like Karachi,
                  Lahore, Islamabad, and Faisalabad, where demand never seems to
                  slow down.
                </p>

                <p className="mb-4">
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  takes a lot of stress out of buying. You'll find verified
                  listings, straight-up pricing, and a way to talk to sellers
                  directly. No guesswork, just a safer, smoother experience.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded ? "max-h-[50px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What You Need
                    </h3>
                    <p className="mb-3">
                      Start by getting clear on how you'll use motorcycle. Is it
                      for delivery or courier work? Then you want something
                      that's fuel-efficient, can handle cargo, and won't quit on
                      you after a few months. If you're driving for ride-hailing
                      apps, go for comfort, reliable engine performance, and
                      easy maintenance. Running your own business? Think about
                      room for branding, maybe a cargo box, or whatever fits
                      your daily deliveries.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Pick the Right Model
                    </h3>
                    <p className="mb-3">
                      The most popular commercial bikes in Pakistan break down
                      like this:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>
                          For budget-friendly jobs and short trips:
                        </strong>{" "}
                        Honda CD 70 is a classic. You see them
                        everywhere—they're easy to maintain and cheap to run.
                      </li>
                      <li>
                        <strong>Need something tougher?</strong> The Honda CG
                        125 or Yamaha YBR can take on longer routes and heavier
                        loads without breaking a sweat.
                      </li>
                      <li>
                        <strong>Curious about electric bikes?</strong> They're
                        showing up more now, and they're perfect if you want to
                        save on fuel and go easier on the environment.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Check the Motorcycle
                    </h3>
                    <p className="mb-3">
                      Even if the bike looks good in photos, always check it
                      yourself. Take a look at engine and transmission. Don't
                      ignore brakes, suspension, and tires—these keep you safe.
                      Inspect the frame and body, and if there's a cargo box,
                      make sure it's solid. Ask about mileage and fuel
                      efficiency too. Sello.pk helps out here with detailed
                      photos and specs, but nothing beats seeing it in person.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Check the Paperwork
                    </h3>
                    <p className="mb-3">
                      You don't want surprises later, so pay attention to
                      documents. Make sure the registration or smart card is
                      there, along with token tax receipts, seller's CNIC, and a
                      transfer letter. Sello.pk's verified listings already cut
                      down on the risk of missing paperwork, but always
                      double-check.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare and Negotiate
                    </h3>
                    <p className="mb-3">
                      Prices swing a lot depending on the model, year, and
                      condition. Look at several listings on Sello.pk before you
                      decide. If you spot things like minor repairs or higher
                      mileage, use those to negotiate a better price. Don't
                      rush—wait for the deal that feels right.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Pay and Transfer Ownership
                    </h3>
                    <p className="mb-3">
                      For payment, stick with a bank transfer. It's safer and
                      you have proof. When you're ready, finish the ownership
                      transfer at your local excise office. Keep all your
                      receipts and confirmations handy. Sello.pk makes it easier
                      to communicate safely with sellers, so you're not left
                      guessing.
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
          <div className="blog2 w-full flex flex-col md:flex-row-reverse gap-4 bg-white rounded-lg shadow-none border-0 outline-none transition-all duration-300 overflow-hidden" style={{ boxShadow: "none", border: "none", outline: "none" }}>
            <div className="image h-[460px] w-full md:w-[400px] lg:w-[500px] overflow-hidden rounded-3xl shrink-0 shadow-none" style={{ boxShadow: "none" }}>
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.bikeCatBlog2}
                alt="Tips for Buying Used Commercial Bikes in Pakistan"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Complete Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                Tips for Buying Used Commercial Bikes in Pakistan
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Looking to buy a used commercial bike in Pakistan? It's a
                  smart way to save on costs, but you've got to keep your eyes
                  open. A good deal can quickly turn into a headache if you
                  don't check the basics. Here's how to stay sharp and get the
                  right bike for your business, whether you're delivering food,
                  running a courier service, or working in ride-hailing.
                </p>

                <p className="mb-4">
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  makes things a lot easier. Their platform only lists verified
                  bikes, shows you all the specs upfront, and keeps your chats
                  with sellers secure. Here's what you need to do:
                </p>

                <div
                  className={`space-y-4 ${!isExpanded2 ? "max-h-[50px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      1. Check Engine and Mechanics
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Start the bike. Listen for weird noises—rattling,
                        knocking, anything off. Bad sounds usually mean trouble.
                      </li>
                      <li>
                        Test the brakes, suspension, and tires. If something
                        feels loose or worn out, factor that in.
                      </li>
                      <li>
                        Take a close look at the chain and gears. Make sure they
                        move smoothly, without jerks or rust.
                      </li>
                      <li>
                        Ask about fuel efficiency. If you can, take the bike for
                        a quick spin.
                      </li>
                      <li>
                        Honestly, if you're not a mechanic, bring one with you.
                        They spot things most people miss.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      2. Look at Mileage and General Condition
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Don't judge a bike by mileage alone. Maintenance matters
                        more. A well-kept bike with higher mileage often beats a
                        low-mileage one that's been neglected.
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
                      3. Check Paperwork
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        You need the original registration book or smart card.
                        No exceptions.
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
                      4. Compare Prices
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Don't just grab the first deal you see. Look at a bunch
                        of listings on Sello.pk.
                      </li>
                      <li>Compare the bikes' years, mileage, and condition.</li>
                      <li>
                        Get a feel for the going rate, then make your offer
                        based on real numbers.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      5. Negotiate Like You Mean It
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Notice repairs or small flaws? Use them to your
                        advantage when talking price.
                      </li>
                      <li>
                        Stay friendly, but don't back down if the deal feels
                        off.
                      </li>
                      <li>
                        And don't be afraid to walk away. There are always more
                        bikes out there.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      6. Pay Safely and Transfer Ownership Right
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Always pay through bank or another traceable method.
                        Cash deals are risky.
                      </li>
                      <li>
                        Do the transfer at the excise office. Get all the
                        receipts and confirmations. It keeps you covered if
                        anything comes up later.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Final Thoughts
                    </h3>
                    <p className="mb-3">
                      Buying a used commercial bike gets a lot simpler with
                      Sello.pk on your side. Their verified listings and
                      detailed info help you find the right ride for your
                      business, without the usual stress.
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

export default BikeCategoryPage;
