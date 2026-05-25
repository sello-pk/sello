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
    pollingInterval: 120000,
  });

  if (location.pathname === "/listings") return null;
  if (location.pathname === "/about") return null;
  if (location.pathname === "/help/faqs") return null;
  if (location.pathname === "/auctions/live") return null;

  const targetDate =
    liveAuction?.endTime ||
    (liveAuction ? new Date(Date.now() + 86400000 * 2) : null);

  const showAuction = !isLoading && liveAuction && targetDate;
  const auctionVenue = liveAuction?.location?.trim() || "Okara Auction Yard";
  const auctionName = liveAuction?.title?.trim() || "Live Auction";

  return (
    <div
      style={{ zIndex: 1000 }}
      className="sello-bottom-bar bg-[#050B20] border-y border-gray-200/80 w-full flex items-center px-3 sm:px-4 md:px-8 lg:px-20 text-sm md:text-base text-white overflow-x-auto scrollbar-hide"
      aria-busy={isLoading}
    >
      <div className="flex w-full min-w-0 h-full items-center gap-2 sm:gap-3 md:gap-4">
        <div className={`flex min-w-0 flex-1 items-center gap-2 sm:gap-3 min-h-[40px] overflow-hidden ${!showAuction ? "hidden" : ""}`}>
          <div
            className={`flex min-w-0 items-center gap-2 sm:gap-3 transition-opacity duration-200 opacity-100`}
            aria-hidden={!showAuction}
          >
            <Link
              to="/auctions/live"
              aria-label="Go to live auction"
              title="Go to live auction"
              className="inline-flex items-center px-3 py-1 gap-2 rounded-full text-xs font-semibold bg-red-900 text-white border border-red-900 whitespace-nowrap shrink-0"
            >
              <FiZap className="w-4 h-4 shrink-0 text-white" aria-hidden />
              <span>Live</span>
            </Link>
            <Link
              to="/auctions/live"
              aria-label={`${auctionVenue} - ${auctionName}`}
              title={`${auctionVenue} - ${auctionName}`}
              className="min-w-0 inline-flex items-center gap-2 text-white hover:text-primary transition-colors"
            >
              <FaLocationDot className="w-4 h-4 shrink-0" />
              <div className="min-w-0 leading-tight max-w-[min(100%,200px)] sm:max-w-xs">
                <p className="truncate text-sm font-semibold">{auctionVenue}</p>
                <p className="truncate text-xs text-white/85 hidden sm:block">
                  {auctionName}
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex shrink items-center gap-2 sm:gap-3 md:gap-4 ml-auto w-full justify-between sm:justify-end sm:w-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-2xl bg-white/10 px-2 sm:px-3 py-1.5 min-h-[32px] sm:min-h-[36px] justify-center">
            <span className="hidden sm:inline text-white text-[10px] sm:text-xs uppercase tracking-[0.12em] whitespace-nowrap">
              Ends In
            </span>
            {targetDate ? (
              <CountdownTimer
                targetDate={targetDate}
                size="small"
                showLabel={false}
                variant="glassDark"
              />
            ) : (
              <span
                className="text-xs sm:text-sm tabular-nums text-white/70 whitespace-nowrap"
                aria-hidden
              >
                --:--:--
              </span>
            )}
          </div>

          <Link
            to="/saved-cars"
            aria-label="View saved cars"
            title="Saved Cars"
            className="inline-flex items-center justify-center shrink-0 w-9 h-9"
          >
            <FaRegHeart className="w-5 h-5 hover:text-primary text-white shrink-0" />
          </Link>

          <Link
            to="/filter"
            aria-label="Open vehicle filters"
            title="Filter cars"
            className="text-white text-sm sm:text-base font-medium whitespace-nowrap underline-offset-4 hover:underline shrink-0"
          >
            Filter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomHeader;
