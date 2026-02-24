import { useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import {
  useGetAllPaymentsQuery,
  useGetAllSubscriptionsQuery,
  useAdminUpdateSubscriptionMutation,
  useAdminCancelSubscriptionMutation,
  useGetAllSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useToggleSubscriptionPlanStatusMutation,
  useAdminGetAllWalletsQuery,
  useAdminUpdateWalletBalanceMutation,
  useAdminGetAllDepositsQuery,
  useAdminProcessDepositMutation,
  useAdminGetAllRefundsQuery,
  useAdminProcessRefundMutation,
  useAdminGetPlatformSettingsQuery,
  useAdminUpdatePlatformSettingsMutation,
  useAdminGetAuditLogQuery,
} from "../../redux/services/adminApi";
import { Spinner } from "../../components/ui/Loading";
import { exportToCSV, formatDateForExport, formatCurrencyForExport } from "../../utils/exportUtils";
import toast from "react-hot-toast";
import {
  FiCreditCard, FiCalendar, FiCheckCircle, FiXCircle, FiPlus,
  FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiDownload,
  FiDollarSign, FiSettings, FiFileText, FiSearch, FiArrowUp, FiArrowDown,
} from "react-icons/fi";
import ConfirmModal from "../../components/features/admin/ConfirmModal";

const formatPrice = (p) => `PKR ${(p || 0).toLocaleString()}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";

const statusBadge = (status) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    processed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    verified: "bg-green-100 text-green-800",
    refunded: "bg-slate-100 text-slate-600",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const txnTypeLabels = {
  token_deposit: "Token Deposit", token_refund: "Token Refund",
  escrow_payment: "Escrow Payment", escrow_release: "Escrow Released", escrow_refund: "Escrow Refund",
  platform_fee: "Platform Fee", deposit: "Deposit", bid_hold: "Bid Hold", bid_refund: "Bid Refund",
  withdrawal: "Withdrawal", refund: "Refund", admin_credit: "Admin Credit", admin_debit: "Admin Debit",
};

const mainTabs = [
  { id: "wallets", label: "Wallets", icon: FiDollarSign },
  { id: "deposits", label: "Deposits", icon: FiArrowDown },
  { id: "refunds", label: "Refunds", icon: FiArrowUp },
  { id: "settings", label: "Platform Settings", icon: FiSettings },
  { id: "audit", label: "Audit Log", icon: FiFileText },
  { id: "payments", label: "Subscriptions", icon: FiCreditCard },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState("wallets");
  const [page, setPage] = useState(1);

  // ── Wallet State ──
  const [walletPage, setWalletPage] = useState(1);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTarget, setWalletTarget] = useState(null);
  const [walletAction, setWalletAction] = useState({ type: "credit", amount: "", notes: "" });

  // ── Deposit State ──
  const [depositFilter, setDepositFilter] = useState("all");

  // ── Refund State ──
  const [refundFilter, setRefundFilter] = useState("all");
  const [showRefundActionModal, setShowRefundActionModal] = useState(null);
  const [refundActionData, setRefundActionData] = useState({ action: "", adminNotes: "", paymentMethod: "", paymentReference: "" });

  // ── Settings State ──
  const [editSettings, setEditSettings] = useState(null);

  // ── Audit State ──
  const [auditPage, setAuditPage] = useState(1);
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");

  // ── Subscription State ──
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [subscriptionToUpdate, setSubscriptionToUpdate] = useState(null);
  const [updatePlan, setUpdatePlan] = useState("basic");
  const [updateDuration, setUpdateDuration] = useState("30");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(null);
  const [planFormData, setPlanFormData] = useState({
    name: "", displayName: "", price: "", duration: 30, features: [""],
    maxListings: -1, boostCredits: 0, isActive: true, isDefault: false,
    order: 0, description: "", visible: true, allowedRoles: ["all"],
    minUserLevel: 0, requiresApproval: false,
  });

  // ── Wallet Queries ──
  const { data: walletsData, isLoading: walletsLoading, refetch: refetchWallets } = useAdminGetAllWalletsQuery({ page: walletPage, limit: 50 });
  const [updateWalletBalance, { isLoading: updatingWallet }] = useAdminUpdateWalletBalanceMutation();

  // ── Deposit Queries ──
  const { data: depositsData, isLoading: depositsLoading, refetch: refetchDeposits } = useAdminGetAllDepositsQuery({ status: depositFilter === "all" ? undefined : depositFilter });
  const [processDeposit] = useAdminProcessDepositMutation();

  // ── Refund Queries ──
  const { data: refundsData, isLoading: refundsLoading, refetch: refetchRefunds } = useAdminGetAllRefundsQuery({ status: refundFilter === "all" ? undefined : refundFilter });
  const [processRefund] = useAdminProcessRefundMutation();

  // ── Settings Queries ──
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useAdminGetPlatformSettingsQuery();
  const [updateSettings, { isLoading: savingSettings }] = useAdminUpdatePlatformSettingsMutation();

  // ── Audit Queries ──
  const { data: auditData, isLoading: auditLoading } = useAdminGetAuditLogQuery({ page: auditPage, limit: 50, type: auditTypeFilter === "all" ? undefined : auditTypeFilter });

  // ── Subscription Queries ──
  const { data: paymentsData, isLoading: paymentsLoading } = useGetAllPaymentsQuery({ page, limit: 50 });
  const { data: subscriptionsData, isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useGetAllSubscriptionsQuery({ page, limit: 50, status: statusFilter === "all" ? undefined : statusFilter });
  const [updateSubscription] = useAdminUpdateSubscriptionMutation();
  const [cancelSubscription] = useAdminCancelSubscriptionMutation();
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useGetAllSubscriptionPlansQuery({ includeInactive: true });
  const [createPlan, { isLoading: isCreatingPlan }] = useCreateSubscriptionPlanMutation();
  const [updatePlanMutation, { isLoading: isUpdatingPlan }] = useUpdateSubscriptionPlanMutation();
  const [deletePlan] = useDeleteSubscriptionPlanMutation();
  const [togglePlanStatus] = useToggleSubscriptionPlanStatusMutation();

  const wallets = walletsData?.wallets || [];
  const deposits = depositsData || [];
  const refunds = refundsData || [];
  const settings = settingsData;
  const auditTransactions = auditData?.transactions || [];
  const auditPagination = auditData?.pagination || {};
  const payments = paymentsData?.payments || [];
  const subscriptions = subscriptionsData?.subscriptions || [];
  const plans = plansData || [];

  // ── Handlers ──

  const handleWalletUpdate = async () => {
    if (!walletTarget || !walletAction.amount) return toast.error("Enter an amount");
    try {
      await updateWalletBalance({ userId: walletTarget._id, ...walletAction, amount: Number(walletAction.amount) }).unwrap();
      toast.success(`Wallet ${walletAction.type}ed successfully`);
      setShowWalletModal(false);
      setWalletTarget(null);
      setWalletAction({ type: "credit", amount: "", notes: "" });
      refetchWallets();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleDepositAction = async (id, action, rejectionReason = "") => {
    const msg = action === "approve" ? "Approve this deposit?" : "Reject this deposit?";
    if (!confirm(msg)) return;
    try {
      await processDeposit({ id, action, rejectionReason }).unwrap();
      toast.success(`Deposit ${action}d`);
      refetchDeposits();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleRefundAction = async () => {
    if (!showRefundActionModal || !refundActionData.action) return;
    try {
      await processRefund({ id: showRefundActionModal, ...refundActionData }).unwrap();
      toast.success(`Refund ${refundActionData.action === "process" ? "processed" : refundActionData.action + "d"}`);
      setShowRefundActionModal(null);
      setRefundActionData({ action: "", adminNotes: "", paymentMethod: "", paymentReference: "" });
      refetchRefunds();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleSaveSettings = async () => {
    if (!editSettings) return;
    try {
      await updateSettings(editSettings).unwrap();
      toast.success("Settings saved");
      refetchSettings();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
  };

  const handleCancelConfirm = async () => {
    if (!subscriptionToCancel) return;
    try {
      await cancelSubscription(subscriptionToCancel).unwrap();
      toast.success("Subscription cancelled");
      refetchSubscriptions();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
    finally { setShowCancelModal(false); setSubscriptionToCancel(null); }
  };

  const handleUpdateConfirm = async () => {
    if (!subscriptionToUpdate) return;
    try {
      await updateSubscription({ userId: subscriptionToUpdate, plan: updatePlan, duration: parseInt(updateDuration) }).unwrap();
      toast.success("Subscription updated");
      refetchSubscriptions();
    } catch (err) { toast.error(err?.data?.message || "Failed"); }
    finally { setShowUpdateModal(false); setSubscriptionToUpdate(null); }
  };

  const handleExportPayments = () => {
    if (payments.length === 0) return toast.error("No payments to export");
    const headers = [
      { label: "User", accessor: (p) => p.userName || "N/A" },
      { label: "Amount", accessor: (p) => formatCurrencyForExport(p.amount) },
      { label: "Status", accessor: "status" },
      { label: "Method", accessor: "paymentMethod" },
      { label: "Date", accessor: (p) => formatDateForExport(p.createdAt) },
    ];
    exportToCSV(payments, headers, `payments_${new Date().toISOString().split("T")[0]}`);
    toast.success("Exported");
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment & Wallet Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage wallets, deposits, refunds, and platform settings</p>
        </div>

        {/* Main Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {mainTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id ? "border-primary-500 text-primary-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                <tab.icon size={16} />{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════ WALLETS ═══════════════════════ */}
        {activeTab === "wallets" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {walletsLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner fullScreen={false} /></div>
              ) : wallets.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No wallets found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Total Deposited</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Bid Held</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Last Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {wallets.map((w) => (
                        <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{w.user?.name || "—"}</p>
                            <p className="text-xs text-gray-500">{w.user?.email}</p>
                            <p className="text-xs text-gray-400 capitalize">{w.user?.role}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatPrice(w.balance)}</td>
                          <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{formatPrice(w.totalDeposited)}</td>
                          <td className="px-6 py-4 text-sm text-amber-600 font-medium">{formatPrice(w.totalBidHeld)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {w.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{w.lastTransactionAt ? formatDate(w.lastTransactionAt) : "Never"}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button onClick={() => { setWalletTarget({ _id: w.user?._id, name: w.user?.name, balance: w.balance }); setWalletAction({ type: "credit", amount: "", notes: "" }); setShowWalletModal(true); }}
                                className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 font-medium">
                                <FiArrowUp className="inline mr-1" size={12} />Credit
                              </button>
                              <button onClick={() => { setWalletTarget({ _id: w.user?._id, name: w.user?.name, balance: w.balance }); setWalletAction({ type: "debit", amount: "", notes: "" }); setShowWalletModal(true); }}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">
                                <FiArrowDown className="inline mr-1" size={12} />Debit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Wallet Credit/Debit Modal */}
            {showWalletModal && walletTarget && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {walletAction.type === "credit" ? "Credit" : "Debit"} Wallet — {walletTarget.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Current balance: <span className="font-bold text-gray-900 dark:text-white">{formatPrice(walletTarget.balance)}</span></p>
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => setWalletAction({ ...walletAction, type: "credit" })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${walletAction.type === "credit" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                        <FiArrowUp className="inline mr-1" />Credit
                      </button>
                      <button onClick={() => setWalletAction({ ...walletAction, type: "debit" })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${walletAction.type === "debit" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                        <FiArrowDown className="inline mr-1" />Debit
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (PKR)</label>
                      <input type="number" min="1" value={walletAction.amount}
                        onChange={(e) => setWalletAction({ ...walletAction, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Reason</label>
                      <textarea rows="2" value={walletAction.notes}
                        onChange={(e) => setWalletAction({ ...walletAction, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. Cash deposit at office" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => { setShowWalletModal(false); setWalletTarget(null); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300">Cancel</button>
                      <button onClick={handleWalletUpdate} disabled={updatingWallet}
                        className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${walletAction.type === "credit" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}>
                        {updatingWallet ? "Processing..." : `${walletAction.type === "credit" ? "Credit" : "Debit"} Wallet`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ DEPOSITS ═══════════════════════ */}
        {activeTab === "deposits" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
              {["all", "pending", "approved", "rejected"].map((s) => (
                <button key={s} onClick={() => setDepositFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${depositFilter === s ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {depositsLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner fullScreen={false} /></div>
              ) : deposits.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No deposits found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {deposits.map((dep) => (
                        <tr key={dep._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{dep.user?.name}</p>
                            <p className="text-xs text-gray-500">{dep.user?.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatPrice(dep.amount)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{dep.method?.replace("_", " ")}</td>
                          <td className="px-6 py-4 text-xs text-gray-500 font-mono">{dep.transactionId || "—"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(dep.status)}`}>{dep.status}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDate(dep.createdAt)}</td>
                          <td className="px-6 py-4">
                            {dep.status === "pending" && (
                              <div className="flex gap-1">
                                <button onClick={() => handleDepositAction(dep._id, "approve")}
                                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium">
                                  <FiCheckCircle className="inline mr-1" size={12} />Approve
                                </button>
                                <button onClick={() => { const reason = prompt("Rejection reason:"); if (reason !== null) handleDepositAction(dep._id, "reject", reason); }}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">
                                  <FiXCircle className="inline mr-1" size={12} />Reject
                                </button>
                              </div>
                            )}
                            {dep.status !== "pending" && (
                              <span className="text-xs text-gray-400">
                                {dep.processedBy?.name ? `by ${dep.processedBy.name}` : ""}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════ REFUNDS ═══════════════════════ */}
        {activeTab === "refunds" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
              {["all", "pending", "approved", "rejected", "processed"].map((s) => (
                <button key={s} onClick={() => setRefundFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${refundFilter === s ? "bg-primary-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"}`}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {refundsLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner fullScreen={false} /></div>
              ) : refunds.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No refund requests</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Fee</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Net Refund</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {refunds.map((ref) => (
                        <tr key={ref._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ref.user?.name}</p>
                            <p className="text-xs text-gray-500">{ref.user?.email}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{formatPrice(ref.amount)}</td>
                          <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 capitalize">{ref.type?.replace("_", " ")}</td>
                          <td className="px-6 py-4 text-xs text-red-500">{formatPrice(ref.platformFee)} ({ref.platformFeePercent}%)</td>
                          <td className="px-6 py-4 text-sm font-semibold text-emerald-600">{formatPrice(ref.netRefund)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(ref.status)}`}>{ref.status}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-500">{formatDate(ref.createdAt)}</td>
                          <td className="px-6 py-4">
                            {ref.status === "pending" && (
                              <div className="flex gap-1">
                                <button onClick={() => { setShowRefundActionModal(ref._id); setRefundActionData({ action: "approve", adminNotes: "", paymentMethod: "", paymentReference: "" }); }}
                                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium">Approve</button>
                                <button onClick={() => { setShowRefundActionModal(ref._id); setRefundActionData({ action: "reject", adminNotes: "", paymentMethod: "", paymentReference: "" }); }}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium">Reject</button>
                              </div>
                            )}
                            {ref.status === "approved" && (
                              <button onClick={() => { setShowRefundActionModal(ref._id); setRefundActionData({ action: "process", adminNotes: "", paymentMethod: "", paymentReference: "" }); }}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium">Process Payment</button>
                            )}
                            {!["pending", "approved"].includes(ref.status) && ref.processedBy?.name && (
                              <span className="text-xs text-gray-400">by {ref.processedBy.name}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Refund Action Modal */}
            {showRefundActionModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize dark:text-white">{refundActionData.action} Refund Request</h3>
                  <div className="space-y-4">
                    {refundActionData.action === "process" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                          <select value={refundActionData.paymentMethod}
                            onChange={(e) => setRefundActionData({ ...refundActionData, paymentMethod: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                            <option value="">Select method</option>
                            <option value="jazzcash">JazzCash</option>
                            <option value="easypaisa">EasyPaisa</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Reference</label>
                          <input value={refundActionData.paymentReference}
                            onChange={(e) => setRefundActionData({ ...refundActionData, paymentReference: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="Transaction ID / Reference" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Notes</label>
                      <textarea rows="2" value={refundActionData.adminNotes}
                        onChange={(e) => setRefundActionData({ ...refundActionData, adminNotes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Optional notes" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={() => setShowRefundActionModal(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300">Cancel</button>
                      <button onClick={handleRefundAction}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90">Confirm</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ PLATFORM SETTINGS ═══════════════════════ */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {settingsLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-gray-200"><Spinner fullScreen={false} /></div>
            ) : !settings ? (
              <div className="p-12 text-center bg-white rounded-lg border border-gray-200"><p className="text-gray-500">No settings found</p></div>
            ) : (
              <>
                {!editSettings ? (
                  <div className="space-y-6">
                    {/* Fees */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Configuration</h3>
                        <button onClick={() => setEditSettings({ ...settings })}
                          className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:opacity-90 flex items-center gap-1">
                          <FiEdit2 size={14} />Edit Settings
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Platform Fee</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{settings.platformFeePercent}%</p>
                          {settings.platformFeeFixed > 0 && <p className="text-xs text-gray-500">+ {formatPrice(settings.platformFeeFixed)} fixed</p>}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Refund Penalty</p>
                          <p className="text-2xl font-bold text-red-600">{settings.refundPenaltyPercent}%</p>
                          <p className="text-xs text-gray-500">For declined cars</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Min Deposit</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(settings.minDeposit)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Max Deposit</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(settings.maxDeposit)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${settings.isWalletSystemEnabled ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Wallet System: {settings.isWalletSystemEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>

                    {/* Deposit Tiers */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deposit Tiers (Bid Limits)</h3>
                      {settings.depositTiers?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {settings.depositTiers.map((tier, i) => (
                            <div key={i} className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 border border-amber-200 dark:border-gray-600">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{tier.label || `Tier ${i + 1}`}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Min deposit: {formatPrice(tier.minDeposit)}</p>
                              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Max bid: {formatPrice(tier.maxBidLimit)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No deposit tiers configured</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Edit Settings Form */
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Edit Platform Settings</h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Fee (%)</label>
                          <input type="number" min="0" max="100" step="0.1" value={editSettings.platformFeePercent}
                            onChange={(e) => setEditSettings({ ...editSettings, platformFeePercent: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fixed Fee (PKR)</label>
                          <input type="number" min="0" value={editSettings.platformFeeFixed}
                            onChange={(e) => setEditSettings({ ...editSettings, platformFeeFixed: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Refund Penalty (%)</label>
                          <input type="number" min="0" max="100" step="0.1" value={editSettings.refundPenaltyPercent}
                            onChange={(e) => setEditSettings({ ...editSettings, refundPenaltyPercent: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Deposit (PKR)</label>
                          <input type="number" min="0" value={editSettings.minDeposit}
                            onChange={(e) => setEditSettings({ ...editSettings, minDeposit: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Deposit (PKR)</label>
                          <input type="number" min="0" value={editSettings.maxDeposit}
                            onChange={(e) => setEditSettings({ ...editSettings, maxDeposit: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editSettings.isWalletSystemEnabled}
                              onChange={(e) => setEditSettings({ ...editSettings, isWalletSystemEnabled: e.target.checked })}
                              className="w-5 h-5 text-primary-500 rounded" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet System Enabled</span>
                          </label>
                        </div>
                      </div>

                      {/* Editable Deposit Tiers */}
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deposit Tiers</label>
                          <button type="button" onClick={() => setEditSettings({ ...editSettings, depositTiers: [...(editSettings.depositTiers || []), { minDeposit: 0, maxBidLimit: 0, label: "" }] })}
                            className="text-sm text-primary-500 hover:text-primary-600 font-medium">+ Add Tier</button>
                        </div>
                        <div className="space-y-3">
                          {(editSettings.depositTiers || []).map((tier, i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <input placeholder="Label" value={tier.label}
                                onChange={(e) => { const tiers = [...editSettings.depositTiers]; tiers[i] = { ...tiers[i], label: e.target.value }; setEditSettings({ ...editSettings, depositTiers: tiers }); }}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-600 dark:text-white" />
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Min:</span>
                                <input type="number" value={tier.minDeposit}
                                  onChange={(e) => { const tiers = [...editSettings.depositTiers]; tiers[i] = { ...tiers[i], minDeposit: Number(e.target.value) }; setEditSettings({ ...editSettings, depositTiers: tiers }); }}
                                  className="w-28 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-600 dark:text-white" />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Max Bid:</span>
                                <input type="number" value={tier.maxBidLimit}
                                  onChange={(e) => { const tiers = [...editSettings.depositTiers]; tiers[i] = { ...tiers[i], maxBidLimit: Number(e.target.value) }; setEditSettings({ ...editSettings, depositTiers: tiers }); }}
                                  className="w-28 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-600 dark:text-white" />
                              </div>
                              <button onClick={() => { const tiers = editSettings.depositTiers.filter((_, idx) => idx !== i); setEditSettings({ ...editSettings, depositTiers: tiers }); }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FiTrash2 size={16} /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => setEditSettings(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300">Cancel</button>
                        <button onClick={handleSaveSettings} disabled={savingSettings}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50">
                          {savingSettings ? "Saving..." : "Save Settings"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════ AUDIT LOG ═══════════════════════ */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
              <select value={auditTypeFilter} onChange={(e) => { setAuditTypeFilter(e.target.value); setAuditPage(1); }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:text-white">
                <option value="all">All Types</option>
                {Object.entries(txnTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500 ml-auto">{auditPagination.total || 0} total transactions</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {auditLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner fullScreen={false} /></div>
              ) : auditTransactions.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No transactions found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Description</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {auditTransactions.map((txn) => (
                        <tr key={txn._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(txn.createdAt)}</td>
                          <td className="px-6 py-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.user?.name || "—"}</p>
                            <p className="text-xs text-gray-500">{txn.user?.email || ""}</p>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.amount >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {txnTypeLabels[txn.type] || txn.type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">{txn.description}</td>
                          <td className={`px-6 py-3 text-right text-sm font-semibold ${txn.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {txn.amount >= 0 ? "+" : ""}PKR {Math.abs(txn.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">{formatPrice(txn.balance)}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(txn.status)}`}>{txn.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {auditPagination.total > 50 && (
                <div className="flex justify-center gap-2 py-4 border-t border-gray-200 dark:border-gray-700">
                  <button onClick={() => setAuditPage(Math.max(1, auditPage - 1))} disabled={auditPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Previous</button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">Page {auditPage} of {Math.ceil(auditPagination.total / 50)}</span>
                  <button onClick={() => setAuditPage(auditPage + 1)} disabled={auditPage >= Math.ceil(auditPagination.total / 50)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">Next</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════ SUBSCRIPTIONS ═══════════════════════ */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Sub-tabs: Payments / Subscriptions / Plans */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <button onClick={() => setStatusFilter("all")}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200">
                  <FiCreditCard className="inline mr-2" />All Payments
                </button>
                <button onClick={() => setStatusFilter("active")}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200">
                  <FiCalendar className="inline mr-2" />Subscriptions
                </button>
              </div>
              <button onClick={handleExportPayments} disabled={payments.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 text-sm">
                <FiDownload size={16} />Export CSV
              </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {paymentsLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner fullScreen={false} /></div>
              ) : payments.length === 0 ? (
                <div className="p-12 text-center"><p className="text-gray-500">No subscription payments found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {payments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.userName}</p>
                            <p className="text-xs text-gray-500">{payment.userEmail}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${payment.amount?.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{payment.purpose}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{payment.paymentMethod || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(payment.status)}`}>{payment.status}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Shared Modals ─── */}
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => { setShowCancelModal(false); setSubscriptionToCancel(null); }}
          onConfirm={handleCancelConfirm}
          title="Cancel Subscription"
          message="Are you sure you want to cancel this subscription?"
          confirmText="Cancel Subscription"
          variant="danger"
        />

        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Update Subscription</h3>
                <button onClick={() => { setShowUpdateModal(false); setSubscriptionToUpdate(null); }} className="text-gray-400 hover:text-gray-600"><FiXCircle size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan</label>
                  <select value={updatePlan} onChange={(e) => setUpdatePlan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value="">Select Plan</option>
                    {plans.filter((p) => p.isActive).map((plan) => (
                      <option key={plan._id} value={plan.name}>{plan.displayName} - ${plan.price}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (days)</label>
                  <input type="number" value={updateDuration} onChange={(e) => setUpdateDuration(e.target.value)} min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button onClick={() => { setShowUpdateModal(false); setSubscriptionToUpdate(null); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300">Cancel</button>
                  <button onClick={handleUpdateConfirm}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90">Update</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={!!showDeletePlanModal}
          onClose={() => setShowDeletePlanModal(null)}
          onConfirm={async () => {
            if (!showDeletePlanModal) return;
            try {
              await deletePlan(showDeletePlanModal).unwrap();
              toast.success("Plan deleted");
              refetchPlans();
            } catch (error) { toast.error(error?.data?.message || "Failed to delete plan"); }
            finally { setShowDeletePlanModal(null); }
          }}
          title="Delete Subscription Plan"
          message="Are you sure you want to delete this plan? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
};

export default Payments;
