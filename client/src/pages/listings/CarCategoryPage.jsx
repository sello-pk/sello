import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { FaCar } from "react-icons/fa6";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import { categoriesBlogsImages } from "../../assets/assets";

const CarCategoryPage = () => {
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

  const vehicleType = "Car";

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
      `/listings/car${newParams.toString() ? "?" + newParams.toString() : ""}`,
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
      `/listings/car${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white shadow-none"
        style={{
          backgroundImage: `url("/assets/categories/carCat.svg")`,
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
                <FaCar className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: "none" }}>
              Cars
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-3xl mx-auto leading-relaxed">
              Cars, sedans, SUVs, and other passenger vehicles
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
                <p className="mt-4 text-gray-600">Loading car listings...</p>
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
                <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Car Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No car listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a Car Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Car Listings ({total})
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

      {/* Blogs Section - Custom for Cars */}
      <div className="my-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Car Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, maintenance guides, and latest news about cars
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="blogs space-y-8">
          {/* Blogs 01 */}
          <div className="blog1 w-full flex flex-col md:flex-row gap-4  transition-all duration-300 overflow-hidden">
            <div className="image h-[440px] w-full md:w-[400px] lg:w-[560px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover"
                src={categoriesBlogsImages.carCatBlog}
                alt="How to Choose the Right Used Car in Pakistan"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Buying Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                How to Choose the Right Used Car in Pakistan (2026 Guide)
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Let's face it—buying a used car in Pakistan isn't just about
                  saving money. It's about dodging headaches, picking something
                  reliable, and getting real value for your cash. New cars?
                  They're getting way more expensive, and you'll end up waiting
                  months for delivery. No wonder most folks in Karachi, Lahore,
                  Islamabad, Rawalpindi, and Faisalabad scroll through endless
                  used car ads when they need a ride.
                </p>

                <p className="mb-4">
                  That's where{" "}
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  steps in. It's not just another online marketplace. They've
                  got verified car listings, smart filters, and prices that
                  actually make sense. If you're planning to buy a used car in
                  2026, this guide lays out everything you need to know—how to
                  avoid scams, what to look for, and how to seal the deal
                  without losing your mind.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Why Go for a Used Car in 2026?
                    </h3>
                    <p className="mb-3">
                      Let's break it down. Here's why picking a used car still
                      makes sense:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You pay way less up front.</li>
                      <li>
                        New cars lose value fast, especially in the first year
                        or two. Used cars? Not so much.
                      </li>
                      <li>
                        There are tons of choices—older models, discontinued
                        favorites, imports, you name it.
                      </li>
                      <li>
                        Forget those crazy delivery times. Used cars are ready
                        to drive home right now.
                      </li>
                    </ul>
                    <p className="mt-3">
                      So, if you pick smart and use a platform like Sello.pk,
                      you'll end up with a car that's both reliable and a good
                      deal.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What You Really Need
                    </h3>
                    <p className="mb-3">
                      Don't just start browsing. Ask yourself:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        What's the main reason you're buying? Office commute,
                        family trips, or something for your business?
                      </li>
                      <li>
                        What fuel works for you—petrol, diesel, CNG, or are you
                        thinking hybrid?
                      </li>
                      <li>
                        Manual or automatic? Be honest about what you prefer.
                      </li>
                      <li>
                        What kind of car do you need? Hatchback for the city,
                        sedan for comfort, SUV or crossover for more space?
                      </li>
                    </ul>
                    <p className="mt-3">Some quick examples:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Suzuki Alto or Wagon R: super economical, easy for city
                        traffic.
                      </li>
                      <li>
                        Toyota Corolla or Honda Civic: if you want comfort and
                        can count on resale value.
                      </li>
                      <li>
                        Toyota Vitz or Passo: solid imports, smooth drive.
                      </li>
                      <li>
                        Hyundai Tucson or Toyota Prado: for when you want a
                        little luxury or plan to hit the mountains.
                      </li>
                    </ul>
                    <p className="mt-3">
                      Get clear on what you want, and you'll save hours (and
                      maybe some regret) later.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Get Real About Your Budget
                    </h3>
                    <p className="mb-3">
                      Here's the thing—there's more to your budget than the
                      sticker price. Don't forget:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Transfer and registration fees</li>
                      <li>Token tax</li>
                      <li>
                        Insurance (not mandatory, but you'll wish you had it if
                        anything goes wrong)
                      </li>
                      <li>
                        Small fixes or maintenance, because every used car needs
                        a little TLC
                      </li>
                    </ul>
                    <p className="mt-3">
                      Here's a tip: Set aside an extra 10-15% for those surprise
                      expenses. Sello.pk shows you transparent prices, so you
                      can compare easily and keep your budget on track.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Dig Into Car Models and Prices
                    </h3>
                    <p className="mb-3">
                      Don't just fall for the first shiny ad. Do your homework:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Check multiple listings for the same model and year.
                      </li>
                      <li>
                        Compare mileage, condition, and where the car's located.
                      </li>
                      <li>
                        Figure out the average market price—don't let anyone
                        overcharge you.
                      </li>
                    </ul>
                    <p className="mt-3">Some cars you'll see everywhere:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>On a budget? Suzuki Alto, Suzuki Wagon R.</li>
                      <li>
                        Want a sedan? Toyota Corolla, Honda Civic, Honda City.
                      </li>
                      <li>Chasing imports? Toyota Vitz, Toyota Passo.</li>
                      <li>Feeling fancy? Hyundai Tucson, Toyota Prado.</li>
                    </ul>
                    <p className="mt-3">
                      You'll get a better deal if you know what things actually
                      cost. Sello.pk helps here too—they've got filters and
                      comparison tools that make this part way less painful.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Check the Car's History
                    </h3>
                    <p className="mb-3">
                      A car's past matters. Don't skip this part:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Make sure the registration is clean and matches the
                        seller's ID.
                      </li>
                      <li>
                        Find out how many owners it's had—fewer is usually
                        better.
                      </li>
                      <li>
                        Ask about accidents or flood damage. Walk away if
                        there's anything serious in its history.
                      </li>
                      <li>
                        Double-check the engine and chassis numbers with the
                        paperwork.
                      </li>
                    </ul>
                    <p className="mt-3">
                      Sello.pk verifies a lot of these details, so you're not
                      flying blind.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Inspect Mileage and Mechanics
                    </h3>
                    <p className="mb-3">
                      Mileage isn't everything. Sometimes a low-mileage car's
                      been neglected, while a high-mileage one's been babied.
                      Here's what to look for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Engine: Any leaks? Smoke? Weird noises?</li>
                      <li>
                        Suspension & Steering: Take it for a spin on bumpy
                        roads—does it feel solid?
                      </li>
                      <li>
                        Transmission: Gears should shift smoothly, no jerking or
                        hesitation.
                      </li>
                      <li>
                        Brakes: They should work quickly and quietly. Squeaks or
                        a "soft" pedal are red flags.
                      </li>
                    </ul>
                    <p className="mt-3">
                      If you're not a car person, bring along someone who is—or
                      pay a mechanic to check it over. It's worth it.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Look Beyond the Photos—Inspect Inside and Out
                    </h3>
                    <p className="mb-3">
                      Photos can be deceiving. You need to see the car in
                      person.
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
                  <span className="text-xs text-gray-500">15 min read</span>
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
            <div className="image h-[460px] w-full md:w-[400px] lg:w-[500px] overflow-hidden rounded-3xl shrink-0">
              <img
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                src={categoriesBlogsImages.carCatBlog2}
                alt="Complete Used Car Buying Guide Pakistan 2026"
              />
            </div>
            <div className="content flex-1 p-4 flex flex-col">
              <span className="inline-block text-xs font-semibold text-primary-500 mb-1 uppercase tracking-wide">
                Complete Guide
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 pb-1">
                Complete Used Car Buying Guide Pakistan 2026
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-primary-500 rounded-full"></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>

              <div className="text-base md:text-lg lg:text-xl mt-8 leading-relaxed text-gray-700 font-medium">
                <p className="mb-4">
                  Let's dive right in. If you're thinking about buying a used
                  car in Pakistan in 2026, you're not alone. With the prices of
                  new cars climbing and more people looking for affordable
                  rides, pre-owned cars are everywhere. Karachi, Lahore,
                  Islamabad, Rawalpindi—you name it, there are listings all over
                  the place. But with so many choices, you really want to know
                  what you're doing before you spend your money.
                </p>

                <p className="mb-4">
                  That's where{" "}
                  <span className="font-semibold text-primary-500">
                    Sello.pk
                  </span>{" "}
                  comes in. It's one of the go-to online car marketplaces in
                  Pakistan, and it actually makes finding the right car way less
                  stressful. You get verified listings, easy-to-use filters, and
                  a ton of details on each car. Makes it way easier to sort
                  through the noise and find something solid.
                </p>

                <div
                  className={`space-y-4 ${!isExpanded2 ? "max-h-[5px] overflow-hidden relative" : ""}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Why Go for a Used Car in Pakistan?
                    </h3>
                    <p className="mb-3">
                      Let's be honest, used cars just make sense for a lot of
                      people right now:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>You pay a lot less than for a brand-new car.</li>
                      <li>
                        New cars drop in value fast, but used ones have already
                        taken that hit.
                      </li>
                      <li>
                        You'll find older models and trims you just can't get
                        new anymore.
                      </li>
                      <li>
                        No crazy wait times—you can get your car right away.
                      </li>
                      <li>
                        If you're a first-time buyer or just need something
                        practical, it's easier on the wallet.
                      </li>
                    </ul>
                    <p className="mt-3">
                      In short, you save money, get a decent set of wheels, and
                      the whole process is smoother—if you plan it out right.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 1: Figure Out What You Need
                    </h3>
                    <p className="mb-3">
                      Before you start scrolling through Sello.pk, get clear on
                      what you actually want:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        What are you using it for? Work, family, rideshare,
                        whatever.
                      </li>
                      <li>
                        What fuel do you want? Petrol, diesel, CNG, hybrid?
                      </li>
                      <li>Manual or automatic?</li>
                      <li>Hatchback, sedan, SUV, crossover?</li>
                    </ul>
                    <p className="mt-3">Some of the hot picks in 2026:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Budget: Suzuki Alto, Suzuki Wagon R</li>
                      <li>Sedans: Toyota Corolla, Honda Civic, Honda City</li>
                      <li>Imports: Toyota Vitz, Toyota Passo</li>
                      <li>SUVs: Hyundai Tucson, Toyota Prado</li>
                    </ul>
                    <p className="mt-3">
                      If you nail down your needs early, you won't get
                      overwhelmed and waste time on the wrong cars.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 2: Set a Realistic Budget
                    </h3>
                    <p className="mb-3">
                      Don't just look at the sticker price. Factor in:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Transfer fees for registration</li>
                      <li>Taxes and government charges</li>
                      <li>Any minor repairs or maintenance you might need</li>
                      <li>Insurance (seriously, get it)</li>
                    </ul>
                    <p className="mt-3">
                      It's smart to keep an extra 10–15% in the bank for stuff
                      that pops up. Sello.pk lists prices clearly, so you can
                      actually compare and see what fits.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 3: Check the Market
                    </h3>
                    <p className="mb-3">
                      Don't jump on the first decent-looking car. Take some time
                      to:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Compare the same car model and year</li>
                      <li>Look at mileage, location, and condition</li>
                      <li>
                        Get a sense of the average price, so you know if you're
                        being ripped off
                      </li>
                    </ul>
                    <p className="mt-3">
                      Sello.pk's filters make this part a breeze.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 4: Dig Into the Car's History
                    </h3>
                    <p className="mb-3">
                      Don't skip this. A car's history can tell you a lot:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Is the registration legit?</li>
                      <li>Who owned it before?</li>
                      <li>Any accident or flood damage?</li>
                      <li>Do the engine and chassis numbers match?</li>
                    </ul>
                    <p className="mt-3">
                      If anything feels off, walk away. Sello.pk's verified
                      listings cut down on sketchy deals, but always
                      double-check.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 5: Inspect Like a Pro
                    </h3>
                    <p className="mb-3">
                      Mileage isn't everything. You want to actually check the
                      car:
                    </p>
                    <p className="font-medium mb-2">
                      Engine: Look for leaks, weird noises, or smoke.
                    </p>
                    <p className="font-medium mb-2">
                      Suspension & Steering: Take it over some bumps, see how it
                      handles.
                    </p>
                    <p className="font-medium mb-2">
                      Transmission: Gears should shift smoothly.
                    </p>
                    <p className="font-medium mb-2">
                      Brakes: Make sure they work well, no strange sounds.
                    </p>
                    <p className="mt-3">
                      If you don't know cars, bring someone who does, or hire a
                      mechanic.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 6: Check the Looks—Inside and Out
                    </h3>
                    <p className="mb-3">
                      Photos online can hide a lot. Always see the car in
                      person.
                    </p>
                    <p className="font-medium mb-2">Outside:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Any dents, scratches, or rust?</li>
                      <li>Is the paint even?</li>
                      <li>How are the tires and wheels?</li>
                      <li>Do all the panels line up?</li>
                    </ul>
                    <p className="font-medium mb-2 mt-3">Inside:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Check the seats and upholstery</li>
                      <li>Look for dashboard warnings</li>
                      <li>Test the AC, audio, and electronics</li>
                    </ul>
                    <p className="mt-3">
                      Sello.pk usually has good photos, but nothing beats seeing
                      it yourself.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 7: Take It for a Spin
                    </h3>
                    <p className="mb-3">Never buy without a test drive.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>See how the engine responds</li>
                      <li>
                        Listen for weird noises from the suspension or brakes
                      </li>
                      <li>Check the steering and transmission</li>
                    </ul>
                    <p className="mt-3">
                      Arrange the test drive safely—Sello.pk's platform helps
                      set this up.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Step 8: Get the Paperwork Right
                    </h3>
                    <p className="mb-3">
                      Don't mess around here. Make sure you get:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The original registration book or smart card</li>
                      <li>Token tax receipts</li>
                      <li>Seller's CNIC (their ID card)</li>
                      <li>The transfer letter</li>
                    </ul>
                    <p className="mt-3">
                      Missing documents can cause huge problems later. Sello.pk
                      usually checks these, but always confirm yourself.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      More Guides to Check Out:
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Top 10 Used Cars to Buy in Pakistan 2026</li>
                      <li>How to Sell Your Car on Sello.pk Safely</li>
                      <li>Common Scams to Avoid When Buying Used Cars</li>
                      <li>
                        Best Family Cars in Pakistan 2026 – Used Car Guide
                      </li>
                      <li>Step-by-Step Guide to Transfer Ownership</li>
                    </ul>
                    <p className="mt-3">
                      Good luck out there—happy car hunting!
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
                  <span className="text-xs text-gray-500">20 min read</span>
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
      </div>

      <div className="text-center py-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
        >
          View All Blogs
          <HiOutlineArrowLeft className="rotate-180" />
        </Link>
      </div>
    </div>
  );
};

export default CarCategoryPage;
