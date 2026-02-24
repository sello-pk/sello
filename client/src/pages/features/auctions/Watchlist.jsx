import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  IoHeartOutline as Heart,
  IoTrashOutline as Trash2,
  IoCarSportOutline as Car,
  IoTimeOutline as Clock,
} from "react-icons/io5";
import { useGetMyAuctionWatchlistQuery, useRemoveFromAuctionWatchlistMutation } from "@redux/services/api";

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, variant = "default", className = "", ...props }) => {
  const v = {
    default: "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] shadow-lg shadow-[#FFA602]/30",
    outline: "border-2 border-slate-300 text-slate-700 hover:bg-slate-100",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  return <button className={`inline-flex items-center justify-center font-medium px-4 py-2 text-sm transition-all duration-300 rounded-lg focus:outline-none ${v[variant]} ${className}`} {...props}>{children}</button>;
};

export default function Watchlist() {
  const { data: items = [], isLoading, refetch } = useGetMyAuctionWatchlistQuery();
  const [removeItem] = useRemoveFromAuctionWatchlistMutation();

  const handleRemove = async (auctionCarId) => {
    try {
      await removeItem(auctionCarId).unwrap();
      toast.success("Removed from watchlist");
      refetch();
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-[#FFA602]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Watchlist</h1>
            <p className="text-slate-500">{items.length} cars you're following</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Watchlist is empty</h3>
            <p className="text-slate-500 mb-6">Follow cars in the live auction to get updates</p>
            <Link to="/auctions/live"><Button>Browse Live Auction</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => {
              const ac = item.auctionCar;
              if (!ac) return null;
              const car = ac.car || {};
              const auction = ac.auction || {};
              const img = Array.isArray(car.images) ? car.images[0] : car.images;

              return (
                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-56 h-40 bg-slate-100 flex-shrink-0">
                      {img && <img src={img} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{car.make} {car.model}</h3>
                        <p className="text-slate-500 text-sm">{car.year} • {car.mileage?.toLocaleString()} km • {car.condition}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-slate-100 text-slate-600">{auction.title}</Badge>
                          {auction.status === "live" && <Badge className="bg-red-500 text-white">Live</Badge>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-[#FFA602]">PKR {(ac.currentBid || ac.startingBid)?.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{ac.bidCount || 0} bids</p>
                        <div className="flex gap-2 mt-2">
                          <Link to={`/auctions/car-detail?id=${ac._id}`}>
                            <Button size="sm">View</Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleRemove(ac._id)} className="text-red-500 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
