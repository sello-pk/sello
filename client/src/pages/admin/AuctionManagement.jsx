import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  IoAddOutline as Plus,
  IoPlayOutline as Play,
  IoStopOutline as Square,
  IoCloseOutline as X,
  IoCheckmarkOutline as Check,
  IoCarSportOutline as Car,
  IoFlashOutline as Zap,
  IoPeopleOutline as Users,
  IoTrendingUpOutline as TrendingUp,
  IoWalletOutline as Wallet,
  IoTimeOutline as Clock,
  IoTrashOutline as Trash,
  IoPencilOutline as Edit,
  IoReturnDownBackOutline as Undo,
  IoShieldCheckmarkOutline as ShieldCheck,
  IoWarningOutline as AlertTriangle,
  IoStatsChartOutline as BarChart3,
  IoCalendarOutline as CalendarDays,
  IoExtensionPuzzleOutline as ExtensionPuzzle,
  IoShieldOutline as ShieldAlert,
  IoSettingsOutline as SettingsIcon,
  IoTrashOutline as Ban,
} from "react-icons/io5";
import { GiGavel as Gavel } from "react-icons/gi";
import {
  useGetAuctionDashboardQuery,
  useAdminCreateAuctionMutation,
  useAdminUpdateAuctionMutation,
  useAdminGoLiveMutation,
  useAdminEndAuctionMutation,
  useAdminCancelAuctionMutation,
  useAdminApproveAuctionCarMutation,
  useAdminRejectAuctionCarMutation,
  useAdminPlaceOfflineBidMutation,
  useAdminGetAllTokenPaymentsQuery,
  useAdminVerifyTokenPaymentMutation,
  useAdminGetAllAuctionCarsQuery,
  useAdminUpdateAuctionCarMutation,
  useAdminDeleteAuctionCarMutation,
  useAdminAddCarToAuctionMutation,
  useAdminGetAllEscrowsQuery,
  useAdminUpdateEscrowStatusMutation,
  useAdminRefundTokenMutation,
  useAdminBulkRefundTokensMutation,
  useGetPaymentStatsQuery,
  useGetAuctionSettingsQuery,
  useUpdateAuctionSettingsMutation,
  useGetInspectionBookingsQuery,
  useUpdateInspectionBookingMutation,
  useGetAuctionExtensionsQuery,
  useGetSecurityEventsQuery,
} from "@redux/services/adminApi";
import { useGetAuctionsQuery, useGetCarsQuery } from "@redux/services/api";

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, variant = "default", className = "", ...props }) => {
  const v = {
    default: "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602]",
    outline: "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
  };
  return <button className={`inline-flex items-center justify-center font-medium px-4 py-2 text-sm rounded-lg transition-all disabled:opacity-50 ${v[variant]} ${className}`} {...props}>{children}</button>;
};

const statusColors = {
  live: "bg-red-500 text-white",
  scheduled: "bg-blue-100 text-blue-600",
  completed: "bg-emerald-100 text-emerald-600",
  draft: "bg-amber-100 text-amber-600",
  cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-200",
  pending: "bg-amber-100 text-amber-600",
  approved: "bg-emerald-100 text-emerald-600",
  rejected: "bg-red-100 text-red-600",
  verified: "bg-emerald-100 text-emerald-700",
};

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "auctions", label: "Auctions", icon: Gavel },
  { id: "cars", label: "Cars", icon: Car },
  { id: "payments", label: "Token Payments", icon: Wallet },
  { id: "escrows", label: "Escrow", icon: ShieldCheck },
  { id: "inspections", label: "Inspection Bookings", icon: CalendarDays },
  { id: "extensions", label: "Auction Extensions", icon: ExtensionPuzzle },
  { id: "risk", label: "Risk Monitor", icon: ShieldAlert },
  { id: "settings", label: "Auction Settings", icon: SettingsIcon },
];

export default function AuctionManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfflineBidModal, setShowOfflineBidModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [selectedAuctionCar, setSelectedAuctionCar] = useState(null);
  const [editingAuctionCar, setEditingAuctionCar] = useState(null);
  const [offlineBidAmount, setOfflineBidAmount] = useState("");
  const [editFormData, setEditFormData] = useState({
    startingBid: "",
    reservePrice: "",
    buyNowPrice: "",
    bidIncrement: "",
    status: "",
  });
  const [offlineBidderName, setOfflineBidderName] = useState("Floor Bid");
  const [addCarData, setAddCarData] = useState({ auctionId: "", carId: "", startingBid: "", bidIncrement: "" });
  const [carSearch, setCarSearch] = useState("");
  const [auctionStatusFilter, setAuctionStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const [newAuction, setNewAuction] = useState({ title: "", description: "", startTime: "", endTime: "", location: "Okara Auction Yard, Punjab" });

  const { data: dashboard, isLoading: dashLoading, refetch: refetchDash } = useGetAuctionDashboardQuery();
  const { data: auctionsResponse, refetch: refetchAuctions } = useGetAuctionsQuery({
    limit: 100,
    ...(auctionStatusFilter !== "all" ? { status: auctionStatusFilter } : {}),
  });
  const auctions = Array.isArray(auctionsResponse) ? auctionsResponse : auctionsResponse?.data ?? [];
  const { data: auctionCars = [], refetch: refetchCars } = useAdminGetAllAuctionCarsQuery({});
  const { data: tokenPayments = [], refetch: refetchPayments } = useAdminGetAllTokenPaymentsQuery({});

  const [createAuction, { isLoading: creating }] = useAdminCreateAuctionMutation();
  const [goLive] = useAdminGoLiveMutation();
  const [endAuction] = useAdminEndAuctionMutation();
  const [cancelAuction] = useAdminCancelAuctionMutation();
  const [approveCar] = useAdminApproveAuctionCarMutation();
  const [rejectCar] = useAdminRejectAuctionCarMutation();
  const [verifyPayment] = useAdminVerifyTokenPaymentMutation();
  const [placeOfflineBid] = useAdminPlaceOfflineBidMutation();
  const [addCarToAuction, { isLoading: addingCar }] = useAdminAddCarToAuctionMutation();
  const { data: carsData } = useGetCarsQuery({ limit: 200, search: carSearch });

  const [escrowStatusFilter, setEscrowStatusFilter] = useState("all");
  const { data: allEscrows = [], refetch: refetchEscrows } = useAdminGetAllEscrowsQuery(
    escrowStatusFilter === "overdue" ? { overdue: "true" } : escrowStatusFilter !== "all" ? { status: escrowStatusFilter } : {}
  );
  const [updateEscrowStatus] = useAdminUpdateEscrowStatusMutation();
  const [refundToken] = useAdminRefundTokenMutation();
  const [bulkRefundTokens, { isLoading: bulkRefunding }] = useAdminBulkRefundTokensMutation();
  const { data: paymentStats } = useGetPaymentStatsQuery();
  const { data: auctionSettings, refetch: refetchSettings } = useGetAuctionSettingsQuery();
  const [updateAuctionSettings, { isLoading: savingSettings }] = useUpdateAuctionSettingsMutation();
  const { data: inspectionBookings = [], refetch: refetchBookings } = useGetInspectionBookingsQuery();
  const [updateInspectionBooking] = useUpdateInspectionBookingMutation();
  const { data: extensionLog = [] } = useGetAuctionExtensionsQuery();
  const { data: securityEvents = [] } = useGetSecurityEventsQuery({ limit: 100 });
  const [settingsForm, setSettingsForm] = useState({
    minBidIncrement: 50000,
    antiSnipeTriggerSeconds: 120,
    antiSnipeExtensionSeconds: 120,
    paymentWindowHours: 48,
    tokenDepositPercent: 0,
    maxProxyBid: 100000000,
    activeBidderWindowMinutes: 15,
    listingFee: 0,
    buyerFeePercent: 0,
    sellerCommissionPercent: 0,
    auctionDepositAmount: 0,
    auctionEntryFee: 0,
    dealerSubscriptionFee: 0,
    tokenDeposit: 10000,
  });

  useEffect(() => {
    if (auctionSettings && Object.keys(auctionSettings).length) setSettingsForm((s) => ({ ...s, ...auctionSettings }));
  }, [auctionSettings]);

  const handleCreate = async () => {
    try {
      if (!newAuction.title || !newAuction.startTime || !newAuction.endTime) return toast.error("Fill all required fields");
      await createAuction(newAuction).unwrap();
      toast.success("Auction created!");
      setShowCreateModal(false);
      setNewAuction({ title: "", description: "", startTime: "", endTime: "", location: "Okara Auction Yard, Punjab" });
      refetchAuctions();
      refetchDash();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleGoLive = async (id) => {
    if (!confirm("Go live with this auction?")) return;
    try { await goLive(id).unwrap(); toast.success("Auction is now LIVE!"); refetchAuctions(); refetchDash(); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleEnd = async (id) => {
    if (!confirm("End this auction? Winners will be determined.")) return;
    try { await endAuction(id).unwrap(); toast.success("Auction ended"); refetchAuctions(); refetchDash(); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this auction? This cannot be undone.")) return;
    try { await cancelAuction(id).unwrap(); toast.success("Auction cancelled"); refetchAuctions(); refetchDash(); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const [adminUpdateAuctionCar] = useAdminUpdateAuctionCarMutation();
  const [adminDeleteAuctionCar] = useAdminDeleteAuctionCarMutation();

  const handleApproveCar = async (id) => {
    try { await approveCar(id).unwrap(); toast.success("Car approved"); refetchCars(); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleRejectCar = async (id) => {
    try { await rejectCar(id).unwrap(); toast.success("Car rejected"); refetchCars(); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleVerifyPayment = async (id, action) => {
    try { await verifyPayment({ id, action }).unwrap(); toast.success(`Payment ${action}d`); refetchPayments(); }
    catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleAddCar = async () => {
    if (!addCarData.auctionId || !addCarData.carId) return toast.error("Select auction and car");
    try {
      await addCarToAuction({ 
        ...addCarData, 
        startingBid: Number(addCarData.startingBid) || 500000,
        bidIncrement: Number(addCarData.bidIncrement) || undefined,
      }).unwrap();
      toast.success("Car added to auction!");
      setShowAddCarModal(false);
      setAddCarData({ auctionId: "", carId: "", startingBid: "", bidIncrement: "" });
      refetchCars();
      refetchDash();
    } catch (err) { toast.error(err?.data?.message || "Failed to add car"); }
  };

  const handleDeleteAuctionCar = async (id) => {
    if (!window.confirm("Are you sure you want to remove this car from the auction? The car listing itself will remain in the marketplace.")) return;
    try {
      await adminDeleteAuctionCar(id).unwrap();
      toast.success("Car removed from auction");
      refetchCars();
      refetchDash();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove car");
    }
  };

  const handleEditAuctionCar = (ac) => {
    setEditingAuctionCar(ac);
    setEditFormData({
      startingBid: ac.startingBid || "",
      reservePrice: ac.reservePrice || "",
      buyNowPrice: ac.buyNowPrice || "",
      bidIncrement: ac.bidIncrement || "",
      status: ac.status || "",
    });
    setShowEditCarModal(true);
  };

  const handleUpdateAuctionCar = async (e) => {
    e.preventDefault();
    try {
      await adminUpdateAuctionCar({
        id: editingAuctionCar._id,
        ...editFormData,
      }).unwrap();
      toast.success("Auction details updated");
      setShowEditCarModal(false);
      refetchCars();
      refetchDash();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update details");
    }
  };

  const handleEscrowAction = async (id, status) => {
    const labels = { in_escrow: "Mark as Paid", released: "Release Funds", refunded: "Refund", disputed: "Dispute" };
    if (!confirm(`${labels[status] || status} this escrow?`)) return;
    try {
      await updateEscrowStatus({ id, status }).unwrap();
      toast.success(`Escrow updated to ${status}`);
      refetchEscrows();
      refetchDash();
    } catch (err) { toast.error(err?.data?.message || "Failed to update escrow"); }
  };

  const handleRefundToken = async (id) => {
    if (!confirm("Refund this token deposit?")) return;
    try {
      await refundToken(id).unwrap();
      toast.success("Token refunded");
      refetchPayments();
      refetchDash();
    } catch (err) { toast.error(err?.data?.message || "Failed to refund"); }
  };

  const handleBulkRefund = async (auctionId) => {
    if (!confirm("Refund all non-winner token deposits for this auction?")) return;
    try {
      const res = await bulkRefundTokens({ auctionId }).unwrap();
      toast.success(res?.message || "Bulk refund processed");
      refetchPayments();
      refetchDash();
    } catch (err) { toast.error(err?.data?.message || "Failed to process bulk refund"); }
  };

  const handleOfflineBid = async () => {
    if (!selectedAuctionCar || !offlineBidAmount) return;
    try {
      await placeOfflineBid({ auctionCarId: selectedAuctionCar, amount: Number(offlineBidAmount), bidderName: offlineBidderName || "Floor Bid" }).unwrap();
      toast.success("Offline bid placed!");
      setShowOfflineBidModal(false);
      setOfflineBidAmount("");
      setOfflineBidderName("Floor Bid");
      refetchCars();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const stats = dashboard?.stats || {};

  return (
    <AdminLayout>
    <div className="p-6 overflow-x-hidden min-w-0 max-w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Auction Management</h1>
          <p className="text-slate-500 dark:text-slate-300">Manage live auctions, cars, bids, and payments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-2" />Create Auction</Button>
      </div>

      {/* Tabs - wrap on narrow screens to avoid horizontal page scroll */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id ? "bg-[#FFA602] text-white" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === "dashboard" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-6">
            {[
              { label: "Total Auctions", value: stats.totalAuctions, icon: Gavel, color: "text-[#FFA602]" },
              { label: "Live Now", value: stats.liveAuctions, icon: Zap, color: "text-red-500" },
              { label: "Total Cars", value: stats.totalCars, icon: Car, color: "text-blue-500" },
              { label: "Total Bids", value: stats.totalBids, icon: TrendingUp, color: "text-emerald-500" },
              { label: "Verified Users", value: stats.totalUsers, icon: Users, color: "text-purple-500" },
              { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, color: "text-amber-500" },
              { label: "Average Sale Price", value: stats.averageSalePrice != null ? `PKR ${Number(stats.averageSalePrice).toLocaleString()}` : "—", icon: BarChart3, color: "text-slate-600" },
              { label: "Bids per Auction", value: stats.bidsPerAuction != null ? Number(stats.bidsPerAuction).toFixed(1) : "—", icon: TrendingUp, color: "text-indigo-500" },
              { label: "Conversion Rate", value: stats.conversionRate != null ? `${Number(stats.conversionRate).toFixed(1)}%` : "—", icon: BarChart3, color: "text-teal-500" },
              { label: "Sold", value: stats.soldCount, icon: Check, color: "text-emerald-600" },
              { label: "Unsold", value: stats.unsoldCount, icon: X, color: "text-slate-500" },
              { label: "Completed Auctions", value: stats.completedAuctions, icon: Gavel, color: "text-blue-600" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value ?? 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue Stats */}
          {paymentStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
                <BarChart3 className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-2xl font-bold">PKR {(paymentStats.totalCollected || 0).toLocaleString()}</p>
                <p className="text-sm opacity-80">Total Revenue</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                <ShieldCheck className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{paymentStats.escrows?.pending?.count || 0}</p>
                <p className="text-sm opacity-80">Pending Escrows</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
                <AlertTriangle className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{paymentStats.overdueEscrows || 0}</p>
                <p className="text-sm opacity-80">Overdue Payments</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
                <Undo className="w-6 h-6 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{paymentStats.refunds?.count || 0}</p>
                <p className="text-sm opacity-80">Refunds Processed</p>
              </div>
            </div>
          )}

          {dashboard?.recentBids?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-slate-100">Recent Bids</h3>
              <div className="overflow-x-auto admin-table-scroll">
                <table className="w-full text-sm text-slate-800 dark:text-slate-200">
                  <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"><th className="pb-3">Bidder</th><th className="pb-3">Amount</th><th className="pb-3">Type</th><th className="pb-3">Time</th></tr></thead>
                  <tbody>
                    {dashboard.recentBids.map((bid) => (
                      <tr key={bid._id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{bid.bidder?.name || bid.bidderName}</td>
                        <td className="py-3 font-semibold text-[#FFA602]">PKR {bid.amount?.toLocaleString()}</td>
                        <td className="py-3"><Badge className={bid.bidType === "offline" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-600"}>{bid.bidType}</Badge></td>
                        <td className="py-3 text-slate-500 dark:text-slate-300">{new Date(bid.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auctions List */}
      {activeTab === "auctions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-slate-500 dark:text-slate-300">Status:</span>
            {["all", "live", "scheduled", "completed", "draft", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setAuctionStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${auctionStatusFilter === s ? "bg-[#FFA602] text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {auctionStatusFilter === "completed" && stats.completedAuctions != null && (
              <span className="text-xs text-slate-500 dark:text-slate-300 ml-1">({stats.completedAuctions} completed)</span>
            )}
          </div>
          {auctions.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-300">
              {auctionStatusFilter !== "all" ? `No ${auctionStatusFilter} auctions` : "No auctions created yet"}
            </div>
          ) : auctions.map((auction) => (
            <div key={auction._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{auction.title}</h3>
                    <Badge className={statusColors[auction.status]}>{auction.status?.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{auction.location}</p>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500 dark:text-slate-300">
                    <span>Start: {new Date(auction.startTime).toLocaleString()}</span>
                    <span>End: {new Date(auction.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-slate-700 dark:text-slate-200">
                    <span>{auction.totalCars || 0} cars</span>
                    <span>{auction.totalBids || 0} bids</span>
                    <span>{auction.totalSold || 0} sold</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {["draft", "scheduled"].includes(auction.status) && (
                    <Button variant="success" onClick={() => handleGoLive(auction._id)}><Play className="w-4 h-4 mr-1" />Go Live</Button>
                  )}
                  {auction.status === "live" && (
                    <Button variant="danger" onClick={() => handleEnd(auction._id)}><Square className="w-4 h-4 mr-1" />End</Button>
                  )}
                  {!["completed", "cancelled"].includes(auction.status) && (
                    <Button variant="outline" onClick={() => handleCancel(auction._id)}><Ban className="w-4 h-4 mr-1" />Cancel</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auction Cars */}
      {activeTab === "cars" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAddCarModal(true)}><Plus className="w-4 h-4 mr-2" />Add Car to Auction</Button>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm text-slate-800 dark:text-slate-200">
              <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <th className="p-4">Car</th><th className="p-4">Auction</th><th className="p-4">Starting Bid</th><th className="p-4">Current Bid</th><th className="p-4">Bids</th><th className="p-4">Status</th><th className="p-4">Actions</th>
              </tr></thead>
              <tbody>
                {auctionCars.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-slate-500 dark:text-slate-300">No cars submitted to auctions</td></tr>
                ) : auctionCars.map((ac) => (
                  <tr key={ac._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{ac.car?.year} {ac.car?.make} {ac.car?.model}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-300">{ac.auction?.title}</td>
                    <td className="p-4">PKR {ac.startingBid?.toLocaleString()}</td>
                    <td className="p-4 font-semibold text-[#FFA602]">PKR {(ac.currentBid || 0).toLocaleString()}</td>
                    <td className="p-4">{ac.bidCount || 0}</td>
                    <td className="p-4"><Badge className={statusColors[ac.status] || ""}>{ac.status}</Badge></td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {ac.status === "pending" && (
                          <>
                            <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleApproveCar(ac._id)} title="Approve"><Check className="w-3 h-3" /></Button>
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleRejectCar(ac._id)} title="Reject"><X className="w-3 h-3" /></Button>
                          </>
                        )}
                        {["approved", "live", "unsold"].includes(ac.status) && (
                          <>
                            <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleEditAuctionCar(ac)} title="Edit Auction Details">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeleteAuctionCar(ac._id)} title="Remove from Auction">
                              <Trash className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        {["approved", "live"].includes(ac.status) && ac.auction?.status === "live" && (
                          <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => { setSelectedAuctionCar(ac._id); setShowOfflineBidModal(true); }}>
                            <Gavel className="w-3 h-3 mr-1" />Floor Bid
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Token Payments */}
      {activeTab === "payments" && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-500 dark:text-slate-300">Filter:</span>
              {["all", "pending", "verified", "rejected", "refunded"].map((s) => (
                <button key={s} onClick={() => setPaymentStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${paymentStatusFilter === s ? "bg-[#FFA602] text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" onChange={(e) => e.target.value && handleBulkRefund(e.target.value)} disabled={bulkRefunding}>
                <option value="">Bulk Refund (select auction)</option>
                {auctions.filter((a) => a.status === "completed").map((a) => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm text-slate-800 dark:text-slate-200">
              <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <th className="p-4">User</th><th className="p-4">Amount</th><th className="p-4">Method</th><th className="p-4">Transaction ID</th><th className="p-4">Receipt</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Actions</th>
              </tr></thead>
              <tbody>
                {(paymentStatusFilter === "all" ? tokenPayments : tokenPayments.filter((p) => p.status === paymentStatusFilter)).length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-10 text-slate-500 dark:text-slate-300">No token payments</td></tr>
                ) : (paymentStatusFilter === "all" ? tokenPayments : tokenPayments.filter((p) => p.status === paymentStatusFilter)).map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4"><div><p className="font-medium text-slate-900 dark:text-slate-100">{p.user?.name}</p><p className="text-xs text-slate-500 dark:text-slate-300">{p.user?.email}</p></div></td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">PKR {p.amount?.toLocaleString()}</td>
                    <td className="p-4 capitalize text-slate-700 dark:text-slate-200">{p.paymentMethod}</td>
                    <td className="p-4 font-mono text-xs text-slate-700 dark:text-slate-200">{p.transactionId}</td>
                    <td className="p-4 text-xs">
                      {p.receiptUrl ? (
                        <a href={p.receiptUrl} target="_blank" rel="noreferrer" className="text-[#FFA602] hover:underline">Open proof</a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Not attached</span>
                      )}
                    </td>
                    <td className="p-4"><Badge className={statusColors[p.status] || ""}>{p.status}</Badge></td>
                    <td className="p-4 text-slate-500 dark:text-slate-300">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {p.status === "pending" && (
                          <>
                            <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleVerifyPayment(p._id, "verify")}><Check className="w-3 h-3 mr-1" />Verify</Button>
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleVerifyPayment(p._id, "reject")}><X className="w-3 h-3 mr-1" />Reject</Button>
                          </>
                        )}
                        {p.status === "verified" && (
                          <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleRefundToken(p._id)}>
                            <Undo className="w-3 h-3 mr-1" />Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Escrow Management */}
      {activeTab === "escrows" && (
        <div>
          <div className="flex gap-2 items-center mb-4">
            <span className="text-sm text-slate-500 dark:text-slate-300">Filter:</span>
            {["all", "pending", "in_escrow", "released", "refunded", "disputed", "overdue"].map((s) => (
              <button key={s} onClick={() => setEscrowStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${escrowStatusFilter === s ? "bg-[#FFA602] text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >{s === "all" ? "All" : s === "in_escrow" ? "In Escrow" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm text-slate-800 dark:text-slate-200">
              <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <th className="p-4">Car</th><th className="p-4">Buyer</th><th className="p-4">Amount</th><th className="p-4">Due</th><th className="p-4">Status</th><th className="p-4">Deadline</th><th className="p-4">Actions</th>
              </tr></thead>
              <tbody>
                {allEscrows.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-slate-500 dark:text-slate-300">No escrows found</td></tr>
                ) : allEscrows.map((esc) => {
                  const car = esc.auctionCar?.car || {};
                  const isOverdue = esc.status === "pending" && new Date(esc.paymentDeadline) < new Date();
                  const hoursLeft = Math.max(0, Math.round((new Date(esc.paymentDeadline) - new Date()) / 3600000));
                  return (
                    <tr key={esc._id} className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isOverdue ? "bg-red-50 dark:bg-red-900/20" : ""}`}>
                      <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{car.year} {car.make} {car.model}</td>
                      <td className="p-4"><div><p className="font-medium text-slate-900 dark:text-slate-100">{esc.buyer?.name}</p><p className="text-xs text-slate-500 dark:text-slate-300">{esc.buyer?.email}</p></div></td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">PKR {esc.amount?.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-[#FFA602]">PKR {esc.amountDue?.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge className={statusColors[esc.status] || "bg-slate-100 text-slate-600"}>{esc.status?.replace("_", " ")}</Badge>
                        {isOverdue && <Badge className="bg-red-500 text-white ml-1">Overdue</Badge>}
                      </td>
                      <td className="p-4">
                        <p className="text-xs">{new Date(esc.paymentDeadline).toLocaleString()}</p>
                        {esc.status === "pending" && !isOverdue && (
                          <p className={`text-xs font-medium ${hoursLeft < 12 ? "text-red-500" : "text-slate-500 dark:text-slate-300"}`}>{hoursLeft}h left</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {esc.status === "pending" && (
                            <>
                              <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleEscrowAction(esc._id, "in_escrow")}><Check className="w-3 h-3 mr-1" />Paid</Button>
                              <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleEscrowAction(esc._id, "disputed")}><AlertTriangle className="w-3 h-3 mr-1" />Dispute</Button>
                            </>
                          )}
                          {esc.status === "in_escrow" && (
                            <>
                              <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleEscrowAction(esc._id, "released")}><Check className="w-3 h-3 mr-1" />Release</Button>
                              <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleEscrowAction(esc._id, "refunded")}><Undo className="w-3 h-3 mr-1" />Refund</Button>
                            </>
                          )}
                          {esc.status === "disputed" && (
                            <>
                              <Button variant="success" className="px-2 py-1 text-xs" onClick={() => handleEscrowAction(esc._id, "in_escrow")}><Check className="w-3 h-3 mr-1" />Resolve</Button>
                              <Button variant="outline" className="px-2 py-1 text-xs" onClick={() => handleEscrowAction(esc._id, "refunded")}><Undo className="w-3 h-3 mr-1" />Refund</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "inspections" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-slate-800 dark:text-slate-200">
            <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <th className="p-4">User</th><th className="p-4">Car</th><th className="p-4">Date</th><th className="p-4">Time</th><th className="p-4">Status</th><th className="p-4">Action</th>
            </tr></thead>
            <tbody>
              {inspectionBookings.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-slate-500 dark:text-slate-300">No inspection bookings</td></tr>
              ) : inspectionBookings.map((b) => (
                <tr key={b._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4"><p className="font-medium text-slate-900 dark:text-slate-100">{b.user?.name}</p><p className="text-xs text-slate-500 dark:text-slate-300">{b.user?.email}</p></td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{b.car?.title || `${b.car?.make} ${b.car?.model}`}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{new Date(b.inspectionDate).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{b.timeSlot}</td>
                  <td className="p-4"><Badge className={statusColors[b.status] || "bg-slate-100"}>{b.status}</Badge></td>
                  <td className="p-4">
                    {b.status === "pending" && (
                      <Button className="px-2 py-1 text-xs" onClick={async () => {
                        try { await updateInspectionBooking({ id: b._id, status: "confirmed" }).unwrap(); toast.success("Booking confirmed"); refetchBookings(); }
                        catch (e) { toast.error(e?.data?.message || "Failed"); }
                      }}>Confirm</Button>
                    )}
                    {b.status === "confirmed" && (
                      <Button variant="outline" className="px-2 py-1 text-xs" onClick={async () => {
                        try { await updateInspectionBooking({ id: b._id, status: "completed" }).unwrap(); toast.success("Marked completed"); refetchBookings(); }
                        catch (e) { toast.error(e?.data?.message || "Failed"); }
                      }}>Complete</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "extensions" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-slate-800 dark:text-slate-200">
            <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <th className="p-4">Auction</th><th className="p-4">Extended by</th><th className="p-4">Minutes</th><th className="p-4">Reason</th><th className="p-4">When</th>
            </tr></thead>
            <tbody>
              {(extensionLog.length === 0) ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500 dark:text-slate-300">No extension log</td></tr>
              ) : extensionLog.map((e) => (
                <tr key={e._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{e.auction?.title}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{e.extendedBy?.name}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">+{e.extensionMinutes} min</td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{e.reason?.replace("_", " ")}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-300">{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-slate-800 dark:text-slate-200">
            <thead><tr className="text-left text-slate-500 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <th className="p-4">Type</th><th className="p-4">Severity</th><th className="p-4">User</th><th className="p-4">Details</th><th className="p-4">When</th>
            </tr></thead>
            <tbody>
              {securityEvents.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500 dark:text-slate-300">No security events</td></tr>
              ) : securityEvents.map((e) => (
                <tr key={e._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{e.type?.replace(/_/g, " ")}</td>
                  <td className="p-4"><Badge className={e.severity === "critical" ? "bg-red-100 text-red-700" : e.severity === "high" ? "bg-amber-100 text-amber-700" : "bg-slate-100"}>{e.severity}</Badge></td>
                  <td className="p-4 text-slate-700 dark:text-slate-200">{e.userId?.name || e.userId?.email || "—"}</td>
                  <td className="p-4 text-xs text-slate-500 dark:text-slate-300 max-w-xs truncate">{JSON.stringify(e.details || {})}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-300">{new Date(e.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Auction operation settings</h3>
            {["minBidIncrement", "antiSnipeTriggerSeconds", "antiSnipeExtensionSeconds", "paymentWindowHours", "tokenDepositPercent", "maxProxyBid", "activeBidderWindowMinutes", "listingFee", "buyerFeePercent", "sellerCommissionPercent", "auctionDepositAmount", "auctionEntryFee", "dealerSubscriptionFee", "tokenDeposit"].map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</label>
                <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={settingsForm[key] ?? ""} onChange={(e) => setSettingsForm((s) => ({ ...s, [key]: Number(e.target.value) }))} />
              </div>
            ))}
            <Button disabled={savingSettings} onClick={async () => {
              try { await updateAuctionSettings(settingsForm).unwrap(); toast.success("Settings saved"); refetchSettings(); }
              catch (e) { toast.error(e?.data?.message || "Failed"); }
            }}>{savingSettings ? "Saving..." : "Save settings"}</Button>
          </div>
        </div>
      )}

      {/* Create Auction Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Auction</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Title *</label>
                  <input className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={newAuction.title} onChange={(e) => setNewAuction({ ...newAuction, title: e.target.value })} placeholder="e.g. Auction #102" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Description</label>
                  <textarea className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" rows="3" value={newAuction.description} onChange={(e) => setNewAuction({ ...newAuction, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Start Time *</label>
                    <input type="datetime-local" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={newAuction.startTime} onChange={(e) => setNewAuction({ ...newAuction, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">End Time *</label>
                    <input type="datetime-local" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={newAuction.endTime} onChange={(e) => setNewAuction({ ...newAuction, endTime: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Location</label>
                  <input className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={newAuction.location} onChange={(e) => setNewAuction({ ...newAuction, location: e.target.value })} />
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create Auction"}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Offline Bid Modal */}
      <AnimatePresence>
        {showOfflineBidModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Place Floor Bid</h3>
                <button onClick={() => setShowOfflineBidModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bidder Name</label>
                  <input className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={offlineBidderName} onChange={(e) => setOfflineBidderName(e.target.value)} placeholder="Floor Bid" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bid Amount (PKR)</label>
                  <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={offlineBidAmount} onChange={(e) => setOfflineBidAmount(e.target.value)} step="50000" />
                </div>
                <Button className="w-full" onClick={handleOfflineBid}><Gavel className="w-4 h-4 mr-2" />Place Floor Bid</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Car to Auction Modal */}
      <AnimatePresence>
        {showAddCarModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add Car to Auction</h3>
                <button onClick={() => setShowAddCarModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Select Auction *</label>
                  <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={addCarData.auctionId} onChange={(e) => setAddCarData({ ...addCarData, auctionId: e.target.value })}>
                    <option value="">Choose an auction...</option>
                    {auctions.filter((a) => ["draft", "scheduled", "live"].includes(a.status)).map((a) => (
                      <option key={a._id} value={a._id}>{a.title} ({a.status})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Search Car</label>
                  <input className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg mb-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" placeholder="Search by make, model..." value={carSearch} onChange={(e) => setCarSearch(e.target.value)} />
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Select Car *</label>
                  <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={addCarData.carId} onChange={(e) => setAddCarData({ ...addCarData, carId: e.target.value })}>
                    <option value="">Choose a car...</option>
                    {(carsData?.data || carsData?.cars || []).map((c) => (
                      <option key={c._id} value={c._id}>{c.year} {c.make} {c.model} — PKR {c.price?.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Starting Bid (PKR)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={addCarData.startingBid} onChange={(e) => setAddCarData({ ...addCarData, startingBid: e.target.value })} placeholder="500000" step="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bid Increment Override</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={addCarData.bidIncrement} onChange={(e) => setAddCarData({ ...addCarData, bidIncrement: e.target.value })} placeholder="Default logic" step="10000" />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddCar} disabled={addingCar}>
                  <Car className="w-4 h-4 mr-2" />{addingCar ? "Adding..." : "Add Car to Auction"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Auction Car Modal */}
      <AnimatePresence>
        {showEditCarModal && editingAuctionCar && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Edit Auction Details</h3>
                  <p className="text-sm text-slate-500">{editingAuctionCar.car?.make} {editingAuctionCar.car?.model} ({editingAuctionCar.car?.year})</p>
                </div>
                <button onClick={() => setShowEditCarModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleUpdateAuctionCar} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Starting Bid (PKR)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={editFormData.startingBid} onChange={(e) => setEditFormData({ ...editFormData, startingBid: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Bid Increment (PKR)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={editFormData.bidIncrement} onChange={(e) => setEditFormData({ ...editFormData, bidIncrement: e.target.value })} placeholder="Leave blank for global default" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Reserve Price (PKR)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={editFormData.reservePrice} onChange={(e) => setEditFormData({ ...editFormData, reservePrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Buy Now Price (PKR)</label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={editFormData.buyNowPrice} onChange={(e) => setEditFormData({ ...editFormData, buyNowPrice: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Status</label>
                  <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100" value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="live">Live</option>
                    <option value="sold">Sold</option>
                    <option value="unsold">Unsold</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditCarModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </AdminLayout>
  );
}
