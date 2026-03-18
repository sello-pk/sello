import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useGetLiveAuctionQuery } from "../redux/services/api";
import CountdownTimer from "./auction/CountdownTimer";
import { FiZap } from "react-icons/fi";
import { FaLocationDot } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa";

const BottomHeader = () => {
  const location = useLocation();
  const { data: liveAuction, isLoading } = useGetLiveAuctionQuery(undefined, {
    pollingInterval: 60000,
  });

  if (location.pathname === "/listings") return null;
  if (location.pathname === "/about") return null;
  if (location.pathname === "/help/faqs") return null;
  if (location.pathname.startsWith("/auctions")) return null;

  const targetDate =
    liveAuction?.endTime ||
    (liveAuction ? new Date(Date.now() + 86400000 * 2) : null);
  const showAuction = !isLoading && liveAuction && targetDate;

  return (
    <div
      style={{ zIndex: 1000 }}
      className="bg-[#050B20] border-y border-gray-200/80 w-full flex flex-wrap items-center justify-between gap-4 md:gap-6 px-4 md:px-20 py-2 md:py-3 text-sm md:text-base text-gray-700"
    >
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 overflow-visible">
        {showAuction && (
          <>
            <Link
              to="/auctions/live"
              className="inline-flex items-center px-3 py-1 gap-2 animate-pulse duration-500 ease rounded-full text-xs font-medium bg-white text-red-400 border border-white whitespace-nowrap flex-shrink-0"
            >
              <FiZap className="w-4 h-4 shrink-0" />
              Live
            </Link>
            <FaLocationDot className="w-4 h-4 shrink-0" />
          </>
        )}
      </div>

      <div className="flex items-center gap-24 flex-shrink-0">
        {/* <span className="text-white text-xs whitespace-nowrap">Ends in</span> */}
        <CountdownTimer
          targetDate={targetDate}
          size="small"
          showLabel={false}
        />
        <div className="flex items-center gap-6">
          {" "}
          <Link to="/saved-cars">
            <FaRegHeart className="w-5 h-5 hover:text-primary ease text-white shrink-0" />
          </Link>
          <Link to="/filter" className="text-white">
            Filter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
