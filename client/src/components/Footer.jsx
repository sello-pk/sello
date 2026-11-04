import React from "react";
import { footerData } from "../assets/assets";
import { Link } from "react-router-dom";
import { apple, android, facebook, instagram } from "../assets/assets";
import { trackContact } from "../utils/metaPixel.js";
import { FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";
import { SOCIAL_LINKS } from "../config/socialLinks";

const Footer = () => {
  const resolveFooterPath = (path) => {
    if (!path) return path;
    if (path.startsWith("/filter?")) {
      const params = new URLSearchParams(path.slice("/filter?".length));
      const city = params.get("city");
      if (city && [...params.keys()].length === 1) {
        return `/used-cars/${city.toLowerCase().replace(/\s+/g, "-")}`;
      }
      return path.replace("/filter?", "/search-results?");
    }
    if (path === "/help/buying-cars") return "/help-center";
    if (path === "/help/selling-cars") return "/help/faqs";
    if (path === "/loan-plans") return "/contact";
    if (path === "/terms-condition" || path === "/terms-and-conditions") {
      return "/terms-conditions";
    }
    return path;
  };

  // Handle footer navigation
  const handleFooterLinkClick = (path, linkName) => {
    const resolvedPath = resolveFooterPath(path);
    return resolvedPath;
  };

  return (
    <footer className="bg-[#050B20] text-white relative z-10 w-full min-w-0">
      <div className="max-w-8xl w-full min-w-0 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 pb-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">
          {footerData.map((section, index) => (
            <div key={index}>
              {section.title && (
                <div className="text-sm font-semibold text-white mb-5 tracking-wide">
                  {section.title}
                </div>
              )}

              {/* Links */}
              <ul className="space-y-3">
                {section.links &&
                  section.links.map((link, i) => (
                    <li key={i}>
                      {link.path ? (
                        (() => {
                          const resolvedPath = handleFooterLinkClick(
                            link.path,
                            link.name,
                          );
                          return (
                            <Link
                              to={resolvedPath}
                              className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                            >
                              {link.name}
                            </Link>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-gray-300">
                          {link.name}
                        </span>
                      )}
                    </li>
                  ))}
                {section.types &&
                  section.types.map((type, i) => (
                    <li key={i} className="text-sm text-gray-300">
                      {type}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-12 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Contact Information */}
            <div>
              <div className="text-sm font-semibold text-white mb-5 tracking-wide">
                Contact Us
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <span className="font-medium text-white">Address:</span>{" "}
                  RFJW+4XR Okara, Pakistan
                </p>
                <p>
                  <span className="font-medium text-white">Phone:</span>{" "}
                  <a
                    href="tel:+923122221474"
                    className="hover:text-white transition-colors duration-200"
                  >
                    +923122221474
                  </a>
                </p>
                <p>
                  <span className="font-medium text-white">Email:</span>{" "}
                  <a
                    href="mailto:info@sello.pk"
                    className="hover:text-white transition-colors duration-200"
                  >
                    info@sello.pk
                  </a>
                </p>
                <p>
                  <span className="font-medium text-white">WhatsApp:</span>{" "}
                  <a
                    href="https://wa.me/923134211023"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackContact()}
                    className="hover:text-white transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <FaWhatsapp size={16} />
                    +92 313 4211023
                  </a>
                </p>
              </div>
            </div>

            {/* Mobile App Downloads — disabled until store listings go live */}
            <div>
              <div className="text-sm font-semibold text-white mb-5 tracking-wide">
                Helpful Resources
              </div>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/listings"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    Browse Cars for Sale
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    Car Buying Guides & News
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vehicle-verification"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    Online Vehicle Verification
                  </Link>
                </li>
                <li>
                  <Link
                    to="/driving-licence"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    Driving Licence Guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/car-estimator"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    AI Car Price Estimator
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auctions"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    Live Vehicle Auctions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200 inline-block"
                  >
                    About Sello Platform
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <div className="text-sm font-semibold text-white mb-5 tracking-wide">
                Follow Us
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-[background-color,transform] duration-300 hover:scale-110 border border-white/10 group"
                  title="Facebook"
                  aria-label="Sello on Facebook"
                >
                  <img
                    src={facebook}
                    alt="Facebook"
                    width={20}
                    height={20}
                    decoding="async"
                    className="w-5 h-5 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </a>

                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-[background-color,transform] duration-300 hover:scale-110 border border-white/10 group"
                  title="Instagram"
                  aria-label="Sello on Instagram"
                >
                  <img
                    src={instagram}
                    alt="Instagram"
                    width={20}
                    height={20}
                    decoding="async"
                    className="w-5 h-5 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </a>

                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-[background-color,transform] duration-300 hover:scale-110 border border-white/10 group"
                  title="X"
                  aria-label="Sello on X"
                >
                  <FaXTwitter className="w-5 h-5 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-[background-color,transform] duration-300 hover:scale-110 border border-white/10 group"
                  title="YouTube"
                  aria-label="Sello on YouTube"
                >
                  <FaYoutube className="w-5 h-5 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
                </a>

                <a
                  href={SOCIAL_LINKS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-[background-color,transform] duration-300 hover:scale-110 border border-white/10 group"
                  title="TikTok"
                  aria-label="Sello on TikTok"
                >
                  <FaTiktok className="w-5 h-5 brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Legal */}
        <div className="border-t border-white/10 pt-8 pb-20 md:pb-24 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()}{" "}
            <a
              href={import.meta.env.VITE_SITE_URL || "https://sello.pk"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-400 transition-colors duration-200 font-medium"
            >
              Sello.pk
            </a>
            . All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6 text-sm">
            <Link
              to="/about"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              About
            </Link>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Contact
            </Link>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <Link
              to="/help-center"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Help Center
            </Link>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <Link
              to="/terms-conditions"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
