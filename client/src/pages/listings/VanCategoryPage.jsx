import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { FaShuttleVan } from "react-icons/fa";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import { categoriesBlogsImages } from "../../assets/assets";

const VanCategoryPage = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [isExpanded3, setIsExpanded3] = useState(false);
  const [filters, setFilters] = useState(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  const vehicleType = "Van";

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
      `/listings/van${newParams.toString() ? "?" + newParams.toString() : ""}`,
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
      `/listings/van${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white shadow-none"
        style={{
          backgroundImage: `url("/assets/categories/vanCat.svg")`,
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
                <FaShuttleVan className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: "none" }}>
              Vans
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Vans and commercial passenger vehicles
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
                <p className="mt-4 text-gray-600">Loading van listings...</p>
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
                <FaShuttleVan className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Van Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No van listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a Van Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Van Listings ({total})
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

      {/* Blogs Section - Custom for Vans */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Van Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, maintenance guides, and latest news about vans
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="blogs space-y-8">
          {/* Blogs 01 */}
          <div className="blog1 w-full flex flex-col md:flex-row gap-4  transition-all duration-300 overflow-hidden">
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.vanCatBlog}
                alt="How to Choose Right Van for Sale in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-4 uppercase tracking-wide">
                Buying Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Choose Right Van for Sale in Pakistan – 2026 Guide
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Getting a van makes sense for all sorts of businesses in
                  Pakistan—logistics, deliveries, school runs, or just moving
                  people around. But with so many options in cities like
                  Karachi, Lahore, Islamabad, and Rawalpindi, it's easy to feel
                  lost.
                </p>

                <p className="mb-4">
                  That's where{" "}
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  comes in. You get verified van listings, detailed specs, and a
                  safe way to talk with sellers. It's everything you need to
                  pick the right van without second-guessing yourself.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What You Need
                    </h3>
                    <p className="mb-3">
                      Before you even look at listings, get clear on what you
                      need your van to do:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Goods Transport:</strong> Focus on how much it
                        can carry, its fuel average, and how tough it is.
                      </li>
                      <li>
                        <strong>Passenger Transport:</strong> Think comfort,
                        safety, seats, and—please—air conditioning.
                      </li>
                      <li>
                        <strong>Business Use:</strong> Maybe you need a delivery
                        van, something for catering, or a mobile workspace.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Pick the Right Type of Van
                    </h3>
                    <p className="mb-3">
                      You'll find a whole range of vans in Pakistan:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Mini Vans:</strong> Suzuki Bolan, HiAce—great
                        for small loads and zipping around city.
                      </li>
                      <li>
                        <strong>Mid-Size Vans:</strong> Toyota Hiace, Nissan
                        Caravan—good for moving people or handling medium
                        deliveries.
                      </li>
                      <li>
                        <strong>Large Vans:</strong> Mercedes Sprinter, Hyundai
                        H350—your best bet for big logistics jobs or commercial
                        use.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Inspect the Van Closely
                    </h3>
                    <p className="mb-3">
                      Used van or not, always check the details:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Test the engine and transmission—listen for weird
                        noises.
                      </li>
                      <li>Look at brakes, suspension, and tires.</li>
                      <li>Scan the body and chassis for rust or damage.</li>
                      <li>
                        Check out the space—does it fit what you want to carry?
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Double-Check the Paperwork
                    </h3>
                    <p className="mb-3">
                      Don't get stuck with legal headaches. Make sure you get:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The original registration or smart card</li>
                      <li>Up-to-date token tax receipt</li>
                      <li>Seller's CNIC</li>
                      <li>Proper transfer letter</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Compare Prices and Bargain a Bit
                    </h3>
                    <p className="mb-3">
                      Prices bounce around depending on the van's model, age,
                      mileage, and condition:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check out similar listings on Sello.pk</li>
                      <li>
                        If you spot a scratch or a minor issue, use it to get a
                        better price.
                      </li>
                      <li>
                        And don't rush—there's always another deal around the
                        corner.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Pay and Transfer Ownership Safely
                    </h3>
                    <p className="mb-3">
                      Stick to bank transfers for payment—it's safer and you
                      have a record.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Do the ownership transfer at the excise office, not in a
                        hurry at someone's shop.
                      </li>
                      <li>
                        Get all receipts and confirmation before you drive off.
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
                src={categoriesBlogsImages.vanCatBlog2}
                alt="Tips for Buying Used Vans in Pakistan – 2026 Guide"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Complete Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                Tips for Buying Used Vans in Pakistan – 2026
              </h2>

              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Used vans are a solid choice for businesses and families in
                  Pakistan. Whether you need seats for passengers, space for
                  cargo, or a van that does both, a smart buying process keeps
                  you safe and satisfied.
                </p>

                <p className="mb-4">
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  makes it easier. You get verified van listings, plenty of
                  details, and a secure way to reach out to sellers—so you can
                  shop smarter.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded2 ? "max-h-[400px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Give the Engine and Mechanics a Proper Check
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Pop the hood and look for leaks, odd noises, or smoke.
                      </li>
                      <li>
                        Don't forget the transmission and gearbox—take it for a
                        test drive if you can.
                      </li>
                      <li>
                        Inspect the brakes, suspension, and tires. Tires
                        especially can tell you a lot.
                      </li>
                      <li>
                        Not a car expert? Bring a trusted mechanic along. It's
                        worth it for peace of mind.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Look at Mileage and Capacity
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Mileage isn't everything. Sometimes a well-maintained
                        van with higher kilometers is better than a neglected
                        one with low numbers.
                      </li>
                      <li>
                        Make sure the van fits your needs—seating or cargo
                        space, depending on your plans.
                      </li>
                      <li>
                        If you care about fuel bills (and who doesn't?), check
                        the fuel efficiency.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Get the Paperwork in Order
                    </h3>
                    <p className="mb-3">You want:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Original registration or smart card</li>
                      <li>Token tax receipts</li>
                      <li>Seller's CNIC</li>
                      <li>Transfer letter</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Shop Around and Compare
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Browse more than one listing on Sello.pk</li>
                      <li>Check the year, condition, mileage, and features.</li>
                      <li>
                        Base your offer on actual prices, not just the seller's
                        wishful thinking.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Negotiate Safely
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Use any issues you spot—like repairs or missing
                        features—to get a better deal.
                      </li>
                      <li>
                        Don't let anyone rush you, and always handle payment
                        through secure channels.
                      </li>
                      <li>
                        Only finalize the deal once you've checked everything
                        and you're happy with the paperwork.
                      </li>
                    </ul>
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
                  <span className="text-xs text-gray-500">15 min read</span>
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

export default VanCategoryPage;
