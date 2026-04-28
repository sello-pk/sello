import { useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import {
  useGetAllValuationsAdminQuery,
  useDeleteValuationAdminMutation,
} from "../../redux/services/adminApi";
import { Spinner } from "../../components/ui/Loading";
import Pagination from "../../components/features/admin/Pagination";
import { FiSearch, FiTrash2, FiEye, FiDownload } from "react-icons/fi";
import ConfirmModal from "../../components/features/admin/ConfirmModal";
import toast from "react-hot-toast";

const Valuations = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [valuationToDelete, setValuationToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedValuation, setSelectedValuation] = useState(null);

  const { data, isLoading, refetch } = useGetAllValuationsAdminQuery({
    page,
    limit: 20,
    search,
  });

  const [deleteValuation] = useDeleteValuationAdminMutation();

  // Support both API response shapes:
  // 1) { count, data: [...] }
  // 2) [...] (when transformResponse already unwraps data)
  const valuations = Array.isArray(data) ? data : data?.data || [];
  const totalValuations = Array.isArray(data) ? data.length : data?.count || 0;

  const handleDelete = (id) => {
    setValuationToDelete(id);
    setShowDeleteModal(true);
  };

  const handleViewDetails = (valuation) => {
    setSelectedValuation(valuation);
    setShowDetailModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!valuationToDelete) return;
    try {
      await deleteValuation(valuationToDelete).unwrap();
      toast.success("Valuation deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete valuation");
    } finally {
      setShowDeleteModal(false);
      setValuationToDelete(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Car Estimator History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View all vehicle valuations performed by users
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="relative max-w-md">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by make or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Spinner fullScreen={false} />
          </div>
        ) : valuations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No valuations found
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto admin-table-scroll">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Estimated Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {valuations.map((v) => (
                    <tr
                      key={v._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {v.vehicleData.year} {v.vehicleData.make}{" "}
                          {v.vehicleData.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {v.vehicleData.mileage.toLocaleString()} KM •{" "}
                          {v.vehicleData.fuelType}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-primary-600">
                          PKR {v.estimation.averagePrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Range: {v.estimation.minPrice.toLocaleString()} -{" "}
                          {v.estimation.maxPrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {v.estimation.isAIPowered && (
                          <div className="mb-2">
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200 uppercase">
                              AI Enhanced
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              Real-time market analysis
                            </span>
                          </div>
                        )}
                        {v.estimation.marketFactors && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium text-gray-700 mb-1">
                              Market Factors:
                            </div>
                            <div className="text-gray-600">
                              {v.estimation.marketFactors.dataSources?.join(
                                ", ",
                              ) || "Internal Database"}
                            </div>
                            {v.estimation.marketFactors.considerations && (
                              <div className="mt-1">
                                {v.estimation.marketFactors.considerations.map(
                                  (factor, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-1"
                                    >
                                      <span className="w-1.5 h-1.5 bg-blue-100 rounded-full"></span>
                                      <span>{factor}</span>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Confidence: {v.estimation.confidenceScore}%
                          {v.estimation.isAIPowered && "• AI Powered"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {v.userId ? (
                          <div>
                            <p>{v.userId.name}</p>
                            <p className="text-xs opacity-75">
                              {v.userId.email}
                            </p>
                          </div>
                        ) : (
                          "Anonymous User"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(v.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* We can add a view details modal later if needed */}
                          <button
                            onClick={() => handleViewDetails(v)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="View details"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(v._id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Delete valuation"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalValuations > 20 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(totalValuations / 20)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Valuation"
          message="Are you sure you want to delete this valuation record from history?"
          confirmText="Delete"
          variant="danger"
        />

        {/* View Details Modal */}
        {showDetailModal && selectedValuation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Valuation Details
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedValuation(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedValuation.vehicleData?.year}{" "}
                      {selectedValuation.vehicleData?.make}{" "}
                      {selectedValuation.vehicleData?.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Mileage:{" "}
                      {selectedValuation.vehicleData?.mileage?.toLocaleString()} KM
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Engine/Fuel:{" "}
                      {selectedValuation.vehicleData?.fuelType ||
                        selectedValuation.vehicleData?.engineType ||
                        "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Transmission:{" "}
                      {selectedValuation.vehicleData?.transmission || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Registration City:{" "}
                      {selectedValuation.vehicleData?.registrationCity || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Estimation</p>
                    <p className="font-semibold text-primary-600 text-lg">
                      PKR{" "}
                      {selectedValuation.estimation?.averagePrice?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Min: PKR{" "}
                      {selectedValuation.estimation?.minPrice?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Max: PKR{" "}
                      {selectedValuation.estimation?.maxPrice?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Confidence:{" "}
                      {selectedValuation.estimation?.confidenceScore ?? 0}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      AI Powered:{" "}
                      {selectedValuation.estimation?.isAIPowered ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Analysis Summary</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                    {selectedValuation.estimation?.analysisSummary ||
                      "No analysis summary available."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">User</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedValuation.userId?.name || "Anonymous User"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedValuation.userId?.email || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Metadata</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Created: {formatDate(selectedValuation.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Updated: {formatDate(selectedValuation.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      ID: {selectedValuation._id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedValuation(null);
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Valuations;
