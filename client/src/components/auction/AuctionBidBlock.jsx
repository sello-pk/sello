import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useGetAuctionCarDetailQuery,
  usePlaceBidMutation,
  useGetMeQuery,
  useGetMyTokenPaymentsQuery,
  useGetMyAuctionAccessStatusQuery,
} from "../../redux/services/api";
import { useSocket } from "../../contexts/SocketContext";
import CountdownTimer from "./CountdownTimer";

const formatPrice = (p) => `PKR ${(p ?? 0).toLocaleString()}`;

/**
 * Inline auction bidding block for marketplace car detail when the car is in a live/upcoming auction.
 * Shows: countdown, current bid, bid history, bid input + place bid (when live).
 */
export default function AuctionBidBlock({ auctionCarId, className = "" }) {
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState(0);

  const token = localStorage.getItem("token");
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const isLoggedIn = !!user;
  const { data: tokenData } = useGetMyTokenPaymentsQuery(undefined, { skip: !isLoggedIn });
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery(undefined, { skip: !isLoggedIn });
  const hasVerifiedToken = tokenData?.hasVerifiedToken || false;
  const bidderStatus = auctionAccess?.auctionCapabilities?.auctionBidder?.status || "not_requested";
  const dealerStatus = auctionAccess?.auctionCapabilities?.auctionDealer?.status || "not_requested";
  const hasAuctionAccess = bidderStatus === "approved" || dealerStatus === "approved";

  const { data: detail, refetch } = useGetAuctionCarDetailQuery(auctionCarId, {
    skip: !auctionCarId,
    pollingInterval: 10000,
  });
  const [placeBid, { isLoading: bidding }] = usePlaceBidMutation();

  const auction = detail?.auction || {};
  const bids = detail?.bids || [];
  const currentHigh = detail?.currentBid || detail?.startingBid || 0;
  const minIncrement = detail?.bidIncrement || 50000;
  const minimumBid = currentHigh + minIncrement;
  const canPlaceBid = hasVerifiedToken;
  const isLive = auction?.status === "live";
  const isEnded =
    detail?.status === "sold" ||
    (auction?.endTime && new Date(auction.endTime) <= new Date());

  useEffect(() => {
    setBidAmount(minimumBid);
  }, [minimumBid]);

  const { socket, addEventListener, removeEventListener } = useSocket();
  useEffect(() => {
    if (!auction?._id || !socket) return;
    socket.emit("join-auction", auction._id);
    return () => socket.emit("leave-auction", auction._id);
  }, [auction?._id, socket]);

  const handleNewBid = useCallback(
    (data) => {
      if (data?.auctionCarId === auctionCarId) refetch();
    },
    [auctionCarId, refetch],
  );
  useEffect(() => {
    if (!addEventListener) return;
    addEventListener("new-bid", handleNewBid);
    return () => removeEventListener("new-bid", handleNewBid);
  }, [addEventListener, removeEventListener, handleNewBid]);

  const handlePlaceBid = async () => {
    try {
      await placeBid({ auctionCarId, amount: bidAmount }).unwrap();
      toast.success("Bid placed!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to place bid");
    }
  };

  if (!detail) return null;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Live Auction</span>
        <Link
          to={`/auctions/car-detail?id=${auctionCarId}`}
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          Full auction page →
        </Link>
      </div>
      <div className="p-4">
        {/* Countdown */}
        {auction?.endTime && !isEnded && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Time remaining</p>
            <CountdownTimer targetDate={auction.endTime} size="default" showLabel={false} />
          </div>
        )}
        {isEnded && (
          <p className="text-sm text-gray-500 mb-4">
            {detail?.status === "sold" ? "Auction ended – sold" : "Auction ended"}
          </p>
        )}

        {/* Current bid */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Current bid</p>
            <p className="text-2xl font-bold text-gray-900">{formatPrice(currentHigh)}</p>
          </div>
          {detail?.reservePrice > 0 && (
            <p className="text-xs text-gray-500">Reserve: {formatPrice(detail.reservePrice)}</p>
          )}
        </div>

        {/* Recent bids */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Recent bids</p>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {bids.length === 0 ? (
              <p className="text-xs text-gray-400">No bids yet</p>
            ) : (
              bids.slice(0, 5).map((bid, i) => (
                <div
                  key={bid._id || i}
                  className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-600 truncate max-w-[140px]">
                    {bid.bidderName || bid.bidder?.name || "Bidder"}
                  </span>
                  <span className="font-medium text-primary-600 shrink-0">
                    {formatPrice(bid.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bid action */}
        {isLive && !isEnded && (
          <div className="space-y-2">
            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium text-sm hover:opacity-90"
              >
                Login to place bid
              </button>
            ) : !hasAuctionAccess ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full py-2.5 rounded-lg border border-amber-300 text-amber-700 bg-amber-50 font-medium text-sm"
              >
                Request auction access
              </button>
            ) : !canPlaceBid ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 text-center">
                  {!hasVerifiedToken
                    ? "Your token payment must be admin-verified before bidding."
                    : "Your verified token gives you access to place bids in this auction."}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to="/auctions/token-payment"
                    className="block w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium text-sm text-center hover:opacity-90"
                  >
                    Token Payment
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    step={minIncrement}
                    min={minimumBid}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={bidding || bidAmount < minimumBid}
                    className="px-4 py-2 rounded-lg bg-primary-500 text-white font-medium text-sm hover:opacity-90 disabled:opacity-50"
                  >
                    {bidding ? "..." : "Place bid"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Min. next bid: {formatPrice(minimumBid)}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
