import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { images, menuLinks } from "../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./utils/SearchBar";
import { FaCirclePlus, FaBars, FaXmark, FaChevronDown } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import gsap from "gsap";
import { useGetMeQuery } from "../redux/services/api";
import NotificationBell from "./common/NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [openCompanyDropdown, setOpenCompanyDropdown] = useState(false);
  const [openAuctionsDropdown, setOpenAuctionsDropdown] = useState(false);
  const [openMobileAuctions, setOpenMobileAuctions] = useState(false);
  const backdropRef = useRef(null);
  const drawerRef = useRef(null);
  const linkRefs = useRef([]);
  const searchPanelRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const auctionsDropdownRef = useRef(null);

  // Track token in state so skip option re-evaluates when token changes
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Get user from localStorage as fallback
  const getCachedUser = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      // Error parsing cached user - silent fail
      console.error(e);
    }
    return null;
  };

  // Only fetch if token exists
  const { data: currentUser, isLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  // Use cached user as fallback while loading or if query is skipped
  const cachedUser = getCachedUser();
  const user = currentUser || cachedUser;

  // Update token state when localStorage changes (after login)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setToken(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleClickOutside = useCallback((event) => {
    // Close search panel
    if (
      showHeaderSearch &&
      searchPanelRef.current &&
      !searchPanelRef.current.contains(event.target)
    ) {
      setShowHeaderSearch(false);
    }

    // Close company dropdown
    if (
      openCompanyDropdown &&
      companyDropdownRef.current &&
      !companyDropdownRef.current.contains(event.target)
    ) {
      setOpenCompanyDropdown(false);
    }

    // Close auctions dropdown
    if (
      openAuctionsDropdown &&
      auctionsDropdownRef.current &&
      !auctionsDropdownRef.current.contains(event.target)
    ) {
      setOpenAuctionsDropdown(false);
    }
  }, [showHeaderSearch, openCompanyDropdown, openAuctionsDropdown]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const isPathMatch = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isActive = (path) => location.pathname === path;
  const companyLinks = [
    { path: "/about", name: "About Us" },
    { path: "/contact", name: "Contact Us" },
    { path: "/blog", name: "Blog" },
    { path: "/help/faqs", name: "FAQs" },
  ];
  const publicAuctionLinks = [
    { path: "/auctions", name: "All Auctions" },
    { path: "/auctions/live", name: "Live Now" },
    { path: "/auctions/schedule", name: "Auction Schedule" },
    { path: "/auctions/trust-legal", name: "Trust & Legal" },
  ];
  const userAuctionLinks = [
    { path: "/auctions/watchlist", name: "My Watchlist" },
    { path: "/auctions/transactions", name: "My Transactions" },
  ];
  const primaryDesktopLinks = menuLinks.filter(
    (link) =>
      !["About Us", "Contact Us", "Blog", "Live Auctions"].includes(link.name),
  );
  const mobileMenuLinks = [...menuLinks, { path: "/help/faqs", name: "FAQs" }];
  const mobilePrimaryLinks = mobileMenuLinks.filter(
    (link) => link.path !== "/auctions",
  );
  const isCompanyActive = companyLinks.some((link) => isPathMatch(link.path));
  const isAuctionsActive = location.pathname.startsWith("/auctions");

  const openDrawer = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" },
      );
      gsap.fromTo(
        drawerRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.55, ease: "power4.out" },
      );
      gsap.fromTo(
        linkRefs.current,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.16,
        },
      );
    });
  };

  const closeDrawer = () => {
    gsap.to(linkRefs.current, {
      y: 12,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      stagger: { each: 0.04, from: "end" },
    });
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.32,
      ease: "power2.in",
    });
    gsap.to(drawerRef.current, {
      xPercent: 100,
      duration: 0.45,
      ease: "power4.inOut",
      onComplete: () => {
        setOpen(false);
        setOpenMobileAuctions(false);
      },
    });
  };

  const avatarFallback = useMemo(() => {
    if (!user) return images.avatarIcon;
    if (user.avatar) return user.avatar;
    const name = user.name || user.email || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name.charAt(0),
    )}`;
  }, [user]);

  // Use the listings header style site-wide for visual consistency.
  const isListingsTheme = true;
  const renderHeaderSearchToggle = () => (
    <div
      ref={searchPanelRef}
      className={`hidden lg:block relative h-10 overflow-hidden transition-all duration-300 ease-out ${
        showHeaderSearch ? "w-[260px]" : "w-8"
      }`}
    >
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          showHeaderSearch
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-2 pointer-events-none"
        }`}
      >
        <SearchBar compact placeholder="Search products" />
      </div>
      <button
        type="button"
        onClick={() => setShowHeaderSearch(true)}
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border transition-all duration-300 flex items-center justify-center ${
          showHeaderSearch
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100 scale-100 pointer-events-auto"
        } ${
          isListingsTheme
            ? "border-primary-500 text-primary-500 hover:bg-primary-50 bg-white"
            : "border-white/70 text-white hover:bg-white/20"
        }`}
        title="Search"
      >
        <FiSearch size={14} />
      </button>
    </div>
  );

  return (
    <>
      <nav
        className={`w-full sticky top-0 z-50 border-b backdrop-blur-md ${
          isListingsTheme
            ? "bg-white/95 text-gray-700 border-gray-200"
            : "bg-primary-500 text-white border-primary-400"
        }`}
      >
        <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 flex items-center justify-between min-w-0">
          <div className="flex items-center min-w-0 gap-4 xl:gap-6">
            {/* Logo */}
            <Link to="/" className="cursor-pointer flex-shrink-0">
              <img
                className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto"
                src={isListingsTheme ? images.blackLogo : images.logo}
                width="120"
                height="48"
                alt="logo"
              />
            </Link>
          </div>

          {/* Desktop Links (Centered) */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-4">
            <div
              className={`flex items-center gap-3 xl:gap-4 text-sm lg:text-base ${
                isListingsTheme ? "text-gray-600" : "text-white"
              }`}
            >
              {primaryDesktopLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                    isPathMatch(link.path)
                      ? "text-primary-500 font-semibold bg-primary-50"
                      : "hover:text-primary-500"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div
                ref={auctionsDropdownRef}
                className="relative"
                onMouseEnter={() => setOpenAuctionsDropdown(true)}
                onMouseLeave={() => setOpenAuctionsDropdown(false)}
              >
                <button
                  type="button"
                  onClick={() => setOpenAuctionsDropdown((prev) => !prev)}
                  aria-expanded={openAuctionsDropdown}
                  aria-haspopup="true"
                  className={`px-2 py-1 rounded-md transition-all whitespace-nowrap inline-flex items-center gap-2 ${
                    isAuctionsActive
                      ? "text-primary-500 font-semibold bg-primary-50"
                      : "hover:text-primary-500"
                  }`}
                >
                  Live Auctions
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      openAuctionsDropdown ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {openAuctionsDropdown && (
                  <div 
                    className="absolute top-full left-0 pt-2 z-[100]"
                    role="menu"
                  >
                    <div className="w-64 rounded-xl border border-gray-200 bg-white shadow-lg text-gray-700 py-2">
                      {publicAuctionLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setOpenAuctionsDropdown(false)}
                          role="menuitem"
                          className={`block px-5 py-2.5 text-base transition-colors ${
                            isPathMatch(link.path)
                              ? "text-primary-500 font-semibold bg-primary-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {link.name}
                        </Link>
                      ))}
                      {token && (
                        <>
                          <div className="my-2 border-t border-gray-200" />
                          {userAuctionLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setOpenAuctionsDropdown(false)}
                              role="menuitem"
                              className={`block px-5 py-2.5 text-base transition-colors ${
                                isPathMatch(link.path)
                                  ? "text-primary-500 font-semibold bg-primary-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {link.name}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                ref={companyDropdownRef}
                className="relative"
                onMouseEnter={() => setOpenCompanyDropdown(true)}
                onMouseLeave={() => setOpenCompanyDropdown(false)}
              >
                <button
                  type="button"
                  onClick={() => setOpenCompanyDropdown((prev) => !prev)}
                  aria-expanded={openCompanyDropdown}
                  aria-haspopup="true"
                  className={`px-2 py-1 rounded-md transition-all whitespace-nowrap inline-flex items-center gap-2 ${
                    isCompanyActive
                      ? "text-primary-500 font-semibold bg-primary-50"
                      : "hover:text-primary-500"
                  }`}
                >
                  Company
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      openCompanyDropdown ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {openCompanyDropdown && (
                  <div 
                    className="absolute top-full left-0 pt-2 z-[100]"
                    role="menu"
                  >
                    <div className="w-56 rounded-xl border border-gray-200 bg-white shadow-lg text-gray-700 py-2">
                      {companyLinks.slice(0, 3).map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setOpenCompanyDropdown(false)}
                          role="menuitem"
                          className={`block px-5 py-2.5 text-base transition-colors ${
                            isPathMatch(link.path)
                              ? "text-primary-500 font-semibold bg-primary-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {link.name}
                        </Link>
                      ))}
                      <div className="my-2 border-t border-gray-200" />
                      <Link
                        to={companyLinks[3].path}
                        onClick={() => setOpenCompanyDropdown(false)}
                        role="menuitem"
                        className={`block px-5 py-2.5 text-base transition-colors ${
                          isPathMatch(companyLinks[3].path)
                            ? "text-primary-500 font-semibold bg-primary-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {companyLinks[3].name}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Avatar / Login + Actions */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-shrink-0">
            {renderHeaderSearchToggle()}

            {/* Create Post Button (Desktop) */}
            <button
              onClick={() => navigate("/create-post")}
              className={`hidden sm:flex gap-1.5 sm:gap-2 items-center text-xs sm:text-sm px-3 py-2 rounded-lg border transition-all ${
                isListingsTheme
                  ? "text-primary-500 border-primary-500 hover:bg-primary-50"
                  : "text-white border-white/70 hover:bg-white/20"
              }`}
              title="Create Post"
            >
              <FaCirclePlus className="text-sm sm:text-base" />
              <span className="hidden md:inline">Sell Your Car</span>
            </button>

            {!isLoading && currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                {/* Dashboard Links */}
                {currentUser.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="hidden md:block text-xs px-2.5 py-1 bg-primary-500 rounded-md hover:opacity-90 text-white transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {user?.role === "dealer" && user?.dealerInfo?.verified && (
                  <Link
                    to="/dealer/dashboard"
                    className="hidden md:block text-xs px-2.5 py-1 bg-primary-500 rounded-md hover:opacity-90 text-white transition-colors"
                  >
                    Dealer
                  </Link>
                )}
                {user?.role === "dealer" && !user?.dealerInfo?.verified && (
                  <Link
                    to="/seller/dashboard"
                    className="hidden md:block text-xs px-2.5 py-1 bg-primary-500 rounded-md hover:opacity-90 text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* Avatar */}
                <div
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-white/80 shadow-sm flex-shrink-0"
                  title="Profile"
                >
                  <img
                    src={avatarFallback}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2 bg-primary-500 rounded-lg text-white text-xs sm:text-sm font-medium hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Login
                </button>
              </div>
            )}

            {/* Mobile Menu */}
            <button
              onClick={openDrawer}
              title="Menu"
              aria-label="Open navigation menu"
              className={`lg:hidden w-9 h-9 rounded-full border flex items-center justify-center ${
                isListingsTheme
                  ? "text-gray-600 border-gray-300 bg-white"
                  : "text-white border-white/70"
              }`}
            >
              <FaBars size={20} className="sm:hidden" />
              <FaBars size={24} className="hidden sm:block" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 w-full h-full z-50 lg:hidden">
          <div
            ref={backdropRef}
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/45"
          />
          <div
            ref={drawerRef}
            className="absolute inset-0 text-black px-4 sm:px-6 py-4 sm:py-6 bg-white shadow-xl"
          >
            {/* Close Button */}
            <div className="flex justify-end text-2xl sm:text-3xl mb-4 sm:mb-6">
              <button 
                onClick={closeDrawer}
                aria-label="Close navigation menu"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaXmark />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4 sm:mb-6">
              <SearchBar />
            </div>

            {/* Drawer Menu Links */}
            <div className="flex flex-col gap-3 sm:gap-4 text-base sm:text-lg">
              {mobilePrimaryLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  ref={(el) => (linkRefs.current[index] = el)}
                  onClick={closeDrawer}
                  className={` pb-2 ${
                    isActive(link.path) ? "font-bold text-black" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div
                className={`pb-2 ${isAuctionsActive ? "font-bold text-black" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenMobileAuctions((prev) => !prev)}
                  aria-expanded={openMobileAuctions}
                  aria-haspopup="true"
                  className="w-full flex items-center justify-between py-2"
                >
                  <span>Live Auctions</span>
                  <FaChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      openMobileAuctions ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openMobileAuctions && (
                  <div className="mt-3 ml-2 flex flex-col gap-3 text-[15px] text-gray-700 border-l border-gray-200 pl-3">
                    {publicAuctionLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={closeDrawer}
                        className={`${isPathMatch(link.path) ? "text-primary-500 font-semibold" : ""}`}
                      >
                        {link.name}
                      </Link>
                    ))}
                    {token &&
                      userAuctionLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={closeDrawer}
                          className={`${isPathMatch(link.path) ? "text-primary-500 font-semibold" : ""}`}
                        >
                          {link.name}
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              {/* Create Post (Mobile) */}
              <button
                onClick={() => {
                  closeDrawer();
                  navigate("/create-post");
                }}
                className="mt-4 flex items-center gap-2 text-black text-base sm:text-lg"
              >
                <FaCirclePlus />
                Create Post
              </button>

              {/* Dashboard Links (Mobile) */}
              {!isLoading && user?.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={closeDrawer}
                  className="mt-4 flex items-center gap-2 text-primary-500 border-t border-primary-300 pt-4 text-base sm:text-lg"
                >
                  <span>Admin Panel</span>
                </Link>
              )}
              {!isLoading &&
                user?.role === "dealer" &&
                user?.dealerInfo?.verified && (
                  <Link
                    to="/dealer/dashboard"
                    onClick={closeDrawer}
                    className="mt-4 flex items-center gap-2 text-primary-500 border-t border-primary-300 pt-4 text-base sm:text-lg"
                  >
                    <span>Dealer Dashboard</span>
                  </Link>
                )}
              {!isLoading &&
                user?.role === "dealer" &&
                !user?.dealerInfo?.verified && (
                  <Link
                    to="/seller/dashboard"
                    onClick={closeDrawer}
                    className="mt-4 flex items-center gap-2 text-primary-500 border-t border-primary-300 pt-4 text-base sm:text-lg"
                  >
                    <span>My Dashboard</span>
                  </Link>
                )}
              {/* Individual users don't have a dashboard */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
