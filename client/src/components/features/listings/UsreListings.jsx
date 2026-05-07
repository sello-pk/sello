import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetMyCarsQuery,
  useRelistCarMutation,
} from "../../../redux/services/api";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../redux/config";
import SortAndViewOptions from "../../listings/SortAndViewOptions";
import CarCard from "../../common/CarCard";

const sortCars = (cars, sortBy) => {
  if (!cars?.length) return cars;
  const list = [...cars];
  switch (sortBy) {
    case "price-low": return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-high": return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "year-new": return list.sort((a, b) => (b.year || 0) - (a.year || 0));
    case "year-old": return list.sort((a, b) => (a.year || 0) - (b.year || 0));
    case "mileage-low": return list.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
    case "mileage-high": return list.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
    case "oldest": return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    case "newest":
    default: return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
};

const UserListings = () => {
  const navigate = useNavigate();
  const [statusFilter, _setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const limit = 12;
  const {
    data,
    isLoading,
    error: listingsError,
    refetch,
  } = useGetMyCarsQuery(
    {
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      page,
      limit,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const [updatingCars, setUpdatingCars] = useState(new Set());
  const [relistCar, { isLoading: isRelisting }] = useRelistCarMutation();

  const cars = useMemo(
    () => (Array.isArray(data?.cars) ? data.cars : []),
    [data?.cars],
  );
  const totalCars = Number(data?.total || 0);
  const totalPages = Number(data?.pages || 1);
  const sortedCars = useMemo(() => sortCars(cars, sortBy), [cars, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleMarkAsSold = async (car, isSold) => {
    if (
      window.confirm(
        `Are you sure you want to mark this car as ${
          isSold ? "sold" : "available"
        }?`,
      )
    ) {
      try {
        setUpdatingCars((prev) => new Set(prev).add(car._id));
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/cars/${car._id}/sold`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isSold: !isSold }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success(`Car marked as ${!isSold ? "sold" : "available"}`);
          refetch();
        } else {
          toast.error(data.message || "Failed to update status");
        }
      } catch (_error) {
        console.error(_error);
        toast.error("Failed to update car status");
      } finally {
        setUpdatingCars((prev) => {
          const newSet = new Set(prev);
          newSet.delete(car._id);
          return newSet;
        });
      }
    }
  };

  if (isLoading) {
    return (
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Listings</h2>
        <p className="text-gray-600">Loading your cars...</p>
      </section>
    );
  }

  if (listingsError) {
    return (
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Listings</h2>
        <p className="text-red-500">Error loading your listings</p>
      </section>
    );
  }

  return (
    <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-gray-100">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Listings</h2>
      <p className="text-gray-600 text-sm mb-6">Manage and edit your posted vehicles</p>

      {cars.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-gray-600">You haven’t posted any cars yet.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <SortAndViewOptions
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewChange={setViewMode}
              totalResults={totalCars}
              resultLabel="listings"
            />
          </div>
          <div
            className={`${
              viewMode === "list"
                ? "grid grid-cols-1 gap-4"
                : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            }`}
          >
          {sortedCars.map((car) => (
            <CarCard
              key={car._id}
              car={car}
              variant={viewMode === "list" ? "list" : "grid"}
              showContactButtons={false}
              showSaveButton={false}
              showViewCta={false}
              actions={
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          car?.listingType === "auction"
                            ? `/edit-auction-car/${car._id}`
                            : `/edit-car/${car._id}`,
                        )
                      }
                      disabled={car?.isSold}
                      className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                        car?.isSold
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-primary-500 hover:brightness-110 text-white"
                      }`}
                    >
                      {car?.isSold ? "Edit disabled" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAsSold(car, car?.isSold)}
                      disabled={updatingCars.has(car._id)}
                      className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary-500 hover:brightness-110 text-white`}
                    >
                      {updatingCars.has(car._id)
                        ? "Updating..."
                        : car?.isSold
                          ? "Mark available"
                          : "Mark as Sold"}
                    </button>
                  </div>
                  {(car?.status === "sold" || car?.status === "expired") && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm("Relist this car? A new active listing will be created.")) {
                          try {
                            setUpdatingCars((prev) => new Set(prev).add(car._id));
                            await relistCar(car._id).unwrap();
                            toast.success("Car relisted successfully!");
                            refetch();
                          } catch (error) {
                            toast.error(error?.data?.message || "Failed to relist car");
                          } finally {
                            setUpdatingCars((prev) => {
                              const next = new Set(prev);
                              next.delete(car._id);
                              return next;
                            });
                          }
                        }
                      }}
                      disabled={isRelisting || updatingCars.has(car?._id)}
                      className="w-full px-4 py-2.5 bg-primary-500 hover:brightness-110 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRelisting || updatingCars.has(car?._id) ? "Relisting..." : "Relist"}
                    </button>
                  )}
                </div>
              }
            />
          ))}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-5 mt-10 pt-8 border-t border-[#e5e7eb]">
              <span className="text-sm text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex flex-wrap justify-center items-center gap-2.5">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center justify-center min-w-[120px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {page > 2 && (
                  <button
                    onClick={() => setPage(1)}
                    className="min-w-10 px-3 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium text-sm"
                  >
                    1
                  </button>
                )}
                {page > 3 && <span className="px-1 text-gray-400">...</span>}
                {page > 1 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="min-w-10 px-3 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium text-sm"
                  >
                    {page - 1}
                  </button>
                )}

                <span className="min-w-10 px-3 py-2.5 rounded-xl bg-primary-500 text-white font-semibold text-sm text-center">
                  {page}
                </span>

                {page < totalPages && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="min-w-10 px-3 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium text-sm"
                  >
                    {page + 1}
                  </button>
                )}
                {page < totalPages - 2 && <span className="px-1 text-gray-400">...</span>}
                {page < totalPages - 1 && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className="min-w-10 px-3 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium text-sm"
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex items-center justify-center min-w-[120px] px-4 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors gap-2 text-sm"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default UserListings;
