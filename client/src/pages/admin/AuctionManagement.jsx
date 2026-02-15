import React, { useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import {
  FiUsers,
  FiActivity,
  FiCalendar,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiDollarSign,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit,
  FiSettings,
  FiBell,
  FiRefreshCw,
  FiX,
  FiUserCheck,
  FiFileText,
  FiClipboard,
  FiStar,
  FiMessageSquare,
  FiChevronRight,
  FiZap,
} from "react-icons/fi";

const AuctionManagement = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOfflineBidDialog, setShowOfflineBidDialog] = useState(false);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");
  const [offlineBid, setOfflineBid] = useState({
    car_id: "",
    amount: "",
    bidder_name: "",
  });
  const [newAuction, setNewAuction] = useState({
    title: "",
    start_time: "",
    end_time: "",
  });

  // Mock data - in real app, this would come from API
  const [users] = useState([
    {
      id: 1,
      full_name: "Ahmed Khan",
      email: "ahmed@test.com",
      role: "user",
      is_approved: true,
      is_banned: false,
    },
    {
      id: 2,
      full_name: "Hassan Ali",
      email: "hassan@test.com",
      role: "user",
      is_approved: false,
      is_banned: false,
    },
    {
      id: 3,
      full_name: "Usman",
      email: "usman@test.com",
      role: "admin",
      is_approved: true,
      is_banned: false,
    },
  ]);

  const [cars] = useState([
    {
      id: 1,
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      status: "in_auction",
      current_bid: 3850000,
      inspection_report: { engine: "pass", body: "minor_issues" },
    },
    {
      id: 2,
      make: "Honda",
      model: "Civic",
      year: 2021,
      status: "pending_approval",
      starting_bid: 2800000,
      inspection_report: { engine: "pass", body: "pass" },
    },
    {
      id: 3,
      make: "Suzuki",
      model: "Alto",
      year: 2023,
      status: "approved",
      starting_bid: 1400000,
    },
  ]);

  const [auctions] = useState([
    {
      id: 1,
      title: "Auction #101",
      status: "live",
      total_cars: 18,
      total_bids: 127,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
    },
    {
      id: 2,
      title: "Auction #102",
      status: "upcoming",
      total_cars: 22,
      start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
  ]);

  const [bids] = useState([
    {
      id: 1,
      amount: 3850000,
      bidder_name: "Ahmed K.",
      bid_type: "online",
      car_id: 1,
      created_date: new Date().toISOString(),
    },
    {
      id: 2,
      amount: 3900000,
      bidder_name: "Floor Bid",
      bid_type: "offline",
      car_id: 1,
      created_date: new Date().toISOString(),
    },
  ]);

  const [bookings] = useState([
    {
      id: 1,
      car_details: "2022 Toyota Corolla",
      buyer_name: "Ahmed",
      booking_date: "2024-02-10",
      booking_time: "10:00 AM",
      status: "pending",
    },
    {
      id: 2,
      car_details: "2021 Honda Civic",
      buyer_name: "Hassan",
      booking_date: "2024-02-11",
      booking_time: "2:00 PM",
      status: "confirmed",
    },
  ]);

  const [disputes] = useState([]);

  const stats = [
    {
      icon: FiUsers,
      value: users.length,
      label: "Total Users",
      color: "blue",
      trend: 12,
    },
    {
      icon: FiActivity,
      value: cars.length,
      label: "Total Vehicles",
      color: "orange",
      trend: 8,
    },
    {
      icon: FiActivity,
      value: bids.length || 127,
      label: "Total Bids",
      color: "purple",
      trend: 25,
    },
    {
      icon: FiDollarSign,
      value: "₨8.5M",
      label: "Total Sales",
      color: "emerald",
      trend: 15,
    },
  ];

  const liveAuction = auctions.find((a) => a.status === "live");
  const carsInAuction = cars.filter((c) => c.status === "in_auction");
  const pendingCars = cars.filter((c) => c.status === "pending_approval");
  const openDisputes = disputes.filter(
    (d) => d.status === "open" || d.status === "under_review",
  );

  const handleApproveCar = (carId, status) => {
    console.log(`Approving car ${carId} with status ${status}`);
    // In real app, this would call an API
  };

  const handleUpdateUser = (userId, data) => {
    console.log(`Updating user ${userId} with data:`, data);
    // In real app, this would call an API
  };

  const handleCreateAuction = (data) => {
    console.log("Creating auction:", data);
    // In real app, this would call an API
  };

  const handleAddOfflineBid = (bidData) => {
    console.log("Adding offline bid:", bidData);
    // In real app, this would call an API
  };

  const handleUpdateBooking = (bookingId, status) => {
    console.log(`Updating booking ${bookingId} to status ${status}`);
    // In real app, this would call an API
  };

  const handleResolveDispute = (disputeId, status, notes) => {
    console.log(
      `Resolving dispute ${disputeId} with status ${status} and notes: ${notes}`,
    );
    // In real app, this would call an API
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-6 -mx-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FiShield className="w-7 h-7 text-orange-400" />
                  Admin Auction Control Panel
                </h1>
                <p className="text-slate-400">Okara Auto Auction Management</p>
              </div>
              <div className="flex items-center gap-4">
                {liveAuction && (
                  <span className="bg-red-500 text-white border-0 animate-pulse px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <FiActivity className="w-4 h-4" />
                    Live Auction Active
                  </span>
                )}
                {openDisputes.length > 0 && (
                  <span className="bg-amber-500 text-white border-0 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <FiAlertTriangle className="w-4 h-4" />
                    {openDisputes.length} Open Disputes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="transition-shadow hover:shadow-md">
                <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}
                    >
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    {stat.trend}% increase
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  "overview",
                  "users",
                  "vehicles",
                  "auctions",
                  "bookings",
                  "inspections",
                  "disputes",
                  "bids",
                ].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`${
                      selectedTab === tab
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {selectedTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Live Auction Monitor */}
                  <div className="border-red-200 bg-red-50/50 rounded-lg border p-6">
                    <h3 className="flex items-center gap-2 text-red-700 font-semibold mb-4">
                      <FiActivity className="w-5 h-5" />
                      Live Auction Monitor
                    </h3>
                    {liveAuction ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {liveAuction.title}
                          </span>
                          <span className="bg-red-500 text-white animate-pulse px-2 py-1 rounded text-xs">
                            LIVE
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-2xl font-bold">
                              {liveAuction.total_cars}
                            </p>
                            <p className="text-xs text-slate-500">Cars</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-2xl font-bold">
                              {liveAuction.total_bids}
                            </p>
                            <p className="text-xs text-slate-500">Bids</p>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <p className="text-2xl font-bold">127</p>
                            <p className="text-xs text-slate-500">Bidders</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowOfflineBidDialog(true)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2"
                        >
                          <FiPlus className="w-4 h-4" />
                          Enter Offline Bid
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <FiClock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No live auction currently</p>
                      </div>
                    )}
                  </div>

                  {/* Pending Approvals */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="flex items-center gap-2 font-semibold mb-4">
                      <FiClock className="w-5 h-5 text-amber-500" />
                      Pending Approvals ({pendingCars.length})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {pendingCars.slice(0, 5).map((car) => (
                        <div
                          key={car.id}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                        >
                          <div>
                            <p className="font-medium">
                              {car.year} {car.make} {car.model}
                            </p>
                            <p className="text-sm text-slate-500">
                              Starting: PKR {car.starting_bid?.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleApproveCar(car.id, "withdrawn")
                              }
                              className="border-red-300 text-red-600 px-2 py-1 rounded text-sm hover:bg-red-50"
                            >
                              <FiXCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleApproveCar(car.id, "approved")
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-sm"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {selectedTab === "users" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold">User Management</h2>
                    <div className="relative w-64">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {users
                      .filter(
                        (u) =>
                          u.full_name
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          u.email
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.full_name?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-semibold">{user.full_name}</p>
                              <p className="text-sm text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="border border-gray-300 px-2 py-1 rounded text-xs capitalize">
                              {user.role}
                            </span>
                            {user.is_banned ? (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                Banned
                              </span>
                            ) : user.is_approved ? (
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
                                Active
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">
                                Pending
                              </span>
                            )}
                            <select
                              defaultValue={user.role}
                              onChange={(e) =>
                                handleUpdateUser(user.id, {
                                  role: e.target.value,
                                })
                              }
                              className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {!user.is_banned ? (
                              <button
                                onClick={() =>
                                  handleUpdateUser(user.id, { is_banned: true })
                                }
                                className="border-red-300 text-red-600 px-2 py-1 rounded text-sm hover:bg-red-50"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUpdateUser(user.id, {
                                    is_banned: false,
                                  })
                                }
                                className="border-emerald-300 text-emerald-600 px-2 py-1 rounded text-sm hover:bg-emerald-50"
                              >
                                <FiUserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Vehicles Tab */}
              {selectedTab === "vehicles" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold">Vehicle Management</h2>
                    <select
                      value={vehicleStatusFilter}
                      onChange={(e) => setVehicleStatusFilter(e.target.value)}
                      className="w-40 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="pending_approval">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="in_auction">In Auction</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {cars
                      .filter(
                        (c) =>
                          vehicleStatusFilter === "all" ||
                          c.status === vehicleStatusFilter,
                      )
                      .map((car) => (
                        <div
                          key={car.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden">
                              <img
                                src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200"
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold">
                                {car.year} {car.make} {car.model}
                              </p>
                              <p className="text-sm text-slate-500">
                                {car.current_bid
                                  ? `Current: PKR ${car.current_bid.toLocaleString()}`
                                  : `Starting: PKR ${car.starting_bid?.toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                car.status === "pending_approval"
                                  ? "bg-amber-100 text-amber-700"
                                  : car.status === "in_auction"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : car.status === "approved"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {car.status?.replace("_", " ")}
                            </span>
                            {car.status === "pending_approval" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveCar(car.id, "withdrawn")
                                  }
                                  className="border-red-300 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-50"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() =>
                                    handleApproveCar(car.id, "approved")
                                  }
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            <button className="p-2 hover:bg-gray-100 rounded">
                              <FiEye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Auctions Tab */}
              {selectedTab === "auctions" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold">Auction Management</h2>
                    <button
                      onClick={() => setShowAuctionDialog(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Create Auction
                    </button>
                  </div>
                  <div className="space-y-3">
                    {auctions.map((auction) => (
                      <div
                        key={auction.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              auction.status === "live"
                                ? "bg-red-500 animate-pulse"
                                : auction.status === "upcoming"
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          <div>
                            <p className="font-semibold">{auction.title}</p>
                            <p className="text-sm text-slate-500">
                              {auction.start_time
                                ? new Date(auction.start_time).toLocaleString()
                                : auction.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-500">
                            {auction.total_cars} cars
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              auction.status === "live"
                                ? "bg-red-100 text-red-700"
                                : auction.status === "upcoming"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {auction.status}
                          </span>
                          <select
                            defaultValue={auction.status}
                            onChange={(e) =>
                              console.log(
                                `Update auction ${auction.id} to ${e.target.value}`,
                              )
                            }
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Go Live</option>
                            <option value="completed">End</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other tabs would follow similar pattern... */}
              {selectedTab !== "overview" &&
                selectedTab !== "users" &&
                selectedTab !== "vehicles" &&
                selectedTab !== "auctions" && (
                  <div className="text-center py-12 text-slate-500">
                    <FiSettings className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold">
                      {selectedTab.charAt(0).toUpperCase() +
                        selectedTab.slice(1)}{" "}
                      Management
                    </p>
                    <p className="text-sm mt-2">
                      This section is under development
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Dialogs would go here - simplified for now */}
        {showOfflineBidDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="font-semibold mb-4">Enter Offline Bid</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Vehicle
                  </label>
                  <select
                    value={offlineBid.car_id}
                    onChange={(v) =>
                      setOfflineBid({ ...offlineBid, car_id: v.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select vehicle</option>
                    {carsInAuction.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model} - PKR{" "}
                        {car.current_bid?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bidder Name
                  </label>
                  <input
                    value={offlineBid.bidder_name}
                    onChange={(e) =>
                      setOfflineBid({
                        ...offlineBid,
                        bidder_name: e.target.value,
                      })
                    }
                    placeholder="Floor Bidder Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bid Amount (PKR)
                  </label>
                  <input
                    type="number"
                    value={offlineBid.amount}
                    onChange={(e) =>
                      setOfflineBid({ ...offlineBid, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOfflineBidDialog(false)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddOfflineBid({
                      car_id: offlineBid.car_id,
                      amount: parseInt(offlineBid.amount),
                      bidder_name: offlineBid.bidder_name || "Floor Bid",
                      auction_id: liveAuction.id,
                    });
                    setShowOfflineBidDialog(false);
                  }}
                  disabled={!offlineBid.car_id || !offlineBid.amount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AuctionManagement;
