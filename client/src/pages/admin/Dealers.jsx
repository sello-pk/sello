import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/features/admin/AdminLayout";
import { ROUTES } from "../../routes";
import {
  useGetAllDealersQuery,
  useVerifyDealerMutation,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useGetAuctionAccessRequestsQuery,
  useReviewAuctionAccessRequestMutation,
} from "../../redux/services/adminApi";
import ConfirmModal from "../../components/features/admin/ConfirmModal";
import {
  notifyActionSuccess,
  notifyActionError,
} from "../../utils/notifications";
import { Spinner } from "../../components/ui/Loading";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiGrid,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit2,
  FiX,
  FiTrash2,
} from "react-icons/fi";

const Dealers = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { data, isLoading, refetch } = useGetAllDealersQuery({
    page,
    limit: 20,
    search,
  });
  const [verifyDealer] = useVerifyDealerMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState("pending");
  const [requestTypeFilter, setRequestTypeFilter] = useState("all");
  const { data: dealerDetails, isLoading: detailsLoading } =
    useGetUserByIdQuery(selectedDealer, { skip: !selectedDealer });

  const dealers = Array.isArray(data) ? data : data?.dealers || [];
  const pagination =
    !Array.isArray(data) && data?.pagination
      ? data.pagination
      : { page: 1, pages: 1, total: dealers.length, limit: 20 };
  const { data: auctionAccessRaw = [], refetch: refetchRequests } =
    useGetAuctionAccessRequestsQuery({
      status: requestStatusFilter,
      type: requestTypeFilter,
      search,
    });
  const auctionAccessRequests = Array.isArray(auctionAccessRaw)
    ? auctionAccessRaw
    : [];
  const [reviewAuctionAccessRequest, { isLoading: reviewingRequest }] =
    useReviewAuctionAccessRequestMutation();

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleVerify = async (userId, verified) => {
    try {
      await verifyDealer({ userId, verified }).unwrap();
      toast.success(
        `Dealer ${verified ? "verified" : "unverified"} successfully`,
      );
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update dealer");
    }
  };

  const handleDelete = (dealerId) => {
    setDealerToDelete(dealerId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dealerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(dealerToDelete).unwrap();
      notifyActionSuccess("deleted", "Dealer");
      refetch();
    } catch (error) {
      notifyActionError("delete", "dealer", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDealerToDelete(null);
    }
  };

  const handleViewDetails = (dealerId) => {
    setSelectedDealer(dealerId);
    setShowDetailsModal(true);
  };

  const handleReviewRequest = async (userId, type, action) => {
    try {
      await reviewAuctionAccessRequest({
        userId,
        type,
        action,
        rejectionReason: action === "reject" ? "Not eligible based on submitted documents" : "",
      }).unwrap();
      toast.success(`Request ${action}d successfully`);
      refetchRequests();
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to review request");
    }
  };

  const handleEdit = (dealerId) => {
    navigate(ROUTES.admin.userDetail(dealerId));
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedDealer(null);
  };

  const getPlanBadge = (plan) => {
    const planColors = {
      free: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      dealer: "bg-primary-100 text-primary-500",
    };
    return planColors[plan] || planColors.free;
  };

  const getStatusBadge = (dealer) => {
    if (dealer.dealerInfo?.verified) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1">
          <FiCheckCircle size={12} />
          Verified
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 flex items-center gap-1">
        <FiXCircle size={12} />
        Not Verified
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen min-w-0 max-w-full box-border">
        {/* Header */}
        <div className="mb-6 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            Dealer Management
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Dealer accounts, verification, documents, and auction access review
          </p>
        </div>

        {/* All Dealers Label and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 min-w-0">
          <div className="p-4 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white shrink-0">
                All Dealers
              </h3>
              <div className="w-full sm:flex-1 sm:max-w-md sm:ml-4 min-w-0">
                <div className="relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full min-w-0 box-border pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 min-w-0 max-w-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center sm:justify-between min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Auction Access Review Queue
            </h3>
            <div className="flex gap-2">
              <select
                value={requestTypeFilter}
                onChange={(e) => setRequestTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="all">All types</option>
                <option value="auctionBidder">Auction Bidder</option>
                <option value="auctionDealer">Auction Dealer</option>
                <option value="dealer">Dealer</option>
              </select>
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          <div className="p-4 min-w-0">
            {auctionAccessRequests.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No requests in this queue.
              </p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {auctionAccessRequests.map((req) => (
                  <div
                    key={req._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {req.name}{" "}
                        <span className="text-gray-500 font-normal">
                          ({req.email})
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Bidder:{" "}
                        {req.auctionCapabilities?.auctionBidder?.status} | Dealer
                        cap:{" "}
                        {req.auctionCapabilities?.auctionDealer?.status} | Profile:{" "}
                        {req.dealerInfo?.verified ? "Verified" : "Not verified"}
                      </p>
                      {(req.auctionCapabilities?.auctionBidder?.documents?.length > 0 ||
                        req.auctionCapabilities?.auctionDealer?.documents?.length >
                          0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[
                            ...(req.auctionCapabilities?.auctionBidder?.documents ||
                              []),
                            ...(req.auctionCapabilities?.auctionDealer?.documents ||
                              []),
                          ].map((doc, idx) => (
                            <a
                              key={`${doc.url || doc.name || idx}`}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 dark:text-primary-400 hover:underline truncate max-w-[200px]"
                            >
                              {doc.name || "Document"}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(req._id)}
                        className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewRequest(
                            req._id,
                            requestTypeFilter === "all" ? "both" : requestTypeFilter,
                            "approve",
                          )
                        }
                        disabled={reviewingRequest}
                        className="px-3 py-1.5 text-xs rounded bg-green-600 text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleReviewRequest(
                            req._id,
                            requestTypeFilter === "all" ? "both" : requestTypeFilter,
                            "reject",
                          )
                        }
                        disabled={reviewingRequest}
                        className="px-3 py-1.5 text-xs rounded bg-red-600 text-white disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Spinner fullScreen={false} />
          </div>
        ) : dealers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              No dealers found
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto admin-table-scroll">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Business Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Listings Limit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dealers.map((dealer) => (
                    <tr
                      key={dealer._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                            {dealer.avatar ? (
                              <img
                                src={dealer.avatar}
                                alt={dealer.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (dealer.name?.charAt(0) || "D").toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {dealer.dealerInfo?.businessName ||
                                dealer.name ||
                                "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {dealer.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {dealer.email || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {dealer.dealerInfo?.businessPhone ||
                              dealer.contactNumber ||
                              "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {dealer.dealerInfo?.businessAddress ||
                            dealer.city ||
                            "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(dealer.subscription?.plan || "free")}`}
                          >
                            {(dealer.subscription?.plan || "free")
                              .charAt(0)
                              .toUpperCase() +
                              (dealer.subscription?.plan || "free").slice(1)}
                          </span>
                          {dealer.subscription?.isActive &&
                          dealer.subscription?.endDate &&
                          new Date(dealer.subscription.endDate) > new Date() ? (
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Active until{" "}
                              {new Date(
                                dealer.subscription.endDate,
                              ).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(dealer)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {dealer.listingsCount || 0}
                          </span>
                          {dealer.subscription?.plan === "free" &&
                            dealer.listingsCount >= 5 && (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                Limit reached
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {dealer.salesCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleVerify(
                                dealer._id,
                                !dealer.dealerInfo?.verified,
                              )
                            }
                            className={`${
                              dealer.dealerInfo?.verified
                                ? "text-yellow-600 hover:text-yellow-700"
                                : "text-green-600 hover:text-green-700"
                            } transition-colors`}
                            title={
                              dealer.dealerInfo?.verified
                                ? "Unverify"
                                : "Verify"
                            }
                            aria-label={
                              dealer.dealerInfo?.verified
                                ? `Unverify dealer ${dealer.dealerInfo?.businessName || dealer.name}`
                                : `Verify dealer ${dealer.dealerInfo?.businessName || dealer.name}`
                            }
                          >
                            {dealer.dealerInfo?.verified ? (
                              <FiXCircle size={18} aria-hidden="true" />
                            ) : (
                              <FiCheckCircle size={18} aria-hidden="true" />
                            )}
                          </button>
                          <button
                            onClick={() => handleViewDetails(dealer._id)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="View Details"
                            aria-label={`View details for dealer ${dealer.dealerInfo?.businessName || dealer.name}`}
                          >
                            <FiEye size={18} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleEdit(dealer._id)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            title="Edit"
                            aria-label={`Edit dealer ${dealer.dealerInfo?.businessName || dealer.name}`}
                          >
                            <FiEdit2 size={18} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(dealer._id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete"
                            aria-label={`Delete dealer ${dealer.dealerInfo?.businessName || dealer.name}`}
                          >
                            <FiTrash2 size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 mb-4 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.pages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDealerToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Dealer"
          message="Are you sure you want to delete this dealer? This action cannot be undone and will remove all their listings."
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
        />

        {/* Dealer Details Modal */}
        {showDetailsModal && selectedDealer && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dealer Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close dealer details modal"
                >
                  <FiX size={24} aria-hidden="true" />
                </button>
              </div>
              <div className="p-6">
                {detailsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner fullScreen={false} />
                  </div>
                ) : dealerDetails ? (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Business Name
                          </p>
                          <p className="font-medium dark:text-white">
                            {dealerDetails.dealerInfo?.businessName || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Owner Name
                          </p>
                          <p className="font-medium dark:text-white">
                            {dealerDetails.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Email
                          </p>
                          <p className="font-medium dark:text-white">
                            {dealerDetails.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Phone
                          </p>
                          <p className="font-medium dark:text-white">
                            {dealerDetails.dealerInfo?.businessPhone ||
                              dealerDetails.phone ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            WhatsApp
                          </p>
                          <p className="font-medium dark:text-white">
                            {dealerDetails.dealerInfo?.whatsappNumber || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Location
                          </p>
                          <p className="font-medium dark:text-white">
                            {dealerDetails.dealerInfo?.area || "N/A"},{" "}
                            {dealerDetails.dealerInfo?.city || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Business Details */}
                    {(dealerDetails.dealerInfo?.description ||
                      dealerDetails.dealerInfo?.website ||
                      dealerDetails.dealerInfo?.establishedYear) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Business Details
                        </h4>
                        <div className="space-y-3">
                          {dealerDetails.dealerInfo?.description && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Description
                              </p>
                              <p className="font-medium dark:text-white">
                                {dealerDetails.dealerInfo.description}
                              </p>
                            </div>
                          )}
                          {dealerDetails.dealerInfo?.website && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Website
                              </p>
                              <a
                                href={dealerDetails.dealerInfo.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {dealerDetails.dealerInfo.website}
                              </a>
                            </div>
                          )}
                          {dealerDetails.dealerInfo?.establishedYear && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Established Year
                              </p>
                              <p className="font-medium dark:text-white">
                                {dealerDetails.dealerInfo.establishedYear}
                              </p>
                            </div>
                          )}
                          {dealerDetails.dealerInfo?.employeeCount && (
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Employee Count
                              </p>
                              <p className="font-medium dark:text-white">
                                {dealerDetails.dealerInfo.employeeCount}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Media */}
                    {(dealerDetails.dealerInfo?.socialMedia?.facebook ||
                      dealerDetails.dealerInfo?.socialMedia?.instagram ||
                      dealerDetails.dealerInfo?.socialMedia?.twitter) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Social Media
                        </h4>
                        <div className="space-y-2">
                          {dealerDetails.dealerInfo?.socialMedia?.facebook && (
                            <a
                              href={
                                dealerDetails.dealerInfo.socialMedia.facebook
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:underline"
                            >
                              Facebook
                            </a>
                          )}
                          {dealerDetails.dealerInfo?.socialMedia?.instagram && (
                            <a
                              href={
                                dealerDetails.dealerInfo.socialMedia.instagram
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-pink-600 hover:underline"
                            >
                              Instagram
                            </a>
                          )}
                          {dealerDetails.dealerInfo?.socialMedia?.twitter && (
                            <a
                              href={
                                dealerDetails.dealerInfo.socialMedia.twitter
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-400 hover:underline"
                            >
                              Twitter
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Documents & Media */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Documents & Media
                      </h4>
                      <div className="space-y-4">
                        {/* Profile Avatar */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Profile Image
                          </p>
                          {dealerDetails.avatar ? (
                            <div className="flex items-center gap-4">
                              <img
                                src={dealerDetails.avatar}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                              />
                              <a
                                href={dealerDetails.avatar}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Full Image
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No profile image uploaded
                            </p>
                          )}
                        </div>

                        {/* Business License */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Business License / CNIC
                          </p>
                          {dealerDetails.dealerInfo?.businessLicense ? (
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📄</span>
                              </div>
                              <div>
                                <a
                                  href={
                                    dealerDetails.dealerInfo.businessLicense
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline font-medium"
                                >
                                  View License Document
                                </a>
                                <p className="text-xs text-gray-500 mt-1">
                                  {dealerDetails.dealerInfo.businessLicense
                                    .split("/")
                                    .pop()}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No license document uploaded
                            </p>
                          )}
                        </div>

                        {/* Showroom Images */}
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Showroom Images
                          </p>
                          {dealerDetails.dealerInfo?.showroomImages?.length >
                          0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                              {dealerDetails.dealerInfo.showroomImages.map(
                                (img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={img}
                                      alt={`Showroom ${idx + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                    <a
                                      href={img}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg"
                                    >
                                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                        View Full
                                      </span>
                                    </a>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No showroom images uploaded
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {dealerDetails.auctionCapabilities && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Auction access
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              Bidder
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                              Status:{" "}
                              {dealerDetails.auctionCapabilities?.auctionBidder
                                ?.status || "—"}
                            </p>
                            {dealerDetails.auctionCapabilities?.auctionBidder?.documents
                              ?.length > 0 && (
                              <ul className="mt-2 space-y-1 list-disc list-inside">
                                {dealerDetails.auctionCapabilities.auctionBidder.documents.map(
                                  (d, i) => (
                                    <li key={i}>
                                      <a
                                        href={d.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 dark:text-primary-400 hover:underline break-all"
                                      >
                                        {d.name || "Document"}
                                      </a>
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              Auction dealer
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                              Status:{" "}
                              {dealerDetails.auctionCapabilities?.auctionDealer
                                ?.status || "—"}
                            </p>
                            {dealerDetails.auctionCapabilities?.auctionDealer?.documents
                              ?.length > 0 && (
                              <ul className="mt-2 space-y-1 list-disc list-inside">
                                {dealerDetails.auctionCapabilities.auctionDealer.documents.map(
                                  (d, i) => (
                                    <li key={i}>
                                      <a
                                        href={d.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 dark:text-primary-400 hover:underline break-all"
                                      >
                                        {d.name || "Document"}
                                      </a>
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Verification Status
                      </h4>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(dealerDetails)}
                        {dealerDetails.dealerInfo?.verifiedAt && (
                          <p className="text-sm text-gray-600">
                            Verified on:{" "}
                            {new Date(
                              dealerDetails.dealerInfo.verifiedAt,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Failed to load dealer details</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dealers;
