import { useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import { useGetAllValuationsAdminQuery, useDeleteValuationAdminMutation } from "../../redux/services/adminApi";
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

  const { data, isLoading, refetch } = useGetAllValuationsAdminQuery({
    page,
    limit: 20,
    search,
  });

  const [deleteValuation] = useDeleteValuationAdminMutation();

  const valuations = data?.data || [];
  const totalValuations = data?.count || 0;

  const handleDelete = (id) => {
    setValuationToDelete(id);
    setShowDeleteModal(true);
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
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-6 flex items-center justify-between">
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
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
            <p className="text-gray-500 dark:text-gray-400 text-lg">No valuations found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Estimated Value</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {valuations.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {v.vehicleData.year} {v.vehicleData.make} {v.vehicleData.model}
                        </div>
                        <div className="text-xs text-gray-500">{v.vehicleData.mileage.toLocaleString()} KM • {v.vehicleData.fuelType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-primary-600">
                          PKR {v.estimation.averagePrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Range: {v.estimation.minPrice.toLocaleString()} - {v.estimation.maxPrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${v.estimation.confidenceScore}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{v.estimation.confidenceScore}%</span>
                        </div>
                        {v.estimation.isAIPowered && (
                          <div className="mt-1">
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200 uppercase">
                              AI Enhanced
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {v.userId ? (
                          <div>
                            <p>{v.userId.name}</p>
                            <p className="text-xs opacity-75">{v.userId.email}</p>
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
                          <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:text-red-700 transition-colors">
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
      </div>
    </AdminLayout>
  );
};

export default Valuations;
